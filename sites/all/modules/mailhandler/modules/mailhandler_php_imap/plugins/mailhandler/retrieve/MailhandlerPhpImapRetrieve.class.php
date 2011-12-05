<?php
/**
 * @file
 * Definition of MailhandlerPhpImapRetrieve class.
 */

/**
 * Retrieve messages using PHP IMAP library.
 */
class MailhandlerPhpImapRetrieve extends MailhandlerRetrieve {

  /**
   * Connect to mailbox and run message retrieval
   *
   * @param $mailbox
   *   Array of mailbox configuration
   * @param $limit
   *   Int - the maximim number of messages to fetch on retrieval, only for 'auto' mode
   * @param $encoding
   *   Text encoding of messages
   * @param $filter_name
   *   Mailhandler filter to restrict what messages are retrieved
   */
  function retrieve($mailbox, $limit = 0, $encoding = 'UTF-8', $filter_name = 'MailhandlerFilters') {
    // This is cast as string in hook_menu, otherwise the url argument would get used.
    $limit = (int) $limit;
    if ($result = $this->open_mailbox((object)$mailbox->settings)) {
      $new = $this->get_unread_messages($result);
    }
    else {
      drupal_set_message(t('Unable to connect to mailbox.'));
      watchdog('mailhandler', 'Unable to connect to %mail', array('%mail' => $mailbox->mail), WATCHDOG_ERROR);
    }
    if ($result && !empty($new)) {
      $messages = array();
      $retrieved = 0;
      while ($new && (!$limit || $retrieved < $limit)) {
        $message = $this->retrieve_message($result, $mailbox, array_shift($new), $encoding, $filter_name);
        if ($message) {
          $messages[] = $message;
        }
        $retrieved++;
      }
      $this->close_mailbox($result);
      return $messages;
    }
    else {
      $this->close_mailbox($result);
      watchdog('mailhandler', 'Mailbox %mail was checked and contained no new messages.', array('%mail' => $mailbox->admin_title), WATCHDOG_INFO);
    }
  }

  function test($form_state) {
    if ($result = $this->open_mailbox((object)$form_state['values']['settings'])) {
      drupal_set_message(t('Mailhandler was able to connect to the mailbox.'));
      $box = $this->mailbox_string((object)$form_state['values']['settings']);
      $status = imap_status($result, $box, SA_MESSAGES);
      if ($status) {
        drupal_set_message(t('There are @messages messages in the mailbox folder.', array('@messages' => $status->messages)));
      }
      else {
        drupal_set_message(t('Mailhandler could not open the specified folder'), 'warning');
      }
      $this->close_mailbox($result);
    }
    else {
      form_set_error('mailhandler', t('Mailhandler could not access the mailbox using these settings'));
    }
  }

  function purge_message($mailbox, $message) {
    if (isset($message['imap_uid'])) {
      if ($result = $this->open_mailbox((object)$mailbox->settings)) {
        if ($mailbox->settings['delete_after_read']) {
          imap_delete($result, $i, FT_UID);
        }
        else {
          imap_setflag_full($result, (string)$message['imap_uid'], '\Seen', FT_UID);
        }
        $this->close_mailbox($result);
      }
      else {
        drupal_set_message(t('Unable to connect to mailbox.'));
        watchdog('mailhandler', 'Unable to connect to %mail', array('%mail' => $mailbox->mail), WATCHDOG_ERROR);
      }
    }
  }

  /**
   * Establish IMAP stream connection to specified mailbox.
   *
   * @param $mailbox
   *   Array of mailbox configuration.
   * @return
   *   IMAP stream.
   */
  function open_mailbox($mailbox) {
    $box = $this->mailbox_string($mailbox);
    if ($mailbox->domain) {
      $result = imap_open($box, $mailbox->name, $mailbox->pass);
    }
    else {
      $result = imap_open($box, '', '');
    }
    return $result;
  }

  /**
   * Constructs a mailbox string based on mailbox object
   */
  function mailbox_string($mailbox) {
    if ($mailbox->domain) {
      if ($mailbox->imap == 1) {
        $box = '{' . $mailbox->domain . ':' . $mailbox->port . $mailbox->extraimap . '}' . $mailbox->folder;
      }
      else {
        $box = '{' . $mailbox->domain . ':' . $mailbox->port . '/pop3' . $mailbox->extraimap . '}' . $mailbox->folder;
      }
    }
    else {
      $box = $mailbox->folder;
    }
    return $box;
  }

  /**
   * Returns the first part with the specified mime_type
   *
   * USAGE EXAMPLES - from php manual: imap_fetch_structure() comments
   * $data = get_part($stream, $msg_number, "TEXT/PLAIN"); // get plain text
   * $data = get_part($stream, $msg_number, "TEXT/HTML"); // get HTML text
   */
  function get_part($stream, $msg_number, $mime_type, $structure = FALSE, $part_number = FALSE, $encoding) {
    if (!$structure) {
      $structure = imap_fetchstructure($stream, $msg_number, FT_UID);
    }
    if ($structure) {
      foreach ($structure->parameters as $parameter) {
        if (drupal_strtoupper($parameter->attribute) == 'CHARSET') {
          $encoding = $parameter->value;
        }
      }
      if ($mime_type == get_mime_type($structure)) {
        if (!$part_number) {
          $part_number = '1';
        }
        $text = imap_fetchbody($stream, $msg_number, $part_number, FT_UID+FT_PEEK);
        if ($structure->encoding == ENCBASE64) {
          return drupal_convert_to_utf8(imap_base64($text), $encoding);
        }
        elseif ($structure->encoding == ENCQUOTEDPRINTABLE) {
          return drupal_convert_to_utf8(quoted_printable_decode($text), $encoding);
        }
        else {
          return drupal_convert_to_utf8($text, $encoding);
        }
      }
      if ($structure->type == TYPEMULTIPART) { /* multipart */
        $prefix = '';
        while (list($index, $sub_structure) = each($structure->parts)) {
          if ($part_number) {
            $prefix = $part_number . '.';
          }
          $data = $this->get_part($stream, $msg_number, $mime_type, $sub_structure, $prefix . ($index + 1), $encoding);
          if ($data) {
            return $data;
          }
        }
      }
    }
    return FALSE;
  }

  /**
   * Returns an array of parts as file objects
   *
   * @param
   * @param $structure
   *   A message structure, usually used to recurse into specific parts
   * @param $max_depth
   *   Maximum Depth to recurse into parts.
   * @param $depth
   *   The current recursion depth.
   * @param $part_number
   *   A message part number to track position in a message during recursion.
   * @return
   *   An array of file objects.
   */
  function get_parts($stream, $msg_number, $max_depth = 10, $depth = 0, $structure = FALSE, $part_number = FALSE) {
    $parts = array();

    // Load Structure.
    if (!$structure && !$structure = imap_fetchstructure($stream, $msg_number, FT_UID)) {
      watchdog('mailhandler', 'Could not fetch structure for message number %msg_number', array('%msg_number' => $msg_number), WATCHDOG_NOTICE);
      return $parts;
    }

    // Recurse into multipart messages.
    if ($structure->type == TYPEMULTIPART) {
      // Restrict recursion depth.
      if ($depth >= $max_depth) {
        watchdog('mailhandler', 'Maximum recursion depths met in mailhander_get_structure_part for message number %msg_number.',   array('%msg_number' => $msg_number), WATCHDOG_NOTICE);
        return $parts;
      }
      $prefix = '';
      foreach ($structure->parts as $index => $sub_structure) {
        // If a part number was passed in and we are a multitype message, prefix the
        // the part number for the recursive call to match the imap4 dot seperated part indexing.
        if ($part_number) {
          $prefix = $part_number . '.';
        }
        $sub_parts = $this->get_parts($stream, $msg_number, $max_depth, $depth + 1,
          $sub_structure, $prefix . ($index + 1));
        $parts = array_merge($parts, $sub_parts);
      }
      return $parts;
    }

    // Per Part Parsing.
    // Initalize file object like part structure.
    $part = new stdClass();
    $part->attributes = array();
    $part->filename = 'unnamed_attachment';
    if (!$part->filemime = $this->get_mime_type($structure)) {
      watchdog('mailhandler', 'Could not fetch mime type for message part. Defaulting to application/octet-stream.', array(), WATCHDOG_NOTICE);
      $part->filemime = 'application/octet-stream';
    }

    if ($structure->ifparameters) {
      foreach ($structure->parameters as $parameter) {
        switch (drupal_strtoupper($parameter->attribute)) {
          case 'NAME':
          case 'FILENAME':
            $part->filename = $parameter->value;
            break;
          default:
            // put every thing else in the attributes array;
            $part->attributes[$parameter->attribute] = $parameter->value;
        }
      }
    }

    // Handle Content-Disposition parameters for non-text types.
    if ($structure->type != TYPETEXT && $structure->ifdparameters) {
      foreach ($structure->dparameters as $parameter) {
        switch (drupal_strtoupper($parameter->attribute)) {
          case 'NAME':
          case 'FILENAME':
            $part->filename = $parameter->value;
            break;
          // put every thing else in the attributes array;
          default:
            $part->attributes[$parameter->attribute] = $parameter->value;
        }
      }
    }

    // Store part id for reference.
    if (!empty($structure->id)) {
      $part->id = $structure->id;
    }

    // Retrieve part and convert MIME encoding to UTF-8
    if (!$part->data = imap_fetchbody($stream, $msg_number, $part_number, FT_UID+FT_PEEK)) {
      watchdog('mailhandler', 'No Data!!', array(), WATCHDOG_ERROR);
      return $parts;
    }

    // Decode as necessary.
    if ($structure->encoding == ENCBASE64) {
      $part->data = imap_base64($part->data);
    }
    elseif ($structure->encoding == ENCQUOTEDPRINTABLE) {
      $part->data = quoted_printable_decode($part->data);
    }
    // Convert text attachment to UTF-8.
    elseif ($structure->type == TYPETEXT) {
      $part->data = imap_utf8($part->data);
    }

    // Always return an array to satisfy array_merge in recursion catch, and
    // array return value.
    $parts[] = $part;
    return $parts;
  }

  /**
   * Retrieve MIME type of the message structure.
   */
  function get_mime_type(&$structure) {
    static $primary_mime_type = array('TEXT', 'MULTIPART', 'MESSAGE', 'APPLICATION', 'AUDIO', 'IMAGE', 'VIDEO', 'OTHER');
    $type_id = (int) $structure->type;
    if (isset($primary_mime_type[$type_id]) && !empty($structure->subtype)) {
      return $primary_mime_type[$type_id] . '/' . $structure->subtype;
    }
    return 'TEXT/PLAIN';
  }

  /**
   * Obtain the number of unread messages for an imap stream
   *
   * @param $result
   *   IMAP stream - as opened by imap_open
   * @return
   *   Array, values contain message numbers
   */
  function get_unread_messages($result) {
    $unread_messages = array();
    $number_of_messages = imap_num_msg($result);
    for ($i = 1; $i <= $number_of_messages; $i++) {
      $header = imap_header($result, $i);
      // only process new messages
      if ($header->Unseen != 'U' && $header->Recent != 'N') {
        continue;
      }
      $unread_messages[] = imap_uid($result, $i);
    }
    return $unread_messages;
  }

  /**
   * Retrieve individual messages from an IMAP result.
   *
   * @param $result
   *   IMAP stream.
   * @param $mailbox
   *   Array of mailbox configuration.
   * @param $i
   *   Int message number.
   * @return
   *   Retrieved message, or FALSE if message cannot / should not be retrieved.
   */
  function retrieve_message($result, $mailbox, $i, $encoding, $filter_name = 'MailhandlerFilters') {
    $header = imap_header($result, imap_msgno($result, $i));
    // Check to see if we should retrieve this message at all
    if ($filter =  mailhandler_plugin_load_class('mailhandler', $filter_name, 'filters', 'handlers')) {
      if (!$filter->fetch($header)) {
        return FALSE;
      }
    }
    // Initialize the subject in case it's missing.
    if (!isset($header->subject)) {
      $header->subject = '';
    }
    $mime = explode(',', $mailbox->settings['mime']);
    // Get the first text part - this will be the node body
    $origbody = $this->get_part($result, $i, $mime[0], FALSE, FALSE, $encoding);
    // If we didn't get a body from our first attempt, try the alternate format (HTML or PLAIN)
    if (!$origbody) {
      $origbody = $this->get_part($result, $i, $mime[1], FALSE, FALSE, $encoding);
    }
    // Parse MIME parts, so all mailhandler modules have access to
    // the full array of mime parts without having to process the email.
    $mimeparts = $this->get_parts($result, $i);
    // Is this an empty message with no body and no mimeparts?
    if (!$origbody && !$mimeparts) {
      $message = FALSE;
    }
    else {
      $message = array(
        'header' => $header,
        'origbody' => $origbody,
        'mimeparts' => $mimeparts,
        'mailbox' => $mailbox,
      );
    }
    if ($mailbox->settings['imap'] == 1) {
      $message['imap_uid'] = $i;
    }
    else {
      imap_delete($result, $i, FT_UID);
    }
    return $message;
  }

  /**
   * Close a mailbox.
   */
  function close_mailbox($result) {
    imap_errors();
    imap_close($result, CL_EXPUNGE);
  }
}
