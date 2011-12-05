<?php 
/**
 * @file linked-data.tpl.php
 *
 * Theme implementation to display a linked data box.
 *
 * Available variables:
 * - $query: The full query object
 * - $row: Associative array the raw data returned from the Linked Data source for this row
 * - $fields: Array of all fields for the given row
 *    - value: The raw value or object for the data
 *    - content: The rendered content for the $field
 *
 * @see template_preprocess()
 * @see template_preprocess_linked_data_row()
 */
?>
<div class="linked-data-row linked-data-row-<?php print $query->name; ?>">
  <?php foreach ($fields as $name => $value): ?>
    <?php print $value['content']; ?>
  <?php endforeach; ?>
</div>
