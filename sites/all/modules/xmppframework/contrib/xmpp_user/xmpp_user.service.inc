<?php
// $Id:

/**
 * Return the XMPP information Drupal is storing for this user
 */
function xmpp_user_service_jid($uid) {
  $data = array();
  $uid = trim(filter_xss($uid));
  if (is_numeric($uid)) {
    $account = user_load(array('uid' => $uid));
    if (isset($account->xmpp_user) && is_array($account->xmpp_user)) {
      $data = $account->xmpp_user;
    }
  }
  return $data;
}
