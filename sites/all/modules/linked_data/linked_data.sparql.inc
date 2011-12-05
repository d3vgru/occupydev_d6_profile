<?php

/**
 * Linked Data class to execute a SPARQL Query
 */
class linked_data_sparql_query extends linked_data_query {
  
  /**
   * Validate the query parses.
   */
  function validate($query) {
    return TRUE;
  }
  
  /**
   * Run the query with the provided arguments
   */
  function execute($query, $args) {
    // Actually build and execute a SPARQL query here.
    module_load_include('inc', 'sparql');
    $options = array(
      'endpoint' => $query->config['endpoint'],
      //'default-graph-uri' => $query->config['default_graph'],
    );
  
    $sparql = $query->config['query'];
    self::filter_arguments($sparql, $args);
  
    $errors = array();
    $data = sparql_query($sparql, $options, $errors);
    if(!empty($errors)) {
      watchdog('Linked Data', 'SPARQL Error: @msg', array('@msg' => $errors[0]), WATCHDOG_ERROR);
      return FALSE;
    }
    
    return $data;
  }
}