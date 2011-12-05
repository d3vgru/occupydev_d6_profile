<?php
// $id

/**
 * Builds the display page for the xmpp vcard synchronize
 *
 * @param $vcard
 *      Array object holding the vcard
 */
function theme_xmpp_vcard_information($vcard = array(), $profile = NULL) {
  global $user;

  $tuser = new StdClass();
  $tuser->uid = 0;
  $header = array('name' => t('Name'), 'xmpp' => t('XMPP'), 'drupal' => t('Content Profile'), 'synch' => t('Synchronize'));
  $output = '<div style="float: right">'. l(t('Synchronize All'), 'xmpp_vcard/synchronize/all') .'</div>';
  $output .= t('<h2>Current XMPP Vcard information</h2>');
  foreach ($vcard as $key => $values) {
    if (is_array($values)) {
      foreach ($values as $sub => $subvalues) {
        // retrieving the field mappings for the particular vcard node
        if ($field = _xmpp_vcard_fields(strtoupper($sub))) {
          $name = $field['name'];
          $xmpp = $subvalues;
          if (isset($profile->$field['mapping']) && $profile->$field['mapping'] && is_array($profile->$field['mapping']) ) {
            $value = $profile->$field['mapping'];
            $drupal = ($value[0]['value']) ? $value[0]['value'] : '';
          }
          else {
              $drupal = ($field['mapping']) ? $profile->$field['mapping'] : '';
          }
          // determine if the field is marked as publicly available
          $synch = t('Not Public');
          $entry[] = array('name' => $name, 'xmpp' => $xmpp, 'drupal' => $drupal, 'synch' => $synch);
        }
      }
    }
    else {
      // retrieving the field mappings for the particular vcard node
      if ($field = _xmpp_vcard_fields(strtoupper($key))) {
        $name = $field['name'];
        $xmpp = $values;
        if (isset($profile->$field['mapping']) && is_array($profile->$field['mapping'])) {
          $drupal = $profile->$field['mapping'][0]['value'];
        }
        else {
          $drupal = ($field['mapping']) ? $profile->$field['mapping'] : '';
        }
        // determine if synchronization can occur for this field
        $synch = t('Not Public');
        $entry[] = array('name' => $name, 'xmpp' => $xmpp, 'drupal' => $drupal, 'synch' => $synch);
      }
    }
  }
  $output .= theme('table', $header, $entry);
  return $output;
}

/**
 * Theme VCard Field Mappings
 */
function theme_xmpp_vcard_fields_form($form) {
  if (isset($form['fields'])) {
    $output = drupal_render($form['fields']);
  }
  $rows = array();
  $rows[] = array(
    'name' => drupal_render($form['name']),
    'title' => drupal_render($form['title']),
    'link' => drupal_render($form['submit']),
  );
  $output .= theme('table', NULL, $rows);
  $output .= drupal_render($form);
  return $output;
}

/**
 * Theme VCard and Content Profile Field Mappings
 */
function theme_xmpp_vcard_mappings_form($form) {
  if (isset($form['mappings'])) {
    $output = drupal_render($form['mappings']);
  }
  $rows = array();
  $rows[] = array(
    'vcard' => drupal_render($form['vcard']),
    'drupal' => drupal_render($form['drupal']),
    'link' => drupal_render($form['submit']),
  );
  $output .= theme('table', NULL, $rows);
  $output .= drupal_render($form);
  return $output;
}

