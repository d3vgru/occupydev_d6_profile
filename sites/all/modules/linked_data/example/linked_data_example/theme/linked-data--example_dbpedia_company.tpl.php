<div class="linked-data linked-data-<?php print $query->name; ?>">
  <h2><?php print $data[0]['name']->value; ?></h2>
  <div class="linked-data-content linked-data-content-<?php print $query->name; ?>">
    <div><?php print $data[0]['abstract']->value; ?></div>
    <div><label><b>Homepage: </b></label><?php print l($data[0]['homepage']->uri, $data[0]['homepage']->uri, array('external' => TRUE)); ?></div>
    <div><label><b>Employees: </b></label><?php print $data[0]['employees']->value; ?></div>
  </div>
</div>
