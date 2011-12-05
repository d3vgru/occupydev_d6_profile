<?php
// $id:

/**
 * Function used to display the admin screen for the module
 */
function xmpp_xmlrpc_admin_settings() {
  $form['settings'] = array('#type' => 'fieldset', '#title' => t('XMPP XMLRPC Settings'), '#collapsible' => TRUE, '#collapsed' => FALSE);
  $form['settings']['xmpp_xmlrpc_url'] = array(
    '#type' => 'textfield',
    '#title' => t('Xmlrpc Url'),
    '#default_value' => variable_get('xmpp_xmlrpc_url', '127.0.0.1'),
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('Url where all XMLRPC requests will be sent too'),
  );
  $form['settings']['xmpp_xmlrpc_port'] = array(
    '#type' => 'textfield',
    '#title' => t('Xmlrpc port'),
    '#default_value' => variable_get('xmpp_xmlrpc_port', '80'),
    '#size' => 20,
    '#maxlength' => 5,
    '#description' => t('Port where all XMLRPC requests will be sent too'),
  );
  $form['settings']['xmpp_xmlrpc_query_string'] = array(
    '#type' => 'textfield',
    '#title' => t('Xmlrpc Query String'),
    '#default_value' => variable_get('xmpp_xmlrpc_query_string', '/'),
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('Additional path information for the XMLRPC request'),
  );
  return system_settings_form($form);
}
