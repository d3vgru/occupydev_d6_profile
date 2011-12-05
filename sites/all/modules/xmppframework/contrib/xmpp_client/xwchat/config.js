/**
 * Author Darren Ferguson darren.ferguson@openband.net
 * August 2007
 *
 * Configuration file XWChat
 */

var XC = {
  name            : 'XWChat', // the name of the client
  os              : 'Web Browser', // os the client is running on
  version         : '0.7', // current version of the client
  pWin            : window.opener || window, // the window which the client was opened by
  port            : 80, // default port the client will connect too
  httpbase        : '/http-bind/', // type of connection we will use, binding (/http-bind/) or polling (/http-poll/)
  timerval        : 2000, // interval between checking the connection for new information (polling mode only)
  domain          : '', // domain the user is logging into on the system
  ujid            : '', // login users username
  fjid            : '', // login users full jid without resource
  password        : '', // password the user utilizes to log into the server
  bookmarks       : '', // holds the latest information we received regarding bookmarks (will be a JSJaCIQ either type set or get)
  vcard           : {}, // object that will hold the pertinent vcard information
  authtype        : 'nonsasl', // needs to be set to nonsasl if using openfire since it has issues, otherwise sasl should be used
  nickname        : 'xwchat', // users nickname for use in group chat
  unload_nick     : '', // nickname if the window was refreshed for the muc
  localizedString : {}, // will hold the translations that the client will utilize for different languages
  locale          : 'en', // the current locale being utilized always default to english in the begining
  invisible       : 0, // is client invisible (1 = yes, 0 = no)
  config_loaded   : 0, // is configuration loaded (1 = yes, 0 = no)
  roster_loaded   : 0, // is the roster loaded (1 = yes, 0 = no)
  amdm            : 30, // default number of messages to display in the archive messages screen (archive max display messages)
  srvUrl          : '', // url where the server root initially is, then we can add extra paths onto this as needed
  MUC             : 'conference.chat.openband.net', // default Group Chat Conference server
  SEARCH          : 'vjud.chat.openband.net', // default search server when using XEP-0055 vjud for ejabberd
  DEFGROUP        : 'General', // default group for clients with no group information
  scrollthreshold : 0.95, // the threshold below which the system will not scroll the messages
  ERRORTIMEOUT    : 5000, // timeout when handling errors (in milliseconds)
  MSGTIMEOUT      : 500, // timeout when trying to verify that the message handling function is available
  UNLOADTIMEOUT   : 5000, // timeout if the unload_nick is set, then it will be unset if set
  SPINNERHIDE     : 1000, // timeout for hiding the presence spinner
  LOGSIZE         : 3, // the size of log messages we will keep before removing log messages from the client
  CONFIG_WAIT     : 1000, // timeout for waiting on configuration options being set via the client before trying the options if not set
  av_locales      : {
                      ar : 'Arabic',
                      ch : 'Chinese',
                      nl : 'Dutch',
                      en : 'English',
                      fi : 'Finnish',
                      fr : 'French',
                      de : 'German',
                      hu : 'Hungarian',
                      it : 'Italian',
                      ko : 'Korean',
                      lt : 'Lithuanian',
                      'pt-pt' : 'Portuguese',
                      ro : 'Romanian',
                      ru : 'Russian',
                      es : 'Spanish',
                      tk : 'Turkish'
                    }, // available locale languages we support
  pIcon           : {
                      available      : 'img/available.gif',
                      away           : 'img/away.gif',
                      chat           : 'img/chat.gif',
                      dnd            : 'img/dnd.gif',
                      offline        : 'img/offline.gif',
                      unavailable    : 'img/unavailable.gif',
                      xa             : 'img/xa.gif'
                    }, // presence icons utilized by the application
  pMsgs           : {
                      available      : 'Available to chat',
                      away           : 'I am currently away',
                      chat           : 'I am available to chat',
                      dnd            : 'Please do not disturb me',
                      offline        : 'User is offline',
                      unavailable    : 'User is offline / unavailable',
                      xa             : 'User is currently extended away'
                    }, // default messages for user status when in chat windows
  srvUrls         : {
                      getconfig      : '/config',
                      updateconfig   : '/config/update',
                      savechat       : '/xmppchat/save',
                      savevcard      : '/vcard/save'
                    }, // server urls for sending information if you are tying the client to a server
  openWins        : new Array(), // an array of all the open windows the application has open
  WINOPTS         : {
                      ADDUSER        : 'width=450, height=350, scrollbars=1, resizable=0, location=0, top=25',
                      ARCHIVE        : 'width=450, height=500, scrollbars=0, resizable=0, location=0, top=25',
                      BOOKMARKS      : 'width=500, height=265, scrollbars=0, resizable=0, location=0, top=25',
                      CONFIGURATION  : 'width=580, height=380, scrollbars=0, resizable=0, location=0, top=25',
                      HEADLINEMSG    : 'width=600, height=400, scrollbars=1, resizable=1, location=0, top=25',
                      HELP           : 'width=1024, height=768, scrollbars=1, resizable=1, location=0, top=25',
                      MSG            : 'width=600, height=500, scrollbars=1, resizable=1, location=0, top=25',
                      MUCINVITE      : 'width=500, height=200, scrollbars=0, resizable=0, location=0, top=25',
                      MUC            : 'width=650, height=700, scrollbars=1, resizable=1, location=0, top=25',
                      MUCCONFIG      : 'width=850, height=600, scrollbars=1, resizable=1, location=0, top=25',
                      PRIVACYLIST    : 'width=1000, height=400, scrollbars=0, resizable=0, location=0, top=25',
                      PRESENCEOTHER  : 'width=400, height=170, scrollbars=0, resizable=0, location=0, top=25',
                      SUBSCRIPTION   : 'width=450, height=250, scrollbars=0, resizable=0, location=0, top=25',
                      TRANSLATE      : 'width=450, height=150, scrollbars=0, resizable=0, location=0, top=25',
                      UNSUBSCRIBE    : 'width=300, height=100, scrollbars=0, resizable=0, location=0, top=25',
                      UPDATEUSER     : 'width=450, height=215, scrollbars=0, resizable=0, location=0, top=25',
                      USERDETAILS    : 'width=400, height=375, scrollbars=0, resizable=0, location=0, top=25',
                      VCARD          : 'width=500, height=700, scrollbars=0, resizable=0, location=0, top=25'
                    }, // all window options utilized by the client
  xc_archive      : 0, // try using XEP-0136 for archiving conversations on the server
  xc_showoffline  : 1, // show offline users defaulting this to true so it will show them
  xc_showtimestamps : 0, // show timestamps in conversations
  xc_emptygroups  : 0, // show empty groups
  xc_sendbutton   : 1, // show send buttons in Group and One on One chat
  xc_translation  : 0, // will do real time translation if activated
  xc_translation_lge : 'en', // language to translate into
  xcfontsize      : 'client.css' // stylesheet to utilize
};

var NS_PING       = "urn:xmpp:ping";
var NS_XEP0136NS  = "http://www.xmpp.org/extensions/xep-0136.html#ns";
var NS_RSM        = "http://jabber.org/protocol/rsm";
var NS_OFFLINE    = "http//jabber.org/protocol/offline"; // xep-0013
var NS_X_ROOMUSER = "x-roomuser-item"; // XEP-0045 Room NickName

/**
 * Service discovery variable required to determine what is supported or not
 */
var xmppclient_xdata     = 0;
var xmppclient_last      = 0;
var xmppclient_offline   = 0;
var xmppclient_vcard     = 0;
var xmppclient_search    = 0;
var xmppclient_version   = 0;
var xmppclient_privacy   = 0;
var xmppclient_archiving = 0;
var xmppclient_ping      = 0;

