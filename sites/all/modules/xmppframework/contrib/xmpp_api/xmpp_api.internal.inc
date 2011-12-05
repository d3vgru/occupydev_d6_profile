<?php
//$id:

/**
 * Get connection object with this server credentials
 */
function xmpp_api_get_server_connection($params = array()) {
  if (!drupal_strlen(XMPP_API_ADMINJID) || !drupal_strlen(XMPP_API_ADMINJID_PASSWORD)) {
    watchdog('xmpp_api', 'Admin JID or Password is not set for server administration', array(), WATCHDOG_ERROR);
    return FALSE;
  }
  // Add default parameters for connection
  $params += array(
    'jid' => XMPP_API_ADMINJID,
    'password' => XMPP_API_ADMINJID_PASSWORD,
    'server' => XMPP_API_ADMINJID_SERVER,
    'timeout' => 30,
    'persistent' => FALSE,
  );
  if (empty($params['jid']) || empty($params['password'])) {
    watchdog('xmpp_api', 'Admin JID or Password is not set for server administration', array(), WATCHDOG_ERROR);
    return FALSE;
  }
  return _xmpp_api_get_connection($params);
}

/**
 * Get connection object with this server credentials
 */
function _xmpp_api_server_connection($conn = NULL) {
  return $conn ? $conn : xmpp_api_get_server_connection();
}

/**
 * Get connection with admin permissions
 *
 * In this case it will be the same as a generic server connection so this is just a wrapper
 */
function _xmpp_api_admin_connection($conn = NULL) {
  return _xmpp_api_server_connection($conn);
}


/**
 * Get connection object with some account credentials
 *
 * @param $xmppaccount
 *   User account, will default to the current user
 */
function xmpp_api_get_user_connection($xmppaccount) {
  if ($conn = _xmpp_api_get_connection($xmppaccount)) {
    return $conn;
  } else {
    return FALSE;
  }
}

/**
 * Get connection object with some account credentials
 *
 * @param $account
 *   XMPP account
 */
function _xmpp_api_user_connection($conn, $account = NULL) {
  return $conn ? $conn : xmpp_api_get_user_connection($account);
}

/**
 * Release connection and free up memory
 */
function xmpp_api_release_connection($conn) {
  if ($conn) {
    _xmpp_api_disconnect($conn);
  }
}

/**
 * Sending a message via XMPP
 *
 * @param $to
 *      Jid of person receiving the message
 * @param $type
 *      XMPP Type of message
 * @param $body
 *      Body text of message
 * @param $subject
 *      Subject of the message
 */
function xmpp_api_send_message($to, $type = 'chat', $body = null, $subject = null, $conn = NULL) {
  // connect to the server, send the message and disconnect from the server
  if ($conn = _xmpp_api_server_connection($conn)) {
    $conn->message($to, $body, $type, $subject);
    return TRUE;
  } else {
    return FALSE;
  }
}

/**
 * Function for setting the users presence in the system
 *
 * @param $account
 *      XMPP account data
 * @param $type
 *      Type of presence available, unavailable
 * @param $show
 *      Show status for the user
 * @param $status
 *      Status message for the user
 */
function xmpp_api_set_presence($account, $type = 'available', $show = 'available', $status = 'Available', $conn = NULL) {
  if ($conn = _xmpp_api_user_connection($conn, $account)) {
    $conn->presence($status, $show, NULL, $type);
    return TRUE;
  } else {
    return FALSE;
  }
}

/**
 * Deleting user account via XMPP
 *
 * @param $name
 *      User Name
 * @param $host
 *      Server
 * @param $password
 *      User Password
 */
function xmpp_api_delete_account($name, $host, $password, $conn = NULL) {
  if (!$conn = _xmpp_api_admin_connection($conn)) {
    return FALSE;
  }

  $jid = $name .'@'. $host;
  // sending delete user form per XEP-0133 specification so we can retrieve the information
  $conn->deleteUserForm($host);
  $payload = $conn->processUntil('form_returned', XMPP_API_PROCESS_TIMEOUT);

  $packet = $payload[0][1];
  // checking if the packet is an array or not
  if (!is_array($packet)) {
    watchdog('xmpp_api', '@name does not have the correct privileges to perform server administration via ad-hoc commands', array('@name' => XMPP_API_ADMINJID), WATCHDOG_ERROR);
    return FALSE;
  }
  // setting the user name we wish to delete from the server
  $packet['accountjids']['data'] = $jid;
  $conn->deleteUser($packet);
  $payload = $conn->processUntil('user_deleted', XMPP_API_PROCESS_TIMEOUT);

  // error occurred while setting the user name
  if ($payload[0][1] != 'result') {
    watchdog('xmpp_api', 'Error occurred while removing the user account', array(), WATCHDOG_ERROR);
    return FALSE;
  }

  return TRUE;
}

/**
 * Creating muc via XMPP
 *
 * @param $name
 *      The name of the muc being created
 * @param $service
 *      The conference server the muc will be created on
 * @param $server
 *      The server the muc will be created on
 * @param $title
 *      The description name for the room
 */
function xmpp_api_create_muc($name, $service, $server, $title) {
  // implemented via XEP-0045 for the creation of the room

  // connecting to the xmpp server
  if (!$conn = _xmpp_api_server_connection($conn)) {
    return FALSE;
  }

  // setting the room including nickname we will utilize
  $room = $name .'@'. $service .'/xwchat-drupal';

  // sending the initial presence to the room so we can create it
  $conn->sendInitialRoomPresence($room);
  $payload = $conn->processUntil('initial_room_enter', XMPP_API_PROCESS_TIMEOUT);
  if ($payload[0][1] != 'result') {
    _xmpp_api_disconnect($conn);
    watchdog('xmpp_api', '@name does not have privileges to create muc rooms', array('@name' => XMPP_API_ADMINJID), WATCHDOG_ERROR);
    return FALSE;
  }

  // resetting the room variable this time without the nickname on it
  $room = $name .'@'. $service;
  // sending request for the form in order to configure the room and receiving processed contents in return
  $conn->createMucRoom($room);
  $payload = $conn->processUntil('muc_created', XMPP_API_PROCESS_TIMEOUT);
  $packet = $payload[0][1];
  // if we are not returned an array we know there was an error in the configuration
  if (!is_array($packet)) {
    _xmpp_api_disconnect($conn);
    watchdog('xmpp_api', '@name does not have privileges to configure muc rooms', array('@name' => XMPP_API_ADMINJID), WATCHDOG_ERROR);
    return FALSE;
  }

  // have pre-determined options that we want to set the muc as i.e. title, persistent etc
  $options = _xmpp_api_muc_config_options($title);
  foreach ($packet as $key => $values) {
    if (array_key_exists($key, $options)) {
      $values['data'] = $options[$key];
    }
  }
  // sending request to configure the room with our pertinent information set
  $conn->createMucRoomFormSend($room, $packet);
  $payload = $conn->processUntil('muc_configured', XMPP_API_PROCESS_TIMEOUT);

  if ($payload[0][1] != 'result') {
    _xmpp_api_disconnect($conn);
    watchdog('xmpp_api', 'Configuration options specified by the user are unacceptable to the room', array(), WATCHDOG_ERROR);
    return FALSE;
  }
  _xmpp_api_disconnect($conn);
  return TRUE;
}

/**
 * Configuring muc via XMPP
 */
function xmpp_api_configure_muc($name, $service, $server, $option, $value, $conn = NULL) {
  // implemented via XEP-0045 for the creation of the room

  // connecting to the xmpp server
  if (!$conn = _xmpp_api_server_connection($conn)) {
    return FALSE;
  }

  // setting the room information regarding the muc
  $room = $name .'@'. $service;
  // sending request for the form in order to configure the room and receiving processed contents in return
  // note at this point it will not create the room since it it should already exist in the system
  $conn->createMucRoom($room);
  $payload = $conn->processUntil('muc_created', XMPP_API_PROCESS_TIMEOUT);
  $packet = $payload[0][1];
  // if we are not returned an array we know there was an error in the configuration
  if (!is_array($packet)) {
    watchdog('xmpp_api', '@name does not have privileges to configure muc rooms', array('@name' => XMPP_API_ADMINJID), WATCHDOG_ERROR);
    return FALSE;
  }
  // have pre-determined options that we want to set the muc as i.e. title, persistent etc
  $options = _xmpp_api_muc_config_options($value);
  foreach ($packet as $key => $values) {
    if (array_key_exists($key, $options)) {
      $values['data'] = $options[$key];
    }
  }
  // sending request to configure the room with our pertinent information set
  $conn->createMucRoomFormSend($room, $packet);
  $conn->processUntil('muc_configured', XMPP_API_PROCESS_TIMEOUT);

  if ($payload[0][1] != 'result') {
    watchdog('xmpp_api', 'Configuration options specified by the user are unacceptable to the room', array(), WATCHDOG_ERROR);
    return FALSE;
  }

  return TRUE;
}


/**
 * Deleting muc via XMPP
 *
 * @param $name
 *      The name of the muc being deleted
 * @param $service
 *      The conference server the muc will be removed from
 * @param $server
 *      The server the muc will be removed from
 */
function xmpp_api_delete_muc($name, $service, $server, $conn = NULL) {
  // implemented via XEP-0045 for the removal of the room

  // connecting to the xmpp server
  if (!$conn = _xmpp_api_server_connection($conn)) {
    return FALSE;
  }

  // setting the room variable with full service information then sending delete packet
  $room = $name .'@'. $service;
  $conn->removeMucRoom($room, t('Removal via xmpp api drupal'));
  $payload = $conn->processUntil('muc_removed', XMPP_API_PROCESS_TIMEOUT);

  if ($payload[0][1] != 'result') {
    watchdog('xmpp_api', 'MUC could not be removed from the xmpp server', array(), WATCHDOG_ERROR);
    return FALSE;
  }
  watchdog('xmpp_api', 'MUC successfully removed from the xmpp server', array(), WATCHDOG_NOTICE);
  return TRUE;
}

/**
 * Adding roster item via XMPP
 *
 * @param $uname
 *      XMPP User name
 * @param $userver
 *      XMPP User server
 * @param $cname
 *      Contact name
 * @param $cserver
 *      Contact server
 * @param $nick
 *      Nickname for contact
 * @param $group
 *      Group for contact
 * @param $subscription
 *      Subscription i.e. both, to, from, none
 * @param $conn
 *      Connection to the server
 */
function xmpp_api_add_rosteritem($uname, $userver, $cname, $cserver, $nick, $group, $subscription, $conn) {
  if (!$cname || !$cserver) {
    watchdog('xmpp_api', 'Contact name or server not received', array(), WATCHDOG_ERROR);
    return FALSE;
  }

  // Connecting to the xmpp server with user credentials
  if (!$conn = _xmpp_api_user_connection($conn)) {
    return FALSE;
  }

  // setting the jid of the contact we will add to our roster
  $jid = $cname .'@'.$cserver;
  if (!$nick) { $nick = $jid; }
  // connecting to the server, deleting the roster item and disconnecting from the server
  $conn->presence(); // sending presence packet
  $conn->addRosterContact($jid, $nick, array($group));
  $payload = $conn->processUntil('contact_added', XMPP_API_PROCESS_TIMEOUT);
  // doing error checking to make sure the contact was loaded
  if ($payload[0][1] != 'result') {
    watchdog('xmpp_api', 'Could not add user @jid to the roster, error occurred', array('@jid' => $jid), WATCHDOG_ERROR);
    return FALSE;
  }

  // now send the subscribe presence otherwise we wont have any subscription
  $conn->presence(NULL, NULL, $jid, 'subscribe');
  return TRUE;
}

/**
 * Deleting roster item via XMPP
 *
 * @param $uname
 *      XMPP User name
 * @param $userver
 *      XMPP User server
 * @param $cname
 *      Contact name
 * @param $cserver
 *      Contact server
 * @param $conn
 *      Connection to the server
 */
function xmpp_api_delete_rosteritem($uname, $userver, $cname, $cserver, $conn) {
  if (!$cname || !$cserver) {
    watchdog('xmpp_api', 'Contact name or server not received', array(), WATCHDOG_ERROR);
    return FALSE;
  }

  // Connecting to the xmpp server with user credentials
  if (!$conn = _xmpp_api_user_connection($conn)) {
    return FALSE;
  }

  // setting the jid of the contact we will remove from our roster
  $jid = $cname .'@'. $cserver;
  // deleting the roster item
  $conn->presence(); // sending presence packet
  $conn->deleteRosterContact($jid);
  $payload = $conn->processUntil('contact_removed', XMPP_API_PROCESS_TIMEOUT);

  // error checking to make sure the packet returned was not an error packet
  if ($payload[0][1] != 'result') {
    watchdog('xmpp_api', 'Error while trying to delete roster item: @jid', array('@jid' => $jid), WATCHDOG_ERROR);
    return FALSE;
  }
  return TRUE;
}

/**
 * Retrieve the users vcard via XMPP
 *
 * @param $account
 *   XMPP account
 */
function xmpp_api_get_vcard($account, $conn = NULL) {
  // Get connection for this user
  if ($conn = _xmpp_api_user_connection($conn, $account)) {
    $conn->getVCard();
    $packet = $conn->processUntil('vcard_received', XMPP_API_PROCESS_TIMEOUT);
    //_xmpp_api_disconnect($conn);
    if (!is_array($packet[0][1])) {
      watchdog('xmpp_api', 'Could not retrieve users vcard from the xmpp server', array(), WATCHDOG_ERROR);
      return FALSE;
    }
    return $packet[0][1];
  }
}

/**
 * Send the users vcard via XMPP
 *
 * @param $account
 *   XMPP account
 */
function xmpp_api_set_vcard($account, $vcard = array(), $conn = NULL) {

  // Connecting to the xmpp server with user credentials
  if (!$conn = _xmpp_api_user_connection($conn, $account)) {
    return FALSE;
  }

  $conn->sendVCard($vcard);
  $payload = $conn->processUntil('vcard_saved', XMPP_API_PROCESS_TIMEOUT);

  // checking for errors that might have occurred
  if ($payload[0][1] != 'result') {
    watchdog('xmpp_api', 'Could not set @name vcard, error occurred', array('@name' => $account['jid']), WATCHDOG_ERROR);
    return FALSE;
  }
  return TRUE;
}

/**
 * Retrieve a users roster
 *
 * @param $account
 *      XMPP account
 */
function xmpp_api_get_roster($account, $conn = NULL) {
  // Check the connection, get a new one if not
  if ($conn = _xmpp_api_user_connection($conn, $account)) {
    $conn->getRoster();
    $packet = $conn->processUntil('roster_received', XMPP_API_PROCESS_TIMEOUT);

    // error checking to make sure we receive the roster and not an error
    if (!is_array($packet[0][1])) {
      watchdog('xmpp_api', 'Could not retrieve the users roster from the system', array(), WATCHDOG_ERROR);
      return FALSE;
    }
    return $packet[0][1];
  }
}

/**
 * Retrieve the number of online resources for a user
 *
 * @param $account
 *   XMPP account
 */
function xmpp_api_get_user_resources($account = NULL) {
  // We need to write the ejabberd piece for it using pure api
  // In the meanwhile, it will be handled by the xmppframework
}

/***********************************************************************************************************
 * INTERNAL FUNCTIONS
 ***********************************************************************************************************/

/**
 * Builds the XMPP Connection Object
 *
 * @param $params
 *   Connection parameters. At the very least they should include:
 *     - jid and password
 *   or
 *    - username, password
 *
 * @return $conn
 *      XMPP Connection Object
 *
 */
function _xmpp_api_build_connection($params) {
  // when we are doing the connect make sure at this point we load the XMPPHP file
  module_load_include('php', 'xmpp_api', 'vendor/XMPPHP/XMPP');

  // if we received a username and password use them
  if (!empty($params['jid']) && !empty($params['password'])) {
    $pieces = explode('@', $params['jid']);
    $params += array('username' => $pieces[0], 'server' =>  $pieces[1]);
  }

  // Check minimum parameters and add defaults
  if (!empty($params['username']) && !empty($params['password'])) {
    $params += array('resource' => 'drupal-server', 'server' => NULL, 'printlog' => FALSE, 'loglevel' => XMPPHP_Log::LEVEL_VERBOSE);
    $params += array('xmpp_server' => variable_get('xmpp_api_server', '127.0.0.1'), 'xmpp_server_port' => variable_get('xmpp_api_port', '5222'));
    $conn = new XMPPHP_XMPP($params['xmpp_server'], $params['xmpp_server_port'], $params['username'], $params['password'], $params['resource'], $params['server'], $params['printlog'], $params['loglevel']);
    $conn->autoSubscribe();
    return $conn;
  } else {
    return FALSE;
  }
}

/**
 * Connect to the XMPP server and return the connection
 *
 * @param $params
 *   Connection parameters. At the very least they should include:
 *     - jid and password
 *   or
 *    - username, password
 *
 * @return $conn
 *      XMPP Connection Object
 *
 */
function _xmpp_api_get_connection($params = array()) {
  // Add some defaults
  $params += array(
    'timeout' => 30,
    'persistent' => FALSE,
  );
  if ($conn = _xmpp_api_build_connection($params)) {
    $conn->connect($params['timeout'], $params['persistent']); // Persistent
    $conn->processUntil('session_start');
    return $conn;
  } else {
    watchdog('xmpp_api', 'Failed to get connection', array(), WATCHDOG_WARNING);
  }
}

/**
 * Disconnect from the xmpp server
 *
 * @param $conn
 *      XMPP Connection Object
 */
function _xmpp_api_disconnect($conn) {
  if ($conn) {
    $conn->disconnect();
  }
}

/**
 * Returns pre-defined muc configuration options
 *
 * @param $title
 *      Description title for the muc room
 */
function _xmpp_api_muc_config_options($title) {
  return array(
    'muc#roomconfig_roomname' => $title,
    'muc#roomconfig_persistentroom' => 1,
    'muc#roomconfig_publicroom' => 1,
    'public_list' => 1,
    'muc#roomconfig_changesubject' => 1,
    'allow_private_messages' => 1,
    'allow_query_users' => 1,
    'muc#roomconfig_allowinvites' => 1,
  );
}

