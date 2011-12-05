<?php
// $Id

/**
 * Function used to display the admin screen for the module
 */
function xmpp_vcard_admin_settings() {
  $options = array();
  foreach (content_profile_get_types('names') as $type => $type_name) {
    $options[$type] = $type_name;
  }

  $form['settings'] = array('#type' => 'fieldset', '#title' => t('XMPP VCard Settings'), '#collapsible' => TRUE, '#collapsed' => FALSE);
  $form['settings']['xmpp_vcard_profile_type'] = array(
    '#type' => 'select',
    '#title' => t('Content Profile Type'),
    '#default_value' => variable_get('xmpp_vcard_profile_type', ''),
    '#options' => $options,
    '#description' => t('Content profile type that we will utilize in order to perform mappings between the VCard and the users profile in Drupal'),
  );
  return system_settings_form($form);
}

/**
 * Form handler for the xmpp vcard field form
 */
function xmpp_vcard_fields_form(&$form_state) {
  $form = array();
  $results = db_query("SELECT name, title FROM {xmpp_vcard_fields} ORDER BY name ASC");
  $rows = array();
  while ($row = db_fetch_object($results)) {
    $rows[] = array('name' => $row->name, 'title' => t($row->title), 'link' => l(t('Delete'), 'admin/xmppframework/vcard/fields/delete', array('query' => array('name' => $row->name))));
  }
  if (!empty($rows)) {
    $header = array('name' => t('Field Name'), 'title' => t('Field Title'), 'link' => t('Operation'));
    $form['fields'] = array('#value' => theme('table', $header, $rows));
  }
  $form['name'] = array(
    '#type' => 'textfield',
    '#title' => t('Field Name'),
    '#description' => t('XMPP VCARD Name for the Field per the specification'),
    '#size' => '30',
  );
  $form['title'] = array(
    '#type' => 'textfield',
    '#title' => t('Field Title'),
    '#description' => t('Title for the Field to see in the select box'),
    '#size' => '30',
  );
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Add'),
  );
  $form['#theme'] = 'xmpp_vcard_fields_form';
  return $form;
}

/**
 * XMPP Vcard Mapping Form Submit Handler
 */
function xmpp_vcard_fields_form_submit(&$form, &$form_state) {
  $current_fields = _xmpp_vcard_available_fields();
  if (isset($current_fields[$form_state['values']['name']])) {
    drupal_set_message(t('Field already exists in the system, you cannot create the same field more than once'), 'error');
  }
  else {
    $array = array('name' => $form_state['values']['name'], 'title' => $form_state['values']['title']);
    drupal_write_record('xmpp_vcard_fields', $array);
    drupal_set_message(t('New VCard field has been created in the system'));
  }
  $form_state['redirect'] = 'admin/xmppframework/vcard/fields';
}

/**
 * Remove an XMPP Vcard mapping from the system
 */
function xmpp_vcard_fields_delete() {
  if (!isset($_GET['name']) && is_null($_GET['name']) || !drupal_strlen($_GET['name'])) {
    watchdog('xmpp_vcard', 'No field was received by the system for deletion', array(), WATCHDOG_ERROR);
    drupal_set_message(t('No field was received by the system for deletion'), 'error');
  }
  else {
    db_query("DELETE FROM {xmpp_vcard_fields} WHERE name = '%s'", $_GET['name']);
    // Remove the mapping if we can from the system
    $mappings = variable_get('xmpp_vcard_field_mapping', array());
    if (isset($mappings[$_GET['name']])) {
      unset($mappings[$_GET['name']]);
    }
    variable_set('xmpp_vcard_field_mapping', $mappings);
    drupal_set_message(t('Field has been successfully removed from the system'));
  }
  drupal_goto('admin/xmppframework/vcard/fields');
}

/**
 * Form handler for xmpp vcard mapping form
 */
function xmpp_vcard_mappings_form(&$form_state) {
  $form = array();
  $mappings = variable_get('xmpp_vcard_field_mapping', array());
  $vcard = _xmpp_vcard_available_fields();
  $content_profile = _xmpp_vcard_content_type_fields();
  if (is_array($mappings) && !empty($mappings)) {
    $rows = array();
    $header = array('vcard' => t('XMPP VCard'), 'drupal' => t('Content Profile'), 'link' => t('Operation'));
    foreach ($mappings as $k => $v) {
      $rows[] = array('vcard' => $vcard[$k], 'drupal' => $content_profile[$v], 'link' => l(t('Delete'), 'admin/xmppframework/vcard/mappings/delete/'. $k));
      unset($vcard[$k]);
      unset($content_profile[$v]);
    }
    // Only display this section if the mappings are not empty
    if (!empty($rows)) {
      $form['mappings'] = array('#value' => theme('table', $header, $rows));
    }
  }
  $form['vcard'] = array(
    '#type' => 'select',
    '#title' => t('XMPP VCard'),
    '#options' => $vcard,
    '#description' => t('Fields that are currently available in the XMPP VCard'),
  );
  $form['drupal'] = array(
    '#type' => 'select',
    '#title' => t('Content Profile'),
    '#options' => $content_profile,
    '#description' => t('Fields that are available in the content profile node type definition'),
  );
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Add'),
  );
  $form['#theme'] = 'xmpp_vcard_mappings_form';
  return $form;
}

/**
 * XMPP Vcard Mapping Form Submit Handler
 */
function xmpp_vcard_mappings_form_submit(&$form, &$form_state) {
  $mappings = variable_get('xmpp_vcard_field_mapping', array());
  $vcard = $form_state['values']['vcard'];
  $drupal = $form_state['values']['drupal'];
  if (isset($mappings[$vcard])) {
    drupal_set_message(t('Mapping already exists in the system, you must remove the existing mapping if you wish to re-map the field'), 'error');
  }
  else {
    $mappings[$vcard] = $drupal;
    variable_set('xmpp_vcard_field_mapping', $mappings);
    drupal_set_message(t('Mapping between Vcard and Content Profile Field has been created'));
  }
  $form_state['redirect'] = 'admin/xmppframework/vcard/mappings';
}

/**
 * Remove an XMPP Vcard mapping from the system
 */
function xmpp_vcard_mappings_delete($field = NULL) {
  if (is_null($field) || !drupal_strlen($field)) {
    watchdog('xmpp_vcard', 'Invalid Field %field was received by the module', array('%field' => $field), WATCHDOG_ERROR);
    drupal_set_message(t('Invalid Field %field was received by the module', array('%field' => $field), 'error'));
  }
  else {
    $mappings = variable_get('xmpp_vcard_field_mapping', array());
    if (isset($mappings[$field])) {
      unset($mappings[$field]);
    }
    variable_set('xmpp_vcard_field_mapping', $mappings);
  }
  drupal_goto('admin/xmppframework/vcard/mappings');
}

/**
 * Helper function to retrieve the fields for the node type
 *
 */
function _xmpp_vcard_content_type_fields() {
  $array = array('' => t('Select One'));
  $fields = array();
  $node_type = variable_get('xmpp_vcard_profile_type', '');
  if (!is_null($node_type) && drupal_strlen($node_type)) {
    $cfields = content_types($node_type);
    // Do not do this for creation of new types
    if (is_array($cfields) && !empty($cfields)) {
      if (is_array($cfields['fields']) && !empty($cfields['fields'])) {
        // Traverse the fields so we can retrieve the information
        foreach ($cfields['fields'] as $k => $v) {
          if (isset($v['widget']['label'])) {
            $fields[$k] = $v['widget']['label'];
          }
          else {
            $fields[$k] = $k;
          }
        }
      }
      if (is_array($cfields['extra']) && !empty($cfields['extra'])) {
        // Traverse the Extra portion inside the node type
        foreach ($cfields['extra'] as $k => $v) {
          if (isset($v['label'])) {
            $fields[$k] = $v['label'];
          }
          else {
            $fields[$k] = $k;
          }
        }
      }
    }
    asort($fields);
  }
  return empty($fields) ? $array : $array += $fields;
}
