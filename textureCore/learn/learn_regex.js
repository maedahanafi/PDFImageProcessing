/*
	Regular expression learner
*/
var miscutils 		= require('./../miscutils');
var _ 				= require('lodash');

// TODO change this to natural order of things
var generator 		= new require("./../regexgenerator.js").RegexGenerator() ;
var regex 			= generator.init();
regex 				= ['[A-Z]+\\s[A-Z]+', '[a-z]+'];

var executor 		= require('./../execute/execute');

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

	var regex_check_promises = [];									// The array that contains the promises on checking a regex against a set of highlights
 	for(var k = 0; k < regex.length ; k++){ 						// For loop through each regex in regex[]
 		var regex_elem 	= regex[k]; 
	 	var promise 	= check_regex_applicable(regex_elem, highlights);
	 	regex_check_promises.push(promise);	 						// Collect promises
 	}

 	Q.all(regex_check_promises).then(function(applicable_regex){
	 	applicable_regex = _.reject(applicable_regex, function(n) {
			return n == -1;
		});
	 	miscutils.logMessage("Array of applicable regex: ", 					2);
	 	miscutils.logMessage(applicable_regex, 									2);
	 	miscutils.logMessage("Applicable regexes:" + applicable_regex.length, 	1);

		deferred.resolve(applicable_regex);
	})	

 	return deferred.promise;
 }
exports.learnRegex = learnRegex;

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
								{'function':'regular_expression'  , 'function_param': [ regex_elem, "", highlight_obj.text ]}												
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
 			var match_res 		= all_matches[t].result;
 			var orig_highlight 	= highlights[t].text;

 			if(match_res == undefined || match_res != orig_highlight){		// Check if the extracted equals the original highlight
				add_flag = false;
				break;
 			}
 		}
 		if(add_flag){
 			miscutils.logMessage("Regex: " + regex_elem + " matches: " + all_matches, 2);
 			deferred.resolve(regex_elem);
 		}else{
 			deferred.resolve(-1);										// Return a -1 to indicate that the regex doesn't describe the set of highlights
 		}
 	})
 	return deferred.promise;
}
