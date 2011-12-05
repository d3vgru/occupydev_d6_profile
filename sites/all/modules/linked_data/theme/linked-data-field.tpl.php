<?php 
/**
 * @file linked-data.tpl.php
 *
 * Theme implementation to display a linked data box.
 *
 * Available variables:
 * - $query: The full query object
 * - $name: The key for this field. (the variable queried against the Linked Data Source)
 * - $field: The raw field. Could be an Primitive, String, Object, Array, etc.
 * - $field_value: The field value.
 *
 * @see template_preprocess()
 * @see template_preprocess_linked_data_field()
 */
?>
<?php 
  $class = "linked-data-field";
  $class .= " linked-data-field-{$query->name}";
  $class .= " linked-data-field-{$filtered_name}";
  $class .= " linked-data-field-{$query->name}-{$filtered_name}";
?>
<div class="<?php print $class; ?>">
  <label><?php print $name; ?>:</label><?php print $field_value; ?>
</div>
