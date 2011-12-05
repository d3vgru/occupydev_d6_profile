<?php
/**
 * XMPPHP: The PHP XMPP Library
 * Copyright (C) 2008  Nathanael C. Fritz
 * This file is part of SleekXMPP.
 *
 * XMPPHP is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * XMPPHP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XMPPHP; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * @category   xmpphp
 * @package	XMPPHP
 * @author	 Nathanael C. Fritz <JID: fritzy@netflint.net>
 * @author	 Stephan Wentz <JID: stephan@jabber.wentz.it>
 * @copyright  2008 Nathanael C. Fritz
 */

/** XMPPHP_XMLStream */
require_once "XMLStream.php";

/**
 * XMPPHP Main Class
 *
 * @category   xmpphp
 * @package	XMPPHP
 * @author	 Nathanael C. Fritz <JID: fritzy@netflint.net>
 * @author	 Stephan Wentz <JID: stephan@jabber.wentz.it>
 * @copyright  2008 Nathanael C. Fritz
 * @version	$Id: XMPP.php,v 1.1.4.1 2009/08/27 21:46:42 darrenferguson Exp $
 */
class XMPPHP_XMPP extends XMPPHP_XMLStream {
	/**
	 * @var string
	 */
	protected $server;

	/**
	 * @var string
	 */
	protected $user;

	/**
	 * @var string
	 */
	protected $password;

	/**
	 * @var string
	 */
	protected $resource;

	/**
	 * @var string
	 */
	protected $fulljid;

	/**
	 * @var string
	 */
	protected $basejid;

	/**
	 * @var boolean
	 */
	protected $authed = false;

	/**
	 * @var boolean
	 */
	protected $auto_subscribe = true;

	/**
	 * @var boolean
	 */
	protected $use_encryption = true;

	/**
	 * Constructor
	 *
	 * @param string  $host
	 * @param integer $port
	 * @param string  $user
	 * @param string  $password
	 * @param string  $resource
	 * @param string  $server
	 * @param boolean $printlog
	 * @param string  $loglevel
	 */
	public function __construct($host, $port, $user, $password, $resource, $server = null, $printlog = false, $loglevel = null) {
		parent::__construct($host, $port, $printlog, $loglevel);

		$this->user	 = $user;
		$this->password = $password;
		$this->resource = $resource;
		if(!$server) $server = $host;
		$this->basejid = $this->user . '@' . $this->host;

		$this->stream_start = '<stream:stream to="' . $server . '" xmlns:stream="http://etherx.jabber.org/streams" xmlns="jabber:client" version="1.0">';
		$this->stream_end   = '</stream:stream>';
		$this->default_ns   = 'jabber:client';

		$this->addHandler('features', 'http://etherx.jabber.org/streams', 'features_handler');
		$this->addHandler('success', 'urn:ietf:params:xml:ns:xmpp-sasl', 'sasl_success_handler');
		$this->addHandler('failure', 'urn:ietf:params:xml:ns:xmpp-sasl', 'sasl_failure_handler');
		$this->addHandler('proceed', 'urn:ietf:params:xml:ns:xmpp-tls', 'tls_proceed_handler');
		$this->addHandler('message', 'jabber:client', 'message_handler');
		$this->addHandler('presence', 'jabber:client', 'presence_handler');
	}

	/**
	 * Turn encryption on/ff
	 *
	 * @param boolean $useEncryption
	 */
	public function useEncryption($useEncryption = true) {
		$this->use_encryption = $useEncryption;
	}

	/**
	 * Turn on auto-authorization of subscription requests.
	 *
	 * @param boolean $autoSubscribe
	 */
	public function autoSubscribe($autoSubscribe = true) {
		$this->auto_subscribe = $autoSubscribe;
	}

	/**
	 * Send XMPP Message
	 *
	 * @param string $to
	 * @param string $body
	 * @param string $type
	 * @param string $subject
	 */
	public function message($to, $body, $type = 'chat', $subject = null, $payload = null) {
		$to	  = htmlspecialchars($to);
		$body	= htmlspecialchars($body);
		$subject = htmlspecialchars($subject);

		$out = "<message from='{$this->fulljid}' to='$to' type='$type'>";
		if($subject) $out .= "<subject>$subject</subject>";
		$out .= "<body>$body</body>";
		if($payload) $out .= $payload;
		$out .= "</message>";

		$this->send($out);
	}

	/**
	 * Set Presence
	 *
	 * @param string $status
	 * @param string $show
	 * @param string $to
	 */
	public function presence($status = null, $show = 'available', $to = null, $type='available') {
		if($type == 'available') $type = '';
		$to	 = htmlspecialchars($to);
		$status = htmlspecialchars($status);
		if($show == 'unavailable') $type = 'unavailable';

		$out = "<presence";
		if($to) $out .= " to='$to'";
		if($type) $out .= " type='$type'";
		if($show == 'available' and !$status) {
			$out .= "/>";
		} else {
			$out .= ">";
			if($show != 'available') $out .= "<show>$show</show>";
			if($status) $out .= "<status>$status</status>";
			$out .= "</presence>";
		}

		$this->send($out);
	}

	/**
	 * Message handler
	 *
	 * @param string $xml
	 */
	public function message_handler($xml) {
		if(isset($xml->attrs['type'])) {
			$payload['type'] = $xml->attrs['type'];
		} else {
			$payload['type'] = 'chat';
		}
		$payload['from'] = $xml->attrs['from'];
		$payload['body'] = $xml->sub('body')->data;
		$this->log->log("Message: {$xml->sub('body')->data}", XMPPHP_Log::LEVEL_DEBUG);
		$this->event('message', $payload);
	}

	/**
	 * Presence handler
	 *
	 * @param string $xml
	 */
	public function presence_handler($xml) {
		$payload['type'] = (isset($xml->attrs['type'])) ? $xml->attrs['type'] : 'available';
		$payload['show'] = (isset($xml->sub('show')->data)) ? $xml->sub('show')->data : $payload['type'];
		$payload['from'] = $xml->attrs['from'];
		$payload['status'] = (isset($xml->sub('status')->data)) ? $xml->sub('status')->data : '';
		$this->log->log("Presence: {$payload['from']} [{$payload['show']}] {$payload['status']}",  XMPPHP_Log::LEVEL_DEBUG);
		if(array_key_exists('type', $xml->attrs) and $xml->attrs['type'] == 'subscribe') {
			if($this->auto_subscribe) $this->send("<presence type='subscribed' to='{$xml->attrs['from']}' from='{$this->fulljid}' /><presence type='subscribe' to='{$xml->attrs['from']}' from='{$this->fulljid}' />");
			$this->event('subscription_requested', $payload);
		} elseif(array_key_exists('type', $xml->attrs) and $xml->attrs['type'] == 'subscribed') {
			$this->event('subscription_accepted', $payload);
                } elseif(array_key_exists('type', $xml->attrs) and $xml->attrs['type'] == 'unsubscribe') {
                        $this->event('unsubscribe_request', $payload);
                } elseif(array_key_exists('type', $xml->attrs) and $xml->attrs['type'] == 'unsubscribed') {
                        $this->event('unsubscribed_accepted', $payload);
		} else {
			$this->event('presence', $payload);
		}
	}

	/**
	 * Features handler
	 *
	 * @param string $xml
	 */
	protected function features_handler($xml) {
		if($xml->hasSub('starttls') and $this->use_encryption) {
			$this->send("<starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'><required /></starttls>");
		} elseif($xml->hasSub('bind')) {
			$id = $this->getId();
			$this->addIdHandler($id, 'resource_bind_handler');
			$this->send("<iq xmlns=\"jabber:client\" type=\"set\" id=\"$id\"><bind xmlns=\"urn:ietf:params:xml:ns:xmpp-bind\"><resource>{$this->resource}</resource></bind></iq>");
		} else {
			$this->log->log("Attempting Auth...");
			$this->send("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='PLAIN'>" . base64_encode("\x00" . $this->user . "\x00" . $this->password) . "</auth>");
		}
	}

	/**
	 * SASL success handler
	 *
	 * @param string $xml
	 */
	protected function sasl_success_handler($xml) {
		$this->log->log("Auth success!");
		$this->authed = true;
		$this->reset();
	}

	/**
	 * SASL feature handler
	 *
	 * @param string $xml
	 */
	protected function sasl_failure_handler($xml) {
		$this->log->log("Auth failed!",  XMPPHP_Log::LEVEL_ERROR);
		$this->disconnect();

		throw new XMPPHP_Exception('Auth failed!');
	}

	/**
	 * Resource bind handler
	 *
	 * @param string $xml
	 */
	protected function resource_bind_handler($xml) {
		if($xml->attrs['type'] == 'result') {
			$this->log->log("Bound to " . $xml->sub('bind')->sub('jid')->data);
			$this->fulljid = $xml->sub('bind')->sub('jid')->data;
		}
		$id = $this->getId();
		$this->addIdHandler($id, 'session_start_handler');
		$this->send("<iq xmlns='jabber:client' type='set' id='$id'><session xmlns='urn:ietf:params:xml:ns:xmpp-session' /></iq>");
	}

	/**
	* Retrieves the roster
	*
	*/
	public function getRoster() {
		$id = $this->getID();
		$this->addIdHandler($id, 'roster_get_handler');
		$this->send("<iq xmlns='jabber:client' type='get' id='$id'><query xmlns='jabber:iq:roster' /></iq>");
	}

	/**
	* Roster retrieval handler
	*
	* @param string $xml
	*/
	protected function roster_get_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('roster_received', 'error');
                                break;
                        case 'result':
                                $roster = array();
                                $query = $xml->sub('query');
                                foreach ($query->subs as $sub) {
                                        $jid = $sub->attrs['jid'];
                                        $roster[$jid] = array(
                                                'name' => $sub->attrs['name'],
                                                'subscription' => $sub->attrs['subscription'],
                                        );
                                        if ($sub->subs && is_array($sub->subs)) {
                                                $groups = array();
                                                foreach ($sub->subs as $key => $group) {
                                                        $groups[] = $group->data;
                                                }
                                                $roster[$jid] = array_merge($roster[$jid], array('groups' => $groups));
                                        }
                                }
                                $this->event('roster_received', $roster);
                                break;
                        default:
                                $this->event('roster_received', 'default');
                }
	}

        /**
        * Retrieves the vcard
        *
        */
        public function getVCard() {
                $id = $this->getID();
                $this->addIdHandler($id, 'vcard_get_handler');
                $this->send("<iq type='get' id='$id'><vCard xmlns='vcard-temp' /></iq>");
        }

        /**
        * VCard retrieval handler
        *
        * @param XML Object $xml
        */
        protected function vcard_get_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('vcard_received', 'error');
                                break;
                        case 'result':
                                $vcard = array();
                                $element = $xml->sub('vcard');
                                // go through all of the sub elements and add them to the vcard array
                                foreach ($element->subs as $sub) {
                                        if (preg_match('/button/', $sub->name)) { continue; }
                                        $vcard[$sub->name] = $sub->data;
                                        if ($sub->subs) {
                                                foreach ($sub->subs as $child) {
                                                        $vcard[$sub->name][$child->name] = $child->data;
                                                }
                                        }
		                }
                                $this->event('vcard_received', $vcard);
                                break;
                        default:
                                $this->event('vcard_received', 'default');
                }
        }

        /**
        * VCard save function
        *
        * Below is an example of the array structure being passed for sending VCards
        * $vcard = array();
        * $vcard['fn'] = 'Test Example User';
        * $vcard['n'] = array('middle' => 'Example', 'first' => 'Test', 'Last' => 'User');
        * $vcard['nickname'] = 'Herbert';
        * $vcard['bday'] = '02/12/2001';
        * @param array with VCard information
        */
        public function sendVCard($vcard) {
                // if not an array return since we do not handle that
                if (!is_array($vcard)) {
                        return FALSE;
                }
                $id = $this->getID();
                $xml = "<iq type='set' id='$id'>";
                $xml .= "<vCard xmlns='vcard-temp'>";

                foreach ($vcard as $key => $element) {
                        $xml .= "<$key>";
                        if (is_array($element)) {
                                foreach ($element as $child_key => $child_element) {
                                        $xml .= "<$child_key>". $child_element ."</$child_key>";
                                }
                        }
                        else {
                                $xml .= $element;
                        }
                        $xml .= "</$key>";
                }
                $xml .= "</vCard></iq>";
                $this->addIdHandler($id, 'vcard_set_handler');
		$this->send($xml);
        }

        /**
        * Handler for saving the vcard
        *
        * @param XML Object $xml
        */
        protected function vcard_set_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('vcard_saved', 'error');
                                break;
                        case 'result':
                                $this->event('vcard_saved', 'result');
                                break;
                        default:
                                $this->event('vcard_saved', 'default');
                }
        }

        /**
        * Add contact to your roster
        *
        *
        */
        public function addRosterContact($jid, $name, $groups = array()) {
                // return if there is no jid specified
                if (!$jid) { return; }
                // set name to the jid if none is specified
                if (!$name) { $name = $jid; }
                $id = $this->getID();
                $xml = "<iq type='set' id='$id'>";
                $xml .= "<query xmlns='jabber:iq:roster'>";
                $xml .= "<item jid='$jid' name='$name'>";
                foreach ($groups as $group) {
                        $xml .= "<group>$group</group>";
                }
                $xml .= "</item>";
                $xml .= "</query>";
                $xml .= "</iq>";
                $this->addIdHandler($id, 'add_roster_contact_handler');
		$this->send($xml);
        }

        /**
        *
        * @param XML Object $xml
        */
        protected function add_roster_contact_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('contact_added', 'error');
                                break;
                        case 'result':
                                $this->event('contact_added', 'result');
                                break;
                        default:
                                $this->event('contact_added', 'default');
                }
        }

        /**
        *
        *
        * @param $jid
        *       Contact you wish to remove
        */
        public function deleteRosterContact($jid) {
                $id = $this->getID();
                $xml = "<iq type='set' id='$id'>";
                $xml .= "<query xmlns='jabber:iq:roster'>";
                $xml .= "<item jid='$jid' subscription='remove' />";
                $xml .= "</query>";
                $xml .= "</iq>";
                $this->addIdHandler($id, 'delete_roster_contact_handler');
		$this->send($xml);
        }

        /**
        *
        * @param XML Object $xml
        */
        protected function delete_roster_contact_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('contact_removed', 'error');
                                break;
                        case 'result':
                                $this->event('contact_removed', 'result');
                                break;
                        default:
                                $this->event('contact_removed', 'default');
                }
        }

        /**
        * Discover what the xmpp server supports
        *
        * @param $entity
        *       Entity we want information about
        */
        public function serviceDiscovery($entity, $items) {
                $id = $this->getID();
                $xml = "<iq type='get' to='$entity' id='$id'>";
                if ($items) {
                  $xml .= "<query xmlns='http://jabber.org/protocol/disco#items' />";
                } else {
                  $xml .= "<query xmlns='http://jabber.org/protocol/disco#info' />";
                }
                $xml .= "</iq>";
                $this->addIdHandler($id, 'service_discovery_handler');
		$this->send($xml);
        }

        /**
        * Build the service discovery array for returning to the user
        *
        * @param XML Object $xml
        */
        protected function service_discovery_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('services_discovered', 'error');
                                break;
                        case 'result':
                                $service_discovery = array('features' => array(), 'identities' => array(), 'items' => array());
                                $query = $xml->sub('query');
                                foreach ($query->subs as $key => $value) {
                                        switch ($value->name) {
                                                case 'identity':
                                                        $category = $value->attrs['category'];
                                                        $type = $value->attrs['type'];
                                                        $name = $value->attrs['name'];
                                                        $service_discovery['identities'][$category] = array('type' => $type, 'name' => $name);
                                                        break;
                                                case 'feature':
                                                        // set the feature so we know it exists
                                                        $var = $value->attrs['var'];
                                                        $service_discovery['features'][$var] = 1;
                                                        break;
                                                case 'item':
                                                        $jid = $value->attrs['jid'];
                                                        $name = '';
                                                        $node = '';
                                                        if (isset($value->attrs['name'])) { $name = $value->attrs['name']; }
                                                        if (isset($value->attrs['node'])) { $node = $value->attrs['node']; }
                                                        $service_discovery['items'][$jid] = array('name' => $name, 'node' => $node);
                                                        break;
                                                default:
                                        }
                                }
                                $this->event('services_discovered', $service_discovery);
                                break;
                        default:
                                $this->event('services_discovered', 'default');
                }
        }

        /**
        * Function requests the delete user form xep-0133
        *
        * @param $server
        *       Servier we will remove the user from
        */
        public function deleteUserForm($server) {
                $id = $this->getID();
                $xml = "<iq id='$id' to='$server' type='set'>";
                $xml .= "<command xmlns='http://jabber.org/protocol/commands' action='execute' node='http://jabber.org/protocol/admin#delete-user' />";
                $xml .= "</iq>";
                $this->addIdHandler($id, 'delete_user_form_handler');
                $this->send($xml);
        }

        /**
        * Handles the form and returns it in an array
        *
        * @param $xml
        *       XML Object
        */
        protected function delete_user_form_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('form_returned', 'error');
                                break;
                        case 'result':
                                $command = $xml->sub('command');
                                $x = $command->sub('x');
                                $rarray = array('command' => array('xmlns' => $command->attrs['xmlns'], 'node' => $command->attrs['node'], 'sessionid' => $command->attrs['sessionid']));
                                foreach ($x->subs as $key => $value) {
                                        if ($value->name == 'field') {
                                                $rarray[$value->attrs['var']] = array('type' => $value->attrs['type']);
                                                if ($value->subs[0]->data) {
                                                        $rarray[$value->attrs['var']]['data'] = $value->subs[0]->data;
                                                }
                                        }
                                }
                                $this->event('form_returned', $rarray);
                        default:
                                $this->event('form_returned', 'default');
                }
        }

        /**
        * Send the packet submitting the form to delete the user
        *
        * @param $data
        *       Data array with all the pertinnt information
        */
        public function deleteUser($data = array()) {
                $xmlns = $data['command']['xmlns'];
                $node = $data['command']['node'];
                $sessionid = $data['command']['sessionid'];
                $id = $this->getID();
                $xml = "<iq id='$id' type='set' to='chat.openband.net'>";
                $xml .= "<command xmlns='$xmlns' node='$node' sessionid='$sessionid'>";
                $xml .= "<x xmlns='jabber:x:data' type='submit'>";
                foreach ($data as $key => $value) {
                        if ($key == 'command') { continue; }
                        if ($value['type'] == 'hidden') {
                                $xml .= "<field type='hidden' var='$key'>";
                        } else {
                                $xml .= "<field var='$key'>";
                        }
                        $val = $value['data'];
                        $xml .= "<value>$val</value>";
                        $xml .= "</field>";
                }
                $xml .= "</x></command></iq>";
                $this->addIdHandler($id, 'delete_user_handler');
                $this->send($xml);
        }

        /**
        * Handler to verify the user has been deleted
        *
        * @param $xml
        *       XML Object
        */
        protected function delete_user_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('user_deleted', 'error');
                                break;
                        case 'result':
                                $this->event('user_deleted', 'result');
                                break;
                        default:
                                $this->event('user_deleted', 'default');
                }
        }

        /**
        * Send initial presence to let them know we want to create a MUC
        *
        * @param $room
        *       Room you wish to create includes user nickname
        */
        public function sendInitialRoomPresence($room) {
                $id = $this->getID();
                $this->addIdHandler($id, 'initial_room_presence_handler');
                $this->send("<presence to='$room' id='$id' />");
        }

        /**
        * Handler function to make sure the request suceeded
        *
        * @param $xml
        *       XML Object
        */
        protected function initial_room_presence_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('initial_room_enter', 'error');
                                break;
                        case 'result':
                                $this->event('initial_room_enter', 'success');
                                break;
                        default:
                                $this->event('initial_room_enter', 'default');
                }
        }

        /**
        * Function requests room creation and will expect a form in return
        *
        * @param $room
        *       Room without the nickname this time
        */
        public function createMucRoom($room) {
                $id = $this->getId();
                $xml = "<iq id='$id' to='$room' type='get'>";
                $xml .= "<query xmlns='http://jabber.org/protocol/muc#owner'/>";
                $xml .= "</iq>";
                $this->addIdHandler($id, 'create_muc_handler');
                $this->send($xml);

        }

        /**
        * Function handles processing the form and returning it in an array
        *
        * @param $xml
        *       XML Object
        */
        protected function create_muc_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('muc_created', 'error');
                                break;
                        case 'result':
                                $query = $xml->sub('query');
                                $x = $query->sub('x');
                                $rarray = array();
                                foreach ($x->subs as $key => $value) {
                                        if ($value->name == 'field') {
                                                $rarray[$value->attrs['var']] = array('type' => $value->attrs['type']);
                                                if (isset($value->subs[0]->data)) {
                                                        $rarray[$value->attrs['var']]['data'] = $value->subs[0]->data;
                                                }
                                        }
                                }
                                $this->event('muc_created', $rarray);
                                break;
                        default:
                                $this->event('muc_created', 'default');
                }
        }

        /**
        * Function handlers the room form sending
        *
        * @param $data
        *       Array holding the form submission information
        */
        public function createMucRoomFormSend($to, $data = array()) {
                $id = $this->getId();
                $xml = "<iq type='set' id='$id' to='$to'>";
                $xml .= "<query xmlns='http://jabber.org/protocol/muc#owner'>";
                $xml .= "<x xmlns='jabber:x:data' type='submit'>";
                foreach ($data as $key => $value) {
                        if ($value['type'] == 'hidden') {
                                $xml .= "<field type='hidden' var='$key'>";
                        } else {
                                $xml .= "<field var='$key'>";
                        }
                        $val = $value['data'];
                        $xml .= "<value>$val</value>";
                        $xml .= "</field>";
                }
                $xml .= "</x></query></iq>";
                $this->addIdHandler($id, 'create_muc_room_form_send_handler');
                $this->send($xml);

        }

        /**
        * Function handlers verification that room was configured
        *
        * @param $xml
        *       XML Object
        */
        protected function create_muc_room_form_send_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('muc_configured', 'error');
                                break;
                        case 'result':
                                $this->event('muc_configured', 'result');
                                break;
                        default:
                                $this->event('muc_configured', 'default');
                }
        }

        /**
        * Function handlers the deteletion of muc rooms
        *
        * @param $room
        *       Room to delete
        * @param $reason
        *       Reason for deletion
        */
        public function removeMucRoom($room, $reason) {
                $id = $this->getId();
                $xml = "<iq id='$id' type='set' to='$room'>";
                $xml .= "<query xmlns='http://jabber.org/protocol/muc#owner'>";
                $xml .= "<destroy jid='$room'>";
                $xml .= "<reason>$reason</reason>";
                $xml .= "</destroy></query></iq>";
                $this->addIdHandler($id, 'remove_muc_handler');
                $this->send($xml);
        }

        /**
        * Handler for verification the room has been deleted
        *
        * @param $xml
        *       XML Object
        */
        protected function remove_muc_handler($xml) {
                switch ($xml->attrs['type']) {
                        case 'error':
                                $this->event('muc_removed', 'error');
                                break;
                        case 'result':
                                $this->event('muc_removed', 'success');
                                break;
                        default:
                                $this->event('muc_removed', 'default');
                }
        }


	/**
	 * Session start handler
	 *
	 * @param string $xml
	 */
	protected function session_start_handler($xml) {
		$this->log->log("Session started");
		$this->event('session_start');
	}

	/**
	 * TLS proceed handler
	 *
	 * @param string $xml
	 */
	protected function tls_proceed_handler($xml) {
		$this->log->log("Starting TLS encryption");
		stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_SSLv23_CLIENT);
		$this->reset();
	}
}
