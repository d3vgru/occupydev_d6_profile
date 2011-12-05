<?php
/**
 * @file
 * Contains theme override functions and preprocess functions for the theme.
 *
 * ABOUT THE TEMPLATE.PHP FILE
 *
 *   The template.php file is one of the most useful files when creating or
 *   modifying Drupal themes. You can add new regions for block content, modify
 *   or override Drupal's theme functions, intercept or make additional
 *   variables available to your theme, and create custom PHP logic. For more
 *   information, please visit the Theme Developer's Guide on Drupal.org:
 *   http://drupal.org/theme-guide
 *
 * OVERRIDING THEME FUNCTIONS
 *
 *   The Drupal theme system uses special theme functions to generate HTML
 *   output automatically. Often we wish to customize this HTML output. To do
 *   this, we have to override the theme function. You have to first find the
 *   theme function that generates the output, and then "catch" it and modify it
 *   here. The easiest way to do it is to copy the original function in its
 *   entirety and paste it here, changing the prefix from theme_ to easybreeze_.
 *   For example:
 *
 *     original: theme_breadcrumb()
 *     theme override: easybreeze_breadcrumb()
 *
 *   where easybreeze is the name of your sub-theme. For example, the
 *   zen_classic theme would define a zen_classic_breadcrumb() function.
 *
 *   If you would like to override any of the theme functions used in Zen core,
 *   you should first look at how Zen core implements those functions:
 *     theme_breadcrumbs()      in zen/template.php
 *     theme_menu_item_link()   in zen/template.php
 *     theme_menu_local_tasks() in zen/template.php
 *
 *   For more information, please visit the Theme Developer's Guide on
 *   Drupal.org: http://drupal.org/node/173880
 *
 * CREATE OR MODIFY VARIABLES FOR YOUR THEME
 *
 *   Each tpl.php template file has several variables which hold various pieces
 *   of content. You can modify those variables (or add new ones) before they
 *   are used in the template files by using preprocess functions.
 *
 *   This makes THEME_preprocess_HOOK() functions the most powerful functions
 *   available to themers.
 *
 *   It works by having one preprocess function for each template file or its
 *   derivatives (called template suggestions). For example:
 *     THEME_preprocess_page    alters the variables for page.tpl.php
 *     THEME_preprocess_node    alters the variables for node.tpl.php or
 *                              for node-forum.tpl.php
 *     THEME_preprocess_comment alters the variables for comment.tpl.php
 *     THEME_preprocess_block   alters the variables for block.tpl.php
 *
 *   For more information on preprocess functions and template suggestions,
 *   please visit the Theme Developer's Guide on Drupal.org:
 *   http://drupal.org/node/223440
 *   and http://drupal.org/node/190815#template-suggestions
 */


/**
 * Implementation of HOOK_theme().
 */
function easybreeze_theme(&$existing, $type, $theme, $path) {
  $hooks = zen_theme($existing, $type, $theme, $path);
  // Add your theme hooks like this:
  /*
  $hooks['hook_name_here'] = array( // Details go here );
  */
  // @TODO: Needs detailed comments. Patches welcome!
  return $hooks;
}

/**
 * Override or insert variables into all templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered (name of the .tpl.php file.)
 */
/* -- Delete this line if you want to use this function
function easybreeze_preprocess(&$vars, $hook) {
  $vars['sample_variable'] = t('Lorem ipsum.');
}
// */

/**
 * Override or insert variables into the page templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("page" in this case.)
 */
function easybreeze_preprocess_page(&$vars, $hook) {
  $directory = drupal_get_path('theme', 'easybreeze') . '/css/';
  $query_string = '?'. substr(variable_get('css_js_query_string', '0'), 0, 1);
  $base_path = base_path() . $directory;

  // Add layout stylesheets manually instead of via its .info file.
  switch (theme_get_setting('zen_layout')) {
    case 'zen-columns-liquid':
      $stylesheet = 'layout-liquid.css';
      break;
    case 'zen-columns-fluid':
      $stylesheet = 'layout-fluid.css';
      break;
    case 'zen-columns-fixed':
      $stylesheet = 'layout-fixed.css';
      break;
  }
  drupal_add_css($directory . $stylesheet, 'theme', 'all');

  // Regenerate the stylesheets.
  $vars['css'] = drupal_add_css();
  $vars['styles'] = drupal_get_css();

  // Add IE styles.
  $vars['styles'] .= '<!--[if IE]><link type="text/css" rel="stylesheet" media="all" href="' . $base_path . 'ie.css' . $query_string . '" /><![endif]-->' . "\n";
  $vars['styles'] .= '<!--[[if lte IE 6]><link type="text/css" rel="stylesheet" media="all" href="' . $base_path . 'ie6.css' . $query_string . '" /><![endif]-->' . "\n";

  // #1083694: Manually add custom.css file.
  if (file_exists("$directory/custom.css")) {
    $vars['styles'] .= '<link type="text/css" rel="stylesheet" media="all" href="' . $base_path . 'custom.css' . $query_string . '" />' . "\n";
  }
}

/**
 * Override or insert variables into the node templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("node" in this case.)
 */
function easybreeze_preprocess_node(&$vars, $hook) {
  // Reset node links without class "inline", sync with Drupal 7.x.
  $vars['links'] = !empty($vars['node']->links) ? theme('links', $vars['node']->links, array('class' => 'links')) : '';
}

/**
 * Override or insert variables into the comment templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("comment" in this case.)
 */
/* -- Delete this line if you want to use this function
function easybreeze_preprocess_comment(&$vars, $hook) {
  $vars['sample_variable'] = t('Lorem ipsum.');
}
// */

/**
 * Override or insert variables into the block templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("block" in this case.)
 */
/* -- Delete this line if you want to use this function
function easybreeze_preprocess_block(&$vars, $hook) {
  $vars['sample_variable'] = t('Lorem ipsum.');
}
// */

/**
 * Preprocess variables for region.tpl.php
 *
 * Prepare the values passed to the theme_region function to be passed into a
 * pluggable template engine.
 *
 * @see region.tpl.php
 */
function easybreeze_preprocess_region(&$vars, $hook) {
  // Create the $content variable that templates expect.
  $vars['content'] = $vars['elements']['#children'];
  $vars['region'] = $vars['elements']['#region'];

  // Setup the default classes.
  $vars['classes_array'] = array('region', 'region-' . str_replace('_', '-', $vars['region']));

  // Sidebar regions get a couple extra classes.
  if (strpos($vars['region'], 'sidebar_') === 0) {
    $vars['classes_array'][] = 'column';
    $vars['classes_array'][] = 'sidebar';
    $vars['template_files'][] = 'region-sidebar';
  }
  else if (strpos($vars['region'], 'triptych_') === 0) {
    $vars['classes_array'][] = 'column';
    $vars['classes_array'][] = 'triptych';
    $vars['template_files'][] = 'region-triptych';
  }
  else if (strpos($vars['region'], 'footer_') === 0) {
    $vars['classes_array'][] = 'column';
    $vars['classes_array'][] = 'footer';
    $vars['template_files'][] = 'region-footer';
  }
}

/**
 * Override or insert variables into templates after preprocess functions have run.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered.
 */
function easybreeze_process(&$vars, $hook) {
  // Only override for region sidebar_*, triptych_* or footer_*.
  if (strpos($vars['region'], 'sidebar_') === 0 || strpos($vars['region'], 'triptych_') === 0 || strpos($vars['region'], 'footer_') === 0) {
    $vars['classes'] = implode(' ', $vars['classes_array']);
  }
}
