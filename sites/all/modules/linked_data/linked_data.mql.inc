<?php

/**
 * Linked Data class to execute a MQL query against Freebase.
 */
class linked_data_mql_query extends linked_data_query {

  const FB_API_BASE  = 'http://api.freebase.com/api/service/mqlread';
  const FB_GUID_BASE = 'http://rdf.freebase.com/ns/guid.';

  /**
   * Execute the MQL query
   */
  function execute($query, $args) {
  
    $mql = $query->config['query'];
    self::filter_arguments($mql, $args);
    
    $qs = '{"query":[' . $mql . ']}';
    $uri = self::FB_API_BASE . "?query=" . urlencode($qs);
    $result = drupal_http_request($uri); 
    if (intval($result->code) != 200) {
      watchdog('Linked Data', 'MQL Error: @msg', array('@msg' => $result->error), WATCHDOG_ERROR);
      return FALSE;
    }
    
    $data = json_decode($result->data, TRUE);
    return $data['result'];
  }  
  
  /**
   * Replace paramters, correcting the guid if needed.
   */
  function filter_arguments(&$query, $args) {
    foreach ($args as $key => $value) {
      if ($key == 'guid' && strpos($value, self::FB_GUID_BASE) === 0) {
        $value = self::fburl2guid($value);
      }    
      $query = preg_replace('/\$' . $key . '/', $value, $query);
    }
  }
 
  /**
   * Utility function to extract the GUID value off of a Freebase URL.
   *
   * Example: http://rdf.freebase.com/ns/guid.9202a8c04000641f800000000014938b 
   *          becomes 
   *          #9202a8c04000641f800000000014938b
   */
  function fburl2guid($url) {
    return preg_replace('@' . self::FB_GUID_BASE . '@', '#', $url);
  }
}