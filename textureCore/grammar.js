//Constants
// Indicators
var RULE 			= 'RULE:', 
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
	PAGE 			= 'PAGE';
//Types 
var SECTION 		= 'SECTION', TITLE = 'TITLE',	//LINE_TYPE
	REGEX 			= 'REGEX', KEYWORD = 'KEYWORD', //TOKEN
	SYN 			= 'SYN';

//A list of important keywords
var KEYWORDS = [
					RULE, LABELS, DICTIONARIES, 
					SELECT, OPTIONAL, PERMUTE, FROM, LOOKUP, IN, BEFORE, AFTER, FIRST, LAST, PAGE, 
					SECTION, TITLE, REGEX, KEYWORD, SYN
				];

var OneCharacterSymbols = ['(', ')', ':', ','];
var TwoCharacterSymbols = ['||', ':=', '//'];

//TokenTypes for things other than symbols and keywords
var STRING             	= "STRING",
	NUMBER             	= "NUMBER",
	COMMENT            	= "COMMENT",
	EOF                	= "EOF";

