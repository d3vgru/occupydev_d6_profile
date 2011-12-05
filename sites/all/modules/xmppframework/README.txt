/* $Id: */

The xmppframework module provides a framework and contributed modules for XMPP for Drual

The modules main purpose is too provide an api that other modules can utilize without worrying about
the underlying transport that is being utilized to fulfill the connection. 

INSTALLATION
------------

Install and enable the Xmppframework Drupal module as you would any Drupal module.

Configure the module at Administer > XMPPFramework

MODULE HOOKS
------------
The module provides hook_xmpp() which allows you to give an api that you wish to utilize for transport.
The hook will return information about the api and the relevant functions and supported functionality.

DEPENDENCIES
------------
Module is written purely for Drupal 6.x core.

CREDITS
-------
Developed and maintained by Darren Ferguson <darren.ferguson [at] openband [dot] net>
Sponsored by OpenBand <http://tech.openband.net/>
