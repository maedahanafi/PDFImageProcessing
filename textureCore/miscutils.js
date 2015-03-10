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

function fs_readFile (file, encoding) {
    var Q = require('Q'); 
    var deferred = Q.defer();
    var fs = require('fs');
    fs.readFile(file, encoding, function (err, data) {
        if (err) deferred.reject(err) // rejects the promise with `er` as the reason
        else deferred.resolve(data) // fulfills the promise with `data` as the value
    })
    return deferred.promise // the promise is returned
}
exports.fs_readFile = fs_readFile;