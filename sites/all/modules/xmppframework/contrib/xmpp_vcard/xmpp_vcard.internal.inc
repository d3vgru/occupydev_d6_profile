<?php
// $id:

/**
 * Function retrieves the users vcard and their matching content profile
 * then it calls the themeing function to display the output to the user
 *
 * @param $user
 *      User object
 */
function xmpp_vcard_synchronize($user = NULL) {
  if (!$user) {
    global $user;
  }

  // return error if no profile is loaded since we cannot
  // do any mappings without the profile node being loaded
  if (!($profile = _xmpp_vcard_content_profile_load())) {
    watchdog('xmpp_vcard', 'No content node matches the type specified for mapping between xmpp vcards and content profiles', array(), WATCHDOG_NOTICE);
    return '<div style="text-align: center;">'. t('No content node is available, mapping between xmpp vcard and your drupal profile cannot occur') .'</div>';
  }
  // calling the xmppframework to retrieve the vcard
  $vcard = xmppframework_get_user_vcard($user);
  variable_set('xmpp_vcard_user_vcard_'. $user->uid, serialize($vcard));

  return theme('xmpp_vcard_information', $vcard, $profile);
}

/**
 * Function to synchronize a specific field
 *
 * @param $field
 *      Field to synchronize
 */
function xmpp_vcard_synchronize_field($field) {
  global $user;
  if (!$field) {
    drupal_set_message(t('No field was specified to synchronize'), 'error');
    drupal_goto('user/'. $user->uid .'/vcard');
  }
  // retrieve the vcard from the serialized data stored previously
  $vcard = unserialize(variable_get('xmpp_vcard_user_vcard_'. $user->uid, ''));
  // retrieve the pertinent information regarding the field
  $field_mapping = _xmpp_vcard_fields(strtoupper($field));
  // load the content profile node and verify that it exists
  if (!($profile = _xmpp_vcard_content_profile_load())) {
    watchdog('xmpp_vcard', 'No content node matches the type specified for mapping between xmpp vcards and content profiles', array(), WATCHDOG_NOTICE);
    drupal_set_message(t('No content node is available, mapping between xmpp vcard and your drupal profile cannot occur'), 'error');
    drupal_goto('user/'. $user->uid .'/vcard');
  }

  // setting so we can determine if access is allowed or not
  $tuser = new StdClass();
  $tuser->uid = 0;

  // retrieve the vcalue for the profile mapping and set it in the vcard
  if (isset($profile->$field_mapping['mapping']) && is_array($profile->$field_mapping['mapping'])) {
    $values = $profile->$field_mapping['mapping'];
    $value = $values[0]['value'];
  }
  else {
    $value = $profile->$field_mapping['mapping'];
  }
  $vcard = _xmpp_vcard_set_value($vcard, $field, $value);

  // resetting with the new information in the vcard
  variable_set('xmpp_vcard_user_vcard_'. $user->uid, serialize($vcard));
  // set the vcard on the xmpp server for the user
  xmppframework_set_user_vcard($vcard);
  drupal_set_message(t('VCard field @field has been synchronized with your content profile field', array('@field' => $field)));
  drupal_goto('user/'. $user->uid .'/vcard');
}

/**
 * Function to synchronize all of the fields between the vcard and drupal content profile
 */
function xmpp_vcard_synchronize_all() {
  global $user;

  // retrieve the vcard from storage
  $vcard = unserialize(variable_get('xmpp_vcard_user_vcard_'. $user->uid, ''));

  // retrieve all of the field mappings
  $field_mapping = _xmpp_vcard_fields();
  // load the content profile node and verify that it exists
  if (!($profile = _xmpp_vcard_content_profile_load())) {
    watchdog('xmpp_vcard', 'No content node matches the type specified for mapping between xmpp vcards and content profiles', array(), WATCHDOG_NOTICE);
    drupal_set_message(t('No content node is available, mapping between xmpp vcard and your drupal profile cannot occur'), 'error');
    drupal_goto('user/'. $user->uid .'/vcard');
  }

  // setting so we can determine if access is allowed or not
  $tuser = new StdClass();
  $tuser->uid = 0;

  // going through the mappings to retrieve the pertinent information
  foreach ($field_mapping as $name => $field) {
    // retrieve the value for the profile mapping and set it in the vcard
    if (isset($profile->$field['mapping']) && is_array($profile->$field['mapping'])) {
      $values = $profile->$field['mapping'];
      $value = $values[0]['value'];
    }
    else {
      $value = $profile->$field['mapping'];
    }
    // incase the name is capitalized which it should not be
    $vcard = _xmpp_vcard_set_value($vcard, strtolower($name), $value);
  }
  // resetting with the new information in the vcard
  variable_set('xmpp_vcard_user_vcard_'. $user->uid, serialize($vcard));
  // set the vcard on the xmpp server for the user
  xmppframework_set_user_vcard($vcard);
  drupal_set_message(t('All VCard fields have been synchronized with your content profile fields'));
  drupal_goto('user/'. $user->uid .'/vcard');
}

/**
 * Function holds the field mappings for the vcard
 *
 * @param $field
 *      Field we are looking for in the mapping
 * @param $refresh
 *      Refresh the cache if this is set
 */
function _xmpp_vcard_fields($field = NULL, $refresh = false) {
  static $fields = array();

  // if refresh is called or this is the first time calling
  if ($refresh || empty($fields)) {
    $vcard_fields = _xmpp_vcard_available_fields();
    foreach (variable_get('xmpp_vcard_field_mapping', array()) as $key => $value) {
      $map = explode("|", trim($mapping));
      if (drupal_strlen(trim($key))) {
        $fields[trim($key)]  = array('name' => $vcard_fields[trim($key)], 'mapping' => trim($value));
      }
    }
  }
  // determine if it is an actual field we want returned
  if ($field) {
    if (isset($fields[$field]) && is_array($fields[$field])) {
      return $fields[$field];
    }
    return NULL;
  }
  return $fields;
}

/**
 * Load the content profile for the user based off admin specified content profile type
 *
 * @return $profile
 *      Content Profile Node if found or NULL if not found
 */
function _xmpp_vcard_content_profile_load() {
  global $user;
  $profile = NULL;

  // go through each of the nodes defined as content profiles
  foreach (content_profile_get_types('names') as $type => $type_name) {
    if ($type == variable_get('xmpp_vcard_profile_type', '')) {
      $profile = content_profile_load($type, $user->uid);
      break;
    }
  }
  return $profile;
}

/**
 * Helper function that will allow us to set the field correctly
 *
 * @param $vcard
 *      Array holding the vcard information
 * @param $field
 *      Field we wish to set in the vcard
 * @param $value
 *      Value for the field in the vcard
 *
 * @return $vcard
 *      Array holding vcard or partial vcard information depending
 *      on where exactly in the recursive call we are standing
 */
function _xmpp_vcard_set_value($vcard, $field, $value) {
  foreach ($vcard as $name => $val) {
    if (is_array($val)) {
      // recursively call until we get to a field that is not an array
      $vcard[$name] = _xmpp_vcard_set_value($val, $field, $value);
    }
    else {
      // check if it is the field we are looking for and set the
      // value for the field if it is the one we are trying to set
      if (!strcmp($field, $name)) {
        $vcard[$name] = $value;
      }
    }
  }
  return $vcard;
}
