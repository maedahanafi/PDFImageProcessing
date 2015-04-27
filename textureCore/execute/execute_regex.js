/*
	Return the match of regex at string in standard form: 	
	@return is a promise, a promise that will return an object i e.g. {operator:'regular_expression', result:___}

	@regex is a regex string //regex literal or a RegExp object

	Note: if string = "PATRICIA P. PATTERSON\\n\\n" and regex = /[A-Z\s\.]+/g, then the newlines are captured, which is wrong.
	if string  = "PATRICIA P. PATTERSON\n\n" and regex = /[A-Z\s\.]+/g, then the newlines are captured, which is wrong
	So, before executing, we must escape the escape characters in string
*/
function regular_expression(regex, regex_flags, string){
	// Escape the escape characters
	string 		= escape_escape_char(string);
	var match 	= string.match(new RegExp(regex, regex_flags));
	if(match == null){
		match = undefined;
	}else{	// The format should be [match, index found, string]
		match = match[0]
	}
	return {'operator':'regular_expression', 'result':match};
}
exports.regular_expression = regular_expression;

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