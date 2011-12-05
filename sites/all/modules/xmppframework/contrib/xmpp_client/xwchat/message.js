// Variables
var pWin = window.opener || window;
var activeTab = 0, tabcount = 0, maxscroll = 0, currentscroll = 0, language = 'en';
var tabObject = {}; // object to hold the pertinent information regarding the users

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
    JQ('#msg').addClass('xcError').append('<div>' + msg + '</div>').show();
  } else {
    JQ('#msg').removeClass('xcError').append('<div>' + msg + '</div>').show();
  }
};

/**
 * @param {Integer} top The current position of the top of the scrollbar
 */
function xcScrollSave(top) {
  if (top > maxscroll) { maxscroll = top; }
  currentscroll = top;
};

/**
 * Function to set the language too that the user will receive
 *
 * @param lge
 *      Language to set the translation from
 */
function xcSetTranslationLanguage(lge) {
  language = lge;
};

/**
 * Posts the contents of the chat to the server
 */
function xcPostChat() {
  if (!pWin.XC.srvUrl) { return false; };
  var body = new Array();
  var participants = new Array(tabObject[activeTab].jid, pWin.XC.fjid);
  var tarray = new Array();
  // retrieve the conversation information from the window
  JQ('#msg_pane.xcMsgPane div.xcChatMessage').each(function() {
    var timestamp = JQ(this).find('.xcChatMessageHeader .xcChatMessageTimestamp').html();
    var name = JQ(this).find('.xcChatMessageHeader .xcChatMessageSender').html();
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
  pWin.XC.pWin.$('#xcMUCPostForm #chat_type').val('single_chat');
  pWin.XC.pWin.$('#xcMUCPostForm #begin_time').val(begin_time);
  pWin.XC.pWin.$('#xcMUCPostForm #end_time').val(end_time);
  pWin.XC.pWin.$('#xcMUCPostForm #participants').val(participants.join('\r\n'));
  pWin.XC.pWin.$('#xcMUCPostForm #body').val(body.join('\r\n'));
  pWin.XC.pWin.document.forms['xcMUCPostForm'].submit();
  return false;
};

/**
 * Create unique name for the MUC chat and then send the necessary information to the server
 * in order for the chat room to be created
 */
function xcMUCChatInitiate() {
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var room = '';
  for (var x = 0; x < 10; x++) {
    i = Math.floor(Math.random() * 52);
    room += chars.charAt(i);
  };
  // create the room on the xmpp server
  try {
    var p = new JSJaCPresence();
    p.setTo(room + '@' + pWin.XC.MUC + '/' + pWin.XC.nickname);
    p.appendNode(p.buildNode('x', {xmlns: pWin.NS_MUC_USER}));
    pWin.con.send(p, window.xcCreateRoomVrfy);
  } catch (e) {
    xcSetMsg(room + pWin.xcT(' creation failed') + ': ' + e.message, true);
  };
};

/**
 * @param {JSJaCPresence} p Presence packet letting us know room was successfully created
 */
function xcCreateRoomVrfy(p) {
  try {
    // room successfully created hence unlock the room
    var room = pWin.xcJID(p.getFrom(), false);
    var iq = new JSJaCIQ();
    iq.setTo(room);
    iq.setType('set');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_MUC_OWNER},
                  [iq.buildNode('x', {xmlns: pWin.NS_XDATA, type: 'submit'})]));
    pWin.con.send(iq);
    pWin.xcMUCInviteLaunch(room, pWin.XC.nickname); // launches the Group Chat
    // invite the current user to the new group chat room
    var m = new JSJaCMessage();
    m.setTo(room);
    m.appendNode(m.buildNode('x', {xmlns: pWin.NS_MUC_USER},
                 [m.buildNode('invite', {to: tabObject[activeTab].jid},
                 [m.buildNode('reason', pWin.xcT('Changing to Group Chat room')),
                  m.buildNode('continue')])]));
    pWin.con.send(m);
    // send chat history to the room so we know we have it
    xcMsgChatHistoryToMUC(room);
    if (JQ('div#xcTabs div.xcTabDiv').size() == 1) {
      // Only one tab so can close the chat window
      window.close();
    } else {
      // Activate the click to remove the tab
      JQ('.xcTabDiv.active a').click();
    }
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * @param {String} room
 *      Chat room to send the messages too
 */
function xcMsgChatHistoryToMUC(room) {
  if (!room) { return false; };
  JQ('div#msg_pane div.xcChatMessage p.xcChatMessageBody').each(function() {
    var body = JQ(this).html();
    if (body) {
      pWin.xcMsgSend(body, room, null, 'groupchat');
    };
  });
}

/*
 * Performs message window initialization for the client
 */
function xcMsgInit() {
  // Hide the Send button if configuration requires it
  if (pWin.XC.xc_sendbutton == 0) {
    JQ('#xcMsgContainer').addClass('no-button');
  };
  // Hide Save Chat link if configuration requires it
  if (!(pWin.XC.srvUrl)) {
    JQ('#xcSaveChatLogLink').hide();
  };
};

/**
 * Puts the message on the screen for the user
 */
function xcMessage(m) {
  // if translation is not turned on then just get the body and display it
  if (!(pWin.XC.xc_translation)) {
    xcMessageShow(m.getBody().htmlEnc(), null); // display the message to the user
  } else {
    marray = new Array(); // array to store all of the incoming messages depending on language
    JQ(m.getDoc()).children().children('body').each(function() {
      var body = JQ(this).text().htmlEnc(); // getting the body text for the message
      if (!(lang = JQ(this).attr('xml:lang'))) { lang = language; }; // determine if a language was specified if not then default to english
      marray[lang] = body; // set the array with the pertinent language and the translation for that language
    });
    // now we check the message array and see if the language we are looking for is there
    // this is if the message packet came in with xml:lang set in the body tag then we get from there
    if (marray[pWin.XC.xc_translation_lge]) {
      xcMessageShow(marray[pWin.XC.xc_translation_lge], m.getBody().htmlEnc()); // display the translation that came in to the user
    } else {
      // step through the array retrieving just the first entry and translating it into the appropriate language
      for (var lang in marray) {
        xcTranslateString(marray[lang], lang); // translate then display the string
        break;
      };
    };
  };
};

/**
 * Function to create the received message for display to the user
 *
 * @param alias
 *  Name of the person who sent the message
 * @param body
 *  Body of the message that was sent
 */
function xcCreateReceivedMessage(alias, body) {
  // Put the message in the hidden div so we can retrieve later as needed
  var html = '<div class="xcChatMessage received">' +
             '<div class="xcChatMessageHeader">' +
             '<span class="xcChatMessageTimestamp">' + (pWin.XC.xc_showtimestamps == 1 ? pWin.xcDate() : '') + '</span>' +
             '<span class="xcChatMessageSender">' + alias + '</span> ' +
             '</div>';
  html += '<p class="xcChatMessageBody">' + body + '</p>';
  html += '</div>';
  return html;
}

/**
 * Function to create the sent message for display to the user
 *
 * @param body
 *  Body of the message that was sent
 */
function xcCreateSentMessage(body) {
  return '<div class="xcChatMessage sent">' +
         '<div class="xcChatMessageHeader">' +
         '<span class="xcChatMessageTimestamp">' + (pWin.XC.xc_showtimestamps == 1 ? pWin.xcDate() : '') + '</span>' +
         '<span class="xcChatMessageSender">' + pWin.XC.ujid + '</span>' +
         '</div>' +
         '<p class="xcChatMessageBody">' + body + '</p>' +
         '</div>';
}

/**
 * Actually display the incoming message to the person
 * @param {String} body
 *      The body text of the message that came in
 * @param {String} pretrans
 *      The data before translation
 */
function xcMessageShow(body, pretrans) {
  // if this is 0 then the DOM still has not fully loaded hence re-run the function
  if (JQ('#msg_pane').size() == 0) {
    setTimeout(function() { xcMessageShow(body, pretrans); }, 1000);
  } else {
    var html = xcCreateReceivedMessage(tabObject[activeTab].name, body);
    JQ('#msg_pane').append(html).children(':last-child').each(function() {
      if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
      this.scrollIntoView(false);
    });
  };
  // if we are running translation this will show the pre-translation information
  if (pretrans) {
    if (JQ('#translated_msg_pane').size() == 1) {
      var html = xcCreateReceivedMessage(tabObject[activeTab].name, pretrans);
      JQ('#translated_msg_pane').append(html).children(':last-child').each(function() {
        if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
        this.scrollIntoView(false);
      });
    };
  };
  // putting the focus on this window
  window.focus();
  JQ('#body').focus();
};

/**
 * @param {String} string
 *      The string that we are going to translate
 * @param {String} lang
 *      Base language that the string is in
 */
function xcTranslateString(string, lang) {
  JQ.ajax({
    type: 'POST',
    url: '/cgi-bin/trans/' + lang + '/' + pWin.XC.xc_translation_lge,
    data: string,
    processData: false, // dont make data into query string
    contentType: 'text/plain',
    dataType: 'text', // in return we expect the response to be text
    success: function(translated) { xcMessageShow(translated, string); },
    error: function(xhr, status, thrown) { pWin.oDbg.log('Failed: ' + status); }
  });
};

/**
 * Sets the presence of the user based off the presence packets coming in
 * @param {JSJaCPresence} p Presence packet with information pertaining to the user presence
 */
function xcPresence(p) {
  var jid = pWin.xcJID(p.getFrom(), false);
  if ((contact = pWin.xcContactExists(jid))) {
    var show = contact.getShow();
    if (show == presence) { return true; };
    xcSetContactPresence(JQ('#xcContactTitle'), show, contact.getStatus());
    var html = '<div class="xcSystemMessage">' + pWin.XC.pMsgs[show] + '</div>';
    JQ('#msg_pane').append(html).children(':last-child').each(function() {
      if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
      this.scrollIntoView(false);
    });
    // if we have translation set then we need to put this information in also
    if (pWin.XC.xc_translation) {
      JQ('#translated_msg_pane').append(html).children(':last-child').each(function() {
        if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
        this.scrollIntoView(false);
      });
    }
    presence = show;
  };
};

/**
 * Sends the message to the server for delivery to the appropriate person
 */
function xcMsgSend() {
  if ((body = JQ('#body').val()) == '') { return false; };
  // do checks to determine if it is just empty lines or not
  if (body.replace(/ /g, '').replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '').length == 0) {
    JQ('#body').val(''); // clear the message box for the next message
    JQ('#body')[0].focus(); // reset focus back onto the message box
    return false;
  };
  pWin.xcMsgSend(body, tabObject[activeTab].jid, null, null); // send the message to the server
  // add the message to the message pane on the screen
  var html = xcCreateSentMessage(body);
  JQ('#msg_pane').append(html).children(':last-child').each(function() {
    if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
    this.scrollIntoView(false);
  });
  // if we have translation set then we need to put this information in also
  if (pWin.XC.xc_translation) {
    JQ('#translated_msg_pane').append(html).children(':last-child').each(function() {
      if ((currentscroll / maxscroll) < pWin.XC.scrollthreshold ) { return false; };
      this.scrollIntoView(false);
    });
  }
  // Clear the message that was just sent
  // Reset focus back onto the textarea
  JQ('#body').val('').focus();
};

/**
 * Function to set Tab Click functionality
 */
function xcSetTabClick() {
  // We only want to set the tabs portion if there is more than one tab in the system
  if (JQ('div#xcTabs div.xcTabDiv').size() > 1) {
    JQ('div#xcTabs div.xcTabDiv').unbind().click(function() {
      JQ(this).removeClass('newmsg');
      JQ('div#xcTabs div.xcTabDiv.active').removeClass('active');
      JQ(this).addClass('active');
      xcTabUnPopulate(activeTab);
      xcTabPopulate(JQ(this).attr('id'));
    }).mouseover(function() {
      JQ(this).children('a.close').show();
    }).mouseout(function() {
      JQ(this).children('a.close').hide();
    });
  } else {
    // Remove the click handler so it will not add class information
    JQ('div#xcTabs div.xcTabDiv').unbind().mouseover(function() {
      JQ(this).children('a.close').show();
    }).mouseout(function() {
      JQ(this).children('a.close').hide();
    });
  }
}

/**
 * Populate the information pertinent for this tab
 *
 * @param tab
 *  Counter / ID of the tab being populated
 */
function xcTabPopulate(tab) {
  // Retrieving the information from the Data Div in the tab
  var currentTab = JQ('#xcConversation' + tab).find('div.data');
  JQ('#msg_pane').html(currentTab.html());
  activeTab = tab;
  if (tabObject[activeTab].isContact === false) {
    JQ('li#xcAddUserContactLink').show();
  } else {
    JQ('li#xcAddUserContactLink').hide();
  }
}

/**
 * Un-populate the information that this tab required
 *
 * @param tab
 *  Counter / ID of the tab being un-populated
 */
function xcTabUnPopulate(tab) {
  var currentTab = JQ('#xcConversation' + tab).find('div.data');
  currentTab.html(JQ('#msg_pane').html());
  JQ('#msg_pane').html('');
}

/**
 * Function will create a new tab in the system for the user
 *
 * @param jid
 *  Jabber ID for the user who we are creating the tab for
 */
function xcCreateTab(jid) {
  var name = jid;
  var show = 'available';
  var isContact = false;
  // Check if the user is actually in our roster or not so we can display contact information
  if ((contact = pWin.xcContactExists(jid))) {
    name = contact.getName();
    show = contact.getShow();
    isContact = true;
  } else {
    // Either a system message or a group chat message
    if (jid.match(/conference/)) {
      //name = pWin.xcJID(jid, true);
      name = jid;
      isContact = true;
    } else {
      name = pWin.xcJID(jid, false);
    };
  };

  // If only currently one then we make the first active since it was the original
  if (JQ('div#xcTabs div.xcTabDiv').size() == 1) {
    JQ('div#xcTabs div.xcTabDiv:first').addClass('active');
  }
  // Remove the add contact link if the user is already a contact
  if (JQ('div#xcTabs div.xcTabDiv').size() == 0 && isContact === true) {
    JQ('li#xcAddUserContactLink').hide();
  }

  // Creating the html div that we are utilizing for the tab
  // name is going to be the contact name or jid depending on roster status
  // show is the current status and can only be retrieved from contacts
  // All others will display as being available since they sent us a message
  var html = '<div class="xcTabDiv" id="' + tabcount + '"><span class="' + show + '">' + name + '</span>';
  html += '<a href="#" onclick="xcRemoveTab(' + tabcount + ');" class="close">Close</a></div>';
  JQ('div#xcTabs').append(html);
  // Creating the hidden textarea utilized when we wish to switch tabs
  JQ('div.xcHiddenArea').append('<div id="xcConversation' + tabcount + '" class="xcConversation"><div class="data"></div></div>');
  // Adding the highlighting if just the one tab also since it is the active tab
  if (JQ('div#xcTabs div.xcTabDiv').size() == 1) {
    setTimeout(function() {
      JQ('div#xcTabs div.xcTabDiv:first').addClass('active');
    }, 100);
  }
  // Create the object in tabObject so we have information regarding it
  tabObject[tabcount] = { jid: jid, name: name, isContact: isContact };
  tabcount++;
  // Make sure we re-set the bindings for the click elements on tabs
  xcSetTabClick();
  // Resize window incase needed
  WindowManager.resize();
  return tabcount - 1;
}

/**
 * Function will remove the tab and if necessary close the window
 *
 * @param tab
 *  Counter / ID of the tab being removed
 */
function xcRemoveTab(tab) {
  // If we have less than two tabs then we close the window
  // Doing less than 2 incase something happens and == 1 does not catch it
  if (JQ('div#xcTabs div.xcTabDiv').size() < 2) {
    window.close();
    return true;
  }
  // We have more than one tab so we go about closing that tab
  var removeTab = JQ('div#xcTabs div#' + tab);
  // If currently active tab we need to remove the contents of the screen also
  if (removeTab.hasClass('active')) {
    JQ('#msg_pane').html('');
  }
  // Remove the hidden tab and remove the tab itself
  JQ('div#xcConversation' + tab).remove();
  JQ('div#' + tab).remove();
  // Remove the tab from the tab object
  delete tabObject[tab];
  // Make sure we re-set the bindings for the click elements on tabs
  xcSetTabClick();
  // Checking if the tab was the active tab and if so will switch it
  if (tab == activeTab) {
    // Switch to the first tab
    for (var i in tabObject) {
      xcTabPopulate(i);
      JQ('div#xcTabs div#' + i).addClass('active');
      break;
    }
  }
  // Resize window incase needed
  WindowManager.resize();
}

/**
 * Receives messages and determines if the tab needs creating
 *
 * @param m
 *  Message XML Document
 */
function xcMessageReceive(m) {
  var jid;
  if (m.getFrom().match(/conference/)) {
    jid = m.getFrom();
  } else {
    jid = pWin.xcJID(m.getFrom(), false);
  }
  // Verify if a tab exists for this message or not
  if (xcTabExists(jid) === false) {
    var tabId = xcCreateTab(jid);
  }
  // Verify if this is the currently active jid or not
  if (tabObject[activeTab].jid == jid) {
    var alias = jid;
    if ((contact = pWin.xcContactExists(jid))) {
      alias = contact.getName();
    }
    // Calling the old message from the original code
    xcMessage(m);
  } else {
    var alias = jid;
    if ((contact = pWin.xcContactExists(jid))) {
      alias = contact.getName();
    }
    // Put the message in the hidden div so we can retrieve later as needed
    var html = xcCreateReceivedMessage(alias, m.getBody().htmlEnc());
    // Verify the JID are retrieve the hidden div we need to go for
    for (var i in tabObject) {
      var object = tabObject[i];
      if (object.jid == jid) {
        JQ('#xcConversation' + i).find('div.data').append(html);
        JQ('#' + i).addClass('newmsg');
        break;
      }
    }
  }
  // Resize window incase needed
  WindowManager.resize();
  // Making sure the focus stays on the body field
  JQ('#body').focus();
}

/**
 * This does initial initiation of the message for a user
 */
function xcMessageInitiate(jid) {
  // Create a tab if the user does not have one
  if (xcTabExists(jid) === false) {
    var tabId = xcCreateTab(jid);
    // Set the active tab based off the div if this is the first
    if (JQ('div#xcTabs div.xcTabDiv').size() == 1) {
      activeTab = tabId;
    }
  }
}

/**
 * Function to let us know if the tab exists or not
 *
 * @param jid
 *  JID of the person we are checking on the tab for
 *
 * @return boolean (true if we have a tab, false if we do not)
 */
function xcTabExists(jid) {
  for (var i in tabObject) {
    if (tabObject[i].jid == jid) {
      return true;
    }
  }
  return false;
}

/**
 * Function to add the user as a contact
 */
function xcAddUserContact() {
  // Subscribing to a user's group
  var groups = [pWin.xcT('General')];
  pWin.xcUpdateUser(tabObject[activeTab].jid, tabObject[activeTab].name, groups);
  pWin.xcSendPresenceType(tabObject[activeTab].jid, 'subscribe');
  xcSetMsg(pWin.xcT('Subscription request has been sent to' + tabObject[activeTab].jid), false);
}

/**
 * Initializing the message window making sure all variables and blocks are set
 */
JQ(document).ready(function() {
  // Initialize the message screen
  xcMsgInit();
  // Setting keypress change function on the body field so if it is the
  // Enter key being pressed we can send the pertinent message too the user
  JQ('#body').keypress(function(e) {
    var keycode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    // enter key pressed
    if (keycode == 13) {
      xcMsgSend();
      return false;
    };
    return true;
  });
  // Add click handler to the error information
  JQ('div#msg').click(function() {
    JQ(this).removeClass('xcError').html('').hide();
  });
  // Making the textarea for entering text resizable by the user
  // Adding focus to the textarea so the user can start typing
  JQ('#body').resizable().focus();
});

/**
 * Making sure the window is removed from the open windows list on closing
 */
JQ(window).unload(function() {
  try { pWin.xcWinClose(pWin.xcDec(self.name)); } catch (e) {}
});

function xcSetContactPresence(contact, show, status) {
  var contactElement = contact.children('.presence');
  JQ.each(pWin.XC.pIcon, function(k, v) {
    contactElement.removeClass(k);
  })
  contact.children('.xcContactStatus').html(status);
  contactElement.addClass(show);
}
