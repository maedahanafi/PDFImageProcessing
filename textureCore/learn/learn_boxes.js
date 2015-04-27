/*
	Box learner
*/
var miscutils 		= require('./../miscutils');
var _ 				= require('lodash');
// The valid boxes we will learn. Should words be added too?
//  highlight_type is the key to find information on the box_type within the highlight structure
var BOXES = [
				{'box_type':'Line', 	'highlight_type':'line_number'}, 
				{'box_type':'Section', 	'highlight_type':'group_number'}, 
				{'box_type':'Page', 	'highlight_type':'page_number'}
			];
/*
	@highlights is the array of highlights
*/
function learnBoxes(highlights){
	var valid_from_statement = [];											// Partial executable statements for the from clause
	// All boxes are valid
	// However, the n (and m) varies for each box.
	for(var i=0; i<BOXES.length; i++){ 										// For each possible box, learn a range from n to m that is valid for all highlights
		var box_type = BOXES[i].box_type;
		var n 	= 0, 														// Let n be the starting point in which a highlight appears. It is the minimum line_number, page_number, or group_number.
			m 	= n; 														// Let m be the largest int in which a highlight appears
		var key = BOXES[i].highlight_type;									// key is the key name that stores the location of the highlight e.g. key = 'line_number' if box_type = Line

		var sorted = _.sortBy(highlights, function(highlight_elem) { 		// Sort the highlights based on where they are located in the doc structure
			return highlight_elem[key];
		});
		miscutils.logMessage('Sorting by ' + key, 		3);
		miscutils.logMessage(sorted, 					3);

		n = sorted[0][key];
		m = sorted[sorted.length - 1][key];
		miscutils.logMessage('n: ' + n + ', m: ' + m, 	3);
		
		// Line type can vary either as Title or Section, other than that the types for Page and Section such as Paragraph are just other ways of refferring to the exact same thing
		if(box_type == 'Line' && n == 0 && m == 0){  						// If the n learned happens to be located at 0 and m is also 0, then simply call the line Title.
			box_type = 'Title';	
		}
		var exec = {'function':'from', 'function_param': [box_type, n, m]};
		valid_from_statement.push(exec);
	}

	miscutils.logMessage('Number of possible boxes:' + valid_from_statement.length, 1);
	miscutils.logMessage('All possible boxes:', 		2);
	miscutils.logMessage(valid_from_statement,  		2);

	return valid_from_statement;
}
exports.learnBoxes = learnBoxes;