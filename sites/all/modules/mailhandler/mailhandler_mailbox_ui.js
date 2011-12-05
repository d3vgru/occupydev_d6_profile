
Drupal.behaviors.mailhandler = function() {

  // Export form machine-readable JS
  // Adapted from feeds_ui.admin.inc
  $('.mailbox-name:not(.processed)').each(function() {
    $('.mailbox-name')
      .addClass('processed')
      .after(' <small class="mailbox-id-suffix">&nbsp;</small>');
    if ($('.mailbox-id').val() === $('.mailbox-name').val().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_') || $('.mailbox-id').val() === '') {
      $('.mailbox-id').parents('.form-item').hide();
      $('.mailbox-name').keyup(function() {
        var machine = $(this).val().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_');
        if (machine !== '_' && machine !== '') {
          $('.mailbox-id').val(machine);
          $('.mailbox-id-suffix').empty().append(' Machine name: ' + machine + ' [').append($('<a href="#">'+ Drupal.t('Edit') +'</a>').click(function() {
            $('.mailbox-id').parents('.form-item').show();
            $('.mailbox-id-suffix').hide();
            $('.mailbox-name').unbind('keyup');
            return false;
          })).append(']');
        }
        else {
          $('.mailbox-id').val(machine);
          $('.mailbox-id-suffix').text('');
        }
      });
      $('.mailbox-name').keyup();
    }
  });

};
