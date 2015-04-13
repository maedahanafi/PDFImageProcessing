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
var Q 				= require('Q');

var pat_name 		= './image_processing/document_structure/patricia0.json';
var patricia_doc	= miscutils.fs_readFile(pat_name);

//TODO create name highlights based on document structures 
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
	learnRegex(highlights);

	//2. Learn inDict executables, return [executable1, executable2, ],
	//where executable = {}

	//3. Learn isEntityType = {}
	//where executable = {}
	
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
 @returns is
*/
 function learnRegex(highlights, executables){
 	var valid_regex 	= [];

 	// Read the docstructure of the files
 	highlights.highlights.forEach(function(elem){
 		elem.file_contents = miscutils.fs_readFile(elem.file);
 	});

	// For loop through each regex in regex[]
 	for(var k = 0; k < 1 ; k++){
 		var regex_elem = regex[k]; 
		var regex_promises 	= [];				// Gather all the regex promises and then execute them at one go

	 	// For loop through each highlight
	 	for(var l = 0; l < highlights.highlights.length; l++){
	 		var highlight_obj 	= highlights.highlights[l];

	 		// Create an executable capable of testing whether the text can be extracted from the line with regex
	 		var executable 		= [
									//{'function':'from', 'function_param': [highlight_obj.line_type, highlight_obj.line_number]},						// First index should always be a from; params should describe how to get there
									{'function':'regular_expression'  , 'function_param': [ regex_elem, "", highlight_obj.text ]}												// is params: [ regex]
								];
			
			miscutils.logMessage("Regex learner. regex: " + regex_elem + ", check in line: " + highlight_obj.text, 1);
			//Figure out a way to properly get the results of the execution 
			regex_promises.push(executor.extract( highlight_obj.file, highlight_obj.file_contents, executable ))
	 		
	 	}
	 	//Gather the regex that works

	 	var allPromise = Q.all(regex_promises );
	    allPromise.then(function(results){
	    	console.log(results)
	    })
 	}

 }

/*
	@data takes in a list of grouped lines and learns NER associations for each line
	e.g. [{group:[line1, line2]}, {group:[line3, line4]}]
*/
function learnLookup(data){

 	//Lookup for words with NER, wordnet, and dictionary in highlights
 	//Highlights should have associated entity types and synonyms (Graph combo here)
 	learnNERonData(data, function(nerdata){
 		//miscutils.logMessage(JSON.stringify(nerdata), 1);
 	});

 	learnRegex(data)
 	
 }


 function learnIn(){

 }


/*
	@data from image2data.js e.g. array of groups; a group is an array of lines
	@callback passes data with entity learned
*/
function learnNERonData(data, callback){
	var NER_promises = [];

 	//NER lookup
 	//Loop through each group
    for(var i=1; i<data.length; i++){
    	var groupElem = data[i].group;
        //Loop through each line in a group
        groupElem.forEach(function(lineElem){
    	 	NER_promises.push(NER(lineElem.text, lineElem.line_number));
        });
    }


    //After all the NER is done on all lines, reaad the result and add to our result data
    var allPromise = Q.all(NER_promises );
    allPromise.then(function(allentities){
    	//Loop through entities and then add then to their reepective lines
    	var entInd = 0;
		//Loop through each group
	    for(var i=1; i<data.length; i++){
	        //Loop through each line in a group
	        data[i].group.forEach(function(lineElem){
	        	lineElem.entities = allentities[entInd];
	        	entInd++; 
	    	});
	    }

	    miscutils.logMessage("All done grabbing data from NER", 1);
	    miscutils.logMessage(JSON.stringify(data), 1);
	    callback(data);

    }, console.err);
}

//NER() is invoked by an event emitter set by process() in order to process PDF asynch
function NER (totaltext ){
	var deferred = Q.defer();

	alchemy.entities(totaltext, {}, function(err, response) {
		if (err){
			miscutils.logMessage(err, 1);
			deferred.reject(err);
		}else{
			// See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object
			var entities = response.entities;
 			//Entities is an arrays of objects [{text, type}, ...]
			miscutils.logMessage(totaltext, 2);
			miscutils.logMessage(entities, 2);
			miscutils.logMessage('-----------------------------------', 2);
			deferred.resolve(entities);

		
 		}
	});

	return deferred.promise; // the promise is returned
};

/*
	And when grabbing the highlight text from the image via interface, we must also figure 	
	out which line the highlight is from. The highlighted text should be indicated within the 
	line information as well as in the structure from image2data.
	This function indicates which lines are highlighted: [{highlights:...}, {group:...}]

 */
function findHighlights(data){
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
