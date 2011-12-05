<div class="linked-data linked-data-<?php print $query->name; ?>">
  <h2><?php print $data[0]['name']; ?></h2>
  <div class="linked-data-content linked-data-content-<?php print $query->name; ?>">
    <div><?php print theme('image', 'http://api.freebase.com/api/trans/image_thumb' . $data[0]['/common/topic/image'][0]['id'] . '?maxwidth=200', '', '', NULL, FALSE); ?></div>
    <div><label><b>Date of Birth: </b></label><?php print date('l F j, Y', strtotime($data[0]['date_of_birth'])); ?></div>
    <div><label><b>Nationality: </b></label><?php print $data[0]['nationality']; ?></div>
    <div><label><b>Birthplace: </b></label><?php print $data[0]['place_of_birth']; ?></div>
  </div>
</div>
