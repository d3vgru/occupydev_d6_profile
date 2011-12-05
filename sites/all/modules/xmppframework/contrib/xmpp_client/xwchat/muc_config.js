// MUC_CONFIG.js
var pWin = window.opener || window;
var aTimeout = 0;

// adding the style sheet based off the information we have in the client settings
document.write('<link rel="stylesheet" type="text/css" href="' + pWin.XC.xcfontsize + '" />');

/**
 * Set message information and then activate timeout to clear it
 * @param {String} msg The message to set
 * @param {Boolean} error Determine if the message is an error message or not
 * @param {Boolean} timeout Use timeout or whether it will be manual
 * @action sets the message and calls the timeout to clear it
 */
function xcSetMsg(msg, error, timeout) {
  if (JQ('div#msg').children().size() > pWin.XC.LOGSIZE) {
    JQ('div#msg').children(':first-child').remove();
  }
  if (error) {
    JQ('#msg').addClass('xcError').append('<div>' + msg + '</div>').show();
  } else {
    JQ('#msg').removeClass('xcError').append('<div>' + msg + '</div>').show();
  }
  if (timeout) { aTimeout = setTimeout('xcMsgClear()', pWin.XC.ERRORTIMEOUT); };
};

/**
 * Clears the msg container and removes the error class if it was associated
 */
function xcMsgClear() {
  JQ('#msg').removeClass('xcError').html('').hide();
  if (aTimeout) {
    clearTimeout(aTimeout);
    aTimeout = 0;
  };
};

/**
 * Handle any error packets that are sent to the window
 * @param {JSJaCPacket} p Error packet that arrives
 */
function xcError(p) {
  if (!p) { return true; };
  xcSetMsg(pWin.xcErrorProcess(p), true, true);
  return true;
};

/**
 * @param {String} server
 *      Conference server to query for group chat rooms
 */
function xcGetRooms(server) {
  if (server.length > 0) {
    try {
      var iq = new JSJaCIQ();
      iq.setType('get');
      iq.setTo(server);
      iq.setQuery(pWin.NS_DISCO_ITEMS);
      pWin.con.send(iq, window.xcListRooms);
      xcSetMsg(pWin.xcT('retrieving available rooms'), false, false);
    } catch (e) {
      xcSetMsg(e.message, true, true);
    };
    return false;
  }
  xcSetMsg(pWin.xcT('You must enter a server to query for group chat rooms'), true, true);
  return false;
};

/**
 * Receives room request packet and displays any information received
 * @param {JSJaCIQ} iq IQ result packet with the pertinent information
 */
function xcListRooms(iq) {
  xcMsgClear(); // clear retrieving message
  var html = '';
  // going through each query child node to get the relevant information
  JQ(iq.getDoc()).find('item').each(function() {
    var jid = pWin.xcEnc(JQ(this).attr('jid')); // room jid
    var description = JQ(this).attr('name'); // room description
    var name = JQ(this).attr('jid').split('@')[0];
    html += '<div id="' + jid + '" class="xcMUCRoomInfo"><div class="xcMUCRoomName">' + name + '</div>';
    html += '<div class="xcMUCRoomDescription">' + description + '</div></div>';
    html += '<div id="' + jid + '_data" class="xcMUCRoomData"></div>';
  });
  JQ('.xcMUCRoomData').remove(); // remove any previous room data records
  JQ('.xcMUCRoomInfo').remove(); // remove any previous room information records
  JQ('#xcFormButtons').prepend(html); // adding the new information to the screen
  // setting the click components for each of the new rooms
  JQ('.xcMUCRoomInfo').unbind().click(function() {
    JQ('div.xcMUCRoomInfo').removeClass('selected');
    JQ(this).addClass('selected');
    JQ('#room').val(pWin.xcDec(this.id));
    JQ('#nickname').attr('disabled', 'disabled').val(pWin.XC.nickname);
    xcMUCReservedNick(pWin.xcDec(this.id)); // check if the room has a reserved nickname or not for the user
  });
  return true;
};

/**
 * Get specific information regarding the actual room
 */
function xcGetRoomInfo(room) {
  if (typeof(room) == 'undefined' || room == '') {
    xcSetMsg(pWin.xcT('No room selected'), true, true);
    return false;
  };
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.setTo(pWin.xcDec(room));
    iq.setQuery(pWin.NS_DISCO_INFO);
    pWin.con.send(iq, window.xcShowRoomInfo);
    JQ('.xcRoomData').html('').hide('slow'); // hiding any currently displayed Group Chat room information
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * Show information regarding the room
 */
function xcShowRoomInfo(iq) {
  if(!iq) { return true; };
  var html = '';
  var jid = pWin.xcEnc(iq.getFrom() + '_data') + '.xcMUCRoomData';
  // retrieve all the feature information first
  JQ(iq.getDoc()).find('feature').each(function() {
    html += '<div>' + xcMUCProperties(JQ(this).attr("var")) + '</div>';
  });
  // retrieve all the extra field information in the x variable
  JQ(iq.getDoc()).find('field').each(function() {
    if (label = JQ(this).attr('label')) {
      var value = JQ(this).children(':first-child').text();
      html += '<div>' + label + ': ' + value + '</div>';
    };
  });
  // adding the close button so you can close the information portion
  html += '<div class="xcFieldWrapper button xcSubmit">';
  html += '<input type="button" id="close_button" value="Close" />';
  html += '</div>';
  JQ('#' + jid).html(html).slideDown('slow');
  JQ('#close_button').click(function() { JQ('#' + jid).html('').slideUp('slow'); });
  return true;
};

/**
 * Send the query request to the server for the room occupants
 */
function xcGetRoomUsers(room) {
  if (typeof(room) == 'undefined' || room == '') {
    xcSetMsg(pWin.xcT('No room selected'), true, true);
    return false;
  };
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.setTo(pWin.xcDec(room));
    iq.setQuery(pWin.NS_DISCO_ITEMS);
    pWin.con.send(iq, window.xcShowRoomUsers);
    JQ('.xcRoomData').html('').hide('slow'); // hiding any currently displayed MUC room info
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * Retrieve the occupants for the specific room
 * @param {JSJaCIQ} packet IQ stanza with pertinent room information
 */
function xcShowRoomUsers(iq) {
  if(!iq) { return true; };
  var jid = pWin.xcEnc(iq.getFrom() + '_data') + '.xcMUCRoomData';
  if (JQ(iq.getQuery()).children().size() == 0) {
    var html = '<div>' + pWin.xcT('No occupant information was available from the server') + '</div>'; // private room or no occupants currently in the room
  } else {
    var html = '<div>' + pWin.xcT('Room has the following occupants') + '</div>';
    JQ(iq.getQuery()).children().each(function() { html += '<div>' + JQ(this).attr('jid') + '</div>'; });
  };
  // adding the close button so you can close the information portion
  html += '<div class="xcFieldWrapper button xcSubmit">';
  html += '<input type="button" id="close_button" value="Close" />';
  html += '</div>';
  JQ('#' + jid).html(html).slideDown('slow');
  JQ('#close_button').click(function() { JQ('#' + jid).html('').slideUp('slow'); });
  return true;
};

/**
 * @param {String} room
 *      Room you wish to remove from the group chat server
 */
function xcDestroyRoom(room) {
  if (typeof(room) == 'undefined' || room == '') {
    xcSetMsg(pWin.xcT('No room selected'), true, true);
    return false;
  };
  var reason = pWin.xcT('Removing room from server');
  try {
    var iq = new JSJaCIQ();
    iq.setTo(room);
    iq.setType('set');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_MUC_OWNER},
                  [iq.buildNode('destroy',
                  [iq.buildNode('reason', reason)])]));
    pWin.con.send(iq, function(iq) {
                        if (iq.isError()) {
                          xcSetMsg(pWin.xcErrorProcess(iq), true, true);
                          return true;
                        };
                        xcSetMsg(pWin.xcT('Room removed'), false, true);
                        xcGetRooms(JQ('#server').val());
                        return true;
                      });
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * Displays the create room form on the page
 */
function xcCreateRoomShowForm() {
  JQ('#xcMUCRoom').hide();
  JQ('#xcMUCCreateRoom').show();
  // make sure we take the value for Nickname and server for the new portion
  JQ('#create_room_server').val(pWin.XC.MUC);
  JQ('#create_room_nickname').val(pWin.XC.nickname);
}

/**
 * Create a new MUC Chat Room
 */
function xcCreateRoom(server, room, nickname) {
  if (!server || !room || !nickname) {
    xcSetMsg(pWin.xcT('You must provide all pertinent information to create a room'), true, true);
    return false;
  };
  try {
    var p = new JSJaCPresence();
    p.setTo(room + '@' + server + '/' + nickname);
    p.appendNode(p.buildNode('x', {xmlns: pWin.NS_MUC_USER}));
    pWin.con.send(p, window.xcCreateRoomVerify);
    xcSetMsg(pWin.xcT('Create room request sent'), false, false);
  } catch (e) {
    xcSetMsg(room + ' ' + pWin.xcT('creation failed') + ': ' + e.message, true, true);
  };
};

/**
 * Verifies that the Room creation occurred and handles any error messages
 */
function xcCreateRoomVerify(p) {
  if (!p) { return true; };
  if (p.isError()) {
    xcSetMsg(pWin.xcErrorProcess(p), true, true);
    return true;
  };
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.setTo(pWin.xcJID(p.getFrom(), false));
    iq.setQuery(pWin.NS_MUC_OWNER);
    pWin.con.send(iq, xcConfigRoom);
  } catch (e) {
    xcSetMsg(pWin.xcT('Un-lock failed') + ': ' + e.message, true, true);
  };
  return true;
};

/**
 * Will either display the form to configure the room, enter the room if no config is possible or display error message
 * @param {JSJaCIQ} iq IQ stanza with either the room form configuration in it or error information
 */
function xcConfigRoom(iq) {
  if (iq.isError()) {
    xcSetMsg(pWin.xcErrorProcess(iq), true, true);
    return true;
  };
  if (JQ(iq.getDoc()).find('x').size() == 0) {
    xcSetMsg(pWin.xcT('Configuration not allowed. Entering room'), false, true);
    xcEnterRoom();
    return true;
  } else {
    var title = JQ(iq.getDoc()).find('title').text();
    var instructions = JQ(iq.getDoc()).find('instructions').text();
    var html = '<form name="roomname_form" id="roomname_form">' +
               '<input type="hidden" id="room_value" value="' + pWin.xcJID(iq.getFrom(), false) + '" />' +
               '</form>' +
               '<div id="title">' + title + '</div>' + pWin.xcCreateForm(iq, 'configure-room-form', 'xcConfigRoomSend', true);
  };
  JQ('#xcMUCCreateRoom').html(html);
  xcMsgClear();
  return true;
};

/**
 * Sends the room configuration back to the server based on user input
 */
function xcConfigRoomSend() {
  if (!(room = JQ('form#roomname_form input#room_value').val())) {
    xcSetMsg(pWin.xcT('No data available'), true, true);
    return false;
  };
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.setTo(room);
    iq.setQuery(pWin.NS_MUC_OWNER);
    var x;
    // IE does not support createElementNS
    if (JQ.browser.msie === true) {
      x = iq.getDoc().createElement('x');
      x.setAttribute('xmlns', pWin.NS_XDATA);
    } else {
      // Firefox no longer allows createElement and setting an xmlns
      // Since Firefox 3, so we need to createElementNs instead MSIE
      // Does not understand createElementNS so we use the old version above
      x = iq.getDoc().createElementNS(pWin.NS_XDATA, 'x');
    }
    x.setAttribute('type', 'submit');
    JQ('#configure-room-form :input').each(function() {
      if ((value = JQ(this).val())) {
        var id = this.id;
        var f = iq.getDoc().createElement('field');
        f.setAttribute('var', id);
        if (typeof(value) == 'string') {
          var v = iq.getDoc().createElement('value');
          var t = iq.getDoc().createTextNode(value);
          v.appendChild(t);
          f.appendChild(v);
        } else {
          for (var i = 0; i < value.length; i++) {
            var v = iq.getDoc().createElement('value');
            var t = iq.getDoc().createTextNode(value[i]);
            v.appendChild(t);
            f.appendChild(v);
          }
        }
        x.appendChild(f);
      }
    });
    iq.getQuery().appendChild(x);
    pWin.con.send(iq, function(iq) {
                        if (iq.isError()) {
                          xcSetMsg(pWin.xcErrorProcess(iq), true, true);
                          return true;
                        };
                        xcEnterRoom(JQ('form#roomname_form input#room_value').val(), pWin.XC.nickname);
                        return true;
                      });
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * @param {String} room
 *      Name of the room you are entering
 * @param {String} nickname
 *      Nickname you will be using to enter the room
 */
function xcEnterRoom(room, nickname) {
  if (room.length == 0 || nickname.length == 0) {
    xcSetMsg(pWin.xcT('Missing information'), true, true);
    return false;
  };
  pWin.xcMUCInviteLaunch(room, nickname);
  window.close();
};

/**
 * Verify if the user has a reserved nickname for the room or not
 */
function xcMUCReservedNick(room) {
  if (typeof(room) == 'undefined' || room == '') {
    xcSetMsg(pWin.xcT('No room was selected'), true, true);
    return false;
  };
  try {
    var iq = new JSJaCIQ();
    iq.setTo(room);
    iq.setType('get');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_DISCO_INFO, node: pWin.NS_X_ROOMUSER}));
    pWin.con.send(iq, window.xcMUCReservedNickVrfy);
    xcSetMsg(pWin.xcT('Checking for reserved nickname for that room'), false, false);
    aTimeout = setTimeout(function() {
                            xcSetMsg(pWin.xcT('No reserved nickname response'), true, true);
                            JQ('#nickname').removeAttr('disabled');
                            clearTimeout(aTimeout);
               }, pWin.XC.ERRORTIMEOUT);
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * @param {JSJaCIQ} iq IQ stanza received back from the xmpp server
 */
function xcMUCReservedNickVrfy(iq) {
  if (!aTimeout) { return true; }; // already cleared because of timeout above hence do nothing here in the function
  xcMsgClear(); // clearing any message we received
  if (JQ('#nickname').attr('disabled')) { JQ('#nickname').removeAttr('disabled'); }; // remove disable attribute from nickname portion
  if (iq.isError()) {
    xcSetMsg(pWin.xcErrorProcess(iq), true, true);
    return true;
  };
  clearTimeout(aTimeout);
  // if query element does not have node = x-room-user then we know the server returned a disco info instead of the correct information so ignore it
  if (JQ(iq.getDoc()).find('query').attr('node') == pWin.NS_X_ROOMUSER) {
    JQ(iq.getDoc()).find('identity').each(function() {
      // per disco info xep-0030, the identity child will be returned by the xmpp server
      // and category/type will be conference/text, if it is not that then ignore the child
      if (JQ(this).attr('category') == 'conference' && JQ(this).attr('type') == 'text') {
        JQ('#nickname').val(JQ(this).attr('name')).attr('disabled', 'disabled');
      };
    });
  };
  return true;
};

/**
 * Returns human readable information about the MUC room property
 * @param {String} name the name of the property
 * @return {String} human readable information
 */
function xcMUCProperties(name) {
  if (name == 'http://jabber.org/protocol/disco#info') { return pWin.xcT('Discovery protocol available'); };
  if (name == 'http://jabber.org/protocol/muc') { return pWin.xcT('Support for MUC protocol'); };
  if (name == 'http://jabber.org/protocol/muc#register') { return pWin.xcT('Support for muc#register'); };
  if (name == 'http://jabber.org/protocol/muc#roomconfig') { return pWin.xct('Support for muc#roomconfig'); };
  if (name == 'http://jabber.org/protocol/muc#roominfo') { return pWin.xcT('Support for muc#roominfo'); };
  if (name == 'muc_hidden') { return pWin.xcT('Hidden room'); };
  if (name == 'muc_membersonly') { return pWin.xcT('Members Only room'); };
  if (name == 'muc_moderated') { return pWin.xcT('Moderated room'); };
  if (name == 'muc_nonanonymous') { return pWin.xcT('Non Anonymous room'); };
  if (name == 'muc_open') { return pWin.xcT('Open room'); };
  if (name == 'muc_passwordprotected') { return pWin.xcT('Password protected room'); };
  if (name == 'muc_persistent') { return pWin.xcT('Persistent room'); };
  if (name == 'muc_public') { return pWin.xcT('Public room'); };
  if (name == 'muc_rooms') { return pWin.xcT('List of MUC rooms'); };
  if (name == 'muc_semianonymous') { return pWin.xcT('Semi Anonymous room'); };
  if (name == 'muc_temporary') { return pWin.xcT('Temporary room'); };
  if (name == 'muc_unmoderated') { return pWin.xcT('Unmoderated room'); };
  if (name == 'muc_unsecured') { return pWin.xcT('Unsecured room'); };
  return ''; // return empty string is we do not understand the room property
}

// DOM is now ready for manipulation
JQ(document).ready(function() {
  JQ('#server').val(pWin.XC.MUC); // muc server set up in the client configuration
  // Adding click handler for the message clear
  JQ('div#msg').click(function() {
    xcMsgClear();
  });
});

// Clean up, while the window is being unloaded
JQ(window).unload(function() { pWin.xcWinClose(window.name); });
