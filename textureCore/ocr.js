/*
Functions that call Tesseract for OCR
*/
var miscutils = require('./miscutils');

exports.OCR = function(image_file, output ){
      var Q = require('Q');
      var deferred = Q.defer();

      var options = '-psm 7';	//Treat the image as a single line of text
      //Invoke a child process that calls tesseract
      var exec = require('child_process').exec;  
      var cmd = 'tesseract ' +image_file+' ' +output +' '+options;  
      var child = exec(cmd);

      child.on('close', function(code){
          miscutils.fs_readFile(output+'.txt', "utf8").then(function(data){
             
              deferred.resolve(data);

              //Output and log
              miscutils.logMessage('Done OCR:\"'+data+'\" to '+out_file, 1);
          }, function(err){
              miscutils.logMessage(err, 1);
              deferred.resolve(err);

          })
          miscutils.logMessage('closing code for exec ocr:'+code, 2);
      });

      return deferred.promise;
}



