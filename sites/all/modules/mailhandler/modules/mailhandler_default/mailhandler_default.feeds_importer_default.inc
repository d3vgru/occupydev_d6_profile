<?php
/**
 * @file
 * Defines mailhandler_nodes importer.
 */

/**
 * Implementation of hook_feeds_importer_default().
 */
function mailhandler_default_feeds_importer_default() {
  $export = array();

  $feeds_importer = new stdClass;
  $feeds_importer->disabled = FALSE; /* Edit this to true to make a default feeds_importer disabled initially */
  $feeds_importer->api_version = 1;
  $feeds_importer->id = 'mailhandler_nodes';
  $feeds_importer->config = array(
    'name' => 'Mailhandler nodes',
    'description' => 'Imports nodes from a Mailhandler mailbox',
    'fetcher' => array(
      'plugin_key' => 'MailhandlerFetcher',
      'config' => array(
        'filter' => 'MailhandlerFiltersNodes',
      ),
    ),
    'parser' => array(
      'plugin_key' => 'MailhandlerParser',
      'config' => array(
        'if_auth_fails' => 'remove',
        'default_commands' => 'status: 1',
        'command_plugin' => array(
          'MailhandlerCommandsDefault' => 'MailhandlerCommandsDefault',
          'MailhandlerCommandsHeaders' => 'MailhandlerCommandsHeaders',
        ),
        'authenticate_plugin' => 'MailhandlerAuthenticateDefault',
      ),
    ),
    'processor' => array(
      'plugin_key' => 'FeedsNodeProcessor',
      'config' => array(
        'content_type' => 'story',
        'expire' => '-1',
        'author' => 0,
        'mappings' => array(
          0 => array(
            'source' => 'subject',
            'target' => 'title',
            'unique' => FALSE,
          ),
          1 => array(
            'source' => 'authenticated_uid',
            'target' => 'uid',
            'unique' => FALSE,
          ),
          2 => array(
            'source' => 'status',
            'target' => 'status',
            'unique' => FALSE,
          ),
          3 => array(
            'source' => 'origbody',
            'target' => 'body',
            'unique' => FALSE,
          ),
        ),
        'update_existing' => '0',
        'input_format' => 'plain_text',
      ),
    ),
    'content_type' => '',
    'update' => 0,
    'import_period' => '900',
    'expire_period' => 3600,
    'import_on_create' => 1,
    'process_in_background' => 0,
  );
  $export['mailhandler_nodes'] = $feeds_importer;

  return $export;
}
