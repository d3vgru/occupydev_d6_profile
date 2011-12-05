<?php
// $id:

/**
 * Function will display the current roster synchronizations with the user
 *
 * @param $user
 *      User object
 */
function xmpp_roster_synchronize($user, $view = 'both') {
  $output = '';

  // TODO: decide whether to store in the db and retrieve from there
  $roster = xmppframework_get_user_roster($user);
  // retrieve all of the users relationships
  $relationships = user_relationships_load(array('user' => $user->uid));
  $associations = xmpp_roster_process_relationships($relationships, $roster, $user);
  xmpp_roster_process_roster($roster, $associations, $user);
  return theme('xmpp_roster_associations', $associations, $view);
}

/**
 *
 * @param $roster
 *      Array holding the users xmpp roster
 * @param $relationships
 *      Array of relationships
 * @param $user
 *      User Object
 */
function xmpp_roster_process_roster($roster, &$relationships, $user) {
  if (is_array($roster) && !empty($roster)) {
    foreach (array_keys($roster) as $key) {
      if (!isset($relationships['both'][$key]) && !isset($relationships['relationship'][$key])) {
        // xmpp roster get uid will return the uid or null if it cannot determine the uid
        $relationships['xmpp'][$key] = array('uid' => xmpp_roster_get_uid_from_jid($key));
      }
    }
  }
}

/**
 * Function processes the relationships and returns an array
 *
 * @param $relationships
 *      Array of relationships
 * @param $roster
 *      Array holding the users xmpp roster
 * @param $user
 *      User Object
 */
function xmpp_roster_process_relationships($relationships, $roster, $user) {
  $processed = array();
  // process the user relationships to determine which we have sync and which we do not
  foreach ($relationships as $key => $object) {
    $relationship = ($object->requester_id == $user->uid) ? user_load(array('uid' => $object->requestee_id)) : user_load(array('uid' => $object->requester_id));
    // determine if the relationship has the jid set
    if (isset($relationship->xmpp_user['jid'])) {
      $jid = $relationship->xmpp_user['jid'];
      // determine if the jid exists in the users roster
      if (array_key_exists($jid, $roster)) {
        if (!isset($sync[$jid])) {
          $processed['both'][$jid] = array('uid' => $relationship->uid, 'name' => $relationship->name, 'created' => $object->created_at, 'type' => array());
        }
        $processed['both'][$jid]['type'][] = $object->name;
      }
      else {
        if (!isset($nonsync[$jid])) {
          $processed['relationship'][$jid] = array('uid' => $relationship->uid, 'name' => $relationship->name, 'created' => $object->created_at, 'type' => array());
        }
        $processed['relationship'][$jid]['type'][] = $object->name;
      }
    }
  }
  return $processed;
}

/**
 * Function will add the item to the user's roster
 *
 * @param $user
 *      User Object
 */
function xmpp_roster_add() {
  global $user;
  $cuser = user_load(array('uid' => arg(2)));
  if (!$cuser->xmpp_user['jid']) {
    drupal_set_message(t('@name does not have a jabber id so you cannot add them to your roster', array('@name' => $cuser->name)));
    drupal_goto('user/'. $user->uid .'/xmpp_roster');
  }
  $chatid = $cuser->name .'@'. $cuser->xmpp_user['server'];
  // add item to the xmpp roster
  $conn = xmppframework_get_user_connection($user);
  if ($conn !== FALSE) {
    $result = xmppframework_add_rosteritem($user->name, $user->xmpp_user['server'], $cuser->name, $cuser->xmpp_user['server'], $cuser->name, t('General'), 'both', $conn);
    if ($result === TRUE) {
      drupal_set_message(t('@name, has been added to your xmpp roster', array('@name' => $chatid)));
    }
    else {
      drupal_set_message(t('Could not add @name to your xmpp roster', array('@name' => $chatid)), 'error');
      watchdog('xmpp_roster', 'Could not add @name to the xmpp roster of @username. Failure in the xmppframework add rosteritem function', array('@name' => $chatid, '@username' => $user->name), 'error');
    }
    xmppframework_release_connection($conn);
  }
  else {
    drupal_set_message(t('Could not add @name to your xmpp roster. No connection was available from the server.', array('@name' => $chatid)), 'error');
    watchdog('xmpp_roster', 'Could not add @name to the xmpp roster of @username. Could not retrieve a connection', array('@name' => $chatid, '@username' => $user->name), WATCHDOG_ERROR);
  }
  drupal_goto('user/'. $user->uid .'/xmpp_roster');
}

/**
 * Function will delete the item from the user's roster
 *
 * @param $user
 *      User Object
 */
function xmpp_roster_delete() {
  global $user;
  if (is_numeric(arg(2))) {
    $cuser = user_load(array('uid' => arg(2)));
  }
  else {
    $jid = explode('@', arg(2));
    $cuser = new StdClass();
    $cuser->name = $jid[0];
    $cuser->xmpp_user['server'] = $jid[1];
  }
  $chatid = $cuser->name .'@'. $cuser->xmpp_user['server'];
  // delete item from the xmpp roster
  $conn = xmppframework_get_user_connect($user);
  if ($conn !== FALSE) {
    $result = xmppframework_delete_rosteritem($user->name, $user->xmpp_user['server'], $cuser->name, $cuser->xmpp_user['server'], $conn);
    if ($result === TRUE) {
      drupal_set_message(t('@name, has been removed from your xmpp roster', array('@name' => $chatid)));
    }
    else {
      drupal_set_message(t('Could not remove @name from your xmpp roster', array('@name' => $chatid)), 'error');
      watchdog('xmpp_roster', 'Could not remove @name from the xmpp roster of @username. Failure in the xmppframework delete rosteritem function', array('@name' => $chatid, '@username' => $user->name), WATCHDOG_ERROR);
    }
    xmppframework_release_connection($conn);
  }
  else {
    drupal_set_message(t('Could not remove @name from your xmpp roster. No connection was available from the server.', array('@name' => $chatid)), 'error');
    watchdog('xmpp_roster', 'Could not remove @name from the xmpp roster of @username. Could not retrieve a connection', array('@name' => $chatid, '@username' => $user->name), WATCHDOG_ERROR);
  }
  drupal_goto('user/'. $user->uid .'/xmpp_roster');
}

/**
 * @param $jid
 *      Jabber id string no resource
 */
function xmpp_roster_get_uid_from_jid($jid) {
  if (module_exists('xmpp_user') && function_exists('_xmpp_user_uid_from_fulljid')) {
    return _xmpp_user_uid_from_fulljid($jid);
  }
  return NULL;
}
