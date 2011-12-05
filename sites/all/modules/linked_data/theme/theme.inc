<?php
/**
 * @file theme.inc
 */
 
/**
 * Theme the query form
 */
function theme_linked_data_query_form($form) {
  $output = drupal_render($form);
  //http://www.freebase.com/app/queryeditor/
  return $output;  
}

/**
 * Implementation of hook_preprocess_linked_data().
 */
function template_preprocess_linked_data(&$vars) {
  $query = $vars['query'];
  $data = $vars['data'];
  $vars['title'] = check_plain($query->title);
    
  $vars['rows'] = '';
  foreach ($data as $row) {
    $vars['rows'] .= theme('linked_data_row', $query, $row);
  }
  
  $vars['template_files'][] = 'linked-data--' . $query->name;
}

/**
 * Implementation of hook_preprocess_linked_data_row().
 */
function template_preprocess_linked_data_row(&$vars) {
  $query = $vars['query'];
  $row = $vars['row'];

  $fields = array();
  foreach ($row as $name => $field) {
    $fields[$name] = array(
      'field'   => $field,
      'content' => theme('linked_data_field', $query, $name, $field),
    );
  }
  $vars['fields'] = $fields;

  $vars['template_files'][] = 'linked-data-row--' . $query->name;
}

/**
 * Implementation of hook_preprocess_linked_data_field().
 */
function template_preprocess_linked_data_field(&$vars) {
  $query = $vars['query'];
  $name = $vars['name'];
  $field = $vars['field'];
  
  if ($field instanceof RDF_Literal) {
    $vars['field_value'] = $field->value;
  }
  elseif ($field instanceof RDF_URIRef) {
    $vars['field_value'] = l($field->uri, $field->uri, array('external' => TRUE));
  }
  elseif (is_array($field)) {
    $vars['field_value'] = print_r($field, TRUE);
  }
  else {
    $vars['field_value'] = $field;
  }
  
  // Remove some invalid chars from keys (freebase allows /)
  $filtered_name = preg_replace('@/@', '-', $name);
  $vars['filtered_name'] = $filtered_name;
  
  $vars['template_files'][] = 'linked-data-field--' . $query->name;
  $vars['template_files'][] = 'linked-data-field--' . $filtered_name;
  $vars['template_files'][] = 'linked-data-field--' . $query->name . '-' . $filtered_name;
}