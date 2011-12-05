<?php

/**
 * @file
 *   Formats the status comment update form in Views.
 */

/**
 * Field handler to add the status comment update form.
 */
class fbss_comments_views_handler_field_comment_box extends views_handler_field {
  function render($values) {
    return '<div class="facebook-status-comments">'. theme('fbss_comments_form_display', $values->{$this->field_alias}, TRUE, TRUE) .'</div>';
  }
}
