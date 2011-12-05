<?php
// $Id

/**
 * Filter by xmpp user status
 */
class views_handler_filter_xmpp_user_status extends views_handler_filter_in_operator {
  function get_value_options() {
    if (!isset($this->value_options)) {
      $this->value_title = t('XMPP User Status');
      $status = array('available' => t('Available'), 'offline' => t('Offline'), 'xa' => t('Extended Away'), 'dnd' => t('Do Not Disturb'), 'away' => t('Away'));
      foreach ($status as $key => $value) {
        $options[$key] = $value;
      }
      $this->value_options = $options;
    }
  }
}
