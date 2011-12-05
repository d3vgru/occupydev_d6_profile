<?php
// $id

/**
 * Builds display block for XMPP Client Login
 */
function theme_xmpp_client_login() {
  global $user;

  if (isset($user->uid) && $user->uid) {
    if (is_null(xmpp_user_get_password($user))) {
      $output = '<div id="xmpp-client-login" class="xmpp-client-login">'. l(t('Configure Chat Client'), 'user/'. $user->uid .'/edit') .'</div>';
    }
    else {
      $output = drupal_get_form('xmpp_client_login_form');
    }
  }
  return $output;
}
