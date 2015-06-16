/********************************************************************************
 Misc Functions
 ********************************************************************************/
var _ = require('lodash');

var isConsoleLog 	= true;
//If you want to debug every single step, enter in 2. Otherwise enter in 1.
//Make sure that isConsoleLog is true though
var debugLevel 		= 2;


/********************************************************************************
 Functions for logging run time
 ********************************************************************************/
var loggedMessages = []
function logMessage(message, msgDebugLevel){
	if(isConsoleLog) {
		if(debugLevel == 1 && msgDebugLevel == 1){
			console.log((message));
		}else if(debugLevel == 2 && msgDebugLevel<=2){
			console.log((message));
		}
	}
	loggedMessages.push((message));
}

exports.logMessage = logMessage;


function saveLog(){
	write_to_file('log/log.txt', JSON.stringify(loggedMessages));
}
exports.saveLog = saveLog;


function fs_readFile (file, encoding) {
    var Q 			= require('Q'); 
    var deferred 	= Q.defer();
    var fs 			= require('fs');
    fs.readFile(file, encoding, function (err, data) {
        if (err) deferred.reject(err) 					// rejects the promise with `er` as the reason
        else deferred.resolve(data) 					// fulfills the promise with `data` as the value
    })
    return deferred.promise 							// the promise is returned
}
exports.fs_readFile = fs_readFile;


function write_array_to_file(out_file, array){
	var string 	= _.reduce(array, function(n, sum){
		sum 	= sum + n + '\n';
	});
	write_to_file(out_file, string);
}
exports.write_array_to_file = write_array_to_file;


function write_to_file(out_file, content){
	var fs = require('fs');
	fs.writeFile(out_file, content, function(err) {
	    if(err) {
	        return logMessage(err, 1);
	    }
	    logMessage("The file " + out_file + " was saved!", 1);
	}); 
}
exports.write_to_file = write_to_file;


// Credits to http://blog.victorquinn.com/javascript-promise-while-loop
// A while loop that is sequential and returns promises
function promise_while(condition, action) {
	var Q 		 = require('Q');
    var resolver = Q.defer();
    var results	 = [];
    var loop = function() {
        if (!condition()){ 
        	//console.log('Break out of loop')
        	return resolver.resolve(results);
        }
        return action()
            	.then(function(result){
			    	results.push(result);
            		return Q.fcall(loop());
            	})/*.catch(function(err){
					console.log('err:'+err)
					resolver.reject(err)
				});*/
    };

    loop();
    //process.nextTick(loop);

    return resolver.promise;
};
exports.promise_while = promise_while;

// Returns a boolean indicating whether inArr contains a null
function isNullExist(inArr){
	// Since even checking for nulls cannot be done while in the loop e.g. trying to get the contents of a slot that is null is not possible/error
	var isNullExist = _.findIndex(inArr, function(chr) {
		return chr == null;
	})
	return isNullExist != -1;
}
exports.isNullExist = isNullExist;

/********************************************************************************
 NER
 ********************************************************************************/
// AlchemyAPI API key
var APIKey 				= "37abd9121c9dc242fdd73073c0f68b935e6631a3";
var AlchemyAPI 			= require('alchemy-api');
var alchemy 			= new AlchemyAPI(APIKey);
var AlchemyAPIEntities 	= [
	'Anatomy',
	'Anniversary',
	'Automobile',
	'City',
	'Company',
	'Continent',
	'Country',
	'Crime',
	'Degree',
	'Drug',
	'EntertainmentAward',
	'Facility',
	'FieldTerminology',
	'FinancialMarketIndex',
	'GeographicFeature',
	'HealthCondition',
	'Holiday',
	'JobTitle',
	'Movie',
	'MusicGroup',
	'NaturalDisaster',
	'OperatingSystem',
	'Organization',
	'Person',
	'PrintMedia',
	'Product',
	'ProfessionalDegree',
	'RadioProgram',
	'RadioStation',
	'Region',
	'Sport',
	'SportingEvent',
	'StateOrCounty',
	'Technology',
	'TelevisionShow',
	'TelevisionStation',
	'EmailAddress',
	'TwitterHandle',
	'Hashtag',
	'IPAddress',
	'Quantity',
	'Money'
];
var NER_cache = [];	// The cache is an array of {totaltext:___, entities:___}
var NER_CACHE_LIMIT = 10;
/*
	@totaltext is the text to extract entities from
	@return is an array of {type: "Person", relevance:0.9, count:3, text: "Maeda Hanafi" }
*/
function NER (totaltext ){
	var Q 		 = require('Q');
	var deferred = Q.defer();

	totaltext	 = validate_and_clean(totaltext);								// Clean the text before sending to alchemyAPI:
	var cache_index = _.findIndex(NER_cache, function(ind){
		return _.isEqual(ind.totaltext, totaltext); 
	});																			// First search if the text has been sent to Alchemy before in the cache
	
	if(cache_index != -1){
		var entities = NER_cache[cache_index];
		logMessage("Accessing NER CACHE: " + NER_cache.length, 		1);

		if(NER_cache.length>NER_CACHE_LIMIT){									// Delete old elements (the first one) if beyond the cache limit.
			NER_cache = NER_cache.splice(0, 1);
		}
		deferred.resolve(entities);
	}else{
		alchemy.entities(totaltext, {}, function(err, response) {
			if (err){
				logMessage(err, 1);
				deferred.reject(err);
			}else{
				var entities = response.entities; 								// See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object
	 																			//Entities is an arrays of objects [{text, type}, ...]
				logMessage(totaltext, 								3);
				logMessage(entities, 								2);
				logMessage('-----------------------------------', 	2);

				NER_cache.push({'totaltext':totaltext, 'entities': entities}); 	// Add results to the cache
				deferred.resolve(entities);
	 		}
		});
	}
	return deferred.promise; // The promise is returned
}
exports.NER = NER;

/********************************************************************************
 Clean OCR tasks
 ********************************************************************************/
var VALID_PUNCTUATION = [
	'!',
	'@',
	'#',
	'$',
	'%',
	'^',
	'&',
	'*',
	'(',
	')',
	'-',
	'_',
	'+',
	'=',
	'{',
	'[',
	'}',
	']',
	'\\',
	'|',
	';',
	':',
	'\'',
	'"',
	',',
	'<',
	'.',
	'>',
	'?',
	'/',
	'\n',
	'\t',
	'\r',
	'\f',
	'\s',
	' '	
];
 /*
	We need to boost the accuracy of the NER by cleaning the OCR-recognized text from 
	random sequences of symbols without cleaning the important symbols such as \n or 
	punctuation symbols. If we have a dictionary of valid punctuation marks, then we 
	can clean out the symbols that are invalid.

	The regex that can detect invalid characters:
	[^!\@\#\$\%\^\&\*\(\)\-\_\+\=\{\[\}\]\\\|\;\:\'\"\,\<\.\>\?\/ \n\t\r\fa-zA-Z0-9]+

	The regex that detects sequences of punctuations of minimum length 5 e.g. $';::::::;;‘::
	[^a-zA-Z0-9]{6,}
 */
function validate_and_clean(string){
	// Remove all invalid characters 
	var clean_string = string.replace(/[^!\@\#\$\%\^\&\*\(\)\-\_\+\=\{\[\}\]\\\|\;\:\'\"\,\<\.\>\?\/ \n\s\t\r\fa-zA-Z0-9]+/g, "");
	// Remove all sequences of punctuations of minimum length 6
	clean_string = clean_string.replace(/[^a-zA-Z0-9]{6,}/g, "");
	

	/*var clean_string 	= "";						// Valid characters are accumulated into clean_string
	var per_char 		= string.split("");
	
	for(var i=0; i<per_char.length; i++){			// For each over each character in string
		
		if( /[a-zA-Z0-9]/.test(per_char[i]) ){ 		// Check if alphanumeric
			clean_string = clean_string + per_char[i];
		}else if( _.findIndex(VALID_PUNCTUATION, function(punc){ return _.isEqual(punc, per_char[i]); }) != -1 ){ 
			// Then check if punctuation
			clean_string = clean_string + per_char[i];
		}											// If either of the conditions are met then it is added into clean_string
		
	}*/

	return clean_string;
}
exports.validate_and_clean = validate_and_clean;
