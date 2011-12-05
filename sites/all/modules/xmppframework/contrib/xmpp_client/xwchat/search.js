// User Search Functionality XEP-0055

/**
 * Request the user search form fields from the XMPP server
 * @return {JSJaCIQ : String} either the full IQ packet or error string
 */
function xcUserSearchForm() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.setTo(XC.SEARCH);
    iq.setQuery(NS_SEARCH);
    return iq;
  } catch (e) {
    return e.message;
  };
};

/**
 * Builds the search form based of the IQ packet received
 * @return {String} returns either the html output for the form or an error message
 * @param {JSJaCIQ} iq packet returned by the XMPP server
 * @param {String} callback, the callback JS function to call for the onclick on the Query button
 */
function xcUserSearchFormVrfy(iq, callback) {
  if (iq.isError()) { return 'Error: ' + xcErrorProcess(iq); };
  var html = "<div class='xcTitle'>" + xcT('User Search Form') + ":</div>";
  html += "<form id='usersearch' name='usersearch'>";
//  html += "<table class='xcUserSearchTable'>";
  JQ(iq.getQuery()).children().not('instructions').not('x').each(function() {
    var nodeName = this.nodeName.toLowerCase();
    html += '<div class="xcFieldWrapper text_field">';
    html += '<label for="' + nodeName + '" id="' + nodeName + '_lbl" class="xcLabel">' + nodeName + ': </label>';
    html += '<input type="text" id="' + nodeName + '" value="" class="xcInput" />';
    html += '</div>';
  });
  // if data forms are being used in the search portion this function will handle their creation
  if (JQ(iq.getDoc()).find('field').size() > 0) {
    html += xcCreateForm(iq, null, null, false);
  };
  html += '<div class="xcFieldWrapper button xcSubmit">';
  html += '<input type="button" name="search_button" id="search_button" class="xcButton" value="' + xcT('Search') + '" onClick="' + callback + '()" />';
  html += '<input type="button" name="search_close_button" id="search_close_button" class="xcButton" value="' + xcT('Close') + '" />';
  html += '</div>'
  html += '</form>';
  return html;
};

/**
 * Builds the IQ {JSJaCPacket} that we will send to query about users
 * @param {JQuery Object} form holding the fields we need to parse
 * @return {JSJaCPacket : String} returns the packet or error message
 */
function xcUserSearch(obj) {
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.setTo(XC.SEARCH);
    iq.setQuery(NS_SEARCH);
    // this will take care of the first portion of the XEP-0055 functionality
    JQ(obj).find(':text').not('.xcForm').each(function() {
      if ((value = JQ(this).val())) {
        var node = iq.getDoc().createElement(this.id);
        var textnode = iq.getDoc().createTextNode(value);
        node.appendChild(textnode);
        iq.getQuery().appendChild(node);
      };
    });
    // determine if any search criteria was actually entered for searching the user
    if (JQ(obj).find('.xcForm').size() > 0) {
      // this will take care of the second portion of the XEP-0055 where a data form could be used to extend the search criteria
      iq.getQuery().appendChild(iq.buildNode('x', {xmlns: NS_XDATA, type: 'submit'}));
      // make sure we add the appropriate hidden form otherwise it will not submit correctly.
      var f = iq.getDoc().createElement('field');
      f.setAttribute('var', 'FORM_TYPE');
      f.setAttribute('type', 'hidden');
      var n = iq.getDoc().createElement('value');
      n.appendChild(iq.getDoc().createTextNode(NS_SEARCH));
      f.appendChild(n);
      JQ(iq.getDoc()).find('x').append(f);
      // go through each of the form elements that we received from the system
      JQ(obj).find('.xcForm').each(function() {
        if (JQ(this).attr('id') == 'FORM_TYPE') { return true; };
        if ((value = JQ(this).val())) {
          var f = iq.getDoc().createElement('field');
          f.setAttribute('var', JQ(this).attr('id'));
          var n = iq.getDoc().createElement('value');
          n.appendChild(iq.getDoc().createTextNode(value));
          f.appendChild(n);
          JQ(iq.getDoc()).find('x').append(f);
        };
      });
    };
    // 1 would be the hidden form value FORM_TYPE hence if one, we did not get any search criteria.
    if (JQ(iq.getDoc()).find('x').children().size() == 1) {
      return xcT('You must enter search criteria');
    };
    return iq;
  } catch (e) {
    return e.message;
  };
};

/**
 * Function parses search query results and will return either the html
 * formatted table or will return Error string with no information matched
 * @param {JSJaCPacket} iq packet with results of our search query
 * @return {String} data to be displayed to the user
 */
function xcUserSearchVrfy(iq) {
  if (iq.isError()) { return 'Error: ' + xcErrorProcess(iq); };
  // no search results were found hence we are going to display this and a button to close the div
  if (JQ(iq.getDoc()).find('item').size() == 0) {
    var html = '<div id="xcNoUserSearchResults">';
    html += '<div class="xcTitle">' + xcT('No information matched your search criteria') + '</div>';
    html += '<div class="xcFieldWrapper button xcSubmit">';
    html += '<input type="button" id="close_button" value="' + xcT('Close') + '" class="xcButton" />';
    html += '</div>';
    html += '</div>';
    return html;
  };

  // search results were found hence display the information to the user
  var html = '<div class="xcTitle">' + xcT('Search Results') + ':</div>';
  html += '<div id="xcUserSearchResultsHeader"><span class="xcUserJID">JID</span><span class="xcUserSelect">Select</span></div>';
  // if 0 then no x-form was submitted hence just process as normal
  if (JQ(iq.getDoc()).find('field').size() == 0) {
    JQ(iq.getDoc()).find('item').each(function() {
      var jid = JQ(this).attr('jid');
      html += '<div id="xcUserSearchResultsData"><span class="xcUserJID">' + jid + '</span><span class="xcUserSelect"><img id="' + jid + '" src="img/select.gif" class="xcUserSearchSelect" /></span></div>';
    });
  } else {
    JQ(iq.getDoc()).find('item').each(function() {
      var jid = '';
      JQ(this).children('field').each(function() {
        if (JQ(this).attr('var') == 'jid') { jid = JQ(this).find('value').text(); };
      });
      html += '<div id="xcUserSearchResultsData"><span class="xcUserJID">' + jid + '</span><span class="xcUserSelect"><img id="' + jid + '" src="img/select.gif" class="xcUserSearchSelect" /></span></div>';
    });
  };
  return html;
};
