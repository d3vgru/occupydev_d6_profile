<?php
// $Id

/**
 * Settings form display.
 */
function xmpp_client_admin_settings() {
  $form['xmpp_client_settings'] = array('#type' => 'fieldset', '#title' => t('Chat Module Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['xmpp_client_settings']['xmpp_client_launch'] = array(
    '#type' => 'checkbox',
    '#title' => t('Launch XWChat Client on user Login'),
    '#default_value' => variable_get('xmpp_client_launch', false),
    '#description' => t('Will by default launch the XWChat client on user login. Users can stop in their settings'),
  );

  $form['client_settings'] = array('#type' => 'fieldset', '#title' => t('Chat Client Launch Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['client_settings']['xmpp_client_httpbase'] = array(
    '#type' => 'select',
    '#title' => t('XWChat HTTP Mode'),
    '#default_value' => variable_get('xmpp_client_httpbase', '/http-bind/'),
    '#options' => array('/http-bind/' => t('HTTP Bind'), '/http-poll/' => t('HTTP Poll')),
    '#description' => t('Choose which http mode the client will utilize polling or binding'),
  );
  $form['client_settings']['xmpp_client_authtype'] = array(
    '#type' => 'select',
    '#title' => t('XWChat Authentication Type'),
    '#default_value' => variable_get('xmpp_client_authtype', 'nonsasl'),
    '#options' => array('nonsasl' => t('NONSASL'), 'sasl' => t('SASL')),
    '#description' => t('Choose whether to use SASL authentication or not when logging in with the client'),
  );
  $form['client_settings']['xmpp_client_muc_conference'] = array(
    '#type' => 'textfield',
    '#title' => t('XWChat Mutli-User Chat Conference Server'),
    '#default_value' => variable_get('xmpp_client_muc_conference', 'conference.chat.openband.net'),
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('Server were all of the multi-user chat rooms are stored'),
  );
  $form['client_settings']['xmpp_client_jud'] = array(
    '#type' => 'textfield',
    '#title' => t('XWChat Jabber User Directory'),
    '#default_value' => variable_get('xmpp_client_jud', 'vjud.chat.openband.net'),
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('Server where your Jabber user directory service is running'),
  );
  $form['client_settings']['xmpp_client_locale'] = array(
    '#type' => 'select',
    '#title' => t('XWChat Locale Setting'),
    '#default_value' => variable_get('xmpp_client_locale', 'en'),
    '#options' => array(
      'arabic' => t('Arabic'),
      'ch' => t('Chinese'),
      'nl' => t('Dutch'),
      'en' => t('English'),
      'fi' => t('Finnish'),
      'fr' => t('French'),
      'de' => t('German'),
      'hu' => t('Hungarian'),
      'it' => t('Italian'),
      'ko' => t('Korean'),
      'lt' => t('Lithuanian'),
      'ro' => t('Romanian'),
      'ru' => t('Russian'),
      'es' => t('Spanish'),
      'tk' => t('Turkish'),
    ),
    '#description' => t('Choose the default language that the client will utilize'),
  );
  return system_settings_form($form);
}
