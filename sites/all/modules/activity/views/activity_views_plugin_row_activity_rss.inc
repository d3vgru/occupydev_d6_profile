<?php
/**
 * @file
 * Contains the Activity RSS row style plugin.
 */

/**
 * Plugin which formats Activity as an RSS item.
 */
class activity_views_plugin_row_activity_rss extends views_plugin_row {

  function query() {
    $this->view->query->add_field('activity', 'created', 'created');
    
    $this->view->query->add_field('activity_messages', 'message', 'message');
    
    $this->view->query->add_field('users_activity', 'uid', 'user_uid');
    $this->view->query->add_field('users_activity', 'name', 'user_name');
    
    $this->view->query->add_field('node_activity', 'nid', 'node_nid');
    $this->view->query->add_field('node_activity', 'title', 'node_title');
  }
  
  function render($row) {
    return theme($this->theme_functions(), $this->view, $this->options, $row);
  }
}

