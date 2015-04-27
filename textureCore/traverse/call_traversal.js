var miscutils           = require('./../miscutils.js');
var _                   = require('lodash');

/*
	Call a python traverser to return the string that matches the descriptions within the @command
	@command is the command line to execute in order to call traverse.py


    Important! When callers call this function, the paths to the python file must be with respect to the current
    working directory. Thus temporarily change it, and then revert back to the old one.
*/
function call_traverse(in_command){
    var path_to_python_file =  '/Users/mh4047/Desktop/bbr/textureCore/traverse';
    var command = "python " + path_to_python_file + "/traverse.py " + in_command;
    var run = function(){

        var Q               = require('Q');
        var deferred        = Q.defer();
        var exec            = require('child_process').exec;  
        var child           = exec(command);
        var result_data     = {}

        //console.log('Curr directory: ' + process.cwd());
        var cur_dir = process.cwd();

        // Change directory
        try {
            process.chdir(path_to_python_file);
            miscutils.logMessage('Temp change directory: ' + process.cwd(), 2);
            miscutils.logMessage("Python call for traverse: " + command,    1);

            child.stdout.on('data', function(data){                             // Data format is {data:[string, string, ...]}
                miscutils.logMessage("Data from traverse: " + data,         2);
                result_data     = JSON.parse(data).data;
            });

            child.stderr.on('data', function(data){
                miscutils.logMessage("stderr:" + data,                      1);
                deferred.reject(data)
            });

            child.on('close', function(code){
                process.chdir(cur_dir);
                miscutils.logMessage('Revert change directory: ' + process.cwd(),           2);

                miscutils.logMessage('Closing code for exec traverse\'s python:' + code,    2);
                deferred.resolve( result_data );        
            });
        }
        catch (err) {
            miscutils.logMessage('Error chdir: ' + err, 1);
        }
        
        return deferred.promise;
    }

    return {
        run: run
    }
    
}
module.exports = call_traverse;