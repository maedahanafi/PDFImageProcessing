/*
	Learn regex, inDict, isEntity operators.

*/

// AlchemyAPI API key
/*var APIKey	 		= "37abd9121c9dc242fdd73073c0f68b935e6631a3";
var AlchemyAPI 		= require('alchemy-api');
var alchemy 		= new AlchemyAPI(APIKey);*/

var miscutils 		= require('./../miscutils');
var Combinatorics 	= require('./../combinatorics.js').Combinatorics;
var executor 		= require('./../execute/execute');
var _ 				= require('lodash');

var learn_regex 	= require('./learn_regex.js');
var learn_boxes 	= require('./learn_boxes.js');


// Filename with respect to execute folder
//var pat_name 		= __dirname + '/image_processing/document_structure/patricia0.json';
//var patricia_doc	= miscutils.fs_readFile(pat_name);

var name_highlights = {'highlights':
						[
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 'text': 'RAVI AMON',
							 "line_type":"TITLE",
							 'file':__dirname + '/../image_processing/document_structure/ravi0.json'
							}/*, 
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"TITLE",
							 'text': 'RICHARD A. LEVINSON',
							 'file':'./image_processing/document_structure/richard0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"TITLE",
							 'text': 'PATRICIA P. PATTERSON',
							 'file':'./image_processing/document_structure/patricia0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"SECTION",
							 'text': 'JANE M. SAMPLE',
							 'file':'./image_processing/document_structure/sample0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 1,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"SECTION",
							 'text': 'SCOTT E. LEFKOWITZ',
							 'file':'./image_processing/document_structure/scott0.json'
							}/*,
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"TITLE",
							 'text': 'MICHAEL D. SIERRA',
							 'file':'./image_processing/document_structure/sierra0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"TITLE",
							 'text': 'Susan B. Simmons',
							 'file':'./image_processing/document_structure/susan0.json'
							}*/
						]
					};
// Dictionary assumed to be provided by the user
var dictionaries = [	// This contains all dictionaties e.g. [{name:schools, content:[ {text} or {regex}, ... ]}]
						{
							'name'   :   'name_dictionary' , 
							'content': [	
								{"type":"text",  "content":"Maeda"}
								,{"type":"regex", "content":["[A-Z\\.\\s]+", ""]}
								,{"type":"entity",	 "content":"Person"}
							]
						}
					];


/*
******************************************************************************************************************************
*/
beginLearn(name_highlights, dictionaries)
function beginLearn(highlights, dictionaries){
	// Read the contents of files first
	highlights.highlights = read_doc_structure(highlights.highlights)

	// Since we assume that the learning process will yield rules that are valid on ALL highlights and not just a subset of the highlights,
	// the preceding step should involve figuring out which subset of highlights we should learn on, lest one of the highlights is
	// invalid.
	miscutils.logMessage('Begin Learning', 1);
 	var Q 					= require('Q');
 	// A partial executable is an element in an executable. It is in obj form e.g. {function, function_params}, 
 	// without the string to operate on added to the function_params.
	var valid_partial_exec 	= []; 
	var promises 			= [];
	//Learn executables!!!!!
	var regex_promise 		= learn_regex.learnRegex(highlights.highlights);		//1. Learn regex 
	promises.push(regex_promise);

	/*var entity_promise 		= learnIsEntity(highlights.highlights);				//2. Learn isEntityType = {}
	promises.push(entity_promise);

	var dict_promise 		= learnInDict(highlights.highlights, dictionaries); 	//3. Learn inDict 
	promises.push(dict_promise);
*/
	Q.all(promises).then(function(results){											// An array of results e.g. [result of regex learn, result of entity learn, result of dictionary learn]

		// Create a partial executable for each element in result
		// Create partial regex executables (only in obj form and not in array form)
		var regex_arr = results[0];
		for(var i=0; i<regex_arr.length; i++){
			var regex_string = regex_arr[i];
			valid_partial_exec.push({'function':'regular_expression'  , 'function_param': [ regex_string, ""]});
		}
														
		// Create entity executables
		/*var entity_arr = results[1];
		for(var i=0; i<entity_arr.length; i++){
			var entity_type = entity_arr[i];
			valid_partial_exec.push({'function':'is'  , 'function_param': [ entity_type]});
		}

		// Create dictionary executables
		var dictionary_arr = results[2];
		for(var i=0; i<dictionary_arr.length; i++){
			var dict = dictionary_arr[i];
			valid_partial_exec.push({'function':'in'  , 'function_param': [ dict.name, dict.content]});
		}*/

		// Learn boxes that are applicable to the highlights.
		var valid_from_partial = learn_boxes.learnBoxes(highlights.highlights);

		// Create all possible full executables from valid, valid_from_partial and valid_partial_exec
		var possible_execs = Combinatorics.cartesianProduct(valid_from_partial, valid_partial_exec).toArray();
		miscutils.logMessage("Number of possible executables:" + possible_execs.length, 1);
		miscutils.logMessage("All possible executables:", 								2);
		miscutils.logMessage(possible_execs, 											2);

		// Filter for rules that don't extract the highlights
		filterExecutables(possible_execs, highlights.highlights).then(miscutils.saveLog());


	});

	//4. Produce permutations of executables here [boxtype, optype] 
	//e.g. [{function:from,}, {function:regex1}], [{function:from,}, {function:regex2}], [{function:from,}, {function:inDict}]
	
	
}


/* 

	Filter for rules that don't extract the highlights

*/
function filterExecutables(executables, highlights){
	var Q 			= require('Q');
 	var deferred   	= Q.defer();

 	var i = 0; 
 	miscutils.promise_while(function(){ 									// Condition
 		return i < executables.length;
 	},function(){															// Action: For each executable execute it on all document structures
 		var executable = executables[i];
 		/*console.log("Action Loop")
 		console.log('@4')*/
 		console.log(i + " out of " + executables.length);
 		i++;
 		return isExecutableApplicable(executable, highlights);
 	}).then(function(results){												// After the loop executes, results will contain an array of al executables applicable to the highlights e.g. [{executable}, {executable}, etc]
 		console.log('@1:' + results.length)
 		console.log(results)
 		// Filter out the elements that have -1:
 		var filtered_results = _.remove(results, function(n) {
			return n != -1;
		});
		console.log(filtered_results)
 		miscutils.logMessage("Filtered executables " + filtered_results.length + ":", 	1);
 		miscutils.logMessage(filtered_results, 											1);
 		deferred.resolve(filtered_results);
 	});
 	

}

/*
	Given an @executable, test if it is valid for the @highlights
	@returns a promise
*/
function isExecutableApplicable(executable, highlights){
	var Q 			= require('Q');
 	var deferred   	= Q.defer();
	var j  			= 0;
 	miscutils.promise_while(function(){ 												// Condition
 		return j < highlights.length;
 	}, function(){																		// Action
		
		var highlight 		= highlights[j];
		var file_contents 	= _.clone(highlight.file_contents, 				true);		
		var this_exec		= _.clone(executable, 							true);		// Important! Clone the executable or else previous strings in the function params will be there
 		
 		miscutils.logMessage("Testing " + j + " out of " + highlights.length, 	2);
 		miscutils.logMessage(this_exec, 										2);

		j++;
		return executor.extract(highlight.file, file_contents, this_exec);
 	
 	}).then(function(results){															// After the loop executes, check if the executable is indeed applicable. results is an array that contains all the results of the executables. Each element at i in results[] corresponds to an executable on a document structure at i from highlights[]
		
		var expected_results = _.pluck(highlights,   'text');							// An array of only the highlight's text that belong to this entity e.g. ['Ravi Amon', 'Chris Sample']
 		miscutils.logMessage("Executable result for each document structure: ", 1);
 		miscutils.logMessage(results,											1);
 		miscutils.logMessage("Expected Results: ",								1);
 		miscutils.logMessage(expected_results, 									1);

 		if(miscutils.isNullExist(results)){												// If there exists a null in the results, then we return, since even checking for nulls cannot be done while in the loop below e.g. trying to get the contents of a slot that is null is not possible/error
			miscutils.logMessage("Executable is not applicable: null exists in results", 	1);
 			deferred.resolve(-1);
		}else{
	 		var function_match_type = executable[executable.length - 1].function;		// This is the textual match's function type e.g. is, regular_expression, or in
	 		var is_applic = true;
	 		for(var i = 0; i < results.length; i++){									// Iterate through array, compare result[i] with expected_result[i]

	 			if( _.isEqual(function_match_type, 'regular_expression') ){				// Read the results as a regular expression result

	 				var extracted_text = results[i][0];									// The text extracted by the rule by regex e.g. Avi Ramon$#$$$$s
	 				miscutils.logMessage("Extracted: " 		  + extracted_text,		 2);
	 				miscutils.logMessage("Expected results: " + expected_results[i], 2);
	 				
	 				if( ! _.isEqual(extracted_text, expected_results[i]) ){
	 					miscutils.logMessage("Not Applicable! Executable: " + JSON.stringify(executable), 	1);	
	 					is_applic = false;
	 					break;
	 				}
	 			}else if( _.isEqual(function_match_type, 'is') ){						// Read the results as an is operator (entity)
	 				//TODO: figure out the output formats of is and in
	 			}else if( _.isEqual(function_match_type, 'in') ){						// Read the results as an in operator (dictionary)

	 			}

	 		}

	 		if(!is_applic){ 															// If the extracted text is null or doesn't match the highlight, then return nothing
	 			miscutils.logMessage("Executable is not applicable", 	1);
	 			deferred.resolve(-1);
	 		}else{																		// If code reaches this point, it means that the rule is applicable to the highlights
	 			miscutils.logMessage("Executable Works!", 				1);
	 			deferred.resolve(executable);
	 		}
 		}
 	});

 	return deferred.promise;

}

function read_doc_structure(highlights){
	var fs 	= require('fs');
	for(var i=0; i<highlights.length; i++){  											// Read the docstructure of the files
		var elem 					= highlights[i];
 		highlights[i].file_contents = JSON.parse(fs.readFileSync(elem.file))
 	}
 	return highlights;
}
/*
******************************************************************************************************************************
*/


/*
	@highlights takes in a list of highlighted text and learns NER associations that are applicable to @highlights

	This learn function takes in a list of highlights that the Is operator must be able to extract e.g. [“Maeda”, “Aisya”]. 
	The output is an array of applicable entity types e.g. [“Person”], where an entity type is applicable when it identifies each of the elements in the list of highlights.
*/
function learnIsEntity(highlights){
	var Q 			= require('Q');
 	var deferred	= Q.defer();

 	getNER(highlights).then(function(entities){							// entities is a 2D array: [[{Person, ...}, ], [{Person}, ...], ...]
 		// Check if all the highlights match all the entities
 		// Given entities [{entity, word}, {entity, word}, ....]
 		// Given highlights [{highlight}, {highlight}, ....]
 		// Check if each highlight exists in entities

 		var flatten_entities = _.flatten(entities);						// flatten_entities is an array: [{Person, ...}, {Person, ...}, ...]
 		var grouped_entities = _.groupBy(flatten_entities, function(entity) {  		// Group the flattened array by the entity
			return entity.type;
		}); 															// grouped_entities = {Person:[], Building:[], ...}
		
		var applicable_entities = [];									// Entities that are applicable on the given highlights
		for(var key in grouped_entities){								// Loop through each group and for each entity group, check if each highlight exists
			var entity_group 		= grouped_entities[key];			// Check if each highlight exists within entity_group
			var text_highlight 		= _.pluck(highlights,   'text');	// An array of only the highlight's text that belong to this entity e.g. ['Ravi Amon', 'Chris Sample']
			var text_entity_group 	= _.pluck(entity_group, 'text');	// An array of only the NER texts that that belong to this entity e.g. ['Ravi Amon', 'Chris']
			
			miscutils.logMessage("Check if Entities extracted equals highlights: ", 2);
			miscutils.logMessage(text_entity_group, 								2);
			miscutils.logMessage(text_highlight, 									2);
			
			if (_.isEqual(text_highlight, text_entity_group)){			// If the highlight array is equal to the entity's text array, then 
				applicable_entities.push(key);
			}
		}
		miscutils.logMessage("Applicable Entities: ", 	1);
		miscutils.logMessage(applicable_entities, 		1);
		deferred.resolve(applicable_entities);

 	});
	return deferred.promise; 	
 }

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

/*
******************************************************************************************************************************
*/
/*
	@highlights from image2data.js e.g. array of groups; a group is an array of lines
	
*/
function getNER(highlights){
	var Q 			 = require('Q');
 	var deferred   	 = Q.defer();
	var NER_promises = [];

 	// NER lookup
    for(var i=0; i<highlights.length; i++){  							
    	var highlight = highlights[i].text;						// Loop through each highlight
    	NER_promises.push(miscutils.NER(highlight));
    }

    // After all the NER is done on all lines, read the result and add to our result data
    var allPromise = Q.all(NER_promises );
    allPromise.then(function(allentities){

	    miscutils.logMessage("All done grabbing data from AlchemyAPI",  1);
	    miscutils.logMessage(JSON.stringify(allentities), 				2);
		deferred.resolve(allentities);

    }, console.err);
 	return deferred.promise;
}



/*
******************************************************************************************************************************
*/
/*
	And when grabbing the highlight text from the image via interface, we must also figure 	
	out which line the highlight is from. The highlighted text should be indicated within the 
	line information as well as in the structure from image2data.
	This function indicates which lines are highlighted: [{highlights:...}, {group:...}]

 */
/*function findHighlights(data){
	//For now we hard code the information
	//Insert highlight information into the 0th index
	data.splice(0,0, 
		{'highlights':
			[
				{'label':'School',
				 "line_number": 72,
				 'word_number':8,	//Delimited by spaces, the nth word in the sentence
				 'text': 'University at Nevada'
				}, 
				{'label':'Major',
				 'line_number':72,
				 'word_number': 0,
				 'text':'MBA'
				}
			]
		}
	);

	miscutils.logMessage("All done grabbing data from user highlights", 1);
	miscutils.logMessage(JSON.stringify(data), 1);
	return data;
}

var highlights 		= {'highlights':
						[
							{'label':'School',
							 "line_number": 72,
							 'word_number':8,	//Delimited by spaces, the nth word in the sentence
							 'text': 'University at Nevada'
							}, 
							{'label':'Major',
							 'line_number':72,
							 'word_number': 0,
							 'text':'MBA'
							}
						]
					}
*/