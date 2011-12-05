Drupal.behaviors.linked_data = function(context) {

  linked_data_set_endpoint_visibility($('select#edit-config-query-type').val());

  $('select#edit-config-query-type').change(function() {
    linked_data_set_endpoint_visibility($(this).val());
  });
  
}

function linked_data_set_endpoint_visibility(type) {
  if(type == 'sparql') {
    $('div#edit-config-endpoint-wrapper').show();    
  }
  else {
    $('div#edit-config-endpoint-wrapper').hide();    
  }
}

