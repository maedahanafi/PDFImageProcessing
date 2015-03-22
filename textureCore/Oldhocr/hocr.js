/*
Functions that call Tesseract for HOCR which returns font information
*/
var miscutils = require('./miscutils');

/*
@image_file includes the whole filename and ext e.g. 'hocr/image1.png'
@output is only the filename since it is already assume 'image1'
*/
exports.HOCR = function(image_file, output){
	var Q = require('Q');
	var deferred = Q.defer();

	//Invoke a child process that calls tesseract
	var exec = require('child_process').exec;  
	var cmd = 'tesseract '+image_file +' ' + output +' hocr'; //'tesseract ' +image_file+' ' +output +' '+options;  
	var child = exec(cmd);

	child.on('close', function(code){
	 	/*miscutils.fs_readFile(output+'.html').then(function(data){
			//Output and log
			miscutils.logMessage('Done HOCR:\"'+data+'\" in '+out_file, 1);
			miscutils.logMessage('closing code for exec hocr:'+code, 2);
			deferred.resolve(data);

		}, function(err){
			miscutils.logMessage('Error in HOCR:'+err, 1);
			deferred.resolve(err);

		})*/
		miscutils.logMessage('closing code for exec hocr:'+code, 1);
		deferred.resolve();
      	
    });

	child.stderr.on('data', function(err){
        miscutils.logMessage('HOCR stderr:'+err, 1);
    });
    
    return deferred.promise;
}