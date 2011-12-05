// Extra,js functions

// add the substitute function to the String prototype
String.prototype.substitute = function(was, becomes) {
  return this.split(was).join(becomes);
};

// adding the localize function to the String prototype
String.prototype.localize = function() {
  var str;
  if (XC.localizedString && (str = XC.localizedString[this])) { return str; };
  return this;
};

/**
 * Clear the nick if it has been set
 */
function xcUnloadNickClear() {
  setTimeout(function() {
    if (XC.unload_nick != '') {
      XC.unload_nick = '';
    };
  }, XC.UNLOADTIMEOUT);
};

/**
 *
 */
function xcPath(str) {
  var retstr = '';
  str = str.split('?')[0];
  str = str.split('/');
  for(var i = 3; i < str.length-1; i++) {
    retstr += '/' + str[i];
  }
  return retstr;
}

/**
 * to determine if a value is actually defined or not
 * @param {Variable} val Determine if it is defined
 * @param {String} defval Return this default value if val is undefined
 */
function xcNVL(val, defval) {
  if (typeof(val) == 'undefined') {
    return defval;
  };
  return val;
};

/**
 * function is a wrapper around String prototype localize so we can call it in child windows
 * @param {String} str The string to be localized
 */
function xcT(str) {
  return str.localize().split('').join(''); // forcing it to be a string incase object is returned on no match
};

/**
 * Sends request to the server to load the XC.locale based off information in the file
 * @param {String} language, the localization we wish to the client to utilize
 */
function xcGetLocale(language) {
  if (!language || !XC.av_locales[language]) { language = 'en'; }; // always default to english if nothing given
  // do not update if the locales are the same
  if (language != XC.locale) {
    // retrieve the language file and then make sure it is loaded into javascript
    JQ.get('xct/' + language + '.xct', function(result) {
      eval(result);
      xcDrawRosterWindow();
      // reload the configuration window if it is still open
      if ((w = xcWinOpenGet('CONFIGURATION'))) { w.xcWinReload(); };
    });
    XC.locale = language; // make sure we set the locale
    xcUpdateCookie(); // update the cookie so we can use that next time if we use the cookie for storing information
  };
};

/**
 * makes sure the string is encoded so that it can be used in DOM ids and jquery can access it
 * @param {String} str String to be encoded to be jquery safe
 */
function xcEnc(str) {
  try {
    str = str.substitute('@' ,'XWatsignCHAT');
    str = str.substitute('.' ,'XWperiodCHAT');
    str = str.substitute('/' ,'XWSlashCHAT');
    str = str.substitute('&' ,'XWampCHAT');
    str = str.substitute("'" ,'XWsinparCHAT');
    str = str.substitute('=' ,'XWequalsCHAT');
    str = str.substitute('#' ,'XWhashCHAT');
    str = str.substitute(':' ,'XWcolonCHAT');
    str = str.substitute('%' ,'XWpercentCHAT');
    str = str.substitute('-' ,'XWdashCHAT');
    str = str.substitute(' ' ,'XWspaceCHAT');
    str = str.substitute('*' ,'XWstarCHAT');
    return str;
  } catch (e) {
    oDbg.log(typeof(str) + ":" + e.message);
    return null;
  };
};

/**
 * makes sure the jquery encoded string can be decoded back to its original setting
 * @param {String} str String to be decoded back to a regular string
 */
function xcDec(str) {
  try {
    str = str.substitute('XWatsignCHAT' ,'@');
    str = str.substitute('XWperiodCHAT' ,'.');
    str = str.substitute('XWSlashCHAT' ,'\/');
    str = str.substitute('XWampCHAT' ,'&');
    str = str.substitute('XWsinparCHAT' ,"\'");
    str = str.substitute('XWequalsCHAT' ,'=');
    str = str.substitute('XWhashCHAT' ,'#');
    str = str.substitute('XWcolonCHAT' ,':');
    str = str.substitute('XWpercentCHAT' ,'%');
    str = str.substitute('XWdashCHAT' ,'-');
    str = str.substitute('XWspaceCHAT' ,' ');
    str = str.substitute('XWstarCHAT' ,'\*');
    return str;
  } catch (e) {
    oDbg.log(typeof(str) + ":" + e.message);
    return null;
  };
};

function xcSmiles(str) {
  try {
    str = str.substitute(':-)', "<img src='img/smilies/happy.png'>");
    str = str.substitute(':)', "<img src='img/smilies/happy.png'>");
    str = str.substitute(':->)', "<img src='img/smilies/happy.png'>");
    str = str.substitute(';-)', "<img src='img/smilies/wink.png'>");
    str = str.substitute(';)', "<img src='img/smilies/wink.png'>");
    str = str.substitute(';->', "<img src='img/smilies/wink.png'>");
    str = str.substitute(';-(', "<img src='img/smilies/sad.png'>");
    str = str.substitute(';(', "<img src='img/smilies/sad.png '>");
    str = str.substitute(':-(', "<img src='img/smilies/sad.png'>");
    str = str.substitute(':(', "<img src='img/smilies/sad.png'>");
    str = str.substitute(':-<', "<img src='img/smilies/sad.png'>");
    str = str.substitute('>:-)', "<img src='img/smilies/devil.png'>");
    str = str.substitute('>:)', "<img src='img/smilies/devil.png'>");
    str = str.substitute('>;-)', "<img src='img/smilies/devil.png'>");
    str = str.substitute('8-)', "<img src='img/smilies'rin.png'>");
    str = str.substitute('8->', "<img src='img/smilies'rin.png'>");
    str = str.substitute(':-D', "<img src='img/smilies'rin.png'>");
    str = str.substitute(';-D', "<img src='img/smilies'rin.png'>");
    str = str.substitute('8-D', "<img src='img/smilies'rin.png'>");
    str = str.substitute(':-d', "<img src='img/smilies/tasty.png'>");
    str = str.substitute(';-d', "<img src='img/smilies/tasty.png'>");
    str = str.substitute('8-d', "<img src='img/smilies/tasty.png'>");
    str = str.substitute(':-|', "<img src='img/smilies/plain.png'>");
    str = str.substitute(';-|', "<img src='img/smilies/wry.png'>");
    str = str.substitute(':-P', "<img src='img/smilies/nyah.png'>");
    str = str.substitute(';-P', "<img src='img/smilies/nyah.png'>");
    str = str.substitute('8-P', "<img src='img/smilies/nyah.png'>");
    str = str.substitute(':-p', "<img src='img/smilies/nyah.png'>");
    str = str.substitute(';-p', "<img src='img/smilies/nyah.png'>");
    str = str.substitute('8-p', "<img src='img/smilies/nyah.png'>");
    str = str.substitute(':-O', "<img src='img/smilies/scare.png'>");
    str = str.substitute(';-O', "<img src='img/smilies/scare.png'>");
    str = str.substitute('8-O', "<img src='img/smilies/scare.png'>");
    str = str.substitute(':-o', "<img src='img/smilies/scare.png'>");
    str = str.substitute(';-o', "<img src='img/smilies/scare.png'>");
    str = str.substitute('8-o', "<img src='img/smilies/scare.png'>");
    str = str.substitute(':-X', "<img src='img/smilies/yukky.png'>");
    str = str.substitute(';-X', "<img src='img/smilies/yukky.png'>");
    str = str.substitute('8-|', "<img src='img/smilies/koed.png'>");
  } catch (e) {
    oDbg.log(typeof(str) + ":" + e.message);
    return null;
  };
  return str;
};

/**
 * Returns formatted date string based off the users locale settings
 */
function xcDate() {
  var date = new Date();
  return date.toLocaleString();
};

/**
 * Returns either the resource or the jid without the resource
 * @paran {String} jid The jid we wish to retrieve information about
 * @param {Boolean} resource if (1 then return the resource) else return the bare jid
 */
function xcJID(jid, resource) {
  if (resource) { return jid.toString().split("/")[1]; };
  return jid.toString().split("/")[0];
};

/**
 * Close all open windows, this is generally called when the application exits
 */
function xcWinsClose() {
  for (var x = 0; x < XC.openWins.length; x++) { XC.openWins[x].close(); };
};

/**
 * @param userjid
 *  User jid we wish to open a chat with
 */
function xcOpenUserChat(userjid) {
  // Here we want to get the message window if it is available
  if (!(w = xcWinOpenGet('ONETOONEMESSAGE'))) {
    w = window.open(xcPath(window.location.href) + '/message.html?', 'ONETOONEMESSAGE', XC.WINOPTS['MSG']);
    XC.openWins.push(w);
  };
  xcOpenUserChatInitialize(userjid, w);
}

/**
 * Function to initialize the chat for the user
 *
 * @param userjid
 *  User jid we wish to open a chat with
 */
function xcOpenUserChatInitialize(userjid, w) {
  if (w.xcMessageInitiate) {
    w.xcMessageInitiate(userjid);
    return true;
  };
  setTimeout(function() { xcOpenUserChatInitialize(userjid, w); }, XC.MSGTIMEOUT);
}

/**
 * Replace VCard holders with readable names
 * @param {String} str String to be replaced
 */
function xcVCardReplaceAliases(str) {
  str = str.substitute('FN', xcT('Full Name'));
  str = str.substitute('FAMILY', xcT('Family Name'));
  str = str.substitute('GIVEN', xcT('First Name'));
  str = str.substitute('MIDDLE', xcT('Middle Name'));
  str = str.substitute('NICKNAME', xcT('NickName'));
  str = str.substitute('URL', xcT('Home Page'));
  str = str.substitute('BDAY', xcT('Date of Birth'));
  str = str.substitute('ORGNAME', xcT('Company Name'));
  str = str.substitute('TITLE', xcT('Title'));
  str = str.substitute('ROLE', xcT('Job Description'));
  str = str.substitute('JABBERID', xcT('Jabber ID'));
  str = str.substitute('DESC', xcT('Description'));
  str = str.substitute('EXTADD', xcT('Division'));
  str = str.substitute('STREET', xcT('Street'));
  str = str.substitute('LOCALITY', xcT('City'));
  str = str.substitute('REGION', xcT('State / County'));
  str = str.substitute('PCODE', xcT('Zip / Post Code'));
  str = str.substitute('CTRY', xcT('Country'));
  return str;
};

/**
 * @param {String} id The unique ID we will assign the element
 * @param {String} label The label we will assign to the element
 * @param {String} type The type of form element we are building
 * @param {JQuery} obj The jquery object with all pertinent information in it
 */
function xcBuildFormElement(id, label, type, obj) {
  switch (type) {
    case 'boolean':
      return '<select name="' + id + '" id="' + id + '" size="1" class="xcSelect xcForm">' +
             '<option value="0">' + xcT('No') + '</option>' +
             '<option value="1">' + xcT('Yes') + '</option>' +
             '</select>';
      break;
    case 'fixed':
      return JQ(obj).find('value').text();
      break;
    case 'hidden':
      return '<input type="hidden" id="' + id + '" value="' + JQ(obj).find('value').text() + '" class="xcForm" />';
      break;
    case 'text-multi':
    case 'jid-multi':
      return '<textarea id="' + id + '" name="' + id + '" rows="2" cols="20" class="xcForm"></textarea>';
      break;
    case 'jid-single':
    case 'text-single':
      var value = JQ(obj).find('value').text();
      if (value) {
        return '<input type="text" id="' + id + '" size="20" value="' + value + '" class="xcInput xcForm" />';
      } else {
        return '<input type="text" id="' + id + '" size="20" class="xcInput xcForm" />';
      };
      break;
    case 'text-private':
      return '<input type="password" id="' + id + '" size="20" class="xcInput" />';
      break;
    case 'list-single':
      var value = JQ(obj).children('value').text();
      var html = '<select name="' + id + '" id="' + id + '" size="1" class="xcSelect xcForm">';
      JQ(obj).children('option').each(function() {
        var optval = JQ(this).find('value').text();
        if (optval == value) {
          html += '<option value="' + optval + '" selected>' + optval + '</option>';
        } else {
          html += '<option value="' + optval + '">' + optval + '</option>';
        };
      });
      html += '</select>';
      return html;
      break;
    case 'list-multi':
      var html = '<select name="' + id + '" id="' + id + '" multiple size="3" class="xcSelect xcForm">';
      var v = new Array();
      JQ(obj).children('value').each(function() { v.push(JQ(this).text()); });
      JQ(obj).children('option').each(function() {
        var selected = 0;
        var optval = JQ(this).find('value').text();
        for (var i = 0; i < v.length; i++) {
          if (v[i] == optval) { selected = 1; };
        };
        if (selected == 0) {
          html += '<option value="' + optval + '">' + optval + '</option>';
        } else {
          html += '<option value="' + optval + '" selected>' + optval + '</option>';
        };
      });
      html += '</select>';
      return html;
      break;
    default:
      return ''; // unknown type was received by the system
  }
}

/**
 * Supports all form types listed in XEP-0004
 * @param {JSJaCPacket} packet The packet with all pertinent form information in it
 * @param {String} name This is going to be the name of the form being created
 * @param {String} onclick This is the handler / callback that will be called in the form buttons onclick
 * @param {Boolean} form If set to true will create the form if set to false will not create form
 */
function xcCreateForm(packet, name, onclick, form) {
  var html = '';
  if (form) {
    html += '<form id="' + name + '" name="' + name + '">';
  };
  // go through the fields creating form elements for them
  JQ(packet.getDoc()).find('field').each(function() {
    var label = JQ(this).attr('label');
    var type = JQ(this).attr('type');
    var id = JQ(this).attr('var');
    html += '<div class="xcFieldWrapper text_field">';
    html += '<label for="' + id + '" id="' + id + '_lbl">' + xcT(label) + ': </label>';
    html += xcBuildFormElement(id, label, type, JQ(this)); // returns the html form element information
    html += '</div>';
  });
  if (form) {
    html += '<div class="xcFieldWrapper button xcSubmit">';
    html += '<input type="button" name="submit_button" value="' + xcT('Submit') + '" class="xcButton" onClick="' + onclick + '();" />';
    html += '</div>';
    html += '</form>';
  };
  return html;
};

/**
 * Processes any error packets that come in and returns human readable string plain text
 * @param {JSJaCPacket} p. Error packet
 * @return {String} plain text error message
 */
function xcErrorProcess(p) {
  // retrieve the information from the packet that is required to determine what it is
  var code = JQ(p.getDoc()).find('error').attr('code');
  var type = JQ(p.getDoc()).find('error').attr('type');
  var condition = JQ(p.getDoc()).find('error').children().get(0).nodeName.toLowerCase();
  // determine the code and return the appropriate message to the calling function
  if (code == 302 && type == 'modify' && condition == 'redirect') { return xcT('Temporary Redirect'); };
  if (code == 302 && type == 'modify' && condition == 'gone') { return xcT('Permanent Redirect'); };
  if (code == 400 && type == 'modify' && condition == 'bad-request') { return xcT('Bad Request'); };
  if (code == 400 && type == 'wait' && condition == 'unexpected-request') { return xcT('Unexpected Request'); };
  if (code == 400 && type == 'modify' && condition == 'jid-malformed') { return xcT('Chat ID Malformed'); };
  if (code == 401 && type == 'auth' && condition == 'not-authorized') { return xcT('Not Authorized'); };
  if (code == 402 && type == 'auth' && condition == 'payment-required') { return xcT('Payment Required'); };
  if (code == 403 && type == 'auth' && condition == 'forbidden') { return xcT('Forbidden'); };
  if (code == 404 && type == 'cancel' && condition == 'item-not-found') { return xcT('Not Found'); };
  if (code == 404 && type == 'wait' && condition == 'recipient-unavailable') { return xcT('Unavailable'); };
  if (code == 404 && type == 'cancel' && condition == 'remote-server-not-found') { return xcT('Server Not Found'); };
  if (code == 405 && type == 'cancel' && condition == 'not-allowed') { return xcT('Not Allowed'); };
  if (code == 406 && type == 'modify' && condition == 'not-acceptable') { return xcT('Not Acceptable'); };
  if (code == 407 && type == 'auth' && condition == 'registration-required') { return xcT('Registration Required'); };
  if (code == 407 && type == 'auth' && condition == 'subscription-required') { return xcT('Registration Required'); };
  if (code == 408 && type == 'wait' && condition == 'remote-server-timeout') { return xcT('Request Timeout'); };
  if (code == 409 && type == 'cancel' && condition == 'conflict') { return xcT('Conflict'); };
  if (code == 500 && type == 'wait' && condition == 'resource-constraint') { return xcT('Invalid Resource'); };
  if (code == 500 && condition == 'undefined-condition') { return xcT('Undefined Condition'); };
  if (code == 500 && type == 'wait' && condition == 'internal-server-error') { return xcT('Internal Server Error'); };
  if (code == 501 && type == 'cancel' && condition == 'feature-not-implemented') { return xcT('Not Implemented'); };
  if (code == 502 && type == 'wait' && condition == 'service-unavailable') { return xcT('Remote Server Error'); };
  if (code == 503 && type == 'cancel' && condition == 'service-unavailable') { return xcT('Service Unavailable'); };
  if (code == 503 && type == 'wait' && condition == 'service-unavailable') { return xcT('Service Unavailable'); };
  if (code == 504 && type == 'wait' && condition == 'remote-server-timeout') { return xcT('Remote Server Timeout'); };
  if (code == 510 && type == 'cancel' && condition == 'service-unavailable') { return xcT('Disconnected'); };
  return condition; // return the default condition if we do not know what it is
};

/**
 * Processes any status packets that come in, mostly utilized by the Group Chat component
 * @param {JSJaCPacket} incoming packet
 * @return {String} text regarding the processing of the packet
 */
function xcStatusProcess(p) {
  var html = '';
  var role = JQ(p.getDoc()).find('item').attr('role');
  var affiliation = JQ(p.getDoc()).find('item').attr('affiliation');
  var jid = JQ(p.getDoc()).find('item').attr('jid'); // non anonymous room

  switch (p.pType()) {
    case 'message':
      JQ(p.getDoc()).find('x').children('status').each(function() {
        var code = JQ(this).attr('code');
        if (code == 100) { html += '<div>' + xcT('All occupants can see your full JID') + '</div>'; }; // normally when a user is entering a room
        if (code == 101) { html += '<div>' + xcT('Affiliation changed to') + ': ' + affiliation + ' :' + xcT('while you were not in the room') + '</div>'; }; // out of band Affiliation change
        if (code == 102) { html += '<div>' + xcT('Room now shows unavailable members') + '</div>'; }; // configuration change
        if (code == 103) { html += '<div>' + xcT('Room now does not show unavailabe members') + '</div>'; }; // configuration change
        if (code == 104) { html += '<div>' + xcT('Room non privacy configuration has changed') + '</div>'; }; // configuration change
        if (code == 170) { html += '<div>' + xcT('Room logging has been enabled') + '</div>'; }; // configuration change
        if (code == 171) { html += '<div>' + xcT('Room logging has been disabled') + '</div>'; }; // configuration change
        if (code == 172) { html += '<div>' + xcT('Room is now non anonymous') + '</div>'; }; // configuration change
        if (code == 173) { html += '<div>' + xcT('Room is now semi anonymous') + '</div>'; }; // configuration change
        if (code == 174) { html += '<div>' + xcT('Room is now fully anonymous') + '</div>'; }; // configuration change
      });
      break;

    case 'presence':
      JQ(p.getDoc()).find('x').children('status').each(function() {
        var code = JQ(this).attr('code');
        if (code == 110) { html += jid + xcT(' presence has been updated'); }; // one of the users own nicks in a room
        if (code == 170) { html += '<div>' + xcT('Room logging is now enabled') + '</div>'; }; // configuration change
        if (code == 201) { html += '<div>' + xcT('Room has been created') + '</div>'; }; // entering a room
        if (code == 210) { html += '<div>' + xcT('Room Nickname has been assigned / modified') + '</div>'; }; // entering a room
        if (code == 301) { html += '<div>' + xcT('You have been banned from the room') + '</div>'; }; // removal from a room
        if (code == 303) { html += '<div>' + xcT('You have changed your nickname') + '</div>'; }; // exiting a room
        if (code == 307) { html += '<div>' + xcT('You have been kicked from the room') + '</div>'; }; // removal from a room
        if (code == 321) { html += '<div>' + xcT('Removed from room because of affiliation change') + '</div>'; }; // removal from a room
        if (code == 322) { html += '<div>' + xcT('You have been removed from the room because it is now a members only room and you are not a member') + '</div>'; }; // removal from a room
        if (code == 332) { html += '<div>' + xcT('System has been shut down hence you have been removed from the room') + '</div>'; }; // removal from a room
      });
      break;
  };
  return html;
};

/**
 * Function supports both XEP-0091 and XEP-0203 since both can still be utilized
 * @param {JSJaCPacket} p Packet with the supposed delayed delivery information in it
 */
function xcDelayedDelivery(p) {
  if (!p) { return xcDate(); }; // return the current date and time if nothing is available
  var date = xcDate();
  // check XEP-0091 for the x node
  if (JQ(p.getDoc()).find('x').size() > 0) {
    JQ(p.getDoc()).find('x').each(function() {
      if (JQ(this).attr('xmlns') == NS_DELAY) {
        // will not have the format at YYYY-MM-DD will be YYYYMMDD
        var tdate = JQ(this).attr('stamp');
        date = '';
        for (var x = 0; x < tdate.length; x++) {
          if (x == 4 || x == 6) {
            date += '-';
          };
          date += tdate[x];
        };
        date = Date.hrTime(date);
        return false;
      };
    });
  };
  // check XEP-0203 for the delayed node
  if (JQ(p.getDoc()).find('delay').size() > 0) {
    JQ(p.getDoc()).find('delay').each(function() {
      if (JQ(this).attr('xmlns') == 'urn:xmpp:delay') {
        alert('XEP-0203: ' + JQ(this).attr('stamp'));
        date = Date.hrTime(JQ(this).attr('stamp'));
        return false;
      };
    });
  };
  return date;
}

/**
 * Sets the client to either auto archive or not auto archive
 * @param {String} value XC.xc_archive value (true = archive, false = do not archive)
 */
function xcAutoArchiveUpdate(value) {
  XC.xc_archive = value;
  (XC.xc_archive == 1) ? xcArchiveConversation('true') : xcArchiveConversation('false');
  xcUpdateCookie();
  // update the server configuration if available with the new value for future use
  if (XC.srvUrl) {
    JQ.post(unescape(XC.srvUrl) + unescape(XC.srvUrls['updateconfig']), '&xc_archive=' + XC.xc_archive);
  };
};

/**
 * Sets the client to either show timestamps or not show timestamps, does not affect conversations
 * that already show or do not show in already open chat windows, will start from when you check the box
 * @param {String} value XC.xc_showtimestamps value (true = show timestamp, false do not show timestamp)
 */
function xcToggleShowTimestamp(value) {
  XC.xc_showtimestamps = value;
  xcUpdateCookie();
  // update the server configuration if available with the new value for future use
  if (XC.srvUrl) {
    JQ.post(unescape(XC.srvUrl) + unescape(XC.srvUrls['updateconfig']), '&xc_showtimestamps=' + XC.xc_showtimestamps);
  };
};

/**
 * Sets the client to either show the send buttons or not show the send buttons in Group and one on one conversation
 * @param {String} value XC.xc_sendbutton value (true = show send button, false do not show send button)
 */
function xcToggleSendButton(value) {
  XC.xc_sendbutton = value;
  xcUpdateCookie();
  // update the server configuration if available with the new value for future use
  if (XC.srvUrl) {
    JQ.post(unescape(XC.srvUrl) + unescape(XC.srvUrls['updateconfig']), '&xc_sendbutton=' + XC.xc_sendbutton);
  };
};

/**
 * Sets the font size to predefined style sheets based off the user specification
 * @param {String} value
 *      The stylesheet to be loaded
 */
function xcFontSize(value) {
  XC.xcfontsize = value;
  xcUpdateCookie();
  JQ('link').attr('href', value); // setting it for the main roster window
  if ((w = xcWinOpenGet('CONFIGURATION'))) { w.JQ('link').attr('href', value); };
  // update the server configuration if available with the new value for future use
  if (XC.srvUrl) {
    JQ.post(unescape(XC.srvUrl) + escape(XC.srvUrls['updateconfig']), '&xcfontsize=' + XC.fontsize);
  }
}

/**************************************************************************************************
 * Below are the configuration options functions for real time chat translation
 **************************************************************************************************/
/**
 * @param {Integer} value
 *      If 1 then real time translation is active, if 0 then real time translation is not active
 */
function xcToggleRealtimeTranslation(value) {
  XC.xc_translation = value;
  xcUpdateCookie(); // update the cookie so we can use that next time if we use the cookie for storing information
}

/**
 * @param {String} value
 *      The language that we wish to set the client to translate too
 */
function xcSetTranslationLanguage(value) {
  XC.xc_translation_lge = value;
  xcUpdateCookie(); // update the cookie so we can use that next time if we use the cookie for storing information
}

/**************************************************************************************************
 * Below is service discovery functions to determine the services supported by the server
 **************************************************************************************************/

/**
 * Makes request to the server to discover its capabilities XEP-0030
 */
function xcServiceDiscovery() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('query', {xmlns: NS_DISCO_INFO}));
    con.send(iq, window.xcServiceDiscoverySet);
  } catch (e) {};
};

/**
 * Discovers all the services that the xmpp server actually supports that the client
 * supports and sets the appropriate flags XEP-0030
 */
function xcServiceDiscoverySet(iq) {
  // process the service discovery information from the server
  JQ(iq.getDoc()).find('feature').each(function() {
    switch (JQ(this).attr('var')) {
      case NS_XDATA:
        xmppclient_xdata = 1;
        break;

      case NS_LAST:
        xmppclient_last = 1;
        break;

      case NS_OFFLINE:
        xmppclient_offline = 1;
        break;

      case NS_VCARD:
        xmppclient_vcard = 1;
        break;

      case NS_SEARCH:
        xmppclient_search = 1;
        break;

      case NS_VERSION:
        xmppclient_version = 1;
        break;

      case NS_PRIVACY:
        xmppclient_privacy = 1;
        break;

      case 'http://www.xmpp.org/extensions/xep-0136.html#ns-auto':
      case 'http://www.xmpp.org/extensions/xep-0136.html#ns-encrypt':
      case 'http://www.xmpp.org/extensions/xep-0136.html#ns-manage':
      case 'http://www.xmpp.org/extensions/xep-0136.html#ns-manual':
      case 'http://www.xmpp.org/extensions/xep-0136.html#ns-pref':
        xmppclient_archiving = 1;
        break;

      case NS_PING:
        xmppclient_ping = 1;
        break;
    };
  });
};

/**************************************************************************************************
 * XMPPClient Cookie Functionality
 **************************************************************************************************/

/**
 * Function takes all the necessary parameters and builds the string to store them in
 */
function xcUpdateCookie() {
  // write the change into the cookie for the user
  var name = xcEncodeHex(XC.ujid); // encode the users jid as the one we need
  var value = 'XC.xc_archive=' + XC.xc_archive + '|';
  value += 'XC.xc_showoffline=' + XC.xc_showoffline + '|';
  value += 'XC.xc_showtimestamps=' + XC.xc_showtimestamps + '|';
  value += 'XC.xc_emptygroups=' + XC.xc_emptygroups + '|';
  value += 'XC.xc_sendbutton=' + XC.xc_sendbutton + '|';
  value += 'XC.locale="' + XC.locale + '"|';
  value += 'XC.xc_translation=' + XC.xc_translation + '|';
  value += 'XC.xc_translation_lge="' + XC.xc_translation_lge + '"|';
  value += 'XC.xcfontsize="' + XC.xcfontsize + '"|';
  xcSetCookie(name, xcEncodeHex(value), 365); // set cookie for one year from now
  xcStorePreferences(value); // storing in xml private data XEP-0049
};

/**
 * Sets a cookie in the browser with the configuration information for the client
 * @param {String} name Name for the cookie in the nv pair
 * @param {String} value Value for the cookie in the nv pair
 * @param {Integer} days Number of days to keep the cookie before it expires
 */
function xcSetCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "; expires = " + date.toGMTString();
  };
  document.cookie = name + "=" + value + expires + "; path=/";
};

/**
 * @param {String} name Name of the cookie to read
 */
function xcReadCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var x = 0;x < ca.length; x++) {
    var c = ca[x];
    while (c.charAt(0)==' ') { c = c.substring(1,c.length); };
    if (c.indexOf(nameEQ) == 0) { return c.substring(nameEQ.length,c.length); };
  };
  return null;
};

/**
 * @param {String} name Name of the cookie to delete
 */
function xcDeleteCookie(name) {
  xcSetCookie(name, "", -1);
};

/**************************************************************************************************
 * Hex Encoding and decoding functionality is located below this portion of the file
 * License
 * This program is free software; you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * Copyright Stephen Ostermiller 2003-2006
 **************************************************************************************************/
var digitArray = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
var hexv = {
  "00":0,"01":1,"02":2,"03":3,"04":4,"05":5,"06":6,"07":7,"08":8,"09":9,"0A":10,"0B":11,"0C":12,"0D":13,"0E":14,"0F":15,
  "10":16,"11":17,"12":18,"13":19,"14":20,"15":21,"16":22,"17":23,"18":24,"19":25,"1A":26,"1B":27,"1C":28,"1D":29,"1E":30,"1F":31,
  "20":32,"21":33,"22":34,"23":35,"24":36,"25":37,"26":38,"27":39,"28":40,"29":41,"2A":42,"2B":43,"2C":44,"2D":45,"2E":46,"2F":47,
  "30":48,"31":49,"32":50,"33":51,"34":52,"35":53,"36":54,"37":55,"38":56,"39":57,"3A":58,"3B":59,"3C":60,"3D":61,"3E":62,"3F":63,
  "40":64,"41":65,"42":66,"43":67,"44":68,"45":69,"46":70,"47":71,"48":72,"49":73,"4A":74,"4B":75,"4C":76,"4D":77,"4E":78,"4F":79,
  "50":80,"51":81,"52":82,"53":83,"54":84,"55":85,"56":86,"57":87,"58":88,"59":89,"5A":90,"5B":91,"5C":92,"5D":93,"5E":94,"5F":95,
  "60":96,"61":97,"62":98,"63":99,"64":100,"65":101,"66":102,"67":103,"68":104,"69":105,"6A":106,"6B":107,"6C":108,"6D":109,"6E":110,"6F":111,
  "70":112,"71":113,"72":114,"73":115,"74":116,"75":117,"76":118,"77":119,"78":120,"79":121,"7A":122,"7B":123,"7C":124,"7D":125,"7E":126,"7F":127,
  "80":128,"81":129,"82":130,"83":131,"84":132,"85":133,"86":134,"87":135,"88":136,"89":137,"8A":138,"8B":139,"8C":140,"8D":141,"8E":142,"8F":143,
  "90":144,"91":145,"92":146,"93":147,"94":148,"95":149,"96":150,"97":151,"98":152,"99":153,"9A":154,"9B":155,"9C":156,"9D":157,"9E":158,"9F":159,
  "A0":160,"A1":161,"A2":162,"A3":163,"A4":164,"A5":165,"A6":166,"A7":167,"A8":168,"A9":169,"AA":170,"AB":171,"AC":172,"AD":173,"AE":174,"AF":175,
  "B0":176,"B1":177,"B2":178,"B3":179,"B4":180,"B5":181,"B6":182,"B7":183,"B8":184,"B9":185,"BA":186,"BB":187,"BC":188,"BD":189,"BE":190,"BF":191,
  "C0":192,"C1":193,"C2":194,"C3":195,"C4":196,"C5":197,"C6":198,"C7":199,"C8":200,"C9":201,"CA":202,"CB":203,"CC":204,"CD":205,"CE":206,"CF":207,
  "D0":208,"D1":209,"D2":210,"D3":211,"D4":212,"D5":213,"D6":214,"D7":215,"D8":216,"D9":217,"DA":218,"DB":219,"DC":220,"DD":221,"DE":222,"DF":223,
  "E0":224,"E1":225,"E2":226,"E3":227,"E4":228,"E5":229,"E6":230,"E7":231,"E8":232,"E9":233,"EA":234,"EB":235,"EC":236,"ED":237,"EE":238,"EF":239,
  "F0":240,"F1":241,"F2":242,"F3":243,"F4":244,"F5":245,"F6":246,"F7":247,"F8":248,"F9":249,"FA":250,"FB":251,"FC":252,"FD":253,"FE":254,"FF":255
};

function xcToHex(n) {
  var result = ''
  var start = true;
  for (var i = 32; i > 0;) {
    i -= 4;
    var digit = (n>>i) & 0xf;
    if (!start || digit != 0) {
      start = false;
      result += digitArray[digit];
    };
  };
  return (result == '' ? '0' : result);
};

/**
 * Pads the string with extra characters up until the length specified
 * @param {String} str string to be padded
 * @param {Integer} len Length to pad the string too
 * @param {String} pad Character with which to pad the string with
 */
function xcPad(str, len, pad) {
  var result = str;
  for (var i = str.length; i < len; i++) { result = pad + result; };
  return result;
};

function xcNtos(n) {
  n = n.toString(16);
  if (n.length == 1) { n = "0" + n; };
  n = "%" + n;
  return unescape(n);
};

/**
 * Function encodes the given string to a hex formatted string
 * @param {String} str String to be encoded into hex format
 */
function xcEncodeHex(str) {
  var result = "";
  for (var i = 0; i < str.length; i++) { result += xcPad(xcToHex(str.charCodeAt(i)&0xff), 2, '0'); };
  return result;
};

/**
 * Function decodes a hex string into human readable form
 * @param {String} str Hex string which needs to be decoded
 */
function xcDecodeHex(str) {
  str = str.toUpperCase().replace(new RegExp("s/[^0-9A-Z]//g"));
  var result = "";
  var nextchar = "";
  for (var i=0; i<str.length; i++){
    nextchar += str.charAt(i);
    if (nextchar.length == 2){
      result += xcNtos(hexv[nextchar]);
      nextchar = "";
    };
  };
  return result;
};

/************************************************************************************************************
 * Functions relationg to XMPP Client Private Data
 ************************************************************************************************************/

/**
 * Request the users preferences that are stored in the private data on the xmpp server
 */
function xcRetrievePrefs() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('query', {xmlns: NS_PRIVATE},
                 [iq.buildNode('xc', {xmlns: 'xc:prefs'})]));
    con.send(iq, xcRetrievePrefsVrfy);
  } catch (e) {};
};

/**
 * Retrieves the users preferences if available and then makes sure they are set in the client
 */
function xcRetrievePrefsVrfy(iq) {
  if (iq.isError()) {
    xcErrorProcess(iq);
    return true;
  };
  // incase the delayed response i.e. server latency, we will have taken from the cookie or the defaults if no cookie exists
  if (XC.config_loaded == 0) {
    if (JQ(iq.getDoc()).find('prefs').text()) {
      eval(JQ(iq.getDoc()).find('prefs').text());
      XC.config_loaded = 1;
    };
  };
  return true;
};

/**
 * Function uses XEP-0049 to store the private data for the user on the xmpp server specifically for preferences
 * @param {String} prefs The preferences string that is going to be stored in private data
 */
function xcStorePreferences(prefs) {
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.appendNode(iq.buildNode('query', {xmlns: NS_PRIVATE},
                 [iq.buildNode('xc', {xmlns: 'xc:prefs'},
                 [iq.buildNode('prefs', prefs)])]));
    con.send(iq, function() { return true; });
  } catch (e) {};
};

/**
 * Retrieve any stored bookmarks that in private xml storage for the user
 */
function xcBookmarksGet() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('query', {xmlns: NS_PRIVATE},
                 [iq.buildNode('storage', {xmlns: 'storage:bookmarks'})]));
    con.send(iq, xcBookmarksGetVrfy);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Display the bookmarks if any in the
 */
function xcBookmarksGetVrfy(iq) {
  if (iq.isError()) {
    xcSetMsg(xcT('Could not retrieve the users bookmarks'), true);
    return true;
  };
  XC.bookmarks = iq; // set the information in the bookmarks so we know what we have
  if (JQ(iq.getDoc()).find('conference').size() > 0) {
    JQ('#xcCL').append(xcBuildGroupHtml('Bookmarks')).show(); // build the group first
    JQ(iq.getDoc()).find('conference').each(function() {
      var jid = JQ(this).attr('jid');
      var name = JQ(this).attr('name');
      var nick = JQ(this).find('nick').text();
      var autojoin = JQ(this).attr('autojoin');
      var html = xcBuildBookmarkHtml(jid, name, nick);
      // ordering the bookmarks correctly
      if (JQ('.xcBookmark').size() == 0) {
        // no bookmarks yet hence just append the first bookmark
        JQ('#' + xcEnc('Bookmarks_contacts')).append(html).parent().show();
      } else {
        JQ('.xcBookmark').each(function() {
          // get the name of the already established bookmark in the DOM
          var cname = JQ(this).find('span.xcBookmarkName').html();
          var carray = new Array(name, cname).sort(); // sort the array in alphabetical order
          if (carray[0] == name) {
            JQ(html).insertBefore(JQ(this));
            return false; // stop processing through the bookmarks since we found what we need
          };
        });
        // add check to see if the element exists
        var check = '#' + xcEnc(jid) + '.xcBookmark';
        if (JQ(check).size() == 0) {
          // elements does not exist hence add it to the end since it must be the last element to be displayed
          JQ('#' + xcEnc('Bookmarks_contacts')).append(html).parent().show();
        };
      };
      if (autojoin == 'true') { xcMUCInviteLaunch(jid, nick); }; // automatically launch if autojoin is set for the client
    });
  };
  return true;
};

/**
 * Removes an existing bookmark from the system
 * @param {String} jid The bookmark room
 */
function xcBookmarkRemove(jid) {
  if (typeof(jid) == 'undefined' || jid == '') { return false; };
  JQ(XC.bookmarks.getDoc()).find('conference').each(function() {
    if (jid == JQ(this).attr('jid')) {
      JQ(this).remove(); // remove this conference from the packet
    };
  });
  var iq = new JSJaCIQ();
  iq.setType('set');
  iq.appendNode(iq.buildNode('query', {xmlns: NS_PRIVATE},
               [iq.buildNode('storage', {xmlns: 'storage:bookmarks'})]));
  // append the previously stored bookmarks also so we keep a running total
  JQ(XC.bookmarks.getDoc()).find('conference').each(function() {
    JQ(this).appendTo(JQ(iq.getDoc()).find('storage'));
  });
  con.send(iq, function(iq) {
                 if (iq.isError()) {
                   xcSetMsg(xcErrorProcess(iq), true);
                   return true;
                 };
                 xcSetMsg(xcT('Bookmark removed'), false);
                 return true;
               });
  XC.bookmarks = iq; // set the information
  // remove the bookmark html from the system
  JQ('.xcBookmark').each(function() {
    if (xcDec(this.id) == jid) { JQ(this).remove(); };
  });
};
