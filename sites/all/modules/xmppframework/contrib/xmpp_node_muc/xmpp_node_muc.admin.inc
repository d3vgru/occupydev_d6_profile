<?php
// $id

function xmpp_node_muc_admin_settings() {
  $options = array();
  if (($node_types = node_get_types()) && is_array($node_types)) {
    foreach ($node_types as $key => $values) {
      $options[$key] = $values->name;
    }
  }

  $form['settings'] = array('#type' => 'fieldset', '#title' => t('XMPP NODE MUC Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['settings']['xmpp_node_muc_server'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Name of the ejabberd server'),
    '#default_value' => variable_get('xmpp_node_muc_server', 'example.com'),
    '#description'   => t('The name of the ejabberd server that the muc will be created on i.e. localhost'),
  );
  $form['settings']['xmpp_node_muc_service'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Name of the ejabberd muc service'),
    '#default_value' => variable_get('xmpp_node_muc_service', 'conference.example.com'),
    '#description'   => t('The name of the ejabberd service that the muc will be created on i.e. conference.localhost'),
  );
  $form['settings']['xmpp_node_muc_types_temporary'] = array(
    '#type'          => 'checkboxes',
    '#title'         => t('Temporary Node Types'),
    '#default_value' => variable_get('xmpp_node_muc_types_temporary', array()),
    '#options'       => $options,
    '#description'   => t('Node types that we will create temporary mucs for'),
  );
  $form['settings']['xmpp_node_muc_types_permanent'] = array(
    '#type'          => 'checkboxes',
    '#title'         => t('Permanent Node Types'),
    '#default_value' => variable_get('xmpp_node_muc_types_permanent', array()),
    '#options'       => $options,
    '#description'   => t('Node types that we will create permanent mucs for'),
  );

  $form['block_settings'] = array('#type' => 'fieldset', '#title' => t('XMPP NODE MUC Block Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['block_settings']['xmpp_node_muc_block_muc_log_amount'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Number of log messages to display in the block'),
    '#default_value' => XMPP_NODE_MUC_BLOCK_MUC_LOG_AMOUNT,
    '#description'   => t('The number of log messages per muc that we will display in the block'),
  );
  $form['block_settings']['xmpp_node_muc_block_refresh'] = array(
    '#type'          => 'checkbox',
    '#title'         => t('Refresh Node Block with AJAX'),
    '#default_value' => XMPP_NODE_MUC_BLOCK_REFRESH,
    '#description'   => t('Determine if you want the block to be refreshed via AJAX or on every page load'),
  );
  $form['block_settings']['xmpp_node_muc_block_refresh_interval'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Block Refresh Inteval using Ajax'),
    '#default_value' => XMPP_NODE_MUC_BLOCK_REFRESH_INTERVAL,
    '#description'   => t('If using AJAX refresh this is the interval between the refreshes'),
  );
  $form['block_settings']['xmpp_node_muc_block_show_all_og_pages'] = array(
    '#type'          => 'checkbox',
    '#title'         => t('Show Block on all og pages'),
    '#default_value' => XMPP_NODE_MUC_BLOCK_SHOW_ALL_OG_PAGES,
    '#description'   => t('If not checked block will only show on the main view node/nid page, if checked will show on all og pages and sub pages'),
  );

  $form['xmlrpc_settings'] = array('#type' => 'fieldset', '#title' => t('XMLRPC Debugging Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['xmlrpc_settings']['xmpp_node_muc_xmlrpc_debug'] = array(
    '#type'          => 'checkbox',
    '#title'         => t('Display debug messages for XMLRPC'),
    '#default_value' => variable_get('xmpp_node_muc_xmlrpc_debug', false),
    '#description'   => t('Put watchdog notices for the xmlrpc requests into watchdog table for debugging purposes'),
  );

  $form['cron_settings'] = array('#type' => 'fieldset', '#title' => t('Cron Settings'), '#collapsible' => TRUE, '#collapsed' => TRUE);
  $form['cron_settings']['xmpp_node_muc_cron_interval'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Remove user from group interval'),
    '#default_value' => variable_get('xmpp_node_muc_cron_interval', 1),
    '#description'   => t('The time interval where the user will be removed from a group if they are inactive. Amount is in (Days)'),
  );

  return system_settings_form($form);
}
