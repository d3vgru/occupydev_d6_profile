<?php
/**
 * @file
 * MailhandlerAuthenticateDefault class.
 */

class MailhandlerAuthenticateDefault extends MailhandlerAuthenticate {

  public function authenticate(&$message, $mailbox) {
    list($fromaddress, $fromname) = _mailhandler_get_fromaddress($message['header'], $mailbox);
    if ($from_user = user_load(array('mail' => $fromaddress))) {
      $message['authenticated_uid'] = $from_user->uid;
    }
    else {
      // Authentication failed.  Try as anonymous.
      $message['authenticated_uid'] = 0;
    }
  }

}
