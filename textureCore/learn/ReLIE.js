var _ = require("lodash");

var user_regex = "[A-Z\\.\\s]+" ///[A-Z]+\s[A-Z]+/

var highlight_positive_training = ["RAVI AMON", "MAEDA F. HANAFI", "HARSHINI J", "ADAM HANAFI"];
var highlight_negative_training = ["Southern Connecticut State Univ."/*, "NYU"*/]	
var highlight_training = {'positive':highlight_positive_training, 'negative':highlight_negative_training};

var highlight_positive_validation = ["HELEN PARKER", "AZZA A. ABOUZIED"];
var highlight_negative_validation = ["United States of America", "SCSU"]	
var highlight_validation = {'positive':highlight_positive_validation, 'negative':highlight_negative_validation};

var transformations = [drop_disjunct, intersect_include];

var finale_regex = ReLIE(user_regex, highlight_training, highlight_validation, transformations);
console.log("complex final regex:", finale_regex);


function ReLIE(user_regex, highlight_training, highlight_validation, transformations){
	var regex_new = user_regex;
	// Dictionary of all the negative examples from training e.g. ["...", "...", ...]
	var negative_dictionary = highlight_training.negative;//.concat(_.pluck(highlight_validation, 'negative'));
	console.log(negative_dictionary)
	do{
		var candidates = [];
		for(var i=0; i<transformations.length; i++){
			var candidate_regex = transformations[i].apply(null, [regex_new, negative_dictionary]);
			candidates.push(candidate_regex);
		}

		var regex_prime = _.max(candidates, function(candidate_regex){
			return f_score(user_regex, candidate_regex, highlight_training);
		});

		if( f_score(user_regex, regex_prime, highlight_training)<=f_score(user_regex, regex_new, highlight_training) ){
			return regex_new;
		}
		if( f_score(user_regex, regex_prime, highlight_validation)<f_score(user_regex, regex_new, highlight_validation) ){
			return regex_new;
		}
		regex_new = regex_prime;
	}while(true);
}

/* 
	@regex_init is the initial regex
	@regex is the regex; the candidate regex
	@training_data e.g. {positive:[...], negative:[...]}
*/
function f_score(regex_init, regex, training_data){
	regex_init = new RegExp(regex_init);
	regex = new RegExp(regex);

	var p = precision(regex, training_data.positive, training_data.negative);
	var r = recall(regex_init, regex, training_data.positive);
	var f = (2 * p * r) / (p + r);
	console.log("f_score("+regex_init+", "+ regex +","+training_data+ "):", f)
	return f;
}

function precision(regex, positive, negative){
	regex = new RegExp(regex);

	// precision = positive examples / all examples
	var positive_ex = match(regex, positive).length;
	var negative_ex = match(regex, negative).length;
	var p = ( positive_ex )/( positive_ex +  negative_ex); 
	console.log("precision("+regex+", "+ positive +","+negative+ "):", positive_ex+"/"+( positive_ex +  negative_ex) +" = "+p)
	return p;
}

function recall(regex_init, regex, positive){
	regex = new RegExp(regex);
	
	// recall = positive examples / positive examples from input regular expression
	var r = match(regex, positive).length / match(regex_init, positive).length;
	console.log("recall("+regex_init+", "+regex+", "+positive+"):", r)
	return r;
}

/*
	@regex is the regex to test the match agains e.g. /[0-9]+/
	@doc is an array to test @regex with e.g. ["Abc", "0-9"]
	@return the set of match regex from the set of doc e.g. ["0-9"]
*/
function match(regex, doc){
	var matches = _.filter(doc, function(n){
		var m = n.match(regex);
		if(m == null){
			return false;
		}
		return _.isEqual(m[0], n);	// Check if regex match's on n result equals n
	});
	//console.log("matches("+regex+", "+doc+"):", matches)
	return matches;
}

// Transformations
function drop_disjunct(regex){
	
	return regex;
}

/*
	@regex is the current regex to transform
	@negatives is the array of negative examples to include within the regex
*/
function intersect_include(regex, negatives){

	var negative_dictionary_string = "\\Q" + negatives[0] + "\\E";// Should yield negative dictionary entry followed by | if needed
	for(var i=1; i<negatives.length; i++){
		negative_dictionary_string = negative_dictionary_string + "|" + "\\Q" + negatives[i] + "\\E";
	}	
	var new_regex = new RegExp("(?!"+negative_dictionary_string+")"+regex);
	console.log("New regex:"+new_regex);

	return new_regex;
}