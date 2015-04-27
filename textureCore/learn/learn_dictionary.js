/*
	Dictionary learner
*/
var miscutils 		= require('./../miscutils');
var _ 				= require('lodash');
var executor 		= require('./../execute/execute');

/*
	@highlights takes in a list of highlighted text and learns dictionaries that are applicable to @highlights
	@dictionaries is a list of dictionaries, see above for format of dictionary
*/
function learnInDict(highlights, dictionaries){
	var Q 			 	= require('Q');
 	var deferred   	 	= Q.defer();
	var text_highlight 	= _.pluck(highlights,   'text');				// An array of only the highlight's text that belong to this entity e.g. ['Ravi Amon', 'Chris Sample']
	var check_promises 	= [];

 	dictionaries.forEach(function(dictionary){							// dict_elem is {name:Schools, content:[{dict_entry}, ...]}
		check_promises.push(is_applicable(text_highlight, dictionary));
 	});
 	Q.all(check_promises).then(function(results){						// results contains an array of dictionaries that can describe the highlights , and -1's which will be removed
 		var clean_results = _.remove(results, function(dict_elem){
 			return dict_elem != -1;
 		});
 		miscutils.logMessage('Dictionaries that can describe the higlights:', 	1); 		
 		miscutils.logMessage(clean_results, 									1);
		deferred.resolve(clean_results);
 	});

	return deferred.promise; 	
}
exports.learnInDict = learnInDict;

/*
	@text_highlight is the array of highlights string e.g. ['Maeda', "Ravi"]
	@dictionary is a dictionary e.g. {name:Schools, content:[{dict_entry}, ...]}

	@return -1 if the dictionary cannot describe the set of highlights
*/
function is_applicable(text_highlight, dictionary){
	var Q 			 	= require('Q');
 	var deferred   	 	= Q.defer();
	var check_promises 	= [];
	
	for(var i=0; i<text_highlight.length; i++){ 								// Iterate over each highlight
		var text = text_highlight[i];
 		check_promises.push(is_dictionary_applicable(text, dictionary));		// For each highlight, check if there exists an entry that is able to describe the highlight.
	}

 	// Q.all gets an array of booleans with each element corresponds to a highlight (whether it can be described by dictionary) e.g. [ true, true, true, false, true ]
 	Q.all(check_promises).then(function(results){								// If a false exists in results, then there exists a highlight which cannot be described by the dictionary
 		miscutils.logMessage('Checking between elements in dictionary ' + dictionary.name + ' and elements in the ' + text_highlight.length + ' highlights:', 1)
		miscutils.logMessage(results, 1);

 		var find_false = _.findIndex(results, function(bool_match) {
			return !bool_match;
		});
		if(find_false == -1 && results.length == text_highlight.length){	
			// If a false doesn't exist (equals -1 meaning not found) and 
			// the results is as many as the highlights, then we return the dictionary
			miscutils.logMessage("Dictionary " + dictionary.name + " successfully describes the highlights", 	1);
	 		deferred.resolve(dictionary);
		}else{																	// Otherwise the text_highlights cannot be described by the dictionary, thus return a -1
			miscutils.logMessage("Dictionary " + dictionary.name + " fails to describe the highlights", 		1);
			deferred.resolve(-1);									
		}
 	});

	return deferred.promise; 	

}
/*
	@text: Check if there exists a rule that applies to the text
	@dictionary is a dictionary {dictionary_name:School, dictionary_content:[...]} e.g. {name:Schools, content:[{dict_entry}, ...]}
	@return a promise; promise returns a boolean 
*/
function is_dictionary_applicable(text, dictionary){
	var Q 			 		= require('Q');
 	var deferred   	 		= Q.defer();
	var is_text_describable = false;
	var exec_promises 		= [];
	
	for(var j=0; j<dictionary.content.length; j++){ 									// Iterate through each rule in the dictionary
		//Create an executable for each rule to check 
		var rule = dictionary.content[j];												// rule e.g. { type: 'text', content: 'Maeda' }
		miscutils.logMessage("Check dictionary rule: " + rule.content + ", matches highlight: " + text, 2);

		// A rule can be a regex, text, entity type
		if( rule.type == 'regex' ){

			// Construct an executable based on a regex
			var executable = [
				{'function'		 : 	'regular_expression'  , 
				 'function_param': rule.content.concat([text])}							// regex params: [regex, regexflags, text]
			];

			var promise = executor.extract( "", "", executable );						// Execute it
	 		exec_promises.push(promise);

		}else if(rule.type == 'text'){													// The rule indicates the highlight must be an exact text match e.g. highlight = Maeda and rule's content = Maeda
			
			if( _.isEqual(rule.content, text) ){ 										// Just check if the rule's content is equal to highlight's text
				is_text_describable = true;
				deferred.resolve(is_text_describable);									// Directly return the result, without executing exec_promises, as a result has been confirmed
			}

		}else if(rule.type == 'entity'){

			// Construct an executable based on a entity
			var executable = [
				{'function'		 : 	'is'  , 
				 'function_param': 	[rule.content].concat([text])}						// is params: [entity type, text], eg. ['Person', 'Maeda Fian']
			];

			var promise = executor.extract( "", "", executable ); 						// Execute it
	 		exec_promises.push(promise);

		}
	}

	// Q.all would execute only rules of type entity and regex
	Q.all(exec_promises).then(function(results){										// e.g. [ [ 'RICHARD', index: 0, input: 'RICHARD A. LEVINSON' ], [...] ]
		miscutils.logMessage('Results of is dictionary applicable to '+ text + ':', 2);
		miscutils.logMessage(results, 												2);

		// If there exists a non null element in results, then there exist a rule that matches text
		var non_nil_results = _.filter(results, function(res){return res != null || res.result != null});		// Filter out all nulls
		miscutils.logMessage("Non null results:" + non_nil_results, 				2);
		if(non_nil_results.length > 0 ){
			// Check if the non_nill_results actually extract exactly the highlight text
			// non_nil_results contains a mix of entity and regex matches e.g. [ [ 'JANE', index: 0, input: 'JANE M. SAMPLE' ], 'JANE M.' ]
			// Entity rules results in string and regex matches results in arrays
			
			var find = _.find(non_nil_results, function(a_res){							// Find if there exists an element that matches fully the highlights
				if( _.isEqual(a_res.operator, 'is') ){	// Entity 
					if( _.isEqual(a_res.result[0], text) ){
						is_text_describable = true;

					}
				}else {//(_.isEqual(a_res.operator, 'regular_expression') ){	// Regex match
					
					if( _.findIndex(a_res.result, function(k){return k==text}) != -1  ){
						is_text_describable = true;
					}
				}
				/*if( _.isArray(a_res) && _.isEqual(a_res[0], text)){						// A regex match is an array
					is_text_describable = true;
				}else if( _.isString(a_res) && _.isEqual(a_res, text)){					// An entity match is a string match
					is_text_describable = true;
				}*/
			});		
			
			deferred.resolve(is_text_describable);
		}else{
			deferred.resolve(is_text_describable);
		}	
 	});
	return deferred.promise; 	
}