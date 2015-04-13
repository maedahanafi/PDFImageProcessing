/*
	The goal of this script is to have the execution of the following functions:

	match functions:
		permute (rule)
		is 		(entity_type)
		inDict 	(concept_dictionary)
		regular_expression

	box function's acceptable parameters: 
		Line, Title or Heading
		Page
		Section, Group, Lines, or Paragraph

	may be followed by a second parameter containing N or -1 (to indicate none)
	may be followed by a third param containing M or -1
	may be followed by a fourth param containing a between operator (but this is considered chaining)

	The following is the format for an executable array:
	0					: 	If the first element in executables[] is a from statement
													{'function':'from', 'function_param': [Box, n, m, ]}
							If the first line doesn't contain a from function, then the 
							string to operate on has already been extracted and appended to the function_param
													{'function':'in', 'function_param': [___, string_to_execute_on]}
	
	The rest of array 	: 	Executable Object
								- regular_expression :{'function':'regular_expression', 'function_param': [regex string exp]}
								- in 				 :{'function':'in', 'function_param': [dict name, dict_array]}
								- is 				 :{'function':'is', 'function_param': [entity type]}
							See example1, example2, example3, respectively.
*/

// AlchemyAPI API key
var APIKey 			= "37abd9121c9dc242fdd73073c0f68b935e6631a3";
var AlchemyAPI 		= require('alchemy-api');
var alchemy 		= new AlchemyAPI(APIKey);

var miscutils 		= require('./miscutils.js');
var _ 				= require('lodash');

var pat_name 		= './image_processing/document_structure/patricia0.json';
var patricia_doc	= miscutils.fs_readFile(pat_name);
// Dictionary used in testing
var name_dictionary = [	
						{"type":"text",  "content":"Maeda"}, 
						{"type":"regex", "content":["[A-Z]+", ""]}
					  ];

/*
******************************************************************************************************************************
*/
// Running
// Execute a rule that will extract executable
//example2()
function example1(){
	/*
		Name:= [A-Z\s\.]+
		From Title #1
	*/
	var executable = [
		{'function':'from', 			  'function_param': ['Title', 0]},			// First index should always be a from; params should describe how to get there
		{'function':'regular_expression', 'function_param': ['[A-Z\\s\\.]+', '']}	// regex params: [regex string exp, regex flags string]
	];
	extract( pat_name, patricia_doc, executable )
}

function example2(){
	/*
		Name := in(person_name) 
		From Title #1
	*/
	var executable = [
		{'function':'from', 'function_param': ['Title', 0]},						// First index should always be a from; params should describe how to get there
		{'function':'in'  , 'function_param': ['name_dictionary', name_dictionary ]}// in params: [dict name, dict_array]
	];
	extract( pat_name, patricia_doc, executable );
}

function example3(){
	/*
		Name:= is(Person)
		From Title #1
	*/
	var executable = [
		{'function':'from', 'function_param': ['Title', 0]},						// First index should always be a from; params should describe how to get there
		{'function':'is'  , 'function_param': ['Person' ]}							// is params: [entity type]
	];
	extract( pat_name, patricia_doc, executable );
}

/* 
******************************************************************************************************************************
*/

function operator_test(){
	// Test on is()
	isOp("PrintMedia", "Juvenile & Adult Treatment! Individual, Family & Group Counseling\n\n")
	.then(function(data){
		miscutils.logMessage( "Text matching:", 						1);
		miscutils.logMessage( data, 									1);

	});

	// Test on inDict
	inDict("name_dictionary", name_dictionary, "PATRICIA P. PATTERSON\n\n").then(function(match){
		miscutils.logMessage( 'Match between Regex and Dict Entry: ', 	1);
		miscutils.logMessage( match, 									1);
	});
}

/*
******************************************************************************************************************************
*/
/*
	@document_structure is the document structure to execute the rule on e.g. [{page_content:[{group:[{line}, ...]}, {group}, ...]}, {page_content}, ...]
	@executable is an array (we treat it as a stack) of objects indicating which function to execute e.g. {'function_name':name, 'parameters':[]}
*/
function extract(filename, document_structure, executables){
	var Q           = require('Q');
    var deferred    = Q.defer();

	// Check if the first line contains a from function, otherwise, assume 
	// that the string to operate on has already been extracted and appended to the op_params
	if(executables[0].function == 'from'){
		// This is the normal case, where valid rules are execute e.g. the from statement is provided and so is the operator
		var from_elem 	= executables[0].function_param;							// The first element in executables[] is always a from statement
		var box_elem 	= from_elem[0];
		
		var command = "python traverse.py " + filename + " "    + box_elem;
		if( from_elem.length > 1 ){	command = command  + " -n " + from_elem[1];	}	// Assign a box number, n, if an n exist, by checking the from_elem length
		if( from_elem.length > 2 ){	command = command  + " -m " + from_elem[2];	}	// Assign a box number, m, if an m exist

		var i = 1;
		call_traverse(command).then(function(string_arr){							// string_arr is an array of strings to apply the operator on
			miscutils.logMessage(string_arr, 1)
			
			// op_string is the string to apply the operator on. After each iteration, it is bound to change.
			var op_string 	= _.reduce(string_arr, function(sum, string_elem){ return sum + string_elem });
			var op_params 	= executables[i].function_param;						// Operator params e.g. [name_dictionary, etc]
			op_params.push(op_string);  											// Append the string that the executable will be applied to. 

			op_string = execute(op_string, executables, i);
			deferred.resolve(op_string);
		});
	}else{	
		// This case is normally used when the string to operate on has already been extracted e.g. a from statement doesn't exist,
		// from the document structure, thus there is no need to run a 'from' operator.
		// This case should be used with caution and normally should only be invoked for testing the input and output
		// of the operators e.g. in, is, etc, such are the learning phase

		var i 		   = 0;
		var op_string  = executables[i].function_param[executables.length-1];		// The string to operate on, which in this case is already appended to the executable's function_param[]
		var res_string = execute(op_string, executables, i);						// The string to operate on is already embedded within the executable
		deferred.resolve(res_string);
	}
	
	return deferred.promise;
	
}
exports.extract = extract;
/*
	For each over each executable in executables[], and execute an executable .
	@op_string is the string to apply the operator on. After each iteration, it is bound to change.
	@executables contains 
	@i is the index to the curren executable

	For now we assume that the length of executables is one.
*/

function execute(op_string, executables, i){
	// Assuming that executables.length == 1
	var operator 	= executables[i].function; 								// Operator e.g. in
	var op_params 	= executables[i].function_param;						// Operator params e.g. [name_dictionary, etc]

	var Q           = require('Q');
    var deferred    = Q.defer();

	if ( _.isEqual(operator, "is") ){

		isOp.apply(operator, op_params).then(function(data){
			op_string = data;										// Execute operator and Assign a new op_string
			miscutils.logMessage("Finale result after executing " + operator, 	2)
			miscutils.logMessage(op_string, 									2)
			deferred.resolve(op_string);

		});

	}else if ( _.isEqual(operator, "in") ){
		
		inDict.apply(operator, op_params).then(function(data){
			op_string = data;										// Execute operator and Assign a new op_string
			miscutils.logMessage("Finale result after executing " + operator, 	2)
			miscutils.logMessage(op_string, 									2)
			deferred.resolve(op_string);

		});

	}else if ( _.isEqual(operator, "regular_expression") ){

		op_string = regular_expression.apply(operator, op_params);	// Execute operator and Assign a new op_string
		miscutils.logMessage("Finale result after executing " + operator, 		2)
		miscutils.logMessage(op_string, 										2)
		deferred.resolve(op_string);

	}
	return deferred.promise;


	// Create an array of promises and then execute it sequentially
	// This is different than the executables[], because it is better to collect all the promises 
	// rather than calling them recursively them. Then it would be clear when all the executables 
	// have been executed, and afterwards we can actually know when to return the final result! 
	/*var execute_promises = [];

	for(var e=0; e<executables.length; e++){
		var e = 0;
		var operator 	= executables[e].function; 						// Operator e.g. in
		var op_params 	= executables[e].function_param;				// Operator params e.g. [name_dictionary, etc]

		op_params.push(op_string);										// Append the string that the executable will be applied to. 

		var e_promise = "";												// e_promise holds the promise
		if ( _.isEqual(operator, "is") ){
			e_promise = isOp.apply(operator, op_params);
		}else if ( _.isEqual(operator, "in") ){
			e_promise = inDict.apply(operator, op_params);
		}else if ( _.isEqual(operator, "regular_expression") ){
			e_promise = regular_expression.apply(operator, op_params);
		}
		// Add the promise to the execute_promises  
		//execute_promises.push( e_promise );
		
	//}

	// Then execute it sequentially
	console.log(execute_promises)
 
	//We know know that the execution has ended.


	// Recursive version of execute- ------------------------------------------------------------
	/*if( i>=executables.length ){
		//console.log("Return 1");
		// When the code reaches here,  then it means the execute ended.
		// Emit a event
		return op_string;
	}
	var operator 	= executables[i].function; 						// Operator e.g. in
	var op_params 	= executables[i].function_param;				// Operator params e.g. [name_dictionary, etc]

	op_params.push(op_string);  									// Append the string that the executable will be applied to. 

	if ( _.isEqual(operator, "is") ){

		isOp.apply(operator, op_params).then(function(data){
			op_string = data;										// Execute operator and Assign a new op_string
			miscutils.logMessage("Finale result after executing " + operator, 	1)
			miscutils.logMessage(op_string, 									1)

			//if( i < executables.length ){							// Continue if there are more executables
			execute(op_string, executables, i+1);
			//}
		});

	}else if ( _.isEqual(operator, "in") ){

		inDict.apply(operator, op_params).then(function(data){

			op_string = data;										// Execute operator and Assign a new op_string
			miscutils.logMessage("Finale result after executing " + operator, 	1)
			miscutils.logMessage(op_string, 									1)

			//if( i < executables.length ){							// Continue if there are more executables
			execute(op_string, executables, i+1);
			//}

		});

	}else if ( _.isEqual(operator, "regular_expression") ){

		op_string = regular_expression.apply(operator, op_params);	// Execute operator and Assign a new op_string
		miscutils.logMessage("Finale result after executing " + operator, 		1)
		miscutils.logMessage(op_string, 										1)

		//if( i < executables.length ){
		execute(op_string, executables, i+1);
		//}
	}
	//console.log("Return 2");
	*/

}

/*
	Call a python traverser to return the string that matches the descriptions within the @command
	@command is the command line to execute in order to call traverse.py
*/
function call_traverse(command){
	var Q           	= require('Q');
    var deferred    	= Q.defer();
	var exec            = require('child_process').exec;  
    var child           = exec(command);
    var result_data 	= {}
    miscutils.logMessage("Python call for traverse: " + command, 1)

    child.stdout.on('data', function(data){             				// Data format is {data:[string, string, ...]}
        miscutils.logMessage('Data from traverse: ' + data, 1);
        result_data  	= JSON.parse(data).data;
    });

    child.stderr.on('data', function(data){
        miscutils.logMessage('stderr:' + data, 1);
        deferred.reject(err)
    });

    child.on('close', function(code){
        miscutils.logMessage('Closing code for exec traverse\'s python:' + code, 1);
        deferred.resolve( result_data );		
    });

    return deferred.promise;
}

/*
******************************************************************************************************************************
*/
/*
	Return the substring of string that matches the entity type
	@entity_type is an entity type from the list of entities 
	@string is the string of what ever is in the box/part
*/
function isOp(entity_type, string){

	var Q           = require('Q');
    var deferred    = Q.defer();

	NER(string).then(function(found_entities){						// Apply AlchemyAPI NER onto the string
		var match = _.find( found_entities, function( entity_obj ){	// Given the result, a list of NER within the string, find the ones that match @entity_type.
			return  _.isEqual( entity_obj.type, entity_type );		// entity_type: {type:"Person", text:"Maeda Hanafi", relevance, count}
		});
		deferred.resolve( match.text );								// Return that string.
	});

	return deferred.promise;
}

/*
	Find a match between the contents of concept dictionary and string. Return the substring that matches.
	@concept_dictionary, is the name of the dictionary. 
	@dictionary is an array of what is contained in @concept_dictionary e.g. [{type: text, content:"Maeda"}, {type: regex, content:"/[A-Z]+/"}]
*/
function inDict(concept_dictionary, dictionary, string){

	var Q           = require('Q');
    var deferred    = Q.defer();

	miscutils.logMessage('String: ' + string, 								2);

	for(var g = 0; g < dictionary.length; g++){						// Find a match between a string's substring and a dictionary's entry
		
		var dict_entry 		= dictionary[g];
		var regex_string, regex_flags, match;

		if (dict_entry.type == 'regex'){
			regex_string 	= dict_entry.content[0];
			regex_flags 	= dict_entry.content[1];
			match 			= regular_expression(regex_string, regex_flags, string);
		}else if(dict_entry.type == 'type'){
			regex_string 	= dict_entry.content;
			match 			= regular_expression(regex_string, regex_flags, string);
		}
		miscutils.logMessage( 'Dictionary entry: ', 						2);
		miscutils.logMessage( dict_entry, 									2);
		miscutils.logMessage( 'Regex string: ' + regex_string, 				2);
		miscutils.logMessage( 'Match between Regex and Dict Entry: ', 		2);
		miscutils.logMessage( match, 										2);
		miscutils.logMessage( '________________________________________', 	2);

		if (match != null){
			deferred.resolve( match[0] );		
		}
	}

	return deferred.promise;
}

/*
	Return the match of regex at string
	@regex is a regex string //regex literal or a RegExp object

	Note: if string = "PATRICIA P. PATTERSON\\n\\n" and regex = /[A-Z\s\.]+/g, then the newlines are captured, which is wrong.
	if string  = "PATRICIA P. PATTERSON\n\n" and regex = /[A-Z\s\.]+/g, then the newlines are captured, which is wrong
	So, before executing, we must escape the escape characters in string
*/
function regular_expression(regex, regex_flags, string){
	/*console.log(string)
	string = "PATRICIA P. PATTERSON\\n\\n"
	regex = /[A-Z\s\.]+/g
	console.log(regex)
	var mat = string.match(regex)
	console.log( mat)
	return string.match(regex)*/
	//var Q           = require('Q');
    //var deferred    = Q.defer();
	// Escape the escape characters
	string = escape_escape_char(string);
	
	//console.log(string)
	//console.log(regex)
	return string.match(new RegExp(regex, regex_flags));

	//return deferred.promise;
}

/*
******************************************************************************************************************************
*/








/*
	@rules is an array of rules that permute has to consider
*/
function permute(rules, location){

}

var AlchemyAPIEntities = [
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
/*
	@totaltext is the text to extract entities from
	@return is an array of {type: "Person", relevance:0.9, count:3, text: "Maeda Hanafi" }
*/
function NER(totaltext){
	var Q           = require('Q');
    var deferred    = Q.defer();

	alchemy.entities(totaltext, {}, function(err, response) {
		if (err){
			miscutils.logMessage(err, 					1);
			deferred.reject({'data':err})
		}else{
			var entities = response.entities; 					// See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object

			miscutils.logMessage("Processing the NER", 	1);
			miscutils.logMessage(entities, 				1);
			deferred.resolve(entities);
		}
	});
	return deferred.promise;
};

/*
	@string is the string to find escaped characters and escape it's escape character e.g. 
		string = "\n\n" -> @return is "\\n\\n"

*/
function escape_escape_char(string){
	string = string.replace(/\\/g,  "\\\\");			// Escape the escape chracters first! Imortant! We dont want to escape the escape chracters of the those are already escaped
	string = string.replace(/\n/g,  "\\n" );
	string = string.replace(/\t/g,  "\\t" );
	string = string.replace(/\'/g,  "\\'" );
	string = string.replace(/\"/g,  "\\\"");
	string = string.replace(/\r/g,  "\\r" );
	string = string.replace(/\f/g,  "\\f" );
	return string;
}



// Traverse through the document 
	// For now we limit our selves to non chained and non nested box specs; 
	// Thus we limit ourselves to checking what the box type is within the function param 
	/*for(var i = 0; i < document_structure.length; i++){
		var page_content = document_structure[i].page_content;

		for(var j = 0; j < page_content.length; j++){
			var group = page_content[j].group;

			for(var k = 0; k < group.length; k++){
				var line = group[k];
			}
		}
	}*/