// Bookmarks Javascript Functions
var pWin = window.opener || window;

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
 * Request the users preferences that are stored in the private data on the xmpp server
 */
function xcBookmarksGet() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_PRIVATE},
                 [iq.buildNode('storage', {xmlns: 'storage:bookmarks'})]));
    pWin.con.send(iq, window.xcBookmarksGetVrfy);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Retrieves bookmarks from the users private storage
 * @param {JSJaCIQ} iq IQ packet with relevant private storage results returned
 */
function xcBookmarksGetVrfy(iq) {
  if (iq.isError()) {
    xcSetMsg(pWin.xcErrorProcess(iq), true);
    return true;
  };
  pWin.XC.bookmarks = iq; // set the bookmark into the XC namespace
  // bookmark url was passed hence we are doing an update not an addition
  if ((bookmark = JQ(document).getUrlParam('jid'))) {
    JQ(iq.getDoc()).find('conference').each(function() {
      if (JQ(this).attr('jid') == bookmark) {
        var jid = JQ(this).attr('jid');
        JQ('#jid').val(jid.split('@')[0]).attr('disabled', 'disabled');
        JQ('#server').val(jid.split('@')[1]).attr('disabled', 'disabled');
        JQ('#name').val(JQ(this).attr('name'));
        JQ('#autojoin').val(JQ(this).attr('autojoin'));
        JQ('#nick').val(JQ(this).find('nick').text());
        JQ('#cmd').val('update');
      };
    });
  };
  return true;
};

/**
 * Function uses XEP-0049 to store the private data for the user on the xmpp server specifically for preferences
 * @param {String} prefs The preferences string that is going to be stored in private data
 */
function xcBookmarksUpdate(jid, server, name, nick, autojoin, cmd) {
  if (typeof(jid) == 'undefined' || jid == '') {
    xcSetMsg(pWin.xcT('You must enter a valid room'), true);
    return false;
  };
  if (typeof(server) == 'undefined' || server == '') {
    xcSetMsg(pWin.xcT('You must enter a valid server'), true);
    return false;
  };
  if (typeof(name) == 'undefined' || name == '') {
    xcSetMsg(pWin.xcT('You must give the bookmark an alias'), true);
    return false;
  };
  if (typeof(nick) == 'undefined' || nick == '') {
    xcSetMsg(pWin.xcT('You must give the bookmark a nickname'), true);
    return false;
  };
  if (typeof(autojoin) == 'undefined' || autojoin == '') { autojoin = 'false'; };
  jid = jid + '@' + server; // will be in the format <roomname>@<servername>
  // only resend the information if the bookmark does not exist already or is being updated
  if ((xcBookmarksExist(jid) && cmd == 'update') || !(xcBookmarksExist(jid))) {
    try {
      var iq = new JSJaCIQ();
      iq.setType('set');
      iq.appendNode(iq.buildNode('query', {xmlns: pWin.NS_PRIVATE},
                   [iq.buildNode('storage', {xmlns: 'storage:bookmarks'},
                   [iq.buildNode('conference', {jid: jid, name: name, autojoin: autojoin},
                   [iq.buildNode('nick', nick)])])]));
      // append the previously stored bookmarks also so we keep a running total
      JQ(pWin.XC.bookmarks.getDoc()).find('conference').each(function() {
        if (JQ(this).attr('jid') != jid) { // check added so we do not overwrite the original one
          JQ(this).appendTo(JQ(iq.getDoc()).find('storage'));
        };
      });
      pWin.con.send(iq, function(iq) {
                          if (iq.isError()) {
                            xcSetMsg(pWin.xcErrorProcess(iq), true);
                            return true;
                          };
                          xcSetMsg(pWin.xcT('Action Completed'), false);
                          return true;
                        });
      pWin.XC.bookmarks = iq; // make sure we have the most updated information does not matter it is a get type it is only the conference pieces we care about anyway
      if (cmd == 'update') {
        pWin.xcUpdateBookmarkHtml(jid, name, nick); // remove the old bookmark and put the new html in there
      } else {
        pWin.xcAppendBookmarkHtml(pWin.xcBuildBookmarkHtml(jid, name, nick));
      };
    } catch (e) {};
  };
};

/**
 * Checks if the desired bookmark already exists if it does it will tell the user so they know
 * @param {String} jid The name of the conference room we will go into
 */
function xcBookmarksExist(jid) {
  if (typeof(jid) == 'undefined' || jid == '') { return false; };
  var check = 0;
  pWin.JQ('.xcBookmarks').each(function() {
    if (pWin.xcDec(this.id) == jid) {
      xcSetMsg(pWin.xcT('Bookmark already exists'), true);
      check = 1;
      return false; // this will stop us looping through any more of the bookmarks
    };
  });
  if (check == 1) { return true; };
  return false;
};

/*
 * When the DOM is ready the system is requesting the VCard to populate the form
 */
JQ(document).ready(function() {
  xcBookmarksGet();
  // Setting click handler for the error message
  JQ('div#msg').click(function() {
    JQ(this).removeClass('xcError').html('').hide();
  });
});


JQ(window).unload(function() {
  try { pWin.xcWinClose(pWin.xcDec(self.name)); } catch (e) {};
});
