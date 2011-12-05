// All JS for privacylists
var pWin = window.opener || window;
var pIQ;

// adding the style sheet based off the information we have in the client settings
document.write('<link rel="stylesheet" type="text/css" href="' + pWin.XC.xcfontsize + '" />');

/**
 * Set message information and then activate timeout to clear it
 * @param {String} msg The message to set
 * @action sets the message and calls the timeout to clear it
 */
function xcSetMsg(msg, error) {
  if (JQ('div#msg').children().size() > pWin.XC.LOGSIZE) {
    JQ('div#msg').children(':first-child').remove();
  }
  if (error) {
    JQ('#msg').addClass('xcError').append(msg);
  } else {
    JQ('#msg').removeClass('xcError').append(msg);
  }
  JQ('.xcErrContainer').css({ top: '150px', left: '400px', width: '300px' }).show();
};

/**
 * Clears the msg container and removes the error class if it was associated
 */
function xcMsgClear() {
  JQ('#msg').removeClass('xcError').html('');
  JQ('.xcErrContainer').hide();
};

/**
 * Removes the item field from the privacy list we are currently editing
 * @param {String} type The type of the item in the privacy list
 * @param {String} val The value in the item based off the type
 * @param {String} action {either allow or deny depending on what you wish to do}
 * @param {String} order The order in which the item will occur in the privacy list
 * @param {String} stanza The type of stanza we wish to block or allow
 * @param {Integer} tablerow The row to remove from the table
 */
function xcPrivacyListRemoveItem(type, val, action, order, stanza, tablerow) {
  JQ(pIQ.getDoc()).find('item').each(function() {
    if (JQ(this).attr('action') == action && JQ(this).attr('order') == order) {
      if (JQ(this).children().size() > 0 && stanza == JQ(this).children().get(0).nodeName) {
        if (pWin.xcNVL(JQ(this).attr('type'), 'All') == type && pWin.xcNVL(JQ(this).attr('value'), 'All') == val) {
          JQ(this).remove(); // remove the node from the pIQ since we do not need it any more it is being deleted
        };
      } else if (JQ(this).children().size() == 0 && stanza == 'All') {
        if (pWin.xcNVL(JQ(this).attr('type'), 'All') == type && pWin.xcNVL(JQ(this).attr('value'), 'All') == val) {
          JQ(this).remove(); // remove the node from the pIQ since we do not need it any more it is being deleted
        };
      };
    };
  });
  pIQ.setType('set');
  pIQ.setTo('');
  pWin.con.send(pIQ, function(iq) {
                       if (iq.isError()) {
                         xcSetMsg(pWin.xcErrorProcess(iq), true);
                         return true;
                       };
                       JQ('#item_' + tablerow).remove();
                       if (JQ('#privacylist_info_tbl').find('tr > td > a').size() == 1) {
                         JQ('#privacylist_info_tbl').find('tr > td > a').unbind().click(function() {
                           return confirm(pWin.xcT('Privacy List will be removed. Are you sure?'));
                         });
                       };
                       return true;
                     });
  if (JQ(pIQ.getDoc()).find('item').size() == 0) {
    JQ('#privacylist_info').hide('slow');
    xcPrivacyListGet();
    JQ('#privacylist_list').show('slow');
  };
};

/**
 * Adds an extra item field to the pertinent privacy list we are currently editing
 * @param {String} type The type of the item in the privacy list
 * @param {String} val The value in the item based off the type
 * @param {String} action {either allow or deny depending on what you wish to do}
 * @param {String} order The order in which the item will occur in the privacy list
 * @param {String} stanza The type of stanza we wish to block or allow
 */
function xcPrivacyListAddItem(type, val, action, order, stanza) {
  if (typeof(action) == 'undefined' || action == '') {
    xcSetMsg(pWin.xcT('Your privacy list item must have a default action'), true);
    return false;
  };
  if (typeof(order) == 'undefined' || order == '') {
    xcSetMsg(pWin.xcT('Your privacy list item must have a default order'), true);
    return false;
  };
  var item = pIQ.buildNode('item', {action: action, order: order});
  if (typeof(type) != 'undefined' && type != '') {
    JQ(item).attr('type', type);
  };
  if (typeof(val) != 'undefined' && val != '') {
    JQ(item).find('item').attr('value', val);
  };
  if (typeof(stanza) != 'undefined' && stanza != '') {
    var n = pIQ.buildNode(stanza);
    JQ(n).appendTo(item);
  };
  JQ(item).appendTo(JQ(pIQ.getDoc()).find('list'));
  pIQ.setType('set'); // make sure it is a set IQ we are sending
  pIQ.setTo(''); // make sure we remove the to element from the packet
  pWin.con.send(pIQ, function(iq) {
                       if (iq.isError()) {
                         xcSetMsg(pWin.xcErrorProcess(iq), true);
                         return true;
                       };
                       xcPrivacyListInfo(JQ('#privacylist_info_form_name').val()); // refresh the contents on the screen
                       return true;
                     });
  JQ('#privacylist_info_form')[0].reset(); // reset the form values to remove the data
};

/**
 * Adds new privacy list for the user
 * @param {String} name The name the user wishes to call the privacy list
 * @param {String} type The type of the item in the privacy list
 * @param {String} val The value in the item based off the type
 * @param {String} order The order in which the item will occur in the privacy list
 * @param {String} stanza The type of stanza we wish to block or allow
 */
function xcPrivacyListAdd(name, type, val, action, order, stanza) {
  if (typeof(name) == 'undefined' || name == '') {
    xcSetMsg(pWin.xcT('You must give your privacy list a name'), true);
    return false;
  };
  if (name.toLowerCase() == 'invisible' || name.toLowerCase() == 'visible') {
    xcSetMsg(name + ' ' + pWin.xcT('is a reserved privacy list name hence you cannot use it'), false);
    return false;
  };
  if (typeof(action) == 'undefined' || action == '') {
    xcSetMsg(pWin.xcT('Your privacy list item must have a default action'), true);
    return false;
  };
  if (typeof(order) == 'undefined' || order == '') {
    xcSetMsg(pWin.xcT('Your privacy list item must have a default order'), true);
    return false;
  };
  var iq = new JSJaCIQ();
  iq.setType('set');
  iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_PRIVACY},
               [iq.buildNode('list', {name: name},
               [iq.buildNode('item', {action: action, order: order })])]));
  if (typeof(type) != 'undefined' && type != '') {
    JQ(iq.getDoc()).find('item').attr('type', type);
  };
  if (typeof(val) != 'undefined' && val != '') {
    JQ(iq.getDoc()).find('item').attr('value', val);
  };
  if (typeof(stanza) != 'undefined' && stanza != '') {
    var n = iq.buildNode(stanza);
    JQ(n).appendTo(JQ(iq.getDoc()).find('item'));
  };
  pWin.con.send(iq, function(iq) {
                      if (iq.isError()) {
                        xcSetMsg(pWin.xcErrorProcess(iq), true);
                        return true;
                      };
                      xcSetMsg(pWin.xcT('Privacy List successfully created'), false);
                      JQ('#privacylist_new_list').hide('slow');
                      xcPrivacyListGet();
                      xcPrivacyListInfo(name); // show the list on the screen
                      return true;
                    });
  JQ('#privacylist_new_list_form')[0].reset(); // reset the form values to remove the data
};

/**
 * Retrieve the list of current privacy lists the user has stored on the server
 */
function xcPrivacyListGet() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_PRIVACY}));
    pWin.con.send(iq, window.xcPrivacyListGetVrfy);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * @param {JSJaCIQ} iq The IQ Stanza with the list of privacy lists
 */
function xcPrivacyListGetVrfy(iq) {
  if (iq.isError()) {
    xcSetMsg(pWin.xcErrorProcess(iq), true);
    return true;
  };
  JQ('#privacylist_tbl').find('tr > td').parent().remove(); // incase the person hits the info again before closing we will only show one list at a time
  var active = JQ(iq.getDoc()).find('active').attr('name');
  var def = JQ(iq.getDoc()).find('default').attr('name');
  JQ(iq.getDoc()).find('list').each(function() {
    var name = JQ(this).attr('name');
    var html = '<tr id="' + name + '" class="xcPrivacyListElement"><td align="center">' + name + '</td>';
    html += (active == name) ? '<td align="center">' + pWin.xcT('Yes') + '</td>' : '<td align="center">' + pWin.xcT('No') + '</td>';
    html += (def == name) ? '<td align="center">' + pWin.xcT('Yes') + '</td>' : '<td align="center">' + pWin.xcT('No') + '</td>';
    html += '<td align="center"><a href="javascript:xcPrivacyListInfo(\'' + name + '\');" title="Edit Privacy List"><img src="img/info.gif" height="16" width="16" /></a>&nbsp;&nbsp;';
    html += '<a href="javascript:xcPrivacyListRemove(\'' + name + '\');" onClick="return confirm(\'' + pWin.xcT('Are you sure') + '?\');" title="Remove Privacy List"><img src="img/trash.gif" height="16" width="16" /></a></td>';
    html += '</tr>';
    JQ('#privacylist_tbl').append(html);
  });
  return true;
};

/**
 * @param {String} name The name of the privacy list you wish to read
 */
function xcPrivacyListInfo(name) {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_PRIVACY},
                 [iq.buildNode('list', {name: name})]));
    pWin.con.send(iq, window.xcPrivacyListInfoVrfy);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * @param {JSJaCIQ} iq The IQ Stanza with the returned privacy list information
 */
function xcPrivacyListInfoVrfy(iq) {
  if (iq.isError()) {
    xcSetMsg(pWin.xcErrorProcess(iq), true);
    return true;
  };
  var counter = 0, onclick = 0;
  JQ('#privacylist_info_tbl').find('tr > td').parent().remove(); // incase the person hits the info again before closing we will only show one list at a time
  var name = JQ(iq.getDoc()).find('list').attr('name');
  JQ('#privacylist_info_form_name').val(name);
  JQ('#privacylist_info_title').html(pWin.xcT('Privacy List ') + name + pWin.xcT(' Information'));
  // need to check if there is just one item or not for deletion since if they delete it they will remove the whole privacy list per the XEP-0016 standard
  if (JQ(iq.getDoc()).find('item').size() == 1) { onclick = 1; };
  JQ(iq.getDoc()).find('item').each(function() {
    var type = pWin.xcNVL(JQ(this).attr('type'), 'All');
    var val = pWin.xcNVL(JQ(this).attr('value'), 'All');
    var action = pWin.xcNVL(JQ(this).attr('action'), 'All');
    var order = pWin.xcNVL(JQ(this).attr('order'), 'All');
    var html = '<tr id="item_' + counter + '"><td>' + type + '</td><td>' + val + '</td><td>' + action + '</td><td>' + order + '</td>';
    if (JQ(this).children().size() == 0) {
      var stanza = 'All';
      html += '<td>All</td>';
    } else {
      var stanza = JQ(this).children().get(0).nodeName;
      html += '<td>' + stanza + '</td>';
    };
    if (name == 'visible' || name == 'invisible') {
      html += '<td>&nbsp;</td></tr>' // reason for this is the client uses these two in the invisible piece hence don't let the people change them
    } else {
      if (onclick) {
        html += '<td><a href="javascript:xcPrivacyListRemoveItem(\'' + type + '\', \'' + val + '\', \'' + action + '\', \'' + order + '\', \'' + stanza + '\', \'' + counter + '\');" onClick="return confirm(\'' + pWin.xcT('Privacy List will be removed. Are you sure?') + '\');" title="' + pWin.xcT('Remove privacy list item') + '"><img src="img/trash.gif" height="16" width="16" /></a></td></tr>';
      } else {
        html += '<td><a href="javascript:xcPrivacyListRemoveItem(\'' + type + '\', \'' + val + '\', \'' + action + '\', \'' + order + '\', \'' + stanza + '\', \'' + counter + '\');" title="' + pWin.xcT('Remove privacy list item') + '"><img src="img/trash.gif" height="16" width="16" /></a></td></tr>';
      };
    };
    JQ('#privacylist_info_tbl').append(html);
    counter++;
  });
  var html = '<tr><td align="center" colspan="6">' +
             '<input type="button" name="close_button" id="close_button" value="Close" class="xcButton" onClick="xcHidePopup();" /></td></tr>';
  JQ('#privacylist_info_tbl').append(html);
  JQ('#privacylist_new_list').hide('slow');
  JQ('#privacylist_list').hide('slow');
  JQ('#privacylist_info').show('slow');
  pIQ = iq; // keeping this incase the user wishes to make changes to this one
  if (name == 'visible' || name == 'invisible') {
    JQ('#privacylist_info_form_addbutton').attr('disabled', 'disabled'); // disable the add button if it is one of the lists we do not wish the user to change
  } else {
    JQ('#privacylist_info_form_addbutton').removeAttr('disabled', 'disabled'); // make sure the button is enabled if the list is not one of our reserved lists
  };
};

/**
 * Hides the popup that appears with all of the pertinent privacylist information and
 * removes the information we dynamically put into the popup
 */
function xcHidePopup() {
  JQ('#privacylist_info').hide('slow');
  JQ('#privacylist_list').show('slow');
  JQ('#privacylist_info_tbl').find('tr > td').parent().remove(); // remove all of the rows we put into the table
  pIQ = {}; // unset the iq we were storing since it is no longer being displayed
};

/**
 * Removes a privacy list from the server since the user no longer needs the privacy list
 */
function xcPrivacyListRemove(name) {
  if (typeof(name) == 'undefined' || name == '') {
    xcSetMsg(pWin.xcT('Unable to process request, no privacy list name was received'), true);
    return;
  };
  if (name.toLowerCase() == 'visible' || name.toLowerCase() == 'invisible') {
    xcSetMsg(name + ' ' + pWin.xcT('is a required privacy list, hence you cannot remove or modify it'), true);
    return;
  };
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.setID(name); // name we were removing as the ID of the packet so we can get it in the verify stage
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_PRIVACY},
                 [iq.buildNode('list', {name: name})]));
    pWin.con.send(iq, function(iq) {
                        if (iq.isError()) {
                          xcSetMsg(pWin.xcErrorProcess(iq));
                          return true;
                        };
                        JQ('#' + iq.getID()).hide('slow').remove();
                        xcSetMsg(pWin.xcT('Privacy List successfully removed'));
                        return true;
                      });
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Function sends an empty active node to the privacy lists to inform we do not
 * wish to utilize any of our privacy lists as active lists
 */
function xcPrivacyListDeactivate() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_PRIVACY},
                 [iq.buildNode('active')]));
    pWin.con.send(iq, xcPrivacyListDeactivateVrfy);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * @param {JSJaCIQ} iq The IQ stanza with the result of our deactivation
 */
function xcPrivacyListDeactivateVrfy(iq) {
  if (isError()) {
    xcSetMsg(pWin.xcErrorProcess(iq), true);
    return true;
  };
  return true; // we received result, hence it worked stop JS bubbling effect
};

/**
 * This function will dynamically make the necessary information pertaining to the users selection
 * for regarding the value field in the privacy list, i.e. group means only groups the user currently has
 * @param {String} value The type of privacy list we are going to be setting up
 */
function xcSetValue(value, id, layer) {
  if (typeof(value) == 'undefined' || value == '') { return false; };
  switch (value) {
    case 'group':
      var html = '<select name="' + id + '" id="' + id + '" class="xcSelect">';
      for (var x = 0; x < pWin.grouplist.length; x++) {
        var groupname = pWin.grouplist[x];
        html += '<option value="' + groupname + '">' + groupname + '</option>';
      };
      html += '</select>';
      break;

    case 'subscription':
      var html = '<select name="' + id + '" id="' + id + '" class="xcSelect">' +
                 '<option value="both">Both</option>' +
                 '<option value="from">From</option>' +
                 '<option value="none" selected>None</option>' +
                 '<option value="to">To</option>' +
                 '</select>';
      break;

    case 'jid':
      var html = '<input type="text" id="' + id + '" value="" class="xcInput" />';
      break;

    default:
      var html = 'All <input type="hidden" id="' + id + '" value="" />';
  };
  JQ('#' + layer).html(html);
};


JQ(document).ready(function() {
  // Adding click handler to the error container
  JQ('.xcErrContainer').click(function() {
    xcMsgClear();
  });
  xcPrivacyListGet();
});

JQ(window).unload(function() {
  try { pWin.xcWinClose(pWin.xcDec(self.name)); } catch (e) {};
});
