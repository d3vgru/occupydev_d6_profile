<?php
// $id:

/**
 * Retrieve the users vcard from the system and send it too the services
 */
function xmpp_vcard_service_retrieve() {
  global $user;
  // Retrieve the connection to connect to the xmpp server
  $conn = xmppframework_get_user_connection($user);
  // Retrieve the users vcard from the xmpp server
  $vcard = xmppframework_get_user_vcard($user, $conn);
  if ($vcard === FALSE) {
    $vcard = array('error' => t('Could not retrieve vcard for !user', array('!user' => $user->name)));
  }
  return $vcard;
}
