<?php
/**
 * @file views-view-row-activity-rss.tpl.php
 * Default view template to display an activity item in an RSS feed.
 */
?>
  <item>
    <title><?php print $message; ?></title>
    <link><?php print $node_link; ?></link>
    <author><?php print $user_link; ?></author>
    <pubDate><?php print $created; ?></pubDate>
  </item>