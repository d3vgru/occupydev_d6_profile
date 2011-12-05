<?php

require_once 'Discovery/HTTP.php';

class Discovery_Drupal implements Discovery_HTTP {

  public function request($url, $method = 'GET', $headers = array(), $data = NULL) {
    $response = drupal_http_request($url, $headers, $method, $data);

    $response_headers = array();
    foreach ($response->headers as $key => $value) {
      $response_headers[strtolower($key)] = $value;
    }
    
    return array(
      'status' => $response->code,
      'headers' => $response_headers,
      'body' => $response->data,
    );
  }

}
