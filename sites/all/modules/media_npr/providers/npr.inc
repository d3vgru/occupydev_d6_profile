<?php

/**
 * @file
 *  This is an npr provider include file for Embedded Media audio.
 *  Use this as a base for creating new provider files.
 *
 *  When using this, first make the following global replacements:
 *    * Replace npr with the name of your provider in all caps.
 *    * Replace npr with the name of your provider in all lower case.
 *    * Replace npr with the name (to be translated) of your provider in
 *        uppercase.
 *
 *  You then need to go through each function and modify according to the
 *  requirements of your provider's API.
 */

/**
 *  This is the main URL for your provider.
 */
define('EMAUDIO_NPR_MAIN_URL', 'http://npr.org');

/**
 *  This is the URL to the API of your provider, if this exists.
 */
define('EMAUDIO_NPR_API_URL', 'http://npr.org/api');

/**
 *  This defines the version of the content data array that we serialize
 *  in emaudio_npr_data(). If we change the expected keys of that array,
 *  we must increment this value, which will allow older content to be updated
 *  to the new version automatically.
 */
define('EMAUDIO_NPR_DATA_VERSION', 1);

/**
 * hook emaudio_PROVIDER_info
 * This returns information relevant to a specific 3rd party audio provider.
 *
 * @return
 *   A keyed array of strings requested by various admin and other forms.
 *    'provider' => The machine name of the provider. This must be the same as
 *      the base name of this filename, before the .inc extension.
 *    'name' => The translated name of the provider.
 *    'url' => The url to the main page for the provider.
 *    'settings_description' => A description of the provider that will be
 *      posted in the admin settings form.
 *    'supported_features' => An array of rows describing the state of certain
 *      supported features by the provider. These will be rendered in a table,
 *      with the columns being 'Feature', 'Supported', 'Notes'. In general,
 *      the 'Feature' column will give the name of the feature, 'Supported'
 *      will be Yes or No, and 'Notes' will give an optional description or
 *      caveats to the feature.
 */
function emaudio_npr_info() {
  $features = array(
    array(t('Autoplay'), t('No'), ''),
    array(t('RSS Attachment'), t('No'), ''),
    array(t('Thumbnails'), t('No'), t('')),
  );
  return array(
    'provider' => 'npr',
    'name' => t('npr'),
    'url' => EMAUDIO_NPR_MAIN_URL,
    'settings_description' => t('These settings specifically affect audio played from !npr. You can also read more about its !api.', array('!npr' => l(t('npr.com'), EMAUDIO_npr_MAIN_URL), '!api' => l(t("developer's API"), EMAUDIO_npr_API_URL))),
    'supported_features' => $features,
  );
}

/**
 *  hook emaudio_PROVIDER_settings
 *  This should return a subform to be added to the emaudio_settings() admin
 *  settings page.
 *
 *  Note that a form field set will already be provided at $form['npr'],
 *  so if you want specific provider settings within that field set, you should
 *  add the elements to that form array element.
 */
function emaudio_npr_settings() {
  // We'll add a field set of player options here. You may add other options
  // to this element, or remove the field set entirely if there are no
  // user-configurable options allowed by the npr provider.
  $form = array();
  $form['npr']['media_npr_api_key'] = array(
    '#type' => 'textfield',
    '#title' => t('Open API Key'),
    '#description' => t('Your npr Open API Key'),
    '#default_value' => variable_get('media_npr_api_key', ''),
    '#size' => 40,
    '#maxlength' => 40,
  );
  $media_options = array('default' => 'Default Player', 'wm' => 'Windows Media', 'rm' => 'Real Media', mp3 => 'MP3');
  $form['npr']['media_npr_default_format'] = array(
    '#type' => 'select',
	'#title' => t('Media Format'),
	'#description' => t('The desired media format from NPR'),
	'#default_value' => variable_get('media_npr_default_format', 'default'), 
	'#options' => $media_options,
  );	
  return $form;
}

/**
 *  hook emaudio_PROVIDER_extract
 *
 *  This is called to extract the audio code from a pasted URL or embed code.
 *
 *  We'll be passed a URL or the embed code from a audio when an editor pastes
 *  that in the field's textfield. We'll need to either pass back an array of
 *  regex expressions to match, or do the matching ourselves and return the
 *  resulting audio code.
 *
 *  @param $parse
 *    An optional string with the pasted URL or embed code.
 *  @return
 *    Either an array of regex expressions to be tested, or a string with the
 *    audio code to be used. If the hook tests the code itself, it should
 *    return either the string of the audio code (if matched), or an empty
 *    array. Otherwise, the calling function will handle testing the embed code
 *    against each regex string in the returned array.
 */
function emaudio_npr_extract($parse = '') {
  // We'll simply return an array of regular expressions for Embedded Media
  // Field to handle for us.
  return array(
    // First test for the embed code.
    //http://www.npr.org/templates/story/story.php?storyId=113653755
	//<embed src="http://www.npr.org/v2/?i=113834285&#38;m=113856702&#38;t=audio" height="383" wmode="opaque" width="400" base="http://www.npr.org"></embed>
    '@npr\.org/v2/\?i\=([^\&]+)@i',
    '@npr\.org/templates/story/story\.php\?storyId\=([^\&]+)@i',
    '@npr\.org/[0-9]+/[0-9]+/[0-9]+/([0-9]+)@i',
  );
}

/**
 *  Implement hook EMAUDIO_PROVIDER_data_version().
 */
function emaudio_npr_data_version() {
  return EMAUDIO_NPR_DATA_VERSION;
}

/**
 *  hook emaudio_PROVIDER_data
 *
 *  Provides an array to be serialised and made available with $item elsewhere.
 *
 *  This data can be used to store any extraneous information available
 *  specifically to the npr provider.
 */
function emaudio_npr_data($field, $item) {
  $data = array();
  $apikey = variable_get('npr_api_key', '');
  $data = emfield_request_xml('npr', 'http://api.npr.org/query?id='. $item['value'] .'&output=MediaRSS&apiKey='. $apikey, array(), TRUE, FALSE, $item['value']);
  $data['audio_id'] = $item['value'];
  $data['emaudio_npr_version'] = EMAUDIO_NPR_DATA_VERSION;
  // this is a really hacky way to get the MP3 format
  // not really sure why, but I can't access that format 
  // without knowing this 'other' id
  // I don't even really know what the arg 'f=' represents
  
  $url_array = parse_url($data['FORMAT']['WM']['0']);
  parse_str($url_array['query'], $query_array);  
  $data['other_id'] = $query_array['id'];
  return $data;
}


/**
 * hook emaudio_PROVIDER_embedded_link($code)
 * returns a link to view the audio at the provider's site.
 *  @param $code
 *    The string containing the audio code.
 *  @return
 *    A string containing the URL to listen to the audio at the original provider's site.
 */
function emaudio_npr_embedded_link($code) {
  return 'http://www.npr.org/templates/story/story.php?storyId='. $code;
}

/**
 * The embedded flash displaying the npr audio.
 */
function theme_emaudio_npr_flash($item, $code, $width, $height, $autoplay, $options) {
  $output = '';
  $audio_id = $item['value'];
  $format = variable_get('media_npr_default_format', '');
  $other_id = $item['data']['other_id'];
  $rm_format = $item['data']['FORMAT']['RM']['0'];
  $wm_format = $item['data']['FORMAT']['WM']['0'];
  
  //this is where we actually use that other_id
  $mp3_format = $item['data'][$other_id]['FORMAT']['MP3']['0'];
  
  if ($item['value']) {
    switch($format) {
	  case 'default':
        $output = '<embed src="http://www.npr.org/v2/?i=' . $audio_id . '" height="383"  wmode="opaque" width="400" base="http://www.npr.org"</embed>';
		break;
	  case 'rm':
	    $output = '<embed src="'. $rm_format .'" type="audio/x-pn-realaudio-plugin">';
		break;
	  case 'wm';
	    $output = '<embed src="'. $wm_format .'" type="application/x-mplayer2">';
		break;
	  case 'mp3';
	    $output = '<embed src="'. $mp3_format .'" type="audio/mpeg">';
		break;
	}
  }
  return $output;
}

/*
 *  hook emaudio_PROVIDER_audio
 *  This actually displays the full/normal-sized audio we want, usually on the
 *  default page view.
 *  @param $embed
 *  @param $width
 *    The width to display the audio.
 *  @param $height
 *    The height to display the audio.
 *  @param $field
 *    The field info from the requesting node.
 *  @param $item
 *    The actual content from the field.
 *  @return
 *    The html of the embedded audio.
 */
function emaudio_npr_audio($code, $width, $height, $field, $item, &$node, $autoplay, $options = array()) {
 $output = theme('emaudio_npr_flash', $item, $code, $width, $height, $autoplay, $options);
 return $output;
}

/**
 *  hook emaudio_PROVIDER_preview
 *
 *  This actually displays the preview-sized audio we want, commonly for the
 *  teaser.
 *  @param $embed
 *    The audio code for the audio to embed.
 *  @param $width
 *    The width to display the audio.
 *  @param $height
 *    The height to display the audio.
 *  @param $field
 *    The field info from the requesting node.
 *  @param $item
 *    The actual content from the field.
 *  @return
 *    The html of the embedded audio.
 */

function emaudio_npr_preview($code, $width, $height, $field, $item, &$node, $autoplay, $options = array()) {
  $output = theme('emaudio_npr_flash', $item, $code, $width, $height, $autoplay, $options);
  return $output;
}

/**
 *  Implementation of hook_emfield_subtheme.
 *  This returns any theme functions defined by this provider.
 */
function emaudio_npr_emfield_subtheme() {
  $themes = array(
    'emaudio_npr_flash'  => array(
      'arguments' => array('code' => NULL, 'width' => NULL, 'height' => NULL, 'autoplay' => NULL, 'options' =>NULL,),
      'file' => 'providers/npr.inc',
      'path' => drupal_get_path('module', 'media_npr'),
    )
  );
  return $themes;
}
