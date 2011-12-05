<?php
/**
 * @file
 * MailhandlerParser class.
 */

/**
 * Parses an IMAP stream.
 */
class MailhandlerParser extends FeedsParser {

  /**
   * Override parent::configDefaults().
   */
  public function configDefaults() {
    return array(
      'if_auth_fails' => 'remove',
      'default_commands' => 'status: 1',
      'available_commands' => 'status',
      'command_plugin' => array('MailhandlerCommandsDefault', 'MailhandlerCommandsFiles', 'MailhandlerCommandsHeaders'),
      'authenticate_plugin' => 'MailhandlerAuthenticateDefault',
    );
  }

  public function sourceForm($source_config) {
    $form['if_auth_fails'] = array(
      '#type' => 'select',
      '#title' => t('If authentication fails'),
      '#options' => array(
        'remove' => t('Do not create the node, do not try to re-import message'),
        'retry' => t('Do not create the node, but try to re-import message next time'),
        'unpublish' => t('Create the node, but leave it unpublished'),
        'ignore' => t('Ignore failed authentication'),
      ),
      '#default_value' => isset($source_config['if_auth_fails']) ? $source_config['if_auth_fails'] : 'remove',
      '#description' => t('If authentication is checked, here you can choose what to do if the incoming emails does not belongs to an authenticated user.'),
    );
    return $form;
  }

  /**
   * Build configuration form.
   */
  public function configForm(&$form_state) {
    $form = array();
    ctools_include('plugins');
    $form['command_plugin'] = array(
      '#type' => 'select',
      '#title' => t('Command plugins'),
      '#description' => t('Choose the command plugins to use'),
      '#options' => _mailhandler_build_options(mailhandler_get_plugins('mailhandler', 'commands')),
      '#multiple' => TRUE,
      '#default_value' => $this->config['command_plugin'],
    );
    $form['authenticate_plugin'] = array(
      '#type' => 'select',
      '#title' => t('Authentication plugin'),
      '#description' => t('Choose an authentication plugin'),
      '#options' => _mailhandler_build_options(mailhandler_get_plugins('mailhandler', 'authenticate')),
      '#default_value' => $this->config['authenticate_plugin'],
      '#required' => FALSE,
    );
    if (($plugins = $this->config['command_plugin']) && is_array($plugins) && !empty($plugins)) {
      foreach ($plugins as $plugin) {
        if ($class = mailhandler_plugin_load_class('mailhandler', $plugin, 'commands', 'handler')) {
          $class->configForm($form, $form_state, $this->config);
        }
      }
    }
    return $form;
  }

  /**
   * Implementation of FeedsParser::parse().
   */
  public function parse(FeedsImportBatch $batch, FeedsSource $source) {
    $fetched = $batch->getRaw();
    $mailbox = $fetched['mailbox'];
    $messages = $fetched['messages'];
    if (!empty($messages)) {
      foreach ($messages as $mid => &$message) {
        $this->authenticate($message, $mailbox);
        if ($message['authenticated_uid'] == 0) {
          // User was not authenticated
          module_invoke_all('mailhandler_auth', 'auth_failed', $message);
          $source_config = $source->getConfigFor($this);
          switch ($source_config['if_auth_fails']) {
            case 'remove':
              if ($class = mailhandler_plugin_load_class('mailhandler', $mailbox->settings['retrieve'], 'retrieve', 'handler')) {
                $class->purge_message($mailbox, $message);
              }
            case 'retry':
              throw new Exception('User could not be authenticated. Please check your Mailhandler authentication plugin settings.');
            case 'unpublish':
              if ($class = mailhandler_plugin_load_class('mailhandler', $mailbox->settings['retrieve'], 'retrieve', 'handler')) {
                $class->purge_message($mailbox, $message);
              }
              $message['status'] = 0;
              break;
            case 'ignore':
              if ($class = mailhandler_plugin_load_class('mailhandler', $mailbox->settings['retrieve'], 'retrieve', 'handler')) {
                $class->purge_message($mailbox, $message);
              }
              $this->commands($message, $source);
              break;
          }
        }
        else {
          $this->commands($message, $source);
        }
      }
      $batch->setItems($messages);
    }
    else {
      if (isset($fetched['new'])) {
        drupal_set_message('No new messages.');
      }
    }
  }

  /*
   * This defines sources which user's can select to map values to.
   */
  public function getMappingSources() {
    $sources = parent::getMappingSources();

    $sources['authenticated_uid'] = array(
      'name' => t('User ID'),
      'description' => t('The authenticated Drupal user ID'),
    );
    $plugins = $this->config['command_plugin'];
    foreach ($plugins as $plugin_name) {
      $plugin = mailhandler_plugin_load_class('mailhandler', $plugin_name, 'commands', 'handler');
      $sources = array_merge($sources, $plugin->getMappingSources($this->config));
    }
    return $sources;
  }

  /*
   * Parse and apply commands.
   */
  public function commands(&$message, $source) {
    if (($plugins = $this->config['command_plugin']) && is_array($plugins) && !empty($plugins)) {
      foreach ($plugins as $plugin) {
        if ($class = mailhandler_plugin_load_class('mailhandler', $plugin, 'commands', 'handler')) {
          $class->parse($message, $source);
          $class->process($message, $source);
        }
      }
    }
  }

  /*
   * Authenticate the message and set $message['authenticated_uid'].
   */
  public function authenticate(&$message, $mailbox) {
    if ($plugin = $this->config['authenticate_plugin']) {
      if ($class = mailhandler_plugin_load_class('mailhandler', $plugin, 'authenticate', 'handler')) {
        $class->authenticate($message, $mailbox);
      }
    }
  }
}
