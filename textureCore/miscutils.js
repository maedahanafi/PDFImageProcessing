/********************************************************************************
 Misc Functions
 ********************************************************************************/
var _ = require('lodash');

var isConsoleLog 	= true;
//If you want to debug every single step, enter in 2. Otherwise enter in 1.
//Make sure that isConsoleLog is true though
var debugLevel 		= 2;

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


function saveLog(){
	write_to_file('log/log.txt', JSON.stringify(loggedMessages));
}
exports.saveLog = saveLog;


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


function write_array_to_file(out_file, array){
	var string 	= _.reduce(array, function(n, sum){
		sum 	= sum + n + '\n';
	});
	write_to_file(out_file, string);
}
exports.write_array_to_file = write_array_to_file;


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


// Credits to http://blog.victorquinn.com/javascript-promise-while-loop
// A while loop that is sequential and returns promises
function promise_while(condition, action) {
	var Q 		 = require('Q');
    var resolver = Q.defer();
    var results	 = [];
    var loop = function() {
        if (!condition()){ 
        	//console.log('Break out of loop')
        	return resolver.resolve(results);
        }
        return action()
            	.then(function(result){
			    	results.push(result);
            		return Q.fcall(loop());
            	})/*.catch(function(err){
					console.log('err:'+err)
					resolver.reject(err)
				});*/
    };

    loop();
    //process.nextTick(loop);

    return resolver.promise;
};
exports.promise_while = promise_while;

// Returns a boolean indicating whether inArr contains a null
function isNullExist(inArr){
	// Since even checking for nulls cannot be done while in the loop e.g. trying to get the contents of a slot that is null is not possible/error
	var isNullExist = _.findIndex(inArr, function(chr) {
		return chr == null;
	})
	return isNullExist != -1;
}
exports.isNullExist = isNullExist;
