<?php
// $id: $

/**
 * Returns the password to the client
 */
function xmpp_client_password() {
  global $user;
  print xmpp_user_get_password($user);
  exit;
}

/**
 * Retrieves any specific XMPPClient config parameters from the database
 * returns them to the calling application
 */
function xmpp_client_config() {
  global $user;
  $output = '';
  $result = db_query("SELECT * FROM {xmpp_user_properties} WHERE uid = %d", $user->uid);
  while ($row = db_fetch_object($result)) {
    $output .= $row->property_id .' = '. $row->value .';';
  }
  print $output;
  exit;
}

/**
 * Updates the XMPPClient Configuration if the user makes any adjustments
 * Returns 0 on success or 1 on failure so the XMPP Thin Client knows
 */
function xmpp_client_config_update() {
  global $user;

  // going through the posted data and updating the database with the information
  foreach ($_POST as $name => $value) {
    if (trim($value) == "") { continue; };

    db_query("UPDATE {xmpp_user_properties} SET value = '%s' WHERE uid = %d AND property_id = '%s'", $value, $user->uid, $name);
    if (!db_affected_rows()) {
      @db_query("INSERT INTO {xmpp_user_properties} (uid, property_id, value) VALUES (%d, '%s', '%s')", $user->uid, $name, $value);
    }
  }
  exit;
}

/**
 * Update the users xmpp presence from drupal
 */
function xmpp_client_status_update() {
  global $user;

  $type = 'available';
  $message = $_GET['message'];
  $status = $_GET['status'];
  // If no status sent then set to the default available
  if (!$status || !drupal_strlen($status)) {
    $status = 'available';
  }
  // set type to unavailable if the status is unavailable
  if ($status == 'unavailable') {
    $type = 'unavailable';
  }
  // Sending the request to the xmpp server so we can set the users presence
  $result = xmppframework_set_user_presence($user, $type, $status, $message);
  if ($result === TRUE) {
    db_query("UPDATE {xmpp_user} SET message = '%s', status = '%s' WHERE uid = %d", $user->uid);
  }
  exit;
}

/**
 * Retrieve the current users status from drupal
 */
function xmpp_client_status_retrieve() {
  global $user;

  $output = array('status' => $user->xmpp_user['status'], 'message' => $user->xmpp_user['message']);
  print drupal_json($output);
  exit;
}
