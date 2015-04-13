//var code = "RULE: \nLABELS \n'Title' := REGEX(/[A-Z]{1}[a-z]+/) \nSELECT ('Title') \nFROM FIRST ('TITLE') AT PAGE 1 \nRULE: \nLABELS \n'Abstract Text' := SECTION \nSELECT ('Abstract Text') \nFROM FIRST ('SECTION') AT PAGE 1 \nRULE: \nLABELS \n'Author' := LOOKUP ('Name Dictionary') \nSELECT ('Author') \nFROM AFTER 'TITLE'\nDICTIONARIES:\n 'Name Dictionary' := REGEX(/[A-Z]{1}[a-z]+\\s[A-Z]{1}[a-z]+/)\n";
var code = "RULE: \nLABELS\n'School' := LOOKUP ( 'University Dictionary' ) \n'Major' := LOOKUP('MAJOR DICTIONARY') \n'Year' := REGEX(/[0-9]{4}/)\n    PERMUTE ( 'Major', 'Year')\n	SELECT ('School')\nFROM \n 	AFTER 'Education' \n 	AT PAGE 3 \nDICTIONARIES:\n	'University Dictionary' := KEYWORD 'University' || REGEX(/\\w+\\sUniversity/)"

														// Constants
														// Indicators
var RULE 			= 'RULE', 
	LABELS 			= 'LABELS', 
	DICTIONARIES 	= 'DICTIONARIES';
														//Operators
var SELECT 			= 'SELECT',
	OPTIONAL 		= 'OPTIONAL',
	PERMUTE 		= 'PERMUTE',
	FROM 			= 'FROM',
	LOOKUP 			= 'LOOKUP',
	IN 				= 'IN',
	BEFORE 			= 'BEFORE',
	AFTER 			= 'AFTER',
	FIRST 			= 'FIRST',
	LAST 			= 'LAST',
	PAGE 			= 'AT PAGE';
														//Types 
var SECTION 		= 'SECTION', TITLE = 'TITLE',		//LINE_TYPE
	REGEX 			= 'REGEX', KEYWORD = 'KEYWORD', 	//TOKEN
	SYN 			= 'SYN';
													
var KEYWORDS 		= [									//A list of important keywords
						RULE, LABELS, DICTIONARIES, 
						SELECT, OPTIONAL, PERMUTE, FROM, LOOKUP, IN, BEFORE, AFTER, FIRST, LAST, PAGE, 
						SECTION, TITLE, REGEX, KEYWORD, SYN
					];

var HIGHLIGHT_DEFINITION	= [RULE, LABELS];
var PATTERN_OP				= [SELECT, OPTIONAL, PERMUTE];
var PAGE_DESCRIPTION		= [IN, BEFORE, AFTER, FIRST, LAST]

var OPEN_PARENTHESES 		= '(',
	CLOSE_PARENTHESES 		= ')',
	COLON 					= ':',
	COMMA 					= ',',
	OR 						= '||',
	AND 					= '&&',
	COMMENT					= '//',
	ASSIGN 					= ':=';

var OneCharacterSymbols 	= [OPEN_PARENTHESES, CLOSE_PARENTHESES, COLON, COMMA];
var TwoCharacterSymbols 	= [OR, ASSIGN, COMMENT, AND];

														// Symbols in the Label clause that should be treated as tokens.
var LABEL_SYMBOLS 			= [OPEN_PARENTHESES, CLOSE_PARENTHESES, AND, OR];	
														
var STRING             		= "STRING",					//TokenTypes for things other than symbols and keywords
	NUMBER             		= "NUMBER",
	COMMENT            		= "COMMENT",
	EOF                		= "EOF";
/****************************************************************************************************************

**************************************************************************************************************/

//Requires
var _ 			= require('lodash');
var miscutils 	= require('./miscutils');


//Read in a sample json of a document structure:
miscutils.fs_readFile ('image_processing/document_structure/miller0.json').then(function(contents){
	var doc_struct = JSON.parse( contents);
});

try{
	begin(code);
}catch(err){
	miscutils.logMessage ('Syntax and parsing error: ' + err, 1);
}
//Begin Executing


//Tokenize the string
function begin(code){

	var tokens 			= code.split('\n');
	var rules 			= [];		//Each slot contains a rule e.g. rules[ rule1[line1, line2,...], rule2[...], etc ]
	var dictionaries 	= [];		//Each slot contains a dictionary e.g. dictionaries[ dict1[...], dict2[...], etc ]
	var rules_index 	= -1;
	var dict_index 		= -1;
	var flag 			= 'Rule'; 	//Rule indicates that the token should be added to the current slot for rules[]

	for(var i = 0; i < tokens.length; i++){
		var curr_token = tokens[i];

		if 	( isStart(curr_token, RULE, false) ){	
			
			//A new rule
			rules_index++;
			rules.push([]);
			rules[rules_index].push(curr_token);
			flag = 'Rule';
		
		}else if ( isStart(curr_token, DICTIONARIES, false) ){	
			
			//A new dictionary
			dict_index++;
			dictionaries.push([]);
			dictionaries[dict_index].push(curr_token);
			flag = 'Dict';

		}else if (flag == 'Rule'){	

			//Add rest of the lines of a rule to the current rule slot
			rules[rules_index].push(curr_token);

		}else if (flag == 'Dict'){ 

			//Add rest of the lines of a dictionary to the current dictionary slot
			dictionaries[dict_index].push(curr_token);

		}
	}

	miscutils.logMessage ('Rules:', 		1);
	miscutils.logMessage (rules, 			1);
	miscutils.logMessage ('Dictionaries:', 	1);
	miscutils.logMessage (dictionaries, 	1);

	var structured_code = process_rules(rules);
	return structured_code;

}


/*
	@rules is an array of rules e.g. rules[ rule1[line1, line2,...], rule2[...], etc ] 
	@returns a structure that contains information on what it has extracted, which is later used to determine what 
	execution path to take e.g. 
*/
function process_rules(rules){
	var structure = [];
	for(var i = 0; i < rules.length; i++){
		var rule 	= rules[i];					//rule is an array of tokens within a rule  e.g. ['RULE', 'LABELS', '...', ...]
		/*
			For each line within a rule, 
			1) Gather the labels 				e.g. Label line
			2) Gather the pattern operator 		e.g. Permute line
			3) Gather the location information 	e.g. From line
		*/
		
		var labels 		= get_labels(rule);
		miscutils.logMessage ('Labels parsed:', 			1);
		miscutils.logMessage (JSON.stringify(labels), 		1);

		var pattern_op 	= get_pattern_operator(rule);
		miscutils.logMessage ('Pattern operator parsed:', 	1);
		miscutils.logMessage (JSON.stringify(pattern_op), 	1);

		var location 	= get_location(rule);
		miscutils.logMessage ('Location parsed:', 			1);
		miscutils.logMessage (JSON.stringify(location), 	1);


	}
}


/*
	Location refers to FROM clause
s	@rule_arr is an array of tokens within a rule  e.g. ['RULE', 'LABELS', 'PERMUTE ...', ...]

*/
function get_location(rule_arr){

	// The last line is always the FROM clause. Remove the FROM word and manipulate the rest of the string
	//var place_desc 			= rule_arr[ rule_arr.length-1 ].replace(FROM, '');
	
	var location_operators 	= [];
	var i 					= 0;
	var pageRegex 			= new RegExp(PAGE + " " +"(\\d+)");

	while(i < rule_arr.length){
		var line = rule_arr[i];
		if(isStart(line, PAGE)){
			// The format of place description: PLACE_DESCRIPTION AT PAGE N
			// PLACE_DESCRIPTION could be BEFORE or AFTER 
			var isPage 		= line.match(pageRegex);
			if(isPage != null){
				var page_op = {
								'location_operator' : PAGE,
								'parameters' 		: isPage[1]
							  } 
				location_operators.push(page_op);
				line 		= line.replace(pageRegex, '');				// Remove the PAGE operator from place_desc
			}
			// Then, since each operator is delimited by ||, then split by it, and for each operator gather its params
			//var loc_defs 	= line.split(OR);
			console.log(line)
			console.log(isPage)
			//console.log(loc_defs)
		}else if (isStart(line, PAGE_DESCRIPTION)){
			// Check if line starts with page description

		}
		i++;
	}

}


/*
	Pattern operator refers to operators such permute
	@rule_arr is an array of tokens within a rule  e.g. ['RULE', 'LABELS', 'PERMUTE ...', ...]
	@returns an array of {'pattern_operator', 'parameters'}
*/
function get_pattern_operator(rule_arr){

	var all_pattern_op 	= [];
	var i 				= 0;
	while(i < rule_arr.length){
		var result_details = isStart(rule_arr[i], PATTERN_OP, true);
		if ( result_details[0] ){							// Manipulate each every line that begins with pattern operator
			
			var operator 		= result_details[1];		// Assign the operator e.g. PERMUTE to the var operator
			var pattern_line 	= rule_arr[i];				// Assign the line that belongs to the pattern operator to pattern_line

			// The parameters to the operators is the string following the operator and they are between parentheses
			// Firstly, replace the first occurence of the operator with blank, then split by commas and then store in array op_param[]
			var op_param 	 	= splitParamsByComma( pattern_line.replace(operator, '') );		

			all_pattern_op.push({
				'pattern_operator'	: operator,
				'parameters'		: op_param
			});

			miscutils.logMessage('Pattern code: ' 		+ pattern_line, 			2);
			miscutils.logMessage('Pattern operator: ' 	+ operator, 				2);
			miscutils.logMessage('Operator parameters: '+ JSON.stringify(op_param), 2);
		}
		i++;
	}

	return all_pattern_op;
}


/*
	@rule_arr is an array of tokens within a rule  e.g. ['RULE', 'LABELS', '...', ...]
	@returns an array of label structures [ {'label_name':'', 'operator_arr':[{operator, params}, {...}, ...] } ]
*/
function get_labels(rule_arr){
									//Scan the lines from 'labels to the one before any one of the PATTERN tokens'
	var labels 		= []; 			//Highlight information in structured form
	var i 			= 0;
	
	while(i < rule_arr.length){
		var line 	= rule_arr[i];
		if ( isStart(line, PATTERN_OP, false) ){						
			break;					// If the line begins with a PATTERN token, break from the loop
		} else if ( isStart(line, STRING, false) ){	
									// If the first word contains a STRING, then take the line and tokenize it in order to put it in the highlight structure.
			labels.push(structure_label(line));
		}
		i ++;
	}

	return labels;
}


/*
	@line Format expected by line is as follows:
		LABEL := REGEX(REGEXP) || KEYWORD || SYN || LINE_TYPE || LOOKUP(STRING)
		e.g. 'School' := LOOKUP ('University Dictionary') || REGEX('Digit'  'Digit' 'Digit' 'Digit')
	@returns {'label_name':'', 'operator_arr':[{operator, params}, {...}, ...] }
	operator_arr could be nested to support AND and OR ops

*/
function structure_label(line){

	var label_struct 		= {'label_name':'', 'operator_arr':[] };

	// Grab the label name via regular expression (note the use := ) and store it into the label name
	label_struct.label_name = line.match(/'(\w+)'[\s]*:=/)[1];  			// quote capture(words) quote space :=

	// Break apart right hand side by delimiting with the || into individual strings and store into defs[]
	var RHS 				= line.match(/:=(.+)/)[1]; 						// := capture(anyCharacter)
	var defs 				= RHS.split(OR);

	miscutils.logMessage('Label defs: ' + JSON.stringify(defs), 2);

	// For each def, store operator and associated params in the label struct.
	// A def should have the following format: OPERATOR PARAMS
	defs.forEach(function(def){

		var def_op 			= def.match(/\w+/)[0]; 							// The first token e.g. word is the operator
		var params_string 	= def.match(/\w+\s*\(*([\w\W\s,\']+)\)*/)[1];	// words spaces parentheses captureany(words space commas quotes) parentheses
		var params_arr 		= splitParamsByComma(params_string);			// Only commas split between parameters and other characters for spliting would split the ones within quotes
		
		
		var operator_obj 	= {
								'operator' 	:def_op, 
								'params'	:params_arr
							};
		
		label_struct.operator_arr.push(operator_obj);

		miscutils.logMessage ('Operator: '  + def_op, 		 2);
		miscutils.logMessage ('Op params: ' + params_string, 2);
		
	});
	return label_struct;
}


/*
	Regular expression matcher that strictly matches @in_token e.g. RULE in the beginning by ignoring whitespaces
	@in_token could be an array of strings or a string token. 
	@string is the string @string begins with @in_token
	@detail is a boolean indicating whether a detailed result in array form should be returned e.g. [true, t'th token found]
*/
function isStart(string, in_token, detail){
	if( _.isArray(in_token) ){
		// If it is an array, then it will check if one of the tokens in the array begins in the string.
		for(var t = 0; t < in_token.length; t++){
			if(	_.startsWith(string, in_token[t]) || (new RegExp("[\\s]*"+in_token[t])).test(string)){	//multiple spaces in_token
				if(detail){
					return [true, in_token[t]];
				}
				return true;
			}
		}

		if(detail){
			return [false];
		}
		return false;
	}else if(_.isEqual(in_token, STRING)){	
		// in_token is THE STRING TOKEN. In this case we use a special regex test for STRING.
		// This test if the beginning is a STRING. By the language, if the string is in the beginning, 
		// then it must be followed by :=

		return (new RegExp("(\\\'.+\\\')\\s*:=")).test(string);		//openParentheses quote anyChar quote closeParentheses spaces :=
	}else{		
		// Other token checks go here.
		// The second check ignores the whitespaces before the token.

		return 	_.startsWith(string, in_token) || (new RegExp("[\\s]*"+in_token)).test(string);		
	}
	return false;
}


/****************************************************************************************************************
	Functions that deal with manipulating the code with regex
**************************************************************************************************************/


/*
	@params_string is the string containing parameters delimited by commas (which is the only way parameters are distinguished from one another)
	e.g. param1 , param2,   param3
	@returns an array 
*/
function splitParamsByComma(params_string){
	var split 	 = params_string.split(/\s*,\s*/); 
	// The starts and ends of params arr may have spaces or open or close parentheses. So clean it.
	for(var t = 0; t < split.length; t++){
		split[t] = cleanParams( split[t] );
		miscutils.logMessage('Param spaces and parentheses cleanup:' + split[t], 2);
	}
	return split;
}


/*
	@dirty_line refers to a string containing parameter information and is surrounding with parentheses and spaces e.g.   (   PARAM1, PARAM2   )
	@returns a clean string meaning that the string is void of parentheses and spaces on the sides
*/
function cleanParams(dirty_line){
	dirty_line 	= dirty_line.replace(/^[\s\(\)]*/, '');		// begining space parentheses replace all with nothing
	dirty_line 	= dirty_line.replace(/[\s\(\)]*$/, '');		// space parentheses end replace all with nothing
	return dirty_line;										// Now clean!
}






/*var line_tok = tokenize(line);
			console.log('highlight info')
			console.log(line_tok)*/
/*	MUCH COMPLICATED
	@in_string is a string to tokenize
	@special_char_arr is an array of certian symbols to also treat as 'words' such as parentheses.
	Tokenize means to get an array of all words seperated by whitespaces and certain symbols such as parentheses.
*/

function tokenize(in_string, special_char_arr){
	//In the case where certian symbols should be extracted as tokens, which sometimes isn't seperated by spaces, 
	//the split should occur on symbols before whitespaces.
	//Scan through each letter. Add the letter to the current word if it is in special_char_arr or 
	//not a white space.
	//Replace special chars with spaces around the special chars
	special_char_arr.forEach(function(spec_char){
		in_string = in_string.replace(new RegExp(spec_char, g), ' '+ spec_char +' ')
	})
	//Replace consecutive spaces with a single question mark (because the language doesn't use it) and split based on that.
	in_string = in_string.replace(/\s+/g, '?');
	var tok_arr = in_string.split("?");
	//Check over tok_arr for any special characters attached to each word and detach them
	/*var t = 0;
	while(t<tok_arr.length){
		var curr_tok = tok_arr[t];
		if( (start_check = isStart(curr_tok, special_char_arr, true))[0] ){

			tok_arr[t] = tok_arr[t].replace(new RegExp(''+start_check[1]), '');
		}
		t++;
	}*/

	return tok_arr;
}
	/*var tok_arr = [];
	var tok_ind = 0;
	var curr_tok = '';
	var t = 0;
	while(t < in_string.length){
		var letter = in_string[t];
		if(_.isExist(letter, special_char_arr) ){
			curr_tok.add
		}else if(letter != ' '){

		}

		//A new token must be added, if the previous was a whitespace and the the current is a token
		// OR if the previous was a special char and the current one is a word (if the current one is 
		// a space, a new token shouldn't be added). 
		// When a new token must be added, then we add the curr_tok to tok_arr, clear curr_tok's contents, and then we
		// must increase tok_ind. 
		t++;
	}*/
