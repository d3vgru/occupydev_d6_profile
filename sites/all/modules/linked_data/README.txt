$Id: README.txt,v 1.1 2010/09/17 22:13:48 febbraro Exp $

Linked Data Module
---------------------------------------
This is a developer centric module that aims to provide the ability to 
create & export SPARQL aor MQL queries and execute them programatically.
It has a very simple sstring replace mechanism for specifying variables 
in the queries.

USAGE
---------------------------------------

* Create a Linked Data Query
    Do this from Site Building -> Linked Data Query.  You can create "Normal" queries,
    or include "Default" queries from your modules.

* Execute a query and do what you want with the results

    linked_data_query_execute($query $args)
       This takes a Query object as loaded from linked_data_query_load and an associative
       array of arguments.  They keys of the args will be searched in the Query and replaced,
       for example if your arg key is guid, then all occurrences of $guid in the Query body 
       will be replaced by the value before execution.  THe results fo the query execution are
       returned in an associative array.

* Execute a query and theme the results

    linked_data_query_render($query_name $args)
       This takes a Query machine name and query arguments. It loads and executes the query 
       and processes the results with the Linked Data module theme system.  The return is
       the string output of the theme system.

THEME
-----------------------------------------
There are a few levels of theme-ability for the Linked Data Query results.  They can be 
thought of as very similar to Views themeing.

* Box level
    linked-data.tpl.php
    linked-data--[machine_name].tpl.php

* Row level:
    linked-data-row.tpl.php
    linked-data-row--[machine_name].tpl.php

* Field level:
    linked-data-field.tpl.php
    linked-data-field--[machine_name].tpl.php
    linked-data-field--[field name].tpl.php
    linked-data-field--[machine_name]-[field name].tpl.php
    
NOTE: If you want to implement one of the variable suggestions TPLs you need to also include 
the base TPL in your theme as well.  For example, if you want to implement 
linked-data-row--[machine_name].tpl.php then you need linked-data-row.tpl.php in your theme
as well.
