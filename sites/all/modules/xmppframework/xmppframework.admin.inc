<?php
// $Id

/**
 * Settings form display.
 */
function xmppframework_admin_settings() {

  $options = array();
  // display the apis that are available to the xmppframework module
  if (($info = xmppframework_apis()) && is_array($info)) {
    foreach ($info as $api => $data) {
      $options[$api] = $data['name'];
    }
  }

  $form['xmppframework'] = array('#type' => 'fieldset', '#title' => t('XMPP Framework Settings'), '#collapsible' => TRUE, '#collapsed' => FALSE);
  $form['xmppframework']['xmppframework_api'] = array(
    '#type'          => 'select',
    '#title'         => t('XMPP API'),
    '#default_value' => XMPPFRAMEWORK_API,
    '#options'       => $options,
    '#description'   => t('XMPP API that we shall utilize in our transactions'),
  );
  return system_settings_form($form);
}
