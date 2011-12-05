<?php
// $Id

/**
 * Display the Admin settings form for the module
 */
function xmpp_api_admin_settings() {
  $form['settings'] = array('#type' => 'fieldset', '#title' => t('XMPP API Settings'), '#collapsible' => TRUE, '#collapsed' => FALSE);
  $form['settings']['xmpp_api_server'] = array(
    '#type' => 'textfield',
    '#title' => t('XMPP Server'),
    '#default_value' => variable_get('xmpp_api_server', '127.0.0.1'),
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('Server where xmpp requests will be sent'),
  );
  $form['settings']['xmpp_api_port'] = array(
    '#type' => 'textfield',
    '#title' => t('XMPP Port'),
    '#default_value' => variable_get('xmpp_api_port', '5222'),
    '#size' => 20,
    '#maxlength' => 5,
    '#description' => t('Port where xmpp requests will be sent'),
  );
  $form['settings']['xmpp_api_adminjid'] = array(
    '#type' => 'textfield',
    '#title' => t('Admin JID'),
    '#default_value' => XMPP_API_ADMINJID,
    '#size' => 20,
    '#description' => t('JID with administration priviledges on the server for using XEP-0133'),
  );
  $form['settings']['xmpp_api_adminjid_password'] = array(
    '#type' => 'password',
    '#title' => t('Admin JID Password'),
    '#default_value' => XMPP_API_ADMINJID_PASSWORD,
    '#size' => 20,
    '#description' => t('Admin JID password for accessing that account on the server'),
  );
  $form['settings']['xmpp_api_adminjid_server'] = array(
    '#type' => 'textfield',
    '#title' => t('Admin JID Server'),
    '#default_value' => XMPP_API_ADMINJID_SERVER,
    '#size' => 20,
    '#description' => t('Admin JID server which we will be connecting too as the domain'),
  );
  return system_settings_form($form);
}
