/*
	Functions that call Tesseract for OCR
*/
var miscutils = require('./miscutils');
var Q = require('Q');

exports.OCR = function(image_file, output /* , callback*/){
  var deferred = Q.defer();

  var options = '-psm 7';	//Treat the image as a single line of text
  //Invoke a child process that calls tesseract
  var exec = require('child_process').exec;  
  var cmd = 'tesseract ' +image_file+' ' +output +' '+options;  
  var child = exec(cmd);

  child.stdout.on('data', function(data){
      //callback();
      

  });

  /*child.stderr.on('data', function(data){
      miscutils.logMessage('stderr:'+data, 1);
      callback('err');
  });*/

  child.on('close', function(code){
      deferred.resolve();
      miscutils.logMessage('closing code for exec ocr:'+code, 2);
  });

  return deferred.promise;
}
/*
function fs_readFile (file, encoding) {
  var deferred = Q.defer()
  fs.readFile(file, encoding, function (err, data) {
    if (err) deferred.reject(err) // rejects the promise with `er` as the reason
    else deferred.resolve(data) // fulfills the promise with `data` as the value
  })
  return deferred.promise // the promise is returned
}
fs_readFile('myfile.txt').then(console.log, console.error)

*/