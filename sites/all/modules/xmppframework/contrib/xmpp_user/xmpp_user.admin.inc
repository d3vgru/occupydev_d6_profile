<?php
// $Id

/**
 * @file
 * Admin page callback file for the xmpp user module.
 */

//////////////////////////////////////////////////////////////////////////////
// XMPP User Admin Settings

/**
 * Settings form display.
 */
function xmpp_user_admin_settings() {
  $form['xmpp_user_settings'] = array('#type' => 'fieldset', '#title' => t('XMPP User Settings'), '#collapsible' => TRUE, '#collapsed' => FALSE);
  $form['xmpp_user_settings']['xmpp_user_password_field'] = array(
    '#type' => 'checkbox',
    '#title' => t('Show XMPP User Password Field'),
    '#default_value' => variable_get('xmpp_user_password_field', FALSE),
    '#description' => t('If checked the user will see the password field on the user account settings page and be able to alter it'),
  );
  $form['xmpp_user_settings']['xmpp_user_resource_field'] = array(
    '#type' => 'checkbox',
    '#title' => t('Show XMPP User Resource Field'),
    '#default_value' => variable_get('xmpp_user_resource_field', FALSE),
    '#description' => t('If checked the user will see the resource field on the user account settings page and be able to alter it'),
  );
  $form['xmpp_user_settings']['xmpp_user_store_login_password'] = array(
    '#type' => 'checkbox',
    '#title' => t('Store Login password as XMPP Password'),
    '#default_value' => variable_get('xmpp_user_store_login_password', FALSE),
    '#description' => t('If checked the system will over write the xmpp password stored in the module with the password utilized on login, useful in ldap environment'),
  );

  $form['xmpp_user_provisioning'] = array('#type' => 'fieldset', '#title' => t('Provisioning Settings'), '#collapsible' => TRUE, '#collapsed' => FALSE);
  $form['xmpp_user_provisioning']['xmpp_user_provisioning_server'] = array(
    '#type' => 'textfield',
    '#title' => t('XMPP Server Domain'),
    '#default_value' => variable_get('xmpp_user_provisioning_server', ''),
    '#size' => 50,
    '#maxlength' => 255,
    '#description' => t('The xmpp server domain we will utilize and hence append the users name too (user @ domain)'),
  );
  $form['xmpp_user_provisioning']['xmpp_user_provisioning_on'] = array(
    '#type' => 'checkbox',
    '#title' => t('Provision XMPP for Drupal Users'),
    '#default_value' => variable_get('xmpp_user_provisioning_on', FALSE),
    '#description' => t('If checked the system will provision xmpp for drupal users so they can utilize xmpp functionality'),
  );
  $form['xmpp_user_cron'] = array('#type' => 'fieldset', '#title' => t('Cron Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['xmpp_user_cron']['xmpp_user_cron_interval'] = array(
    '#type' => 'textfield',
    '#title' => t('XMPP User Offline Interval'),
    '#default_value' => variable_get('xmpp_user_cron_interval', 1),
    '#description' => t('The time interval (Days) where the user will be set to offline if their status is not updated during this period'),
  );
  return system_settings_form($form);
}
