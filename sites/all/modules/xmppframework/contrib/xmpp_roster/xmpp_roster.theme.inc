<?php
// $id

/**
 * Builds the display page for the xmpp roster associations
 *
 * @param $associations
 *      Array of pre-built associations
 * @param $view
 *      View we wish to see
 */
function theme_xmpp_roster_associations($associations = array(), $view = 'both') {
  global $user;
  $output = '';

  $header = array('name' => t('Name'), 'created' => t('Created'), 'type' => t('Relationship Types'), 'action' => t('Action'));

  if ($view == 'both') {
    // retrieving all associations that are in xmpp and user relationships
    $both = $associations['both'];
    if (is_array($both) && !empty($both)) {
      $output .= t('<h2>Associates you have in your XMPP Roster and have a User Relationship with</h2>');
      foreach ($both as $key => $values) {
        $uid = $values['uid'];
        // This is done so we make sure the translations are displayed correctly
        if (is_array($values['type'])) {
          $type = array();
          foreach ($values['type'] as $association_type) {
            $type[] = t($association_type);
          }
          $type = implode(', ', $type);
        }
        else {
          $type = t($values['type']);
        }
        $entry[] = array(
          'name' => $values['name'],
          'created' => format_date($values['created'], variable_get('user_profile_date_format', 'small')),
          'type' => $type,
          'action' => l(t('Remove'), 'xmpp_roster/delete/'. $uid),
        );
      }
      $output .= theme('table', $header, $entry);
    }
    else {
      $output .= '<div style="text-align: center;">'. t('No relationships were found that we in your XMPP and User Relationships') .'</div>';
    }
  }

  if ($view == 'relationships') {
    // retrieving all associations that are in user relationships only
    $relationship = $associations['relationship'];
    if (is_array($relationship) && !empty($relationship)) {
      $output .= t('<h2>Associates with User Relationships only</h2>');
      foreach ($relationship as $key => $values) {
        $uid = $values['uid'];
        // This is done so we make sure the translations are displayed correctly
        if (is_array($values['type'])) {
          $type = array();
          foreach ($values['type'] as $association_type) {
            $type[] = t($association_type);
          }
          $type = implode(', ', $type);
        }
        else {
          $type = t($values['type']);
        }
        $entry1[] = array(
          'name' => $values['name'],
          'created' => format_date($values['created'], variable_get('user_profile_date_format', 'small')),
          'type' => $type,
          'action' => l(t('Add'), 'xmpp_roster/add/'. $uid),
        );
      }
      $output .= theme('table', $header, $entry1);
    }
    else {
      $output .= '<div style="text-align: center;">'. t('No relationships were found') .'</div>';
    }
  }
  // resetting two of the header fields for the xmpp view
  $header = array('name' => t('Name'), 'jid' => t('Chat ID'), 'system' => t('In System'), 'action' => t('Action'));

  if ($view == 'xmpp') {
    // retrieving all associations that are in xmpp only
    $xmpp = $associations['xmpp'];
    if (is_array($xmpp) && !empty($xmpp)) {
      $output .= t('<h2>Associates with XMPP Roster relationships only</h2>');
      foreach ($xmpp as $key => $values) {
        if (isset($xmpp[$key]) && isset($xmpp[$key]['uid']) && is_numeric($xmpp[$key]['uid'])) {
          if (db_result(db_query("SELECT COUNT(uid) FROM {users} WHERE uid = %d", $xmpp[$key]['uid']))) {
            $xmppuser = TRUE;
          }
        }
        $name = (!is_null($xmppuser)) ? $xmppuser->name : t('Unknown');
        $jid = $key;
        $system = (!is_null($xmppuser)) ? t('Yes') : t('No');
        $action = (!is_null($xmppuser)) ? l(t('Remove'), 'xmpp_roster/delete/'. $xmpp[$key]['uid']) : l(t('Remove'), 'xmpp_roster/delete/'. $key);
        $entry2[] = array('name' => $name, 'jid' => $jid, 'system' => $system, 'action' => $action);
        $xmppuser = NULL;
      }
      $output .= theme('table', $header, $entry2);
    }
    else {
      $output .= '<div style="text-align: center;">'. t('No xmpp relationships were found') .'</div>';
    }
  }
  return $output;
}
