// VCard Javascript Functions
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
  };
};

/**
 * Request the users VCard
 */
function xcVCardRequest() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('vCard', {xmlns: pWin.NS_VCARD}));
    pWin.con.send(iq, window.xcVCardDisplay);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Function processes the vCard and populates the form
 * @param {JSJaCIQ} iq IQ packet with VCard information
 */
function xcVCardDisplay(iq) {
  if(!iq) { return true; };
  if (iq.isError()) {
    xcSetMsg(pWin.xcErrorProcess(iq), true);
    return true;
  };
  // find the vCard DOM element and traverse each of the child elements
  JQ(iq.getDoc()).find('vCard').children().each(function() {
    var p = JQ(this).get(0).nodeName;
    if(JQ(this).children().size() > 0) { // if the node has children then process the child elements
      JQ(this).children().each(function() { JQ('#' + p + 'DOTDOT' + JQ(this).get(0).nodeName).val(JQ(this).text()); });
    } else {
      JQ('#' + p).val(JQ(this).text());
    };
  });
  return true;
};

/**
 * Builds the necessary nodes and then sends the vcard information to the server
 * Taken from JWChat VCard node population
 */
function xcVCardSend() {
  var node = '';
  var iq = new JSJaCIQ();
  iq.setType('set');
  var v = iq.appendNode(iq.buildNode('vCard', {xmlns: pWin.NS_VCARD}));
  for (var x = 0; x < document.forms[0].elements.length; x++) {
    var e = document.forms[0].elements[x]; // form element
    if (e.value == '' || e.id == '') { continue; }; // if empty ignore the element
    if (e.id.indexOf('DOTDOT') == -1) { // if the form element is not a child of a node
      v.appendChild(iq.getDoc().createElement(e.id)).appendChild(iq.getDoc().createTextNode(e.value));
    } else {
      var p = e.id.substring(0,e.id.indexOf('DOTDOT')); // parent node
      var c = e.id.substring(e.id.indexOf('DOTDOT')+6); // child node
      if (v.getElementsByTagName(p).length > 0) {
        node = v.getElementsByTagName(p).item(0); // node already exists
      } else {
        node = v.appendChild(iq.getDoc().createElement(p)); // create the node did not exist
      };
      node.appendChild(iq.getDoc().createElement(c)).appendChild(iq.getDoc().createTextNode(e.value));
    };
  };
  pWin.con.send(iq);
  xcSetMsg(pWin.xcT('VCard has been updated'), false);
  if (pWin.XC.srvUrl) {
    JQ.post(unescape(pWin.XC.srvUrl) + unescape(pWin.XC.srvUrls['savevcard']), '&data=' + iq.getDoc().xml); // send the xml representation of the packet to the server, then it can be parsed if necessary
  };
};

/*
 * When the DOM is ready the system is requesting the VCard to populate the form
 */
JQ(document).ready(function() {
  xcVCardRequest();
  // Adding click handler too the message div
  JQ('div#msg').click(function() {
    JQ(this).html('').removeClass('xcError').hide();
  });
});

/**
 * Setting default action for the screen when a user is on it
 */
JQ(document).keydown(function(e) {
  var keycode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
  if (keycode == 13) {
    xcVCardSend(); // enter key pressed
    return false;
  };
  return true;
});

JQ(window).unload(function() {
  try { pWin.xcWinClose(pWin.xcDec(self.name)); } catch (e) {};
});
