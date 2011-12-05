<?php
// $id:

/**
 * Function used to display the admin screen for the module
 */
function xmpp_roster_admin_settings() {
  $form['settings'] = array('#type' => 'fieldset', '#title' => t('XMPP Roster Settings'), '#collapsible' => TRUE, '#collapsed' => FALSE);
  return system_settings_form($form);
}
