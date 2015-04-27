/*
	Learn regex, inDict, isEntity operators.

*/

var miscutils 		= require('./../miscutils');
var Combinatorics 	= require('./../combinatorics.js').Combinatorics;
var executor 		= require('./../execute/execute');
var _ 				= require('lodash');

var learn_regex 	= require('./learn_regex.js');
var learn_entity	= require('./learn_entity.js');
var learn_dict 		= require('./learn_dictionary.js');
var learn_boxes 	= require('./learn_boxes.js');

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
							 'file':__dirname + '/../image_processing/document_structure/richard0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"TITLE",
							 'text': 'PATRICIA P. PATTERSON',
							 'file':__dirname + '/../image_processing/document_structure/patricia0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"SECTION",
							 'text': 'JANE M. SAMPLE',
							 'file':__dirname + '/../image_processing/document_structure/sample0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 1,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"SECTION",
							 'text': 'SCOTT E. LEFKOWITZ',
							 'file':__dirname + '/../image_processing/document_structure/scott0.json'
							}/*,
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"TITLE",
							 'text': 'MICHAEL D. SIERRA',
							 'file':__dirname + '/../image_processing/document_structure/sierra0.json'
							},
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 "line_type":"TITLE",
							 'text': 'Susan B. Simmons',
							 'file':__dirname + '/../image_processing/document_structure/susan0.json'
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
								//,{"type":"text", "content":"RAVI AMON"}
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

	var entity_promise 		= learn_entity.learnIsEntity(highlights.highlights);	//2. Learn isEntityType = {}
	promises.push(entity_promise);

	var dict_promise 		= learn_dict.learnInDict(highlights.highlights, dictionaries); 	//3. Learn inDict 
	promises.push(dict_promise);

	Q.all(promises).then(function(results){											// An array of results e.g. [result of regex learn, result of entity learn, result of dictionary learn]

		// Create a partial executable for each element in result
		// Create partial regex executables (only in obj form and not in array form)
		var regex_arr = results[0];
		for(var i=0; i<regex_arr.length; i++){
			var regex_string = regex_arr[i];
			valid_partial_exec.push({'function':'regular_expression'  , 'function_param': [ regex_string, ""]});
		}
														
		// Create entity executables
		var entity_arr = results[1];
		for(var i=0; i<entity_arr.length; i++){
			var entity_type = entity_arr[i];
			valid_partial_exec.push({'function':'is'  , 'function_param': [ entity_type]});
		}

		// Create dictionary executables
		var dictionary_arr = results[2];
		for(var i=0; i<dictionary_arr.length; i++){
			var dict = dictionary_arr[i];
			valid_partial_exec.push({'function':'in'  , 'function_param': [ dict.name, dict.content]});
		}

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
 		miscutils.logMessage(i + " out of " + executables.length, 						1);
 		i++;
 		return isExecutableApplicable(executable, highlights);
 	}).then(function(results){												// After the loop executes, results will contain an array of al executables applicable to the highlights e.g. [{executable}, {executable}, etc]
 		// Filter out the elements that have -1:
 		var filtered_results = _.remove(results, function(n) {
			return n != -1;
		});
 		miscutils.logMessage("---------------------------------------------------", 	1);
 		miscutils.logMessage("Filtered executables " + filtered_results.length + ":", 	1);
 		miscutils.logMessage(JSON.stringify(filtered_results), 							1);
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
 		miscutils.logMessage("Executable result used: ", 						1);
 		miscutils.logMessage(results,											1);
 		miscutils.logMessage("Expected Results: ",								1);
 		miscutils.logMessage(expected_results, 									1);

 		var is_applic = isExtractedEqualExpected(results, expected_results);
 		
 		if(!is_applic){ 															// If the extracted text is null or doesn't match the highlight, then return nothing
 			miscutils.logMessage("Executable is not applicable" + JSON.stringify(executable), 	1);
 			deferred.resolve(-1);
 		}else{																		// If code reaches this point, it means that the rule is applicable to the highlights
 			miscutils.logMessage("Executable Works!", 				1);
 			deferred.resolve(executable);
 		}
 		
 	});

 	return deferred.promise;

}
/*
	@results is the actual results e.g. [{op, result},  {op, result}]
	@expected_results is the expected e.g. ["Maeda Hanafi", "Ravi Amon"]
*/
function isExtractedEqualExpected(results, expected_results){
	var is_applic = true;
	for(var i = 0; i < results.length; i++){										// Iterate through array, compare result[i] with expected_result[i]
		var res_op 			= results[i].operator;
		var extracted_text 	= results[i].result;
		var expected 		= expected_results[i];
		miscutils.logMessage("Extracted: " 		  + JSON.stringify(extracted_text), 1);
		miscutils.logMessage("Expected results: " + JSON.stringify(expected), 		1);
			
		if( _.isEqual(res_op, 'regular_expression') ){								// Read the results as a regular expression result	 				
			if( ! _.isEqual(extracted_text, expected) ){
				return false;
			}
		}else if( _.isEqual(res_op, 'is') ){										// Read the results as an is operator (entity), which is an array
			if(_.findIndex(extracted_text, function(text){return _.isEqual(text, expected);}) == -1){		// Find the if the array of extracted entities contains the expected entity
				return false;
			}
		}else if( _.isEqual(res_op, 'in') ){										// Read the results as an in operator (dictionary) which is an array of {operator, results}
			// extracted_text is e.g. [{op:, result:string|array}, ...]
			var possible_match = _.flatten(_.pluck(extracted_text, 'result'));		// extracted_text is flatten to an array
			
			if(_.findIndex(possible_match, function(text){return _.isEqual(text, expected);}) == -1){ 		// Ensure that the expected exists in possible_match
				return false;
			}
		}

	}
	return true;
}

function read_doc_structure(highlights){
	var fs 	= require('fs');
	for(var i=0; i<highlights.length; i++){  										// Read the docstructure of the files
		var elem 					= highlights[i];
 		highlights[i].file_contents = JSON.parse(fs.readFileSync(elem.file))
 	}
 	return highlights;
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