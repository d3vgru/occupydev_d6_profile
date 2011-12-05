<?php
// $id:

/**
 * creates the relationship between the users on the xmpp server when it is approved
 * will send an xmlrpc request to the server to associate both in their respective rosters
 *
 * @param $relationship
 *      Relationship object that is passed by the user_relationships_api module to hook_user_relationships()
 */
function _xmpp_relationships_approve_user_relationship($relationship) {
  $requester = user_load(array('uid' => $relationship->requester_id)); // person who requested the relationship
  $requestee = user_load(array('uid' => $relationship->requestee_id)); // person who accepted the relationship request

  // if the variables are not set then we cannot do the xmlrpc request hence ignore this portion
  if (isset($requester->xmpp_user['user_name']) && isset($requester->xmpp_user['server']) && isset($requestee->xmpp_user['user_name']) && isset($requestee->xmpp_user['server'])) {
    // add the roster item to the requestee's roster
    $reconn = xmppframework_get_user_connection($requestee);
    // add the roster item to the requester's roster
    $rrconn = xmppframework_get_user_connection($requester);
    if ($reconn !== FALSE) {
      $result = xmppframework_add_rosteritem($requestee->xmpp_user['user_name'], $requestee->xmpp_user['server'], $requester->xmpp_user['user_name'], $requester->xmpp_user['server'], $requester->name, t('General'), 'both', $reconn);
      xmppframework_release_connection($reconn);
      if ($result !== TRUE) {
        watchdog('xmpp_relationships', 'Error when trying to add !name as a roster item for !rname', array('!name' => $requester->name, '!rname' => $requestee->name), WATCHDOG_ERROR);
        $reconn = FALSE;
      }
      else {
        $reconn = TRUE;
      }
    }
    if ($rrconn !== FALSE) {
      $result = xmppframework_add_rosteritem($requester->xmpp_user['user_name'], $requester->xmpp_user['server'], $requestee->xmpp_user['user_name'], $requestee->xmpp_user['server'], $requestee->name, t('General'), 'both', $rrconn);
      xmppframework_release_connection($rrconn);
      if ($result !== TRUE) {
        watchdog('xmpp_relationships', 'Error when trying to add !name as a roster item for !rname', array('!name' => $requestee->name, '!rname' => $requester->name), WATCHDOG_ERROR);
        $rrconn = FALSE;
      }
      else {
        $rrconn = TRUE;
      }
    }
    // if the module is configured for it send the notification via xmpp that the relationship exists
    if (XMPP_RELATIONSHIPS_SEND_SUBSCRIPTION_NOTIFICATION && $rrconn !== FALSE && $reconn !== FALSE) {
      $admin_conn = xmppframework_get_admin_connection();
      if ($admin_conn !== FALSE) {
        // sending first for the person whom accepted the relationship
        $to = $requestee->xmpp_user['user_name'] .'@'. $requestee->xmpp_user['server'];
        $body = t('Your relationship with !user has been successfully created', array('!user' => $requester->xmpp_user['user_name']));
        $result = xmppframework_send_message($to, 'headline', $body, t('User Relationship Approved'), $admin_conn);
        if ($result === FALSE) {
          watchdog('xmpp_relationships', 'Failed to send message to user %to', array('%to' => $to), WATCHDOG_ERROR);
        }
        // sending for the person who requested the relationship
        $to = $requester->xmpp_user['user_name'] .'@'. $requester->xmpp_user['server'];
        $body = t('Your relationship with !user has been successfully created', array('!user' => $requestee->xmpp_user['user_name']));
        $result = xmppframework_send_message($to, 'headline', $body, t('User Relationship Approved'), $admin_conn);
        if ($result === FALSE) {
          watchdog('xmpp_relationships', 'Failed to send message to user %to', array('%to' => $to), WATCHDOG_ERROR);
        }
        xmppframework_release_connection($admin_conn);
      }
      else {
        watchdog('xmpp_relationships', 'Error while trying to retrieve administrative connection too the xmpp server', array(), WATCHDOG_ERROR);
      }
    }
  }
}

/**
 * removes the relationship between the users on the xmpp server when remove has been decided
 * will send an xmlrpc request to the server to remove the association from the respective rosters
 *
 * @param $relationship
 *      Relationship object that is passed by the user_relationships_api module to hook_user_relationships()
 */
function _xmpp_relationships_remove_user_relationship($relationship) {
  $removed = user_load(array('uid' => $relationship->requestee_id)); // person being removed from the relationship
  $user = user_load(array('uid' => $relationship->requester_id)); // person who requested the removal
  // if the variables are not set then we cannot do the xmlrpc request hence ignore this portion
  if (isset($user->xmpp_user['user_name']) && isset($user->xmpp_user['server']) && isset($removed->xmpp_user['user_name']) && isset($removed->xmpp_user['server'])) {
    // removing from the roster of the person being removed from the relationship
    $conn = xmppframework_get_user_connection($user);
    if ($conn !== FALSE) {
      $result = xmppframework_delete_rosteritem($user->xmpp_user['user_name'], $user->xmpp_user['server'], $removed->xmpp_user['user_name'], $removed->xmpp_user['server'], $conn);
      xmppframework_release_connection($conn);
      if ($result !== TRUE) {
        watchdog('xmpp_relationships', 'Error when trying to remove !name as a roster item for !rname', array('!name' => $removed->name, '!rname' => $user->name), WATCHDOG_ERROR);
        $conn = FALSE;
      }
      else {
        $conn = TRUE;
      }
    }
    // removing from the roster of the person who requested the deletion of the relationship
    $rconn = xmppframework_get_user_connection($removed);
    if ($rconn !== FALSE) {
      $result = xmppframework_delete_rosteritem($removed->xmpp_user['user_name'], $removed->xmpp_user['server'], $user->xmpp_user['user_name'], $user->xmpp_user['server'], $rconn);
      if ($result !== FALSE) {
        watchdog('xmpp_relationships', 'Error when trying to remove !name as a roster item for !rname', array('!name' => $user->name, '!rname' => $removed->name), WATCHDOG_ERROR);
        $rconn = FALSE;
      }
      else {
        $rconn = TRUE;
      }
    }
    // if the module is configured for it send the notification via xmpp that the relationship exists
    if (XMPP_RELATIONSHIPS_SEND_SUBSCRIPTION_NOTIFICATION && $conn !== FALSE && $rconn !== FALSE) {
      $admin_conn = xmppframework_get_admin_connection();
      if ($admin_conn !== FALSE) {
        // sending first for the person whom accepted the relationship
        $to = $removed->xmpp_user['user_name'] .'@'. $removed->xmpp_user['server'];
        $body = t('Your relationship with !user has been successfully removed', array('!user' => $user->xmpp_user['user_name']));
        $result = xmppframework_send_message($to, 'headline', $body, t('User Relationship Removed'));
        if ($result === FALSE) {
          watchdog('xmpp_relationships', 'Failed to send message to user %to', array('%to' => $to), WATCHDOG_ERROR);
        }
        // sending for the person who requested the relationship
        $to = $user->xmpp_user['user_name'] .'@'. $user->xmpp_user['server'];
        $body = t('Your relationship with !user has been successfully removed', array('!user' => $removed->xmpp_user['user_name']));
        $result = xmppframework_send_message($to, 'headline', $body, t('User Relationship Removed'));
        if ($result === FALSE) {
          watchdog('xmpp_relationships', 'Failed to send message to user %to', array('%to' => $to), WATCHDOG_ERROR);
        }
        xmppframework_release_connection($admin_conn);
      }
      else {
        watchdog('xmpp_relationships', 'Error while trying to retrieve administrative connection too the xmpp server', array(), WATCHDOG_ERROR);
      }
    }
  }
}
