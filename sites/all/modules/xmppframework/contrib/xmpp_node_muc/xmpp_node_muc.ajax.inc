<?php
// $id:

/**
 * Handle creation of the muc
 *
 * @param $nid
 *      The node id we wish to launch the muc for
 */
function xmpp_node_muc_launch($nid) {
  global $user;

  $node = node_load($nid);
  // we already have a group for the node hence we can just put them into it
  if (_xmpp_node_muc_count_mucs_from_nid($nid)) {
    if (function_exists('_xmpp_client_build_join_muc_js')) {
      $group = _xmpp_node_muc_group_toplevel($nid);
      $output = _xmpp_client_build_join_muc_js('Drupal.xmpp_node_muc.group_chat', $group->title);
      // if this is going to be the first person in the group we should insert them into the db
      if (!(_xmpp_node_muc_count_users_from_gid($group->gid))) {
        db_query("INSERT INTO {xmpp_node_muc_users} (gid, nid, uid, jid, nickname, join_time) VALUES (%d, %d, %d, '%s', '%s', %d)", $group->gid, $group->nid, $user->uid, $user->xmpp_user['jid'], $nickname, time());
      }
      $output .= 'if (attribute.html() == "'. t('Create Chat Room') .'") { attribute.html("'. t('Join Chat Room') .'"); };';
    }
    else {
      // Inform the user that the xmpp client module is required in order to utilize this functionality
      $text = '<div class="title">'. t('XMPP Client Module is not enabled') .'</div>';
      $text .= '<div class="message">'. t('In order to utilize this functionality the XMPP Client module is required too be installed and enabled') .'</div>';
      $output = '$(".xmpp_node_muc_msg_alert").html(\''. str_replace("'", "", $text) .'\').show();';
    }
  }
  else {
    if (xmpp_node_muc_type($node->type) == XMPP_NODE_MUC_UNKNOWN) {
      // this is not a configured node type hence we cannot allow this to have a muc created for it
      // this should never get to this piece since the link should not be displayed if the NODE TYPE is unknown
      // more of an insurance type incase someone decides to write their own url for the launch
      $text = '<div class="title">'. t('Node Type Mis-configuration') .'</div>';
      $text .= '<div class="message">'. t('Node Type is not configured for chat room association') .'</div>';
      $output = '$(".xmpp_node_muc_msg_alert").html(\''. str_replace("'", "", $text) .'\').show();';
    }
    else {
      if (function_exists('_xmpp_client_build_join_muc_js')) {
        $gid = xmpp_node_muc_create_muc($node, 0); // creating the muc on the server since it is not there yet
        $group = _xmpp_node_muc_group_load($gid); // getting the group that we assigned to the muc
        $output = _xmpp_client_build_join_muc_js('Drupal.xmpp_node_muc.group_chat', $group->title);
        $nickname = $user->name;
        // adding the user since we know they are about to be put into the muc xmlrpc will take care if additional one comes
        db_query("INSERT INTO {xmpp_node_muc_users} (gid, nid, uid, jid, nickname, join_time) VALUES (%d, %d, %d, '%s', '%s', %d)", $gid, $group->nid, $user->uid, $user->xmpp_user['jid'], $nickname, time());
        $output .= 'if (attribute.html() == "'. t('Create Chat Room') .'") { attribute.html("'. t('Join Chat Room') .'"); };';
      }
      else {
        // Inform the user that the xmpp client module is required in order to utilize this functionality
        $text = '<div class="title">'. t('XMPP Client Module is not enabled') .'</div>';
        $text .= '<div class="message">'. t('In order to utilize this functionality the XMPP Client module is required too be installed and enabled') .'</div>';
        $output = '$(".xmpp_node_muc_msg_alert").html(\''. str_replace("'", "", $text) .'\').show();';
      }
    }
  }
  print $output;
  exit;
}

/**
 * Handle the ajax refreshing of the temporary muc
 *
 * @param $nid
 *      The Node ID which the block is assigned with temporary mucs
 */
function xmpp_node_muc_block_refresh_temporary($nid) {
  global $user;

  $output = '';
  if (XMPP_NODE_MUC_BLOCK_REFRESH) {
    $row = db_fetch_object(db_query("SELECT * FROM {xmpp_node_muc_groups} WHERE nid = %d", $nid));
    if ($row->gid) {
      // Creating link so the user can join the MUC if they are not already online
      $joinlink = __xmpp_client_build_join_muc_link(t('Join'), $row->title, 'Drupal.xmpp_node_muc.group_chat');
      $joinlink = str_replace("'", "\'", $joinlink);
      // Retrieving the number of users currently online in the group chat
      $peoplecount = db_result(db_query("SELECT COUNT(*) FROM {xmpp_node_muc_users} WHERE nid = %d AND gid = %d", $nid, $row->gid));
      // Check the users current status to determine if they are in or not, if they are remove the Join link otherwise display it
      $user_status = db_result(db_query("SELECT COUNT(*) FROM {xmpp_node_muc_users} WHERE nid = %d AND gid = %d AND uid = %d", $nid, $row->gid, $user->uid));
      // Calling the function that will update the MUC header based on the system information
      $output .= 'Drupal.xmpp_node_muc.updateTempMucHeader(\''. $row->gid .'\', \''. $peoplecount .'\', \''. $user_status .'\', \''. $row->name .'\', \''. $joinlink .'\');';

      $listitem = array();
      $log = db_query("SELECT * FROM {xmpp_node_muc_log} WHERE nid = %d AND gid = %d AND body <> '' ORDER BY mdate DESC", $nid, $row->gid);
      while ($logrow = db_fetch_object($log)) {
        // Break out of the loop if the muc block amount has been reached
        if (count($listitem) >= XMPP_NODE_MUC_BLOCK_MUC_LOG_AMOUNT) { break; };
        $listitem[] = '<li class="xmpp_node_muc_list_item"><div class="xmpp_node_muc_list_item_submitted">'. t('!user said at !time', array('!user' => substr($logrow->nickname, 0, strpos($logrow->nickname, "@")), '!time' => '<span class="xmpp_node_muc_list_item_timestamp">'. format_date($logrow->mdate, 'short') .'</span>')) .'</div><div class="xmpp_node_muc_list_item_content">'. $logrow->body .'</div></li>';
      }
      // Calling the helper function that will update the log messages
      $output .= 'Drupal.xmpp_node_muc.updateTempLog(\''. $row->gid .'\', \''. str_replace("'", "", implode("", $listitem)) .'\');';
      $output .= '$(document).ready(function() { $(".block-xmpp_node_muc").show(); });';
      $output .= '$("li.xmpp_node_muc a").html("'. t('Join Chat Room') .'");';
    }
    else {
      $output .= '$(document).ready(function() { $(".block-xmpp_node_muc").hide(); });';
      $output .= '$("li.xmpp_node_muc a").html("'. t('Create Chat Room') .'");';
    }
  }
  print $output;
  exit;
}

/**
 * Handling the ajax refreshing for permanent muc blocks
 *
 * @param $nid
 *      Node ID of the block we are refreshing
 */
function xmpp_node_muc_block_refresh_permanent($nid) {
  global $user;

  $output = '';
  if (XMPP_NODE_MUC_BLOCK_REFRESH) {
    $result = db_query("SELECT * FROM {xmpp_node_muc_groups} WHERE nid = %d ORDER BY sub_group ASC", $nid);
    while($row = db_fetch_object($result)) {
      // Retrieving the number of users currently online in the group chat
      $peoplecount = db_result(db_query("SELECT COUNT(*) FROM {xmpp_node_muc_users} WHERE nid = %d AND gid = %d", $nid, $row->gid));
      // Check the users current status to determine if they are in or not, if they are remove the Join link otherwise display it
      $user_status = db_result(db_query("SELECT COUNT(*) FROM {xmpp_node_muc_users} WHERE nid = %d AND gid = %d AND uid = %d", $nid, $row->gid, $user->uid));
      // Calling the function that will update the MUC header based on the system information
      $output .= 'Drupal.xmpp_node_muc.updateMucHeader("'. $row->gid .'", "'. $peoplecount .'", "'. $user_status .'");';

      $listitem = array();
      $log = db_query("SELECT * FROM {xmpp_node_muc_log} WHERE nid = %d AND gid = %d AND body <> '' ORDER BY mdate DESC", $nid, $row->gid);
      while ($logrow = db_fetch_object($log)) {
        // Break out of the loop if the muc block amount has been reached
        if (count($listitem) >= XMPP_NODE_MUC_BLOCK_MUC_LOG_AMOUNT) { break; };
        $listitem[] = '<li class="xmpp_node_muc_list_item"><div class="xmpp_node_muc_list_item_submitted">'. t('!user said at !time', array('!user' => substr($logrow->nickname, 0, strpos($logrow->nickname, "@")), '!time' => '<span class="xmpp_node_muc_list_item_timestamp">'. format_date($logrow->mdate, 'short') .'</span>')) . '</div><div class="xmpp_node_muc_list_item_content">'. $logrow->body .'</div></li>';
      }
      // Calling the helper function that will update the log messages
      $output .= 'Drupal.xmpp_node_muc.updateLog(\''. $row->gid .'\', \''. str_replace("'", "", implode("", $listitem)) .'\');';
    }
  }
  print $output;
  exit;
}
