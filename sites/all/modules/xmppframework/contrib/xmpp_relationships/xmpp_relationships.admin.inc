<?php
// $id

/**
 * Administrative settings form function
 */
function xmpp_relationships_admin_settings() {
  $form['settings'] = array('#type' => 'fieldset', '#title' => t('XMPP Relationships Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['settings']['xmpp_relationships_send_subscription_notification'] = array(
    '#type' => 'checkbox',
    '#title' => t('Send Notification of Relationship via XMPP'),
    '#default_value' => XMPP_RELATIONSHIPS_SEND_SUBSCRIPTION_NOTIFICATION,
    '#description' => t('If checked, an xmpp message will be sent to the user regarding the removal of the relationship this will be a message of type headline'),
  );
  // retrieving the user_relationships_types information
  if (function_exists('user_relationships_types_load')) {
    $options = array();
    foreach (user_relationships_types_load() as $rtype) {
      $options[$rtype->rtid] = $rtype->name;
    }
    if (!empty($options)) {
      $form['types'] = array('#type' => 'fieldset', '#title' => t('XMPP Relationships'), '#collapsible' => TRUE, '#collapsed' => TRUE);
      $form['types']['xmpp_relationships_user_relationships_types'] = array(
        '#type' => 'checkboxes',
        '#title' => t('User Relationship Types'),
        '#default_value' => variable_get('xmpp_relationships_user_relationships_types', array()),
        '#options' => $options,
        '#description' => t('User Relationship Types we will create XMPP relationships for'),
      );
    }
  }
  return system_settings_form($form);
}
