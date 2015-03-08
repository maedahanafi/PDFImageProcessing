/********************************************************************************
 Misc Functions
 ********************************************************************************/
//var jsStringEscape = require('js-string-escape')
var _ = require('lodash');

var isConsoleLog = true;
//If you want to debug every single step, enter in 2. Otherwise enter in 1.
//Make sure that isConsoleLog is true though
var debugLevel = 1;

/********************************************************************************
 Functions for logging run time
 ********************************************************************************/
var loggedMessages = []
function logMessage(message, msgDebugLevel){


	if(isConsoleLog) {
		if(debugLevel == 1 && msgDebugLevel == 1){
			console.log(/*jsStringEscape*/(message))
		}else if(debugLevel==2){
			console.log(/*jsStringEscape*/(message))
		}
		
	}
	loggedMessages.push(/*jsStringEscape*/(message))

}
exports.logMessage = logMessage;