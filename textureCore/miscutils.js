/********************************************************************************
 Misc Functions
 ********************************************************************************/
var _ = require('lodash');

var isConsoleLog 	= true;
//If you want to debug every single step, enter in 2. Otherwise enter in 1.
//Make sure that isConsoleLog is true though
var debugLevel 		= 1;

/********************************************************************************
 Functions for logging run time
 ********************************************************************************/
var loggedMessages = []
function logMessage(message, msgDebugLevel){
	if(isConsoleLog) {
		if(debugLevel == 1 && msgDebugLevel == 1){
			console.log((message));
		}else if(debugLevel == 2){
			console.log((message));
		}
	}
	loggedMessages.push((message));
}

exports.logMessage = logMessage;


function fs_readFile (file, encoding) {
    var Q 			= require('Q'); 
    var deferred 	= Q.defer();
    var fs 			= require('fs');
    fs.readFile(file, encoding, function (err, data) {
        if (err) deferred.reject(err) 					// rejects the promise with `er` as the reason
        else deferred.resolve(data) 					// fulfills the promise with `data` as the value
    })
    return deferred.promise 							// the promise is returned
}
exports.fs_readFile = fs_readFile;



function write_to_file(out_file, content){
	var fs = require('fs');
	fs.writeFile(out_file, content, function(err) {
	    if(err) {
	        return logMessage(err, 1);
	    }
	    logMessage("The file " + out_file + " was saved!", 1);
	}); 
}
exports.write_to_file = write_to_file;

