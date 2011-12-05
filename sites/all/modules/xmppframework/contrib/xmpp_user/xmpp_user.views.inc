<?php
// $Id: xmpp_user.views.inc,v 1.1.2.15 2009/09/25 20:51:05 darrenferguson Exp $

/**
 * @file
 * Provide views data and handlers for xmpp_user.module
 */

/**
 * Implementation of hook_views_handlers().
 */
function xmpp_user_views_handlers() {
  return array(
    'info' => array(
      'path' => drupal_get_path('module', 'xmpp_user') .'/includes',
    ),
    'handlers' => array(
      'views_handler_filter_xmpp_user_status' => array(
        'parent' => 'views_handler_filter_in_operator',
      ),
    ),
  );
}

/**
 * Implementation of hook_views_data()
 */
function xmpp_user_views_data() {
  // field group
  $data['xmpp_user']['table']['group']  = t('User');

  // table joins
  $data['xmpp_user']['table']['join'] = array(
    'users' => array(
      'left_field' => 'uid',
      'field' => 'uid'
    ),
    'node' => array(
      'left_table' => 'users',
      'left_field' => 'uid',
      'field' => 'uid',
      'type' => 'INNER'
    ),
    'node_revisions' => array(
      'left_table' => 'node',
      'left_field' => 'uid',
      'field' => 'uid',
      'type' => 'INNER'
    )
  );

  // jid
  $data['xmpp_user']['jid'] = array(
    'title' => t('Jabber ID'),
    'help' => t('The Users Jabber ID'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    )
  );

  // status
  $data['xmpp_user']['status'] = array(
    'title' => t('Jabber Status'),
    'help' => t('The Users Jabber Status'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_xmpp_user_status',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    )
  );

  // message
  $data['xmpp_user']['message'] = array(
    'title' => t('Jabber Message'),
    'help' => t('The Users Jabber Message'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    )
  );
  return $data;
}
