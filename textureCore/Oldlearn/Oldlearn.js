/*
	
	Before running activate the environment variables:
	ADUAE04448LP-MX:bbr mh4047$ source venv/bin/activate

	Script Learning
 

 1. Learn the lookup operators
	entities and their dictionary and entity types 
	Learn Regular Expressions for each dictionary entry
 2. Learn a merge operator (???)
 3. Learn which fields are optional and which are mandatory.
 5. Learn the in operator. Identify where to look fields in. 
 	Same group or child group? Before or after a field?
 4. Learn a permute function. 

 We assume that dictionaries are loaded.



 */

//AlchemyAPI API key
var APIKey = "37abd9121c9dc242fdd73073c0f68b935e6631a3";
var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI(APIKey);

var miscutils = require('./miscutils');
var _ = require('lodash');
var Q = require('Q');


//IMP michael1.png for HIGHLIGHT EXTRACTION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//kyle2.png for hocr font classification
//Obtain results from imagingprocessing.js
var data = require('./image2data').
			image2data('img/', 'imc', 'png', beginLearn);


function beginLearn(data){
	if(data!='err'){
		miscutils.logMessage('Begin Learning', 1);
		//First we identify where the highlights are
		//data = findHighlights(data); 
		//We begin by learning descriptions of the highlights
		//learnLookup(data);
	}else{
		miscutils.logMessage('Error in image2data process. ', 1);
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
/*
 Given an array of highlights, produce all possible regular expressions that describe it.
 @data is the datastructure from image2data with additional information in it
 @returns is
*/
 function learnRegex(data){
 	var generator =  new require("./RegexGenerator.js").RegexGenerator() ;
    generator.init()

 }


 function learnOptional(){

 }

 function learnIn(){

 }

 function learnPermute(){
 	
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





