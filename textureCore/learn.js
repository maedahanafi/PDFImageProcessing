/*
	Learn regex, inDict, isEntity operators.

*/
var generator 		=  new require("./regexgenerator.js").RegexGenerator() ;
var regex 			= generator.init();

// AlchemyAPI API key
var APIKey	 		= "37abd9121c9dc242fdd73073c0f68b935e6631a3";
var AlchemyAPI 		= require('alchemy-api');
var alchemy 		= new AlchemyAPI(APIKey);

var miscutils 		= require('./miscutils');
var executor 		= require('./execute');
var _ 				= require('lodash');

var pat_name 		= './image_processing/document_structure/patricia0.json';
var patricia_doc	= miscutils.fs_readFile(pat_name);

var name_highlights = {'highlights':
						[
							{'label':'Name',
							 'page_number': 0,
							 "line_number": 0,
							 "group_number":0,
							 'word_number':0,	//Delimited by spaces, the nth word in the sentence
							 'text': 'RAVI AMON',
							 "line_type":"TITLE",
							 'file':'./image_processing/document_structure/ravi0.json'
							}, 
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

var BOXES = ['Line', 'Section', 'Page'];


beginLearn(name_highlights)
function beginLearn(highlights){
	miscutils.logMessage('Begin Learning', 1);
	//Learn executables!!!!!
	//1. Learn regex executables, return [executable1, executable2], 
	//where executable = {function:regex, function_params:[   ]}
	var applicable_regex = [];
	var regex_promise 	 = learnRegex(highlights.highlights).then(function(result){
		applicable_regex = result;
	});

	//2. Learn isEntityType = {}
	var applicable_entity 	= [];
	var entity_promise 		= learnIsEntity(highlights.highlights).then(function(result){
		applicable_entity 	= result;
	});
	
	//3. Learn inDict executables, return [executable1, executable2, ],
	var applicable_dict 	= [];
	var dict_promise 		= learnInDict(highlights.highlights).then(function(result){
		applicable_dict 	= result;
	});

	//4. Produce permutations of executables here [boxtype, optype] 
	//e.g. [{function:from,}, {function:regex1}], [{function:from,}, {function:regex2}], [{function:from,}, {function:inDict}]

	// First we identify where the highlights are
	//data = findHighlights(data); 

	// We begin by learning descriptions of the highlights
	//learnLookup(data);

	// Learn boxes that are applicable to the highlights.

}

/*
 Given an array of highlights, produce all possible regular expressions that describe it.
 @returns is a promise; and the promise is to return an array of regular expressions 

 Note to self: Currently we check if a regex doesn't return a null when asked for a match to the text e.g. RAVI AMON
 				and we also check if the regex can describe the highlight, as opposed to extracting is from it's text 
 				e.g. find a regex that can describe Ravi Amon; but not extract Ravi Amon from Ravi AmonDeschandel
 				In other words we are only checking a regex is only "applicable" to a set of highlights
 				based on whether it can describe that text exactly.
 				Shouldn't we also check if a regex can extract such a text from the whole line? or from the whole Section?

 				Moreover, if we decide to we need to be specific and describe the text with moredescriptions, wecan divide a highlight up by spaces
 				Spaces are key in that they separate words, and these words can be described by the regular expressions.
 				The patterns of the word's regular expressions would give a much more detailed pattern as opposed to 
 				only a three token regex pattern. The reason why FE uses such a pattern was because they operators that describe
 				the patterns made the mundane three tokens powerful enough to be expressive.
*/
 function learnRegex(highlights, executables){
 	var Q 			= require('Q');
 	var deferred   	= Q.defer();

 	highlights.forEach(function(elem){  							// Read the docstructure of the files
 		elem.file_contents = miscutils.fs_readFile(elem.file);
 	});

	var regex_check_promises = [];									// The array that contains the promises on checking a regex against a set of highlights
 	for(var k = 0; k < regex.length ; k++){ 						// For loop through each regex in regex[]
 		var regex_elem 	= regex[k]; 
	 	var promise 	= check_regex_applicable(regex_elem, highlights)
	 	regex_check_promises.push(promise);	 						// Collect promises
 	}

 	Q.all(regex_check_promises).then(function(applicable_regex){
	 	applicable_regex = _.reject(applicable_regex, function(n) {
			return n == -1;
		});
	 	miscutils.logMessage("Array of applicable regex: ", 					1);
	 	miscutils.logMessage(applicable_regex, 									2);
	 	miscutils.logMessage("Applicable regexes:" + applicable_regex.length, 	1);

		deferred.resolve(applicable_regex);
	})	

 	return deferred.promise;
 }

/*
	@regex_elem is the regex to check the @highlights, an array, 
	@returns a promise to do it, where the promise is to return the regex if it is applicable to the set of higlights
*/
function check_regex_applicable(regex_elem, highlights){
	var Q 				= require('Q');
 	var deferred    	= Q.defer();
	var regex_promises  = [];

 	for(var l = 0; l < highlights.length; l++){ 						// For loop through each highlight
 		var highlight_obj 	= highlights[l];
 		var executable 		= [ 										// Create an executable capable of testing whether the text can be extracted from the line with regex
								{'function':'regular_expression'  , 'function_param': [ regex_elem, "", highlight_obj.text ]}												// is params: [ regex]
							];
		
		miscutils.logMessage("Regex learner. regex: " + regex_elem + ", check in line: " + highlight_obj.text, 2);
		var promise = executor.extract( highlight_obj.file, highlight_obj.file_contents, executable );
 		regex_promises.push(promise);
 	}
 	
 	Q.all(regex_promises).then( function(all_matches){					// all_matches contains an array of match() results, e.g. [["text_match", ...], null, [...], etc]
 		// A regex is applicable if it can describes all highlights e.g. non of the elements in data
 		// is null and all the matches equal the original highlight
 		var add_flag = true;
 		for(var t=0; t<all_matches.length; t++){
 			var match_res 		= all_matches[t];
 			var orig_highlight 	= highlights[t].text;

 			if(match_res == null || match_res[0] != orig_highlight){	// Check if the extracted equals the original highlight
				add_flag = false;
				break;
 			}
 		}
 		if(add_flag){
 			miscutils.logMessage("Regex: " + regex_elem + " matches: " + all_matches, 2);
 			deferred.resolve(regex_elem);
 		}else{
 			deferred.resolve(-1);	// Return a -1 to indicate that the regex doesn't describe the set of highlights
 		}
 	})
 	return deferred.promise;
}

/*
	@highlights takes in a list of highlighted text and learns NER associations that are applicable to @highlights

	This learn function takes in a list of highlights that the Is operator must be able to extract e.g. [“Maeda”, “Aisya”]. 
	The output is an array of applicable entity types e.g. [“Person”], where an entity type is applicable when it identifies each of the elements in the list of highlights.
*/
function learnIsEntity(highlights){
	var Q 			 = require('Q');
 	var deferred   	 = Q.defer();

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
			miscutils.logMessage("Check if Entities extracted equals highlights: ", 1);
			miscutils.logMessage(text_entity_group, 1);
			miscutils.logMessage(text_highlight, 	1);
			if (_.isEqual(text_highlight, text_entity_group)){			// If the highlight array is equal to the entity's text array, then 
				applicable_entities.push(key);
			}
		}
		miscutils.logMessage("Entities Match: ", 	1);
		miscutils.logMessage(applicable_entities, 	1);
		deferred.resolve(applicable_entities);

 	});
	return deferred.promise; 	
 }

/*
	@highlights takes in a list of highlighted text and learns dictionaries that are applicable to @highlights
	
	The basic algorithm is a for loop for each dictionary. 
	For each dictionary, apply each dictionary rule to each highlight. 
	If each each dictionary rule is applicable to each highlight from the set of highlights, 
	then return the set of applicable operators.  
	Essentially the output is an array of dictionaries that are applicable to each highlight e.g. [name_dictionary] 
	is the output for the input [“Maeda”, “Aisya”].

*/
function learnInDict(highlights){

}


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
    	 	NER_promises.push(NER(highlight));
    }

    // After all the NER is done on all lines, read the result and add to our result data
    var allPromise = Q.all(NER_promises );
    allPromise.then(function(allentities){

	    miscutils.logMessage("All done grabbing data from AlchemyAPI",  1);
	    miscutils.logMessage(JSON.stringify(allentities), 				1);
		deferred.resolve(allentities);

    }, console.err);
 	return deferred.promise;

}

/*
	@totaltext is the text to find entities
*/
function NER (totaltext ){
	var Q 		 = require('Q');
	var deferred = Q.defer();

	alchemy.entities(totaltext, {}, function(err, response) {
		if (err){
			miscutils.logMessage(err, 1);
			deferred.reject(err);
		}else{
			var entities = response.entities; 				// See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object
 			//Entities is an arrays of objects [{text, type}, ...]
			miscutils.logMessage(totaltext, 							2);
			miscutils.logMessage(entities, 								2);
			miscutils.logMessage('-----------------------------------', 2);
			deferred.resolve(entities);
 		}
	});

	return deferred.promise; // The promise is returned
};

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