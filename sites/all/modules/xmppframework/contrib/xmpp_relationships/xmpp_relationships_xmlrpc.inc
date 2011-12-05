<?php
// $Id: xmpp_relationships_xmlrpc.inc,v 1.1.2.1.2.15 2009/09/25 20:51:05 darrenferguson Exp $
/**
 * @description: function updates the users presence in the database
 *
 * @param $jid
 *      Full JID including resource of the user who's status was updated
 * @param $status
 *      Users current status i.e. available, away, do not disturb etc
 * @param $message
 *      Message the user might have left when they set their status
 */
function xmpp_relationships_xmlrpc_update_presence($jid, $status, $message) {
  // Verify that the jid actually exists in our system, if it does not we do not process
  if (!module_exists('xmpp_user') || !($uid = _xmpp_user_uid_from_fulljid($jid))) {
    return FALSE;
  }
  // Update the database with the users current status and any message they might have set in their chat client
  $array = array('status' => $status, 'message' => $message, 'last_access' => time(), 'uid' => $uid);
  drupal_write_record('xmpp_user', $array, array('uid'));

  // if notifications exists and xmpp notificiations is available
  // send this event informing the system that a users presence has updated
  if (module_exists('notifications') && module_exists('xmpp_notifications')) {
    $op = ($status == 'offline') ? $status : 'available';
    $event = array(
      'module' => 'xmpp_relationships',
      'uid' => $uid,
      'oid' => $uid,
      'type' => 'xmpp',
      'action' => $op,
      'user' => user_load(array('uid' => $uid)),
      'params' => array('uid' => $uid),
    );
    notifications_event($event);
  }
  return TRUE;
}

?>
