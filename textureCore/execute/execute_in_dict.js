var miscutils 			= require('./../miscutils');
var _ 					= require('lodash');
var regex_executor 		= require('./execute_regex.js');
var is_entity_executor 	= require('./execute_is_entity.js');
/*
	Return the substring that is extracted from the dictionary entry's execution on string
	in the standard form e.g. {operator:'in', result:___}
	@concept_dictionary, is the name of the dictionary e.g. "name_dictionary". 
	@dictionary is an array of what is contained in @concept_dictionary 
	e.g. [{type: text, content:"Maeda"}, {type: regex, content:"/[A-Z]+/"}, {type:entity, content:"Person"}]
*/
function inDict(concept_dictionary, dictionary, string){

	var Q           = require('Q');
    var deferred    = Q.defer();

	miscutils.logMessage('String: ' + string, 							2);

	var g = 0;
	miscutils.promise_while(function(){ 												// Condition
 		return g < dictionary.length;
 	}, function(){																		// Action
		var dict_entry 		= _.clone(dictionary[g], 				true);	
		g++;
		return dictionaryEntryCheck(dict_entry, string); 								// Find a match between a string's substring and a dictionary's entry 	
 	
 	}).then(function(results_dict_execute){
		
		var filter = _.filter(results_dict_execute, function(elem){ 					//  Filter out the elements that are null/undefined
			return 'result' in elem && elem.result!=undefined && elem.result!=null;
		});																				// filter[] contains [{operator:in, result:___}, {operator:in, result:___}], where each elem corresponds to a dictionary entry
									
 		miscutils.logMessage("Results of whole dictionary execution: ", 2);
 		miscutils.logMessage(filter, 									2);

 		deferred.resolve({'operator':'in', 'result':filter});
 	});

	return deferred.promise;
}
exports.inDict = inDict;

/*
	The code that executes the dictionary entry
	@dict_entry e.g. {type: regex, content:"/[A-Z]+/"} or any element from a dictionary array
	@string is the string to operate the dictionary check against
	@return is a promise, the promise returns the execution result of a dictonary entry on the string e.g. {operator:___', result:__ }
*/
function dictionaryEntryCheck(dict_entry, string){
	var Q           = require('Q');
    var deferred    = Q.defer();

	miscutils.logMessage( 'Dictionary entry: ', 						2);
	miscutils.logMessage( dict_entry, 									2);
	
	if(dict_entry.type == 'entity'){											// A dictionary content can be an entity type 
		var entity 		= dict_entry.content;
		var op_params 	= [entity, string];										// Parameters to pass to isOp function for evaluating e.g. [entity_type, string_to_operate_on]
		is_entity_executor.isOp.apply(string, op_params).then(function(entity_arr){				// {operator:is, result:arr}, where arr is an array of entities of type entity e.g. "Person" found e.g. ["Maeda", "Amos"]
			miscutils.logMessage("Dict def is entity type:" + entity_arr, 		2);
			miscutils.logMessage('________________________________________', 	2);

			deferred.resolve( {'operator':'is', 'result':entity_arr.result} );	
		});

	}else if(dict_entry.type == 'regex' || dict_entry.type == 'text'){			// Otherwise a dictionary can be a regex or text type
		var regex_string, regex_flags, match;

		if (dict_entry.type == 'regex'){
			regex_string 	= dict_entry.content[0];
			regex_flags 	= dict_entry.content[1];
			match 			= regex_executor.regular_expression(regex_string, regex_flags, string).result;
		}else if(dict_entry.type == 'text'){
			regex_string 	= dict_entry.content;
			match 			= regex_executor.regular_expression(regex_string, regex_flags, string).result;
		}
		
		miscutils.logMessage( 'Regex string: ' + regex_string, 				2);
		miscutils.logMessage( 'Match between Regex and Dict Entry: ', 		2);
		miscutils.logMessage( match, 										2);
		miscutils.logMessage( '________________________________________', 	2);

		if (match != null && match != undefined){
			deferred.resolve( {'operator':'regular_expression', 'result':match} );		
		}else{
			deferred.resolve( {'operator':'regular_expression', 'result':undefined} );
		}
	}
	return deferred.promise;
}