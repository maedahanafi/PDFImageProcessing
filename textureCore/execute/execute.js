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



var miscutils 			= require('./../miscutils.js');
var _ 					= require('lodash');

var regex_executor 		= require('./execute_regex.js');
var is_entity_executor 	= require('./execute_is_entity.js');
var in_dict_executor 	= require('./execute_in_dict.js');

var call_traverse 		= require('./../traverse/call_traversal.js');


var pat_name 			= 'image_processing/document_structure/patricia0.json';
var patricia_doc		= miscutils.fs_readFile(pat_name);
// Dictionary used in testing
var name_dictionary 	= [	
							{"type":"text",  "content":"Maeda"}, 
							{"type":"regex", "content":["[A-Z]+", ""]}
						  ];


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
		
		var command = "\'" + filename + "\' "    + box_elem;
		if( from_elem.length > 1 ){	command = command  + " -n " + from_elem[1];	}	// Assign a box number, n, if an n exist, by checking the from_elem length
		if( from_elem.length > 2 ){	command = command  + " -m " + from_elem[2];	}	// Assign a box number, m, if an m exist

		var i = 1;
		new require("./../traverse/call_traversal.js")(command).run().then(function(string_arr){							// string_arr is an array of strings to apply the operator on
			miscutils.logMessage(string_arr, 1)
			
			// op_string is the string to apply the operator on. After each iteration, it is bound to change.
			var op_string 	= _.reduce(string_arr, function(sum, string_elem){ return sum + string_elem });
			var op_params 	= executables[i].function_param;						// Operator params e.g. [name_dictionary, etc]
			op_params.push(op_string);  											// Append the string that the executable will be applied to. 
 
 			execute(op_string, executables, i).then(function(op_string){
				deferred.resolve(op_string);
			});
		});
	}else{	
		// This case is normally used when the string to operate on has already been extracted e.g. a from statement doesn't exist,
		// from the document structure, thus there is no need to run a 'from' operator.
		// This case should be used with caution and normally should only be invoked for testing the input and output
		// of the operators e.g. in, is, etc, such are the learning phase

		var i 		   = 0;
		var op_string  = executables[i].function_param[executables.length-1];			// The string to operate on, which in this case is already appended to the executable's function_param[]
		execute(op_string, executables, i).then(function(res_string){ 					// The string to operate on is already embedded within the executable
			deferred.resolve(res_string);
		})						
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

	// Validation check: op_string shouldn't be undefined
	if( _.isUndefined(op_string) ){
		return Q.fcall(function () {	// Return value using Q.fcall, otherwise function within then() will not be called
		    return -1;
		});
	}

	if ( _.isEqual(operator, "is") ){

		is_entity_executor.isOp.apply(operator, op_params).then(function(data){	// !!!! data is an array !!!!
			op_string = data;												// Execute operator and Assign a new op_string
			miscutils.logMessage("Finale result after executing " + operator, 	2)
			miscutils.logMessage(JSON.stringify(op_string),						2)
			deferred.resolve(op_string);

		});

	}else if ( _.isEqual(operator, "in") ){
		
		in_dict_executor.inDict.apply(operator, op_params).then(function(data){
			op_string = data;												// Execute operator and Assign a new op_string
			miscutils.logMessage("Finale result after executing " + operator, 	2)
			miscutils.logMessage(JSON.stringify(op_string),						2)
			deferred.resolve(op_string);

		});

	}else if ( _.isEqual(operator, "regular_expression") ){

		op_string = regex_executor.regular_expression.apply(operator, op_params);			// Execute operator and Assign a new op_string
		miscutils.logMessage("Finale result after executing " + operator, 		2)
		miscutils.logMessage(JSON.stringify(op_string),							2)
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
******************************************************************************************************************************
*/


/*
	@rules is an array of rules that permute has to consider
*/
function permute(rules, location){

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