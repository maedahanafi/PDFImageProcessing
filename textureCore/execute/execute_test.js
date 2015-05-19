
/*
	Tests the input and output of execute.js functions.
*/

var executor 		= require('./execute.js');
var miscutils 		= require('./../miscutils.js');
var fs 				= require('fs');


// Test data:
var pat_name 		= __dirname + '/../image_processing/document_structure/patricia0.json';// read wrt to the execute folder
var patricia_doc	= JSON.parse(fs.readFileSync(pat_name))//miscutils.fs_readFile(pat_name);

// Dictionary used in testing
var name_dictionary = [	
						{"type":"text",  "content":"PATRICIA P. PATTERSON"}, 
						{"type":"regex", "content":["[A-Z]+", ""]},
						{"type":"entity", "content":"Person"},
						{"type":"regex", "content":["[A-Z\\s\\.]+", ""]},		// Regex match
						{"type":"regex", "content":["([A-Z\\s\\.]+)\\n", ""]}	//Capture group entry example
					  ];
/*
******************************************************************************************************************************
*/
// Running
// Execute a rule that will extract executable
example5()
function example1(){
	/*
		Name:= [A-Z\s\.]+
		From Title #1
	*/
	var executable = [
		{'function':'from', 			  'function_param': ['Title', 0]},			// First index should always be a from; params should describe how to get there
		{'function':'regular_expression', 'function_param': ['[A-Z\\s\\.]+', '']}	// regex params: [regex string exp, regex flags string]
	];
	executor.extract( pat_name, patricia_doc, executable ).then(function(rs){
		console.log(rs)
	})
	// @return is: {"operator":"regular_expression","result":"PATRICIA P. PATTERSON"}
	
	
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
	executor.extract( pat_name, JSON.parse(fs.readFileSync(pat_name)), executable );
	// return is e.g. 
	/*Results of whole dictionary execution: 
		[ { operator: 'regular_expression',
		    result: 'PATRICIA P. PATTERSON' },
		  { operator: 'regular_expression', result: 'PATRICIA' },
		  { operator: 'is', result: [ 'PATRICIA P. PATTERSON' ] },
		  { operator: 'regular_expression',
		    result: 'PATRICIA P. PATTERSON' } ]*/
}

function example3(){
	/*
		Name:= is(Person)
		From Title #1
	*/
	var executable = [
		{'function':'from', 'function_param': ['Line', 0]},							// First index should always be a from; params should describe how to get there
		{'function':'is'  , 'function_param': ['Person' ]}							// is params: [entity type]
	];
	executor.extract( pat_name, JSON.parse(fs.readFileSync(pat_name)), executable );
	//@return should include an array of entities found e.g. {"operator":"is","result":["PATRICIA P. PATTERSON"]}
}

function example4(){
	/*
		School:=/[A-Z\s\.]+/
		From Title #1
		After Section #1
	*/
	var executable = [
		{'function':'from', 'function_param': ['Title', 0]},	
		{'function':'after', 'function_param':['Section', 0]},						
		{'function':'regular_expression'  , 'function_param': ['[A-Z\\s\\.]+', '']}					
	];
	executor.extract( pat_name, JSON.parse(fs.readFileSync(pat_name)), executable ).then(console.log);
}

function example5(){
	/*
		School:=/[A-Z\s\.]+/
		From Title #1
		After "Education"
	*/
	var executable = [
		{'function':'from', 'function_param': ['Title', 0]},	
		{'function':'after', 'function_param':['string', 'EXPERIENCE']},		// The first parameter of the second clause indicates the type of paramters e.g. regex, box, or string					
		{'function':'regular_expression'  , 'function_param': ['[A-Z\\s\\.]+', '']}					
	];
	executor.extract( pat_name, JSON.parse(fs.readFileSync(pat_name)), executable ).then(console.log);
}
/* 
******************************************************************************************************************************
*/

function operator_test(){
	// Test on is()
	executor.isOp("PrintMedia", "Juvenile & Adult Treatment! Individual, Family & Group Counseling\n\n")
	.then(function(data){
		miscutils.logMessage( "Text matching:", 						1);
		miscutils.logMessage( data, 									1);

	});

	// Test on inDict
	executor.inDict("name_dictionary", name_dictionary, "PATRICIA P. PATTERSON\n\n").then(function(match){
		miscutils.logMessage( 'Match between Regex and Dict Entry: ', 	1);
		miscutils.logMessage( match, 									1);
	});
}