<?php
// Include the definition of zen_settings() and zen_theme_get_default_settings().
include_once './' . drupal_get_path('theme', 'zen') . '/theme-settings.php';


/**
 * Implementation of THEMEHOOK_settings() function.
 *
 * @param $saved_settings
 *   An array of saved settings for this theme.
 * @return
 *   A form array.
 */
function easybreeze_settings($saved_settings) {

  // Get the default values from the .info file.
  $defaults = zen_theme_get_default_settings('easybreeze');

  // Merge the saved variables and their default values.
  $settings = array_merge($defaults, $saved_settings);

  /*
   * Create the form using Forms API: http://api.drupal.org/api/6
   */
  $form = array();
  /* -- Delete this line if you want to use this setting
  $form['easybreeze_example'] = array(
    '#type'          => 'checkbox',
    '#title'         => t('Use this sample setting'),
    '#default_value' => $settings['easybreeze_example'],
    '#description'   => t("This option doesn't do anything; it's just an example."),
  );
  // */

  // Add the base theme's settings.
  $form += zen_settings($saved_settings, $defaults);

  $form['themedev']['zen_layout'] = array(
    '#type'          => 'radios',
    '#title'         => t('Layout method'),
    '#options'       => array(
                          'zen-columns-liquid' => t('Liquid layout') . ' <small>(layout-liquid.css)</small>',
                          'zen-columns-fluid' => t('Fluid layout') . ' <small>(layout-fluid.css)</small>',
                          'zen-columns-fixed' => t('Fixed layout') . ' <small>(layout-fixed.css)</small>',
                        ),
    '#default_value' => $settings['zen_layout'],
  );

  // Return the form
  return $form;
}
