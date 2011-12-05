<?php
/**
 * @file
 * Feature provides a default Mailhandler importer to produce nodes from emails.
 */

/**
 * Implementation of hook_ctools_plugin_api().
 */
function mailhandler_default_ctools_plugin_api() {
  list($module, $api) = func_get_args();
  if ($module == "feeds" && $api == "feeds_importer_default") {
    return array("version" => 1);
  }
}
