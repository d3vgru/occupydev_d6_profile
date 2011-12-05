<?php
/**
 * @file
 * Allows Mailhandler Mailboxes to be exported.
 */

$plugin = array(
  'schema' => 'mailhandler_mailbox',
  'access' => 'administer mailhandler',
  'menu' => array(
    'menu prefix' => 'admin/build',
    'menu item' => 'mailhandler',
    'menu title' => 'Mailhandler Mailboxes',
    'menu description' => 'Administer mailhandler mailboxes.',
  ),
  'title singular' => t('mailhandler mailbox'),
  'title singular proper' => t('Mailhandler Mailbox'),
  'title plural' => t('mailhandler mailboxes'),
  'title plural proper' => t('Mailhandler Mailboxes'),
  'handler' => array(
    'class' => 'mailhandler_mailbox_ui',
    'parent' => 'ctools_export_ui',
  ),
);
