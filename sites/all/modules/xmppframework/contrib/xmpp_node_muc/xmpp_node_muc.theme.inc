<?php
// $id

/**
 * Builds display blocks for the temporary mucs associated with nodes
 */
function theme_xmpp_node_muc_block_temporary($node) {
  // if there is an active conversation going on then display that information instead of the archived conversations
  $row = db_fetch_object(db_query("SELECT * FROM {xmpp_node_muc_groups} WHERE nid = %d", $node->nid));
  // Retrieving the number of users currently online in the group chat
  $peoplecount = db_result(db_query("SELECT COUNT(*) FROM {xmpp_node_muc_users} WHERE nid = %d AND gid = %d", $node->nid, $row->gid));
  // Creating link so the user can join the MUC if they are not already online
  if (function_exists('_xmpp_client_build_join_muc_link')) {
    $joinlink = _xmpp_client_build_join_muc_link(t('Join'), $row->title, 'Drupal.xmpp_node_muc.group_chat');
  }
  else {
    $joinlink = '';
    watchdog('xmpp_node_muc', 'XMPP Client module is not installed hence the join links for joining group chats are not enabled', array(), WATCHDOG_NOTICE);
  }

  $output = '<div id="xmpp_node_muc_group_channel_'. $row->gid .'" class="xmpp_node_muc_group_channel_header">
               <a id="xmpp_node_muc_group_channel_title_'. $row->gid .'" class="xmpp_node_muc_group_channel_title" href="#">'. $row->name .'</a>
       	       <span id="xmpp_node_muc_group_people_'. $row->gid .'" class="xmpp_node_muc_group_people_count">'. $peoplecount .' people</span>
	       <span id="xmpp_node_muc_group_join_'. $row->gid .'" class="xmpp_node_muc_group_join">'. $joinlink .'</span>
	       <div class="clear-block"></div>
             </div>';

  $listitem = array();
  if ($row->gid) {
    $log = db_query("SELECT * FROM {xmpp_node_muc_log} WHERE nid = %d AND gid = %d AND body <> '' ORDER BY mdate DESC", $node->nid, $row->gid);
    while ($logrow = db_fetch_object($log)) {
      // Break out of the loop if the muc block amount has been reached
      if (count($listitem) >= XMPP_NODE_MUC_BLOCK_MUC_LOG_AMOUNT) { break; };
      $listitem[] = '<li class="xmpp_node_muc_list_item"><div class="xmpp_node_muc_list_item_submitted">'. t('!user said at !time', array('!user' => substr($logrow->nickname, 0, strpos($logrow->nickname, "@")), '!time' => '<span class="xmpp_node_muc_list_item_timestamp">'. format_date($logrow->mdate, 'short') .'</span>')) . '</div><div class="xmpp_node_muc_list_item_content">'. $logrow->body .'</div></li>';
    }
  }
  // Msg listings
  $output .= '<div id="xmpp_node_muc_group_list_'. $row->gid .'" class="xmpp_node_muc_group_list">'. implode("", $listitem) .'</div>';
  // do not display anything if there are no currently active mucs
  if ($row->gid) {
    drupal_add_js('$(document).ready(function() { $(".block-xmpp_node_muc").show(); });', 'inline');
  }
  else {
    drupal_add_js('$(document).ready(function() { $(".block-xmpp_node_muc").hide(); });', 'inline');
  }
  // check if the ajax refresh is configured in the module
  if (XMPP_NODE_MUC_BLOCK_REFRESH) {
    drupal_add_js("Drupal.xmpp_node_muc.refresh_block('". $node->nid ."', '". url('xmpp_node_muc/block_refresh/temporary') ."','". XMPP_NODE_MUC_BLOCK_REFRESH_INTERVAL ."');", "inline");
  }
  return $output;
}

/**
 * Builds display blocks for the permanent mucs associated with nodes
 */
function theme_xmpp_node_muc_block_permanent($node) {
  global $user;
  $output = '';
  // check if the muc exists since it might have been created without one
  if (!(_xmpp_node_muc_count_mucs_from_nid($node->nid))) {
    return $output;
  }
  // Determine whether the user is a member of the group or not if not return empty
  // Admins will be allowed to still see the block in the system
  $in_group = db_result(db_query("SELECT COUNT(uid) FROM {og_uid} WHERE nid = %d AND uid = %d AND is_active = %d", $node->nid, $user->uid, 1));
  if ($in_group == 0) {
    return $output;
  }

  // Retrieve a list of all the muc chat rooms associated with the permanent node type
  $result = db_query("SELECT * FROM {xmpp_node_muc_groups} WHERE nid = %d ORDER BY sub_group ASC", $node->nid);
  while ($row = db_fetch_object($result)) {
    // Retrieving the number of users currently online in the group chat
    $peoplecount = db_result(db_query("SELECT COUNT(*) FROM {xmpp_node_muc_users} WHERE nid = %d AND gid = %d", $node->nid, $row->gid));
    // Creating link so the user can join the MUC if they are not already online
    if (function_exists('_xmpp_client_build_join_muc_link')) {
      $joinlink = _xmpp_client_build_join_muc_link(t('Join'), $row->title, 'Drupal.xmpp_node_muc.group_chat');
    }
    else {
      $joinlink = '';
      watchdog('xmpp_node_muc', 'XMPP Client module is required to be enabled in order for the links to exist on the system', array(), WATCHDOG_NOTICE);
    }

    $output .= '<div id="xmpp_node_muc_group_channel_'. $row->gid .'" class="xmpp_node_muc_group_channel_header">
                  <a id="xmpp_node_muc_group_channel_title_'. $row->gid .'" class="xmpp_node_muc_group_channel_title" href="#">'. $row->name .'</a>
		  <span id="xmpp_node_muc_group_people_'. $row->gid .'" class="xmpp_node_muc_group_people_count">'. $peoplecount .' people</span>
		  <span id="xmpp_node_muc_group_join_'. $row->gid .'" class="xmpp_node_muc_group_join">'. $joinlink .'</span>
		  <div class="clear-block"></div>
		</div>';

    $listitem = array();
    $log = db_query("SELECT * FROM {xmpp_node_muc_log} WHERE nid = %d AND gid = %d AND body <> '' ORDER BY mdate DESC", $node->nid, $row->gid);
    while ($logrow = db_fetch_object($log)) {
      // Break out of the loop if the muc block amount has been reached
      if (count($listitem) >= XMPP_NODE_MUC_BLOCK_MUC_LOG_AMOUNT) { break; };
      $listitem[] = '<li class="xmpp_node_muc_list_item"><div class="xmpp_node_muc_list_item_submitted">'. t('!user said at !time', array('!user' => substr($logrow->nickname, 0, strpos($logrow->nickname, "@")), '!time' => '<span class="xmpp_node_muc_list_item_timestamp">'. format_date($logrow->mdate, 'short') .'</span>')) . '</div><div class="xmpp_node_muc_list_item_content">'. $logrow->body .'</div></li>';
    }
    // Msg listings
    $output .= '<div id="xmpp_node_muc_group_list_'. $row->gid .'" class="xmpp_node_muc_group_list">'. implode("", $listitem) .'</div>';
  }
  // check if the ajax refresh is configured in the module
  if (XMPP_NODE_MUC_BLOCK_REFRESH) {
    drupal_add_js("Drupal.xmpp_node_muc.refresh_block('". $node->nid ."', '". url('xmpp_node_muc/block_refresh/permanent') ."','". XMPP_NODE_MUC_BLOCK_REFRESH_INTERVAL ."');", "inline");
  }

  return $output;
}

/**
 * Theme the node muc creation form
 */
function theme_xmpp_node_muc_create_form($form) {
  $rows = array();
  $rows[] = array(
    'textfield' => drupal_render($form['name']),
    'button' => drupal_render($form['submit']),
  );
  $output = theme('table', NULL, $rows);
  $output .= drupal_render($form);
  return $output;

}
