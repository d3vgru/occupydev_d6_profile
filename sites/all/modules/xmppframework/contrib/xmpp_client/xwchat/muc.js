// MUC.js
var pWin = window.opener || window;
var nickname = '', oldnick = '', oldsubject = '';
var aTimeout = 0, maxscroll = 0, currentscroll = 0;

// adding the style sheet based off the information we have in the client settings
document.write('<link rel="stylesheet" type="text/css" href="' + pWin.XC.xcfontsize + '" />');

// MSIE does not support indexOf for some reason
// Taken from http://soledadpenades.com/2007/05/17/arrayindexof-in-internet-explorer/
if (!Array.indexOf) {
  Array.prototype.indexOf = function(obj) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == obj) { return i; };
    };
    return -1;
  };
};

/**
 * @param {Integer} top The current position of the top of the scrollbar
 */
function xcScrollSave(top) {
  if (top > maxscroll) { maxscroll = top; };
  currentscroll = top;
}


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
  }
};

/**
 * Posts the contents of the MUC chat to the save on the server
 */
function xcPostMUCChat() {
  if (!pWin.XC.srvUrl) { return false; };
  var body = new Array();
  var title = JQ('#subject').val();
  var participants = new Array();
  var tarray = new Array();
  // retrieve the participants in the conversation
  JQ('#muc_occupants.xcMUCOccupants div.xcMUCOccupant').each(function() {
    if (JQ(this).children('div#xcMUCCurrentUser').size() == 0) {
      participants.push(JQ(this).html());
    } else {
      participants.push(JQ(this).find('div#xcMUCCurrentUser strong').html());
    };
  });
  // retrieve the conversation information from the window
  JQ('#msg_pane.xcMUCMsgPane div.xcChatMessage').each(function() {
    var timestamp = JQ(this).find('.xcChatMessageHeader .xcChatMessageTimestamp').html();
    var name = JQ(this).find('.xcChatMessageHeader .xcChatMessageSender').html();
    // if the name was not in the participants list i.e. they have already left then make sure we add it
    if (participants.indexOf(name) == -1) { participants.push(name); };
    if (timestamp) {
      name = name + ' (' + timestamp + ')';
      tarray.push(timestamp);
    };
    var data = name + ': ' + JQ(this).children('p.xcChatMessageBody').html();
    body.push(data);
  });
  // check if the timestamps were accurate if not then leave them empty
  var begin_time = tarray[0]; // format is YYYY-MM-DD HH24:MI:SS
  var end_time = tarray[tarray.length - 1]; // format is YYYY-MM-DD HH24:MI:SS
  pWin.XC.pWin.$('#xcMUCPostForm #chat_type').val('group_chat');
  pWin.XC.pWin.$('#xcMUCPostForm #title').val(JQ('#subject').val());
  pWin.XC.pWin.$('#xcMUCPostForm #begin_time').val(begin_time);
  pWin.XC.pWin.$('#xcMUCPostForm #end_time').val(end_time);
  pWin.XC.pWin.$('#xcMUCPostForm #participants').val(participants.join('\r\n'));
  pWin.XC.pWin.$('#xcMUCPostForm #body').val(body.join('\r\n'));
  pWin.XC.pWin.$('#xcMUCPostForm #mucname').val(pWin.xcDec(window.name));
  pWin.XC.pWin.document.forms['xcMUCPostForm'].submit();
  return false;
};

/**
 * Send Message to the XMPP server, msg is not put in the msg_pane. The XMPP
 * server will broadcast the message back to everyone including this client.
 */
function xcMsgSend() {
  if ((body = JQ('#mbody').val()) != '') {
    pWin.xcMsgSend(body, pWin.xcDec(window.name), null, 'groupchat');
    JQ('#mbody').val('');
  };
  JQ('#mbody')[0].focus();
};

/**
 * Sends packet to change the subject of the MUC room if subject was changed
 * @param {String} subject The new subject
 */
function xcSubjectChange(subject) {
  if (typeof(subject) != 'undefined' && subject != '' && subject != oldsubject) {
    oldsubject = subject;
    pWin.xcMsgSend(null, pWin.xcDec(window.name), subject, 'groupchat');
  };
};

/**
 * Sends packet to change the users nickname in the MUC
 * @param {String} nick The new nickname for the users
 */
function xcNickChange(nick) {
  if (typeof(nick) == 'undefined' || nick == '' || nick == nickname) {
    return false;
  };
  oldnick = nickname;
  nickname = nick;
  try {
    var p = new JSJaCPresence(); // create presence packet with the new nickname and send it
    p.setTo(pWin.xcDec(window.name) + '/' + nickname);
    pWin.con.send(p);
  } catch (e) {
    xcSetMsg(e.message, true, true);
    nickname = oldnick; // failed to change so make sure we change it back
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
 * @param {String} alias
 *      The alias for the person who sent the message
 * @param {String} date
 *      The date and time the message was sent
 * @param {String} lang
 *      The current language the subject is in
 * @param {String} subject
 *      The subject being translated so we can view it
 */
function xcTranslateSubject(alias, date, lang, subject) {
  JQ.ajax({
    type: 'POST',
    url: '/cgi-bin/trans/' + lang + '/' + pWin.XC.xc_translation_lge,
    data: subject,
    processData: false, // dont make data into query string
    contentType: 'text/plain',
    dataType: 'text', // in return we expect the response to be text
    success: function(translated) { xcMessageShow(alias, date, translated, '', subject, null); },
    error: function(xhr, status, thrown) { pWin.oDbg.log('Failed: ' + status); }
  });
};

/**
 * @param {String} alias
 *      The alias for the person who sent the message
 * @param {String} date
 *      The date and time the message was sent
 * @param {String} lang
 *      The current language the body is in
 * @param {String} body
 *      The body being translated so we can view it
 */
function xcTranslateBody(alias, date, lang, body) {
  JQ.ajax({
    type: 'POST',
    url: '/cgi-bin/trans/' + lang + '/' + pWin.XC.xc_translation_lge,
    data: body,
    processData: false, // dont make data into query string
    contentType: 'text/plain',
    dataType: 'text', // in return we expect the response to be text
    success: function(translated) { xcMessageShow(alias, date, '', translated, null, body); },
    error: function(xhr, status, thrown) { pWin.oDbg.log('Failed: ' + status); }
  });
};

/**
 * Handle incoming messages for the MUC
 * @param {JSJaCMessage} m, packet with the message in it
 */
function xcMsgGet(m) {
  var alias = pWin.xcJID(m.getFrom(), true);
  var date = pWin.xcDelayedDelivery(m); // for XEP-0091 and XEP-0203 compatibility
  if (!(pWin.XC.xc_translation)) {
    var subject = m.getSubject().htmlEnc();
    var body = m.getBody().htmlEnc();
    xcMessageShow(alias, date, subject, body, null, null);
  } else {
    sarray = new Array(); // array to store all of the incoming subjects depending on language
    marray = new Array(); // array to store all of the incoming messages depending on language
    // get all of the body texts for the message
    JQ(m.getDoc()).children().children('body').each(function() {
      var body = JQ(this).text().htmlEnc(); // getting the body text for the message
      if (!(lang = JQ(this).attr('xml:lang'))) { lang = 'en'; }; // determine if a language was specified if not default to english
      marray[lang] = body; // set the array with the body for that particular language
    });
    // get all of the subject texts for the message
    JQ(m.getDoc()).children().children('subject').each(function() {
      var subject = JQ(this).text().htmlEnc(); // getting the subject for the message
      if (!(lang = JQ(this).attr('xml:lang'))) { lang = 'en'; }; // determine if a language was specified if not default to english
      sarray[lang] = subject; // set the array with the subject for that particular language
    });
    // check for the subject to determine if it can be sent or needs translated
    if (sarray[pWin.XC.xc_translation_lge]) {
      xcMessageShow(alias, date, sarray[pWin.XC.xc_translation_lge], '', null, null); // we already have the translation for the subject
    } else {
      for (var lang in sarray) {
        xcTranslateSubject(alias, date, lang, sarray[lang]);
        break;
      };
    };

    // check for the body and determine if it can be displayed or needs translated
    if (marray[pWin.XC.xc_translation_lge]) {
      xcMessageShow(alias, date, '', marray[pWin.XC.xc_translation_lge], null, null); // we already have the translation for the body
    } else {
      for (var lang in marray) {
        xcTranslateBody(alias, date, lang, marray[lang]);
        break;
      };
    };
  };
};

/**
 * Display the message that was received on the screen to the user
 *
 * @param {String} alias
 *      The alias of the person who sent the message
 * @param {String} date
 *      The date the message was received
 * @param {String} subject
 *      The subject of the message that was received
 * @param {String} body
 *      The body text of the message received
 * @param {String} ptsubject
 *      The subject before it was translated
 * @param {String} ptbody
 *      The body before it was translated
 */
function xcMessageShow(alias, date, subject, body, ptsubject, ptbody) {
  // checking to see if the DOM is loaded, will be 0 if not
  if (JQ('#msg_pane').size() == 0) {
    setTimeout(function() { xcMessageShow(alias, date, subject, body, ptsubject, ptbody); }, 1000);
    return true;
  };

  if (subject != '') {
    if (body == '') {
      var html = '<div class="xcSystemMessage xcTopicChange">' + pWin.xcT('Topic has been changed to') + ': ' + subject + '</div>';
    } else {
      var html = '<div class="xcSystemMessage xcTopicChange">' + body + '</div>';
    };
    JQ('#msg_pane').append(html).children(':last-child').each(function() {
      if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
      this.scrollIntoView(false);
    });
    JQ('#xcMUCRoomSubject').html(subject);
    JQ('#subject').val(subject);
    oldsubject = subject; // setting the old subject so it can be checked against any changes we make to the subject
    WindowManager.resize(); // adding this to make sure the window resizes correctly
    return true;
  };
  // if the message has any body, add it to the msg pane for people to view
  if (body != '') {
    var html = '<div class="xcChatMessage ' + (alias == nickname ? 'sent' : 'received') + '">' +
               '<div class="xcChatMessageHeader">' +
               '<span class="xcChatMessageTimestamp">' + (pWin.XC.xc_showtimestamps == 1 ? date : '') + '</span>' +
               '<span class="xcChatMessageSender">' + alias + '</span> ' +
               '</div>';
    if (ptbody) {
      html += '<div class="xcChatMessageTranslationToggle" onClick="JQ(this).siblings(\'p.xcChatMessageTranslatedBody\').toggle();">Translation</div>';
      html += '<p class="xcChatMessageBody">' + body + '</p>';
      html += '<p class="xcChatMessageTranslatedBody">' + ptbody + '</p>';
    } else {
      html += '<p class="xcChatMessageBody">' + body + '</p>';
    };
    html += '</div>';
    JQ('#msg_pane').append(html).children(':last-child').each(function() {
      if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
      this.scrollIntoView(false);
    });
    WindowManager.resize(); // adding this to make sure the window resizes correctly
  };
  // putting the focus on this window
  window.focus();
  return true;
};

/**
 * Handles all presence packets that come in for the MUC
 * @param {JSJaCPacket} incoming presence packet
 */
function xcPresence(p) {
  if (!p) { return true; };
  // retrieve information from the packet
  var fulljid = p.getFrom();
  var alias = pWin.xcJID(fulljid, true);
  var jid = JQ(p.getDoc()).find('item').attr('jid'); // for non anonymous rooms
  if (p.getType() == 'error') {
    xcSetMsg(pWin.xcErrorProcess(p), true, true);
    // if the code is changing the nickname make sure we update the information
    if (JQ(p.getDoc()).find('error').attr('code') == 409) {
      if (oldnick != '') {
        nickname == oldnick;
        oldnick = '';
      };
    };
  } else if (p.getType() == 'unavailable') { // someone is leaving the room hence handle that
    var nick = null;
    try {
      // This is encapsulated in try / catch due to Internet Explorer erroring
      // With no error message or any popup if the nick attribute does not exist
      nick = JQ(p.getDoc()).find('item').attr('nick');
    } catch (e) {
      nick = null;
    }
    if (nick) {
      var html = "<div class='xcSystemMessage xcNickChange'><strong>" + alias + "</strong> " + pWin.xcT('is changing their nickname to') + ": " + nick + "</div>";
      JQ('#msg_pane').append(html).children(':last-child').each(function() {
        if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
        this.scrollIntoView(false);
      });
      // check if the user already had a window open for one on one chat via group chat
      if ((w = pWin.xcWinOpenGet(pWin.xcDec(window.name) + '/' + alias))) {
        w.name = pWin.xcEnc(pWin.xcDec(window.name) + '/' + nick); // if so, update the window name for the chat
        w.JQ('#alias').html(nick); // use the JQuery handler on that page to update the page
      };
    };
    JQ('.xcMUCOccupant').each(function() { if (this.id == pWin.xcEnc(fulljid)) { JQ(this).remove(); }; });
    var html = "<div class='xcSystemMessage xcLeftRoom'><strong>" + alias + "</strong> " + pWin.xcT('has left the room') + (pWin.XC.xc_showtimestamps == 1 ? ' (' + pWin.xcDate() + ') ' : '') + "</div>";
    JQ('#msg_pane').append(html).children(':last-child').each(function() {
      if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
      this.scrollIntoView(false);
    });
  } else {
    // check if the user is currently in the list, if so ignore adding them to the list
    var check = 0;
    JQ('.xcMUCOccupant').each(function() { if (this.id == pWin.xcEnc(fulljid)) { check = 1; return false; }; });
    // the user is not currently in the list hence new presence add them to the list
    if (check == 0) {
      var html = "<div id='" + pWin.xcEnc(fulljid) + "' class='xcMUCOccupant" + (alias == nickname ? " xcMUCCurrentUserContainer" : "") + "' " + (jid ? "jid='" + pWin.xcJID(jid, false) + "'" : '') + " oncontextmenu='return false;'>" + alias + "</div>";
      JQ('#muc_occupants').append(html);
      if (alias == nickname) {
        xcInsertNicknameEditor();
      }
      // set click handler for the MUC occupants
      xcSetOccupantClickOptions();
      var html = "<div class='xcSystemMessage xcEnteredRoom'><strong>" + alias + "</strong> " + pWin.xcT('has entered the room') + (pWin.XC.xc_showtimestamps == 1 ? ' (' + pWin.xcDate() + ') ' : '') + "</div>";
      JQ('#msg_pane').append(html).children(':last-child').each(function() {
        if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
        this.scrollIntoView(false);
      });
    };
    // set the classes if the user sends show information into this
    JQ('.xcMUCOccupant').each(function() { if (this.id == pWin.xcEnc(fulljid)) { JQ(this).removeClass().addClass('xcMUCOccupant ' + p.getShow()); }; });
    if (check == 0) {
      var html = pWin.xcStatusProcess(p); // Group Chat presence packet arrived so send to status processor in parent window
      if (html != '') {
        JQ('#msg_pane').append(html).children(':last-child').each(function() {
          if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
          this.scrollIntoView(false);
        });
      };
    };
  };
  WindowManager.resize(); // adding this to make sure the window resizes correctly
  return true;
};

/**
 * Puts the User into an MUC room
 */
function xcEnterRoom(room) {
  if (typeof(room) == 'undefined' || room == '') { return false; };
  if (pWin.XC.unload_nick != '') {
    nickname = pWin.XC.unload_nick;
    pWin.XC.unload_nick = '';
  };
  try {
    var p = new JSJaCPresence();
    p.setTo(room + '/' + nickname);
    p.appendNode(p.buildNode('x', {xmlns: pWin.NS_MUC}));
    window.name = pWin.xcEnc(room); // setting the window name to the room at this point
    pWin.con.send(p, window.xcEnterRoomVerify);
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * Verify the user was able to enter the MUC room successfully
 * @param {JSJaCPresence} p. Presence packet from xmpp server
 */
function xcEnterRoomVerify(p) {
  if (!p) { return true; };
  if (p.isError()) {
    xcSetMsg(pWin.xcErrorProcess(p), true, true);
    window.name = 'MUC'; // set the window name back to MUC since we never entered the room successfully
    return true;
  };
  JQ('div#roomname.xcMUCRoomName').html(pWin.xcDec(window.name)); // making sure we display the name to the user
  nickname = pWin.xcJID(p.getFrom(), true);
  JQ('#nick').val(nickname);
  var fulljid = pWin.xcJID(p.getFrom(), false) + '/' + nickname;
  var jid = JQ(p.getDoc()).find('item').attr('jid');
  // the user is not currently in the list hence new presence add them to the list
  if (JQ('#muc_occupants > #' + pWin.xcEnc(fulljid)).size() == 0) {
    var html = '<div id="' + pWin.xcEnc(fulljid) + '" class="xcMUCOccupant xcMUCCurrentUserContainer" ' + (jid ? "jid='" + pWin.xcJID(jid, false) + "'" : '') + ' oncontextmenu="return false;">' + nickname + '</div>';
    JQ('#muc_occupants').append(html);
    xcInsertNicknameEditor();
    xcSetOccupantClickOptions();
  };
  WindowManager.resize(); // adding this to make sure the window resizes correctly
  return true;
};

function xcInsertNicknameEditor() {
  var nickname = JQ('.xcMUCCurrentUserContainer').html();
  var html = '\
    <div id="xcMUCCurrentUser" class="clearfix">\
      <strong style="float:left">' + nickname + '</strong>\
      <a href="#" onclick="JQ(\'#xcMUCCurrentUser\').toggle();JQ(\'#xcMUCNickname\').toggle();JQ(\'#nick\').focus()" style="float:right;font-size:11px">' + pWin.xcT('Change') + '</a>\
    </div>\
    <div id="xcMUCNickname" class="clearfix">\
      <input type="text" id="nick" value="" size="15" class="xcInput" style="float:left" /> <a href="#" onclick="JQ(\'#xcMUCCurrentUser\').toggle();JQ(\'#xcMUCNickname\').toggle();" style="float:right;font-size:11px">' + pWin.xcT('Cancel') + '</a>\
    </div>'
  JQ('.xcMUCCurrentUserContainer').html(html);
  // change the nickname of the user in the group chat if the enter button is pressed
  JQ('#nick').keypress(function(e) {
    var keycode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (keycode == 13) {
      xcSetMsg('Changing...', false, true);
      xcNickChange(this.value);
      return false;
    };
    return true;
  });
}

/**
 * Close the MUC window when the user leaves the room send presence of
 * type unavailable to the room in order to tell it the user has left
 */
function xcLeaveRoom() {
  try {
    var p = new JSJaCPresence();
    p.setTo(pWin.xcDec(window.name) + '/' + nickname);
    p.setType('unavailable');
    pWin.con.send(p);
    pWin.xcWinClose(pWin.xcDec(window.name));
  } catch (e) {
    pWin.xcWinClose(pWin.xcDec(window.name));
  };
};

/**
 * Sends an invitation to a specific user to join in a group chat
 *
 * to {String}
 *      JID that the invitation is being sent too
 * reason {String}
 *      Reason for sending the invitation to the user
 */
function xcInviteUser(to, reason) {
  if (!to) {
    xcSetMsg(pWin.xcT('No Chat ID information'), true, true);
    return false;
  };
  // if no reason given then put in a default reason so it can be sent
  if (!reason) { reason = pWin.xcT('No reason given'); }
  try {
    var m = new JSJaCMessage();
    m.setTo(pWin.xcDec(window.name));
    m.appendNode(m.buildNode('x', {xmlns: pWin.NS_MUC_USER},
                 [m.buildNode('invite', {to: to},
                 [m.buildNode('reason', reason)])]));
    pWin.con.send(m);
    xcSetMsg(pWin.xcT('Invitiation sent to') + ': ' + to, false, true);
    JQ('#xcMUCInviteForm').slideUp('fast'); // hiding the search popup if it was used
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
  // clearing the text fields in the search form so they can be used later if needed
  JQ('#searchjid').addClass('xcAutoClear').val('john.doe@' + pWin.XC.domain);
  JQ('#imessage').val('');
};

/**
 * Retrieve the form for searching for users
 */
function xcMUCSearchForm() {
  var iq = pWin.xcUserSearchForm();
  if (typeof(iq) == "object") {
    pWin.con.send(iq, window.xcMUCSearchFormDisplay);
  } else {
    xcSetMsg(iq, true, true);
  };
};

/**
 * Display the Form for searching for users
 */
function xcMUCSearchFormDisplay(iq) {
  var html = pWin.xcUserSearchFormVrfy(iq, 'xcMUCUserSearch');
  if (html.substring(0, 6) == "Error:") {
    xcSetMsg(html, true, true);
  } else {
    JQ('#xcUserSearchDiv').html(html).slideDown('fast');
    JQ('#usersearch #search_close_button').click(function() {
      JQ('#xcUserSearchDiv').html('').slideUp('fast');
      xcUserOnlineContacts();
    });
  };
  return true;
};

/**
 * Processing the user search form and send results to the server
 */
function xcMUCUserSearch() {
  var iq = pWin.xcUserSearch(JQ('#usersearch'));
  if (typeof(iq) == "object") {
    pWin.con.send(iq, window.xcMUCUserSearchResults);
  } else {
    xcSetMsg(iq, true, true);
  };
};

/**
 * Display the results of the user search query
 */
function xcMUCUserSearchResults(iq) {
  var html = pWin.xcUserSearchVrfy(iq);
  if (html.substring(0, 6) == "Error:") {
    xcSetMsg(html, true, true);
  } else {
    JQ('#xcUserSearchDiv').html(html);
    // check whether we received search results or not
    if (JQ('#xcNoUserSearchResults').size() > 0) {
      JQ('#xcNoUserSearchResults .xcFieldWrapper input.xcButton').click(function() {
        JQ('#xcUserSearchDiv').html('');
      });
    } else {
      JQ('.xcUserSearchSelect').click(function() {
        JQ('#searchjid').val(this.id);
        JQ('#xcUserSearchDiv').html('');
      });
    };
  };
  return true;
};

/**
 * Sets the necessary click functionality for the MUC Occupants
 */
function xcSetOccupantClickOptions() {
  JQ('div.xcMUCOccupant:not(.xcMUCCurrentUserContainer)').unbind().mousedown(function(e) {
    var buttoncode = e.which ? e.which : e.button; // msie specific checks does not support e.which
    var pageX = e.pageX ? e.pageX : e.clientX; // msie specific checks does not support e.page
    var pageY = e.pageY ? e.pageY : e.clientY; // msie specific checks does not support e.page
    var id = pWin.xcDec(this.id); // retrieve the id of the current div we are binding the function too
    var jid = JQ(this).attr('jid'); // get the jid incase we need it later
    var contact = pWin.xcContactExists(jid); // determine if they are already a contact of ours or not
    JQ('#xcMUC #xcMUCOccupants .xcMUCOccupant.selected').removeClass('selected');
    JQ(this).addClass('selected');

    if (buttoncode != 1) {
      JQ('#xcRightMenu').css({ top: pageY + 'px', left: pageX + 'px' }).show();
      JQ(document).one("click" , function() { JQ('#xcRightMenu').hide(); });
    } else {
      // as long as it is not the current user then we can do the one on one message
      if (!JQ(this).hasClass('xcMUCCurrentUserContainer')) {
        var w = pWin.xcOpenUserChat(id);
      };
    };
    // adding some configurable menu options in the context menu based off information we have
    if (jid) {
      JQ('li#ban').show();
      JQ('li#kick').show();
      // determine if they are a contact or not a contact
      if (contact) { JQ('li#subscribe').hide(); } else { JQ('li#subscribe').show(); };
    } else {
      JQ('li#ban').hide();
      JQ('li#kick').hide();
      JQ('li#subscribe').hide();
    }


    // bindings to the functionality in the right click menu
    JQ('.xcContextMenu > ul > li').unbind().click(function() {
      if (this.id == 'ban') {
        xcBanUser(jid);
      } else if (this.id == 'chat') {
        var w = pWin.xcMsgUser(id); // open a one on one chat session with the user
      } else if (this.id == 'info') {
        pWin.xcUserInfo(id); // try and retrieve the users information
      } else if (this.id == 'kick') {
        xcKickUser(pWin.xcJID(id, true));
      } else if (this.id == 'subscribe') {
        var group = new Array('General');
        pWin.xcUpdateUser(jid, jid, group);  // putting user in default group with jid
        pWin.xcSendPresenceType(jid, 'subscribe');
        xcSetMsg(pWin.xcT('Subscription request sent'), false, true);
      };
    }).mouseover(function() { JQ(this).addClass('xcOver'); }).mouseout(function() { JQ(this).removeClass('xcOver'); });
  });
};

/**
 * Attempt to ban the user from the MUC Chat
 * @param {String} jid JID of the user to be banned
 */
function xcBanUser(jid) {
  //FIXME: see if there is a way to let the user enter the reason
  if (!jid) { return false; };
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.setTo(pWin.xcDec(window.name));
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_MUC_ADMIN},
                 [iq.buildNode('item', {affiliation: 'outcast', jid: jid},
                 [iq.buildNode('reason', pWin.xcT('Banning you from the room'))])]));
    pWin.con.send(iq, function(iq) {
                        if (iq.isError()) {
                          xcSetMsg(pWin.xcErrorProcess(iq), true, true);
                          return true;
                        };
                        xcSetMsg(pWin.xcT('User successfully banned from the Chatroom'), false, true);
                        return true;
                      });
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * Attempt to kick a user from the MUC chat
 * @param {String} nick Nickname of the person to kick
 */
function xcKickUser(nick) {
  //FIXME: see if there is a way to let the user enter the reason
  if (!nick) { return false; };
  try {
    var iq = new JSJaCIQ();
    iq.setTo(pWin.xcDec(window.name)); // name of the Group Chat
    iq.setType('set');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_MUC_ADMIN},
                  [iq.buildNode('item', {nick: nick, role: 'none'},
                  [iq.buildNode('reason', pWin.xcT('Kicking you from the room'))])]));
    pWin.con.send(iq, function(iq) {
                        if (iq.isError()) {
                          xcSetMsg(pWin.xcErrorProcess(iq), true, true);
                          return true;
                        };
                        xcSetMsg(pWin.xcT('User successfully kicked from the Chatroom'), false, true);
                        return true;
                      });
  } catch (e) {
    xcSetMsg(e.message, true, true);
  };
};

/**
 * Retrieve the online contacts for the user so they can be chosen if needed
 */
function xcUserOnlineContacts() {
  var online = pWin.xcOnlineContacts(); // array of online contacts
  if (online.length) {
    var html = '<div id="xcLabel">Online Contacts</div>';
    for (var x = 0; x < online.length; x++) {
      html += '<div class="xcUserCurrentContact">' + online[x].getJID() + '</div>';
    };
    JQ('#xcUserCurrentContactsDiv').html(html); // setting the html
    JQ('.xcUserCurrentContact').click(function() { JQ('#searchjid').val(JQ(this).html()); }); // populating the search jid with the information
  };
};

function xcToggleRoomSubjectEditor() {
  JQ('#xcMUCRoomSubjectEditor').slideToggle('fast');
  JQ('#xcMUCRoomSubjectToggle').toggleClass('expanded');
  if (JQ('#xcMUCRoomSubjectToggle').hasClass('expanded')) {
    JQ('#xcMUCRoomSubjectToggle').html(pWin.xcT('Done'));
  } else {
    xcSubjectChange(JQ('#subject').val());
    JQ('#xcMUCRoomSubjectToggle').html(pWin.xcT('Change'));
  }
  return false;
}

/**
 * Doing initialization for the MUC
 */
function xcMUCInit() {
  // hide send button if configured
  if (pWin.XC.xc_sendbutton == 0) {
    JQ('div#xcMUCSendButton').hide();
  }
  // putting event for keypress so if enter then sends the message
  JQ('#mbody').keypress(function(e) {
    var keycode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (keycode == 13) {
      xcMsgSend(); // enter key pressed
      return false;
    };
    return true;
  });
  // putting keypress event so the subject will change on enter keypress
  JQ('#xcMUCRoomSubjectEditor #subject').keypress(function(e) {
    var keycode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (keycode == 13) {
      xcToggleRoomSubjectEditor();
      return false;
    };
    return true;
  });
}

// necessary start up manipulation of the DOM
JQ(document).ready(function() {
  if (pWin.XC.unload_nick == '') {
    nickname = (JQ(document).getUrlParam('nick')) ? JQ(document).getUrlParam('nick') : pWin.XC.nickname;
  } else {
    nickname = pWin.XC.unload_nick;
  };
  xcEnterRoom(pWin.xcDec(window.name));
  xcMUCInit(); // this will do the necessary initialization for the DOM and window
  // Setting a click handler for the div
  JQ('div#msg').click(function() {
    xcMsgClear();
  });
  var defaultValue = JQ('#searchjid').val();
  JQ('.xcAutoClear').focus(function() {
    if (this.value == defaultValue) {
      this.value = '';
      JQ(this).removeClass('xcAutoClear');
    }
  }).blur(function() {
    if (this.value == '') {
      this.value = defaultValue;
      JQ(this).addClass('xcAutoClear');
    }
  });
  JQ('#mbody').resizable(); // making the textarea for entering text resizable
  JQ('#mbody').focus(); // putting focus onto the body
});

// Clean up, while the window is being unloaded
JQ(window).unload(function() {
  if (window.name == 'MUC') {
     pWin.xcWinClose(pWin.xcDec(window.name));
  } else {
    xcLeaveRoom();
  };
  pWin.XC.unload_nick = nickname;
  pWin.xcUnloadNickClear(); // will clear it after predetermined time if the window was being closed completely
});
