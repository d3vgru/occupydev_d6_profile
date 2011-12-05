/*
  Author Darren Ferguson darren.ferguson@openband.net
*/

var grouplist = new Array(); // Array holding the groups the client has contacts in
var contactlist = new Array(); // Array holding contact list for the client

/**
 * Contact Class
 */
function xcContact(jid) {
  /*
   * @private used to store information regarding the contact
   */
  this.jid = jid;
  this.resource = null;
  this.name = null;
  this.type = null;
  this.show = 'unavailable';
  this.status = null;
  this.subscription = null;
  this.ask = null;
  this.group = new Array();
  xcAddContact(this);
}

/**
 * Gets the jid for the xcContact
 * @return the jid for this xcContact
 * @type String
 */
xcContact.prototype.getJID = function() { return this.jid; };

/**
 * Sets jid for the xcContact
 * @param {String} jid The jid of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setJID = function(jid) {
  this.jid = jid;
  return this;
};

/**
 * Gets the name for the xcContact
 * @return the name for this xcContact
 * @type String
 */
xcContact.prototype.getName = function() { return this.name; };

/**
 * Sets name for the xcContact
 * @param {String} name The name of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setName = function(name) {
  this.name = name;
  return this;
};

/**
 * Gets the group for the xcContact
 * @param {String} seperator Seperator to be used if multiple groups
 * @return the group(s) for this xcContact
 * @type String : Array
 */
xcContact.prototype.getGroup = function(seperator) {
  if (seperator) {
    return this.group.join(seperator);
  } else {
    return this.group;
  };
};

/**
 * Searches for the specified group in the xcContacts listed groups
 * @param {String} group Group to be searched on
 * @type Boolean : true if xcContact in the group, false if xcContact not in the group
 */
xcContact.prototype.searchGroup = function(group) {
  for (var x = 0; x < this.group.length; x++) {
    if (this.group[x] == group) { return true; };
  };
  return false;
};

/**
 * Resets the group value for the xcContact to empty
 * @type xcContact
 */
xcContact.prototype.clearGroup = function() {
  this.group = new Array();
  return this;
};

/**
 * Sets group for the xcContact, if already set function returns
 * @param {String} group The group of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setGroup = function(group) {
  if (this.searchGroup(group)) { return this; };
  this.group.push(group); // group did not exist so add it to the array
  return this;
};

/**
 * Gets the subscription for the xcContact
 * @return the subscription for this xcContact
 * @type String
 */
xcContact.prototype.getSubscription = function() { return this.subscription; };

/**
 * Sets subscription for the xcContact
 * @param {String} subscription The subscription of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setSubscription = function(subscription) {
  this.subscription = subscription;
  return this;
};

/**
 * Gets the type for the xcContact
 * @return the type for this xcContact
 * @type String
 */
xcContact.prototype.getType = function() { return this.type; };

/**
 * Sets type for the xcContact
 * @param {String} type The type of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setType = function(type) {
  this.type = type;
  return this;
};

/**
 * Gets the show for the xcContact
 * @return the show for this xcContact
 * @type String
 */
xcContact.prototype.getShow = function() { return this.show; };

/**
 * Sets show for the xcContact
 * @param {String} show The show of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setShow = function(show) {
  this.show = show || 'unavailable';
  return this;
};

/**
 * Gets the status for the xcContact
 * @return the status for this xcContact
 * @type String
 */
xcContact.prototype.getStatus = function() { return this.status; };

/**
 * Sets status for the xcContact
 * @param {String} status The status of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setStatus = function(status) {
  this.status = status;
  return this;
};

/**
 * Gets the resource for the xcContact
 * @return the resource for this xcContact
 * @type String
 */
xcContact.prototype.getResource = function() { return this.resource; };

/**
 * Sets resource for the xcContact
 * @param {String} resource The resource of the xcContact.
 * @type xcContact
 */
xcContact.prototype.setResource = function(resource) {
  this.resource = resource;
  return this;
};

/**
 * Gets the ask for the xcContact
 * @return the ask for this xcContact
 * @type String
 */
xcContact.prototype.getAsk = function() { return this.ask; };

/**
 * Sets ask for the xcContact
 * @param {String} ask The ask of the contact.
 * @type xcContact
 */
xcContact.prototype.setAsk = function(ask) {
  this.ask = ask;
  return this;
};

/**
 * Sets name, type, show and status for the xcContact
 * @param {String, String, String, String, String} name, type, show, status and resource of xcContact
 * @type xcContact
 */
xcContact.prototype.setContact = function(name, type, show, status, resource) {
  if (name) { this.name = name; };
  if (type) { this.type = type; };
  if (show) { this.show = show; };
  if (status) { this.status = status; };
  if (resource) { this.resource = resource; };
  return this;
};

/**
 * Verify is a contact exists in the contact list
 * @param {String} jid. JID to check against the contact
 * @return contact if exists else null
 */
function xcContactExists(jid) {
  for (var x = 0; x < contactlist.length; x++) {
    if (contactlist[x].getJID() == jid) { return contactlist[x]; };
  };
  return null;
};

/**
 * Update an existing contact with new information
 * @param {Object} contact. Contact with which to update
 * @type xcContact
 */
function xcUpdateContact(contact) {
  for (var x = 0; x < contactlist.length; x++) {
    if (contactlist[x].getJID() == contact.getJID()) { contactlist[x] = contact; };
  };
};

/**
 * Checks if the user is in the offline group or not
 * @param {String} jid JID of the user we are checking for
 * @result {Boolean} true or false depending on if they are or not
 */
function xcInOfflineGroup(jid) {
  var check = 0;
  // no offline contacts are currently in the offline contacts group
  if (JQ('#' + xcEnc('Offline_contacts')).children('.xcContact').size() == 0) {
    return false;
  };
  // some contacts so check if it is the person that we are looking for.
  JQ('#' + xcEnc('Offline_contacts')).children('.xcContact').each(function() {
    if (xcDec(this.id) == jid) {
      check = 1;
      return false;
    };
  });
  if (check == 1) { return true; };
  return false;
};

/**
 * @param {String} jid JID of the conference we will join
 * @param {String} name Name of conference we will join
 * @param {String} nick Nickname to use when going into the conference
 */
function xcBuildBookmarkHtml(jid, name, nick) {
  if (typeof(jid) == 'undefined' || jid == '') { return ''; };
  if (typeof(name) == 'undefined' || name == '') { name = jid; };
  var html = '<div id="' + xcEnc(jid) + '" class="xcBookmark clearfix" nick="' + nick + '" oncontextmenu="return false;">' +
             '<span class="xcBookmarkName">' + name + '</span>' +
             '</div>';
  return html;
};

/**
 * Needed because from other windows we cannot use the jquery handler correctly
 * @param {String} html The html for the object being appended to the bookmarks contacts
 */
function xcAppendBookmarkHtml(html) {
  if (typeof(html) == 'undefined' || html == '') { return false; };
  if (JQ('#' + xcEnc('Bookmarks_contacts')).size() == 0) { // if the bookmarks are not there create them first
    var cdata = JQ('#xcCL').html();
    JQ('#xcCL').html(xcBuildGroupHtml('Bookmarks')).show();
    JQ('#xcCL').append(cdata).show();
  };
  JQ('#' + xcEnc('Bookmarks_contacts')).append(html).parent().show();
  xcSetRosterClick();
};

/**
 * @param {String} jid The conference we are updating
 * @param {String} name Name for the conference we will utilize
 * @param {String} nick Nickname to use when going into the conference
 */
function xcUpdateBookmarkHtml(jid, name, nick) {
  if (typeof(jid) == 'undefined' || jid == '') { return false; };
  if (typeof(name) == 'undefined' || name == '') { name = jid; };
  JQ('.xcBookmark').each(function() {
    if (this.id == xcEnc(jid)) {
      JQ(this).attr('nick', nick);
      JQ(this).children().each(function() {
        if (JQ(this).children().size() == 0) {
          JQ(this).html(name);
        };
      });
    };
  });
};

/**
 * Builds the html code that will display the user in the roster
 * @param {String} jid The jid for the contact
 * @return {String} html The html formatted output.
 */
function xcBuildContactHtml(jid, contact) {
  if (typeof(jid) == 'undefined' || jid == '') { return ''; };
  var html = '<div id="' + xcEnc(jid) + '" class="xcContact clearfix" oncontextmenu="return false;">' +
  '<span class="xcContactName presence unavailable">' + contact.getName() + '</span>' +
  '<span class="xcContactStatus"></span>' +
  '</div>';
  return html;
};

/**
 * Updates the existing HTML for the contact in the system
 * @param {Object} contact Contact to be updated
 */
function xcUpdateContactHtml(contact) {
  var jid = contact.getJID();
  JQ('.xcContact').each(function() {
    if (xcDec(this.id) == jid) {
      JQ(this).find('.xcContactName').html(contact.getName());
    };
  });
};

/**
 * Add an new contact to the contact list
 * @param {Object} contact. Contact to be added
 * @type xcContact
 */
function xcAddContact(contact) {
  for (var x = 0; x < contactlist.length; x++) {
    if (contactlist[x].getJID() == contact.getJID()) { return; };
  };
  contactlist.push(contact);
};

/**
 * Remove existing contact from the contact list
 * @param {String} jid. JID for the contact to be removed
 * @type xcContact
 */
function xcRemoveContact(jid) {
  for (var x = 0; x < contactlist.length; x++) {
    if (contactlist[x].getJID() == jid) { contactlist.splice(x,1); };
  };
};

/**
 * Return an array of all the online contacts for the user
 */
function xcOnlineContacts() {
  var online = new Array();
  for (var x = 0; x < contactlist.length; x++) {
    if (contactlist[x].getShow() == 'unavailable') { continue; };
    online.push(contactlist[x]);
  };
  return online;
};

/**
 * Add an new group to the group list
 * @param {String} group. Group to be added
 * @type xcContact : if contact exist it will return without adding the contact
 */
function xcAddGroup(group) {
  for (var x = 0; x < grouplist.length; x++) {
    if (grouplist[x] == group) { return; };
  };
  grouplist.push(group);
};

/**
 * Verify if a contact group exists
 * @param {String} group. The name of the group to verify against
 * @return the group or null if it does not exist
 */
function xcGroupExists(group) {
  for (var x = 0; x < grouplist.length; x++) {
    if(grouplist[x] == group) { return grouplist[x]; };
  };
  return null;
};

/**
 * Builds the html that will be used to display the group in the roster
 * @param {String} group The name of the group we are creating html for
 */
function xcBuildGroupHtml(group) {
  if (!group) { return ''; };
  var html = '<div class="xcGroupContainer expanded">' +
             '<div id="' + xcEnc(group) + '" class="xcGroup">' +
             '<span class="xcGroupName"><strong>' + group + '</strong></span>' +
             '</div>' +
             '<div id="' + xcEnc(group) + '_contacts" class="xcGroupContact"></div>' +
             '</div>';
  return html;
};

/**
 * @param {String} group
 *      The group we are currently manipulating
 * @param {String} jid
 *      The jid for the contact
 * @param {String} name
 *      The display name for the contact
 * @param {String} html
 *      The html we will use to display the contact
 */
function xcAddContactToGroup(group, jid, name, html) {
  // making sure the contact list is alphabetically ordered
  var check = '#' + xcEnc(group) + '_contacts' + ' .xcContact';
  var update = '#' + xcEnc(group) + '_contacts';
  if (JQ(check).size() == 0) {
    // if nothing already exists in the group contacts append to the end
    JQ(update).append(html).parent().show();
  } else {
    // go through each of the contacts currently in the list
    JQ(check).each(function() {
      // get the name of the contact that is displayed in the DOM
      var cname = JQ(this).find('span.xcContactName').html();
      var carray = new Array(name, cname).sort();
      // check which of the names is first in the alphabetically sorted array
      if (carray[0] == name) {
        JQ(html).insertBefore(JQ(this));
        return false; // return false stops the processing so we do not continually add the value
      };
    });
    // if nothing was added then it needs to be at the very end alphabetically so add it to the end
    var cupdate = '#' + xcEnc(group) + '_contacts #' + xcEnc(jid);
    if (JQ(cupdate).size() == 0) {
      JQ(update).append(html).parent().show();
    };
  };
};

/**
 * Sets the appropriate click functionality for each item in the roster
 */
function xcSetRosterClick() {
  // Click functionality so groups will expand and contract
  JQ('div.xcGroup').unbind().click(function(){
    var id = this.id;
    JQ('#' + xcEnc(id + '_contacts')).toggle();
    JQ('#' + xcEnc(id)).parent().toggleClass('expanded');
    JQ('#' + xcEnc(id)).parent().toggleClass('collapsed');
  });
  // Click functionality for users in the roster
  JQ('div.xcContact').unbind().mousedown(function(e) {
    var buttoncode = e.which ? e.which : e.button; // msie specific checks does not support e.which
    var pageX = e.pageX ? e.pageX : e.clientX; // msie specific checks does not support e.page
    var pageY = e.pageY ? e.pageY : e.clientY; // msie specific checks does not support e.page
    var id = xcDec(this.id);
    if (buttoncode == 1) {
      xcOpenUserChat(id); // One on One chat with the user
    } else {
      JQ('#xcBookmarkRightMenu').hide();
      JQ('#xcRightMenu').css({ top: pageY + 'px', left: pageX + 'px' }).show();
      // Checking to determine if the right click menu will go off the page at the bottom or not
      // If it will we bring it back up so the user will see all of the options available to them
      var overlapcheck = parseInt(JQ(window).height()) - parseInt(pageY) - parseInt(JQ('#xcRightMenu').height());
      if (overlapcheck < 0) {
        JQ('#xcRightMenu').css('top', pageY + -20 + parseInt(overlapcheck) + 'px');
      }
      JQ(document).one("click" , function() { JQ('#xcRightMenu').hide(); });
    };
    var contact = xcContactExists(id);
    // adding checks for subscription so we can send subscription packets
    if (contact.getSubscription() == 'both') {
      JQ('li#resubscribe').hide();
    } else if (contact.getSubscription() == 'none') {
      JQ('li#resubscribe').show().html(xcT('Subscribe'));
    } else {
      JQ('li#resubscribe').show().html(xcT('Resubscribe'));
    };
    // setting the click menu functionality for the right click menu on the roster
    JQ('.xcContextMenu > ul > li').unbind().click(function() {
      if (this.id == 'archive') {
        xcViewUserLog(id); // view archived information for that user
      } else if (this.id == 'chat') {
        xcOpenUserChat(id); // One on One chat with the user
      } else if (this.id == 'info') {
        xcUserInfo(id); // get user vcard information
      } else if (this.id == 'getpresence') {
        xcSendPresenceType(id, 'probe'); // get the users current online presence
        xcSetMsg(xcT('Presence request sent'), false);
      } else if (this.id == 'setpresence') {
        xcWinUpdatePresenceOpen(id);
      } else if (this.id == 'remove') {
        if (confirm(xcT('Are you sure you wish to remove the user from your roster?'))) {
          xcDeleteContact(id); // remove the contact from your roster
        };
      } else if (this.id == 'resubscribe') {
        xcSendPresenceType(id, 'subscribe'); // send subscription presence to the user
        xcSetMsg(xcT(JQ(this).html() + ' sent'), false);
      } else if (this.id == 'update') {
        xcWinUpdateUserOpen(id); // open the update user window
      };
    }).mouseover(function() { JQ(this).addClass('xcOver'); }).mouseout(function() { JQ(this).removeClass('xcOver'); });
  });
  // set the click functionality for the bookmarks portion of the screen
  JQ('div.xcBookmark').unbind().mousedown(function(e) {
    var buttoncode = e.which ? e.which : e.button; // msie specific checks does not support e.which
    var pageX = e.pageX ? e.pageX : e.clientX; // msie specific checks does not support e.page
    var pageY = e.pageY ? e.pageY : e.clientY; // msie specific checks does not support e.page
    var id = xcDec(this.id);
    var nick = JQ(this).attr('nick');
    if (buttoncode == 1) {
      xcMUCInviteLaunch(id, nick);
    } else {
      JQ('#xcRightMenu').hide();
      JQ('#xcBookmarkRightMenu').css({ top: pageY + 'px', left: pageX + 'px' }).show();
      JQ(document).one("click" , function() { JQ('#xcBookmarkRightMenu').hide(); });
    };
    JQ('.xcBookmarkContextMenu > ul > li').unbind().click(function() {
      if (this.id == 'open_bookmark') {
        xcMUCInviteLaunch(id, nick);
      } else if (this.id == 'remove_bookmark') {
        xcBookmarkRemove(id);
      } else if (this.id == 'update_bookmark') {
        var w = xcWinOpen('bookmarks', 'jid=' + id, 'BOOKMARKS', 'BOOKMARKS');
      };
    }).mouseover(function() { JQ(this).addClass('xcOver'); }).mouseout(function() { JQ(this).removeClass('xcOver'); });
  });
};

/**
 * Does the hiding and showing of offline personnel in the roster based off user preferences
 * @param {Integer} value XC.xc_showoffline current value (1 = show, 0 = do not show)
 */
function xcRosterToggleOffline(value) {
  XC.xc_showoffline = value;

  if (XC.xc_showoffline == 1) {
    JQ('div#Offline.xcGroup').parent().slideDown();
  } else {
    JQ('div#Offline.xcGroup').parent().slideUp();
  }
  xcUpdateCookie();
  // update the server configuration if available with the new value for future use
  if (XC.srvUrl) {
    JQ.post(unescape(XC.srvUrl) + unescape(XC.srvUrls['updateconfig']), '&xc_showoffline=' + XC.xc_showoffline);
  };
};

/**
 * Does the displaying and hiding of empty groups based off the user preferences
 * @param {Integer} value XC.xc_emptygroups current value (1 = show, 0 = do not show)
 */
function xcToggleEmptyGroups(value) {
  XC.xc_emptygroups = value;
  if (XC.xc_emptygroups == 1) {
    JQ('.xcGroupContainer').show(); // blanket show all groups
  } else {
    JQ('.xcGroupContainer').each(function() {
      if (JQ(this).find('.xcGroupContact').children('.xcContact').size() == 0) {
        if (JQ(this).find('.xcGroupContact').children('.xcBookmark').size() == 0) { // make sure it is not bookmarks since they will be part of the group
          JQ(this).hide(); // hide the group if it proves to be empty
        } else {
          JQ(this).show();
        };
      };
    });
  };
  xcUpdateCookie();
  // update the server configuration if available with the new value for future use
  if (XC.srvUrl) {
    JQ.post(unescape(XC.srvUrl) + unescape(XC.srvUrls['updateconfig']), '&xc_emptygroups=' + XC.xc_emptygroups);
  };
};


/**
 * Produces the HTML output that is utilized across the whole roster for the system
 */
function xcDrawRosterWindow() {
  // links for help, privacy and configuration of the client
  JQ('#xcRosterConfigLink').html('<a href="javascript:var w = xcWinOpen(\'configuration\', \'\', \'CONFIGURATION\', \'CONFIGURATION\');">' + xcT('Settings') + '</a>');
  JQ('#xcRosterPrivacyIcon').html('<a href="javascript:var w = xcWinOpen(\'privacylist\', \'\', \'PRIVACYLIST\', \'PRIVACYLIST\');" title="' + xcT('Privacy Lists') + '">' + xcT('Privacy') + '</a>');
  JQ('#xcRosterHelpLink').html('<a href="javascript:var w = xcWinOpen(\'help\', \'\', \'HELP\', \'HELP\');">' + xcT('Help') + '</a>');
  // the group chat, bookmark and add user icons
  JQ('#xcRosterAddUserIcon').html('<a href="javascript:var w = xcWinOpen(\'adduser\', \'\', \'ADDUSER\', \'ADDUSER\');" title="' + xcT('Add Contact') + '"><strong class="plus">+</strong> ' + xcT('Add Contact') + '</a>');
  JQ('#xcRosterBookmarkLink').html('<a href="javascript:var w = xcWinOpen(\'bookmarks\', \'\', \'BOOKMARKS\', \'BOOKMARKS\');"><span class="plus">+</span> ' + xcT('Add Bookmark') + '</a>');
  JQ('#xcRosterMUCIcon').html('<a href="javascript:var w = xcWinOpen(\'muc_config\', \'\', \'MUCCONFIG\', \'MUCCONFIG\');" title="' + xcT('Group Chat') + '">' + xcT('Group Chats') + '</a>');
  // the right click menu
  var str = '<ul oncontextmenu="return false;">' +
            '<li id="archive" oncontextmenu="return false;">' + xcT('Chat Log') + '</li>' +
            '<li id="chat" oncontextmenu="return false;">' + xcT('Chat') + '</li>' +
            '<li id="info" oncontextmenu="return false;">' + xcT('Info') + '</li>' +
            '<li id="getpresence" oncontextmenu="return false;">' + xcT('Get Presence') + '</li>' +
            '<li id="setpresence" oncontextmenu="return false;">' + xcT('Set Presence') + '</li>' +
            '<li id="remove" oncontextmenu="return false;">' + xcT('Remove') + '</li>' +
            '<li id="resubscribe" oncontextmenu="return false;">' + xcT('Resubscribe') + '</li>' +
            '<li id="update" oncontextmenu="return false;">' + xcT('Update') + '</li>' +
            '</ul>';
  JQ('#xcRightMenu').html(str);
  // updating the bookmark menu also
  var str = '<ul oncontextmenu="return false;">' +
            '<li id="open_bookmark" oncontextmenu="return false;">' + xcT('Open') + '</li>' +
            '<li id="remove_bookmark" oncontextmenu="return false;">' + xcT('Remove') + '</li>' +
            '<li id="update_bookmark" oncontextmenu="return false;">' + xcT('Update') + '</li>' +
            '</ul>';
  JQ('#xcBookmarkRightMenu').html(str);
};


function xcTogglePresenceSelector() {
  JQ('#xcUserPresenceContainer').slideToggle('fast');
  JQ('#xcUserPresenceDisplay').toggleClass('expanded');
  return false;
}
