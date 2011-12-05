<?php
// $id:

/**
 * Get connection parameters
 *
 * This is a connection-less method so we just pass around the connection parameters
 */
function xmpp_xmlrpc_get_connection() {
  return array(
    'host' => variable_get('xmpp_xmlrpc_url', '127.0.0.1'),
    'port' => variable_get('xmpp_xmlrpc_port', '80'),
    'query' => variable_get('xmpp_xmlrpc_query_string', '/'),
  );
}

/**
 * Foo function
 */
function xmpp_xmlrpc_release_connection() {
  return TRUE;
}


/**
 * Sending a message via XMLRPC interface
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
function xmpp_xmlrpc_send_message($to, $type = 'chat', $body = null, $subject = null, $conn = NULL) {
  return _xmpp_xmlrpc('send_message', array('from' => $to, 'to' => $to, 'subject' => $subject, 'body' => $body), $conn);
}

/**
 * Setting a users presence via XMLRPC interface
 *
 * @param $xmppaccount
 *      XMPP account we are setting the presence for
 * @param $type
 *      Type of presence packet we are sending
 * @param $show
 *      Show status we will send to the users
 * @param $status
 *      Status message we will display to the users
 */
function xmpp_xmlrpc_set_presence($xmppaccount, $type = 'available', $show = 'available', $status = 'Available', $connection = NULL) {
  // Return false if the user object does not have the jud and client information set
  if (!isset($xmppaccount['jid']) || !drupal_strlen($xmppaccount['jid'])) {
    return FALSE;
  }
  return _xmpp_xmlrpc('set_presence', array('user' => $xmppaccount['username'], 'server' => $xmppaccount['server'], 'show' => $show, 'status' => $status, 'type' => $type), $connection);
}

/**
 * Deleting user account via XMLRPC interface
 *
 * @param $name
 *      User Name
 * @param $host
 *      Server
 * @param $password
 *      User Password
 */
function xmpp_xmlrpc_delete_account($name, $host, $password, $connection = NULL) {
  return _xmpp_xmlrpc('delete_account', array('user' => $name, 'host' => $host, 'password' => $password), $connection);
}

/**
 * Creating muc via XMLRPC interface
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
function xmpp_xmlrpc_create_muc($name, $service, $server, $title, $connection = NULL) {
  $result = _xmpp_xmlrpc('create_muc_room', array('name' => $name, 'service' => $service, 'server' => $server), $connection);
  if ($result === FALSE) {
    watchdog('xmpp_xmlrpc', 'Errno: !num Message: !msg', array('!num' => xmlrpc_errno(), '!msg' => xmlrpc_error_msg()), WATCHDOG_ERROR);
    return $result;
  }
  // change the title i.e. the description for the room
  return _xmpp_xmlrpc('muc_room_change_option', array('name' => $name, 'service' => $service, 'option' => 'title', 'value' => $title));
}

/**
 * Configuring muc via XMLRPC interface
 *
 * @param $name
 *  The name of the muc being created
 * @param $service
 *  The conference server the muc will be created on
 * @param $server
 *  The server the muc will be created on
 * @param $option
 *  Option we wish to configure
 * @param $value
 *  Value of the option we wish to configure
 */
function xmpp_xmlrpc_configure_muc($name, $service, $server, $option, $value, $connection = NULL) {
  return _xmpp_xmlrpc('muc_room_change_option', array('name' => $name, 'service' => $service, 'option' => $option, 'value' => $value), $connection);
}

/**
 * Deleting muc via XMLRPC interface
 *
 * @param $name
 *      The name of the muc being created
 * @param $service
 *      The conference server the muc will be created on
 * @param $server
 *      The server the muc will be created on
 */
function xmpp_xmlrpc_delete_muc($name, $service, $server, $connection = NULL) {
  return _xmpp_xmlrpc('delete_muc_room', array('name' => $name, 'service' => $service, 'server' => $server), $connection);
}

/**
 * Adding roster item via XMLRPC interface
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
 */
function xmpp_xmlrpc_add_rosteritem($uname, $userver, $cname, $cserver, $nick, $group, $subscription, $connection = NULL) {
  return _xmpp_xmlrpc('add_rosteritem', array('localuser' => $uname, 'localserver' => $userver, 'user' => $cname, 'server' => $cserver, 'nick' => $nick, 'group' => $group, 'subs' => $subscription), $connection);
}

/**
 * Deleting roster item via XMLRPC interface
 *
 * @param $uname
 *      XMPP User name
 * @param $userver
 *      XMPP User server
 * @param $cname
 *      Contact name
 * @param $cserver
 *      Contact server
 */
function xmpp_xmlrpc_delete_rosteritem($uname, $userver, $cname, $cserver, $connection = NULL) {
  return _xmpp_xmlrpc('delete_rosteritem', array('localuser' => $uname, 'localserver' => $userver, 'user' => $cname, 'server' => $cserver), $connection);
}

/**
 * Retrieving a user roster
 *
 * @param $xmppuser
 *    XMPP User credentials
 */
function xmpp_xmlrpc_get_roster($xmppuser = NULL, $conn = NULL) {

  $url = xmpp_xmlrpc_url($conn);
  $result = xmlrpc($url, 'get_roster', array('user' => $xmppuser['username'], 'server' => $xmppuser['server']));
  if ($result === FALSE) {
    watchdog('xmpp_xmlrpc', 'Errno: !num Message: !msg' , array('!num' => xmlrpc_errno(), '!msg' => xmlrpc_error_msg()), WATCHDOG_ERROR);
    return FALSE;
  }
  // parse the information and return as an array
  $roster = array();
  if (is_array($result)) {
    foreach ($result as $key => $values) {
      $jid = $values['jid'];
      // means the user was in more than one group
      if (isset($roster[$jid])) {
        $roster[$jid]['groups'][] = $values['group'];
      }
      else {
        $roster[$jid] = array('name' => $values['nick'], 'subscription' => 'both');
        $roster[$jid]['groups'] = array($values['group']);
      }
    }
  }
  return $roster;
}

/**
 * Retrieving the number of online resources for a user
 *
 * @param $account
 *      XMPP account
 */
function xmpp_xmlrpc_get_user_resources($account, $connection = NULL) {
  return _xmpp_xmlrpc('num_resources', array('user' => $account['username'], 'host' => $account['server']), $connection);
}

/**
 * Setting member list for multi-user chat groups
 *
 * @param $name
 *  Muc room name
 * @param $service
 *  Muc service on the xmpp server
 * @param $jid
 *  JID we are setting the affiliation for
 * @param $affiliation
 *  JID's affiliation to the room i.e. (none, member etc)
 */
function xmpp_xmlrpc_set_user_muc_affiliation($name, $service, $jid, $affiliation, $connection = NULL) {
  return _xmpp_xmlrpc('muc_room_set_affiliation', array('name' => $name, 'service' => $service, 'jid' => $jid, 'affiliation' => $affiliation), $connection);
}

/**
 * Build xmlrpc url based off the module parameters
 *
 * Alternatively, if a connection is provided, will use the parameters for that connection
 */
function xmpp_xmlrpc_url($conn = NULL) {
  if (is_null($conn) || !is_array($conn)) {
    $conn = xmpp_xmlrpc_get_connection();
  }
  $host = $conn['host'];
  $port = $conn['port'];
  $query = $conn['query'];
  $url = 'http://'. $host .':'. $port .'/';
  if (drupal_strlen($query)) {
    $url .= (strpos($query, '/') == 0) ? substr($query, 1) : $query;
  }
  return $url;
}

/**
 * Helper function. Make XMLRPC with error logging.
 */
function _xmpp_xmlrpc($service, $params, $connection = NULL) {
  $result = xmlrpc(xmpp_xmlrpc_url($connection), $service, $params);
  if ($result === FALSE) {
    watchdog('xmpp_xmlrpc', 'Errno: !num Message: !msg' , array('!num' => xmlrpc_errno(), '!msg' => xmlrpc_error_msg()), WATCHDOG_ERROR);
    return FALSE;
  } else {
    return TRUE;
  }
}
