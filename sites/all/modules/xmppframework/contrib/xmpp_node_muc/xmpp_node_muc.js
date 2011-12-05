// $id Javascript portion for the XMPP NODE MUC
Drupal.xmpp_node_muc = {
  ROSTERWINOPTS: 'top=25,width=375,height=450,location=0,scrollbars=1,resizable=1,status=0'
};

var xcpass = '';

if (Drupal.jsEnabled) {
  $(document).ready(function() {
    $('div.xmpp_node_muc_group_list').hide();
    $('div.xmpp_node_muc_group_list:first').show();
    $('.xmpp_node_muc a').click(function(e) {
      var nid = $(this).attr('nid');
      var url = $(this).attr('url');
      var attribute = $(this);
      $.get(url + '/' + nid, function(result) { eval(result); });
      return false;
    });
    // Setting the click option so we can view the messages for the muc
    $('.xmpp_node_muc_group_channel_title').click(function() {
      var nid = $(this).attr('id').substr(34);
      $('#xmpp_node_muc_group_list_' + nid).slideToggle();
      return false;
    });
  });
}

/**
 * @param nid
 *      Node id that we will retrieve the information from
 * @param url
 *      Url where to go and get the information from
 * @param interval
 *      Time between AJAX block refreshes
 */
Drupal.xmpp_node_muc.refresh_block = function(nid, url, interval) {
  setTimeout(function() {
    $.get(url + '/' + nid, function(result) {
      // only try and do something if the result length we receive is larger than 0
      if (result.length > 0) {
        eval(result);
      };
      // continue block refreshing
      Drupal.xmpp_node_muc.refresh_block(nid, url, interval);
    })
  }, interval);
}

/**
 * Function utilized to set the online number of users per group based on ajax request
 * Function will also display or hide the Join link depending on the users status in the group
 *
 * @param gid
 *      Group we are working with
 * @param peoplecount
 *      Number of people currently in the group
 * @param user_status
 *      Users current status in the group
 */
Drupal.xmpp_node_muc.updateMucHeader = function(gid, peoplecount, user_status) {
  // Setting the number of online people who are currently active in the group.
  $('#xmpp_node_muc_group_people_' + gid).html(peoplecount + ' people');

  // Hiding or Displaying the Join link for the group depending on the users status in the group.
  if (parseInt(user_status)) {
    $('#xmpp_node_muc_group_join_' + gid).hide();
  } else {
    $('#xmpp_node_muc_group_join_' + gid).show();
  };
};

/**
 *
 * @param gid
 *      Group we are working with
 * @param log
 *      Log text formatted in html already
 */
Drupal.xmpp_node_muc.updateLog = function(gid, log) {
  // Updating the log messages with new information from the server
  $('#xmpp_node_muc_group_list_' + gid).html(log);
}

/**
 *
 * @param gid
 *      Group we are working with
 * @param peoplecount
 *      Number of people currently in the group
 * @param user_status
 *      Users current status in the group
 * @param title
 *      Title assigned to the group muc
 * @param join_link
 *      The link for joining the muc
 */
Drupal.xmpp_node_muc.updateTempMucHeader = function(gid, peoplecount, user_status, title, join_link) {
  // Check to make sure the people div has the correct attribute set
  if ($('#xmpp_node_muc_group_people_' + gid).size() == 0) {
    $('.xmpp_node_muc_group_join').attr('id', 'xmpp_node_muc_group_join_' + gid);
    $('.xmpp_node_muc_group_people_count').attr('id', 'xmpp_node_muc_group_people_' + gid);
    $('.xmpp_node_muc_group_channel_title').attr('id', 'xmpp_node_muc_group_channel_title_' + gid);
    $('.xmpp_node_muc_group_channel_header').attr('id', 'xmpp_node_muc_group_channel_' + gid);
  };
  // Setting the title for the temporary MUC
  $('#xmpp_node_muc_group_channel_title_' + gid)
    .html(title)
    .unbind('click')
    .click(function() {
      $('#xmpp_node_muc_group_list_' + gid).slideToggle();
      return false;
    });

  // Setting the link so the join link will be there
  $('#xmpp_node_muc_group_join_' + gid).html(join_link);
  // Calling Update MUC Header function instead of repeating it
  Drupal.xmpp_node_muc.updateMucHeader(gid, peoplecount, user_status);
}

/**
 *
 * @param gid
 *      Group we are working with
 * @param log
 *      Log text formatted in html already
 */
Drupal.xmpp_node_muc.updateTempLog = function(gid, log) {
  // If the div does not have the attribute id set correctly set it first
  if ($('#xmpp_node_muc_group_list_' + gid).size() == 0) {
    $('.xmpp_node_muc_group_list').attr('id', 'xmpp_node_muc_group_list_' + gid);
  }
  // Updating the log messages with the new information from the server
  $('#xmpp_node_muc_group_list_' + gid).html(log);
}

/**
 * @param group
 *      Full jid of the group we wish to join
 */
Drupal.xmpp_node_muc.group_chat = function(group) {
  w = window.open('', 'XMPP_CLIENTROSTERWIN', Drupal.xmpp_node_muc.ROSTERWINOPTS);
  w.blur();
  window.focus();
  if (w.con && w.con.connected()) {
    w.focus();
    w.xcMUCInviteLaunch(group, Drupal.settings.xmpp_client.login['username']);
  } else {
    w.close();

    var url = Drupal.settings.xmpp_client.login['url'];
    // parsing through the object building the url we will send
    $.each(Drupal.settings.xmpp_client.login, function(k, v) {
      if (k == 'url') { return true; }
      url += '&' + k + '=' + escape(v);
    });
    url += '&nickname=' + Drupal.settings.xmpp_client.login['username'];
    url += '&muc=' + group;

    $.get(Drupal.settings.xmpp_client.login['srvUrl'] + '/password', function(result) {
      xcpass = result;
      var w = window.open(url, 'XMPP_CLIENTROSTERWIN', Drupal.xmpp_node_muc.ROSTERWINOPTS);
      w.focus();
      result = '';
    });
  }
}
