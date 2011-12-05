<?php
/**
 * @file
 * MailhandlerAuthenticate class.
 */

abstract class MailhandlerAuthenticate {

  /**
   * Authenticates an incoming message.
   *
   * @param $item
   *   Array containing message headers, body, and mailbox information.
   */
  abstract public function authenticate(&$message, $mailbox);

}
