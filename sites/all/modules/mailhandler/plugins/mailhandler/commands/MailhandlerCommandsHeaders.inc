<?php
/**
 * @file
 * MailhandlerCommandsHeaders class.
 */

$plugin = array(
  'name' => 'Headers processor',
  'description' => 'Provides IMAP headers as mapping sources.',
  'handler' => array(
    'class' => 'MailhandlerCommandsHeaders',
    'parent' => 'MailhandlerCommands',
  ),
  'weight' => 0,
);
