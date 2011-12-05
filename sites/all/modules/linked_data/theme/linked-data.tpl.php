<?php 
/**
 * @file linked-data.tpl.php
 *
 * Theme implementation to display a linked data box.
 *
 * Available variables:
 * - $title: The (sanitized) title of the node.
 * - $query: The full query object
 * - $data: Array of the raw data returned from the Linked Data source
 * - $rows: All rows from $data rendered via the theme system
 *
 * @see template_preprocess()
 * @see template_preprocess_linked_data()
 */
?>
<div class="linked-data linked-data-<?php print $query->name; ?>">
  <h2><?php print $title; ?></h2>
  <div class="linked-data-content linked-data-content-<?php print $query->name; ?>">
    <?php print $rows; ?>
  </div>
</div>