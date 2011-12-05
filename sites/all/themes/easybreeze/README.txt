ABOUT EAZY BREEZE
----------------------

This is a re-implementation of the Easy Breeze theme by Igor Jovic. This is a
tableless, multi-column, fluid width layout. Parts of the design are ported
from Contented7, Internet Services and Interactive Media theme. This theme is
part of the project PantaRei Siren.

Official Easy Breeze project page:
  http://www.spinz.se/Templates/EasyBreeze/index.htm

Drupal Easy Breeze project page:
  http://drupal.org/project/easybreeze/
  http://pantarei-design.com/projects/easybreeze/

PantaRei Siren project page:
  http://drupal.org/project/pantarei_siren
  http://drupal.org/project/pantarei_siren_core

Sponsored by:
  http://pantarei-design.com/


HOWTO INSTALL THIS THEME? (>= 6.x-2.x)
----------------------

Since 6.x-2.x this theme is now completely revamp as Zen subtheme
(http://drupal.org/project/zen). Therefore you should also install Zen into
your setup in order to make this theme works. Some suggested procedure:

  1. Download and install Zen latest stable version into your sites/all/themes,
     e.g. sites/all/themes/zen.
  2. Download and install this theme into your sites/all/themes, e.g.
     sites/all/themes/my_zen_subtheme.
  3. Enable your theme (but not required to enable Zen).


HOWTO CHANGE THE LAYOUT SETTING? (>= 6.x-2.x)
----------------------

This theme now support with both fixed/fluid/liquid width layout design, all
based on 960 Grid System (http://960.gs/).

In order to change your layout design, you should go to the theme configuration
page, change the setting under "Theme Development Settings -> Layout method".

Once saved you may also need to flush your Drupal cache the refresh with new
layout.


HOWTO CUSTOMIZE THIS THEME? (>= 6.x-2.x)
----------------------

For theme customization usually you will need to change the style.css. By the
way this traditional method is not too flexible.

This theme provide a hook called as custom.css. The custom.css will always
override default style.css setting, and will not be covered during version
upgrade. Benefit of using this hook including:

  1. Your customization will NOT get mixed with original theme style.
  2. Your customization will NOT be override during theme upgrade.

This theme also provide some example for customization within custom.css.txt,
divided into section by section. You can copy-and-paste them to your custom.css
and feel free to change it.


ABOUT RTL SUPPORT (>= 6.x)
----------------------

This theme is RTL supported, and fully tested with Acid2 compatible browsers,
e.g. IE 9, FireFox 5, Chrome 12, Opera 11 and Safari5. However, other browser
such as FireFox2 and Internet Explorer 6/7/8 may looks buggy.

As the implementation is validate with XHTML and CSS2 coding standard, I am not
going to provide browser-specific hack, for both LTR and RTL.

For more information about Acid2:
  http://en.wikipedia.org/wiki/Acid2

To test your browser with Acid2:
  http://www.webstandards.org/files/acid2/test.html


LIST OF MAINTAINERS
----------------------

PROJECT OWNER
M: Edison Wong <hswong3i@gmail.com>
S: maintained
W: http://edin.no-ip.com/
