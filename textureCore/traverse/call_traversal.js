/*
    Any access or traversals for the document structure goes through here from nodejs
    Calls the iterative traversal
*/

var miscutils           = require('./../miscutils.js');
var _                   = require('lodash');
var VALID_BOX = ['Page', 'Section', 'Paragraph', 'Group', 'Lines', 'Title', 'Heading', 'Line'];
 
function call_traverse(document_structure, box_match){  
    var Q           = require('Q');
    var deferred    = Q.defer();
    // Instantiate the document_structure. Send in the box matches.
    
    return deferred.promise;
} 
/*
    @box_match is the array of executables referring to the box matches 
    e.g. [  { function: 'from', function_param: [ 'Title', 0 ] },
            { function: 'after', function_param: [ 'Section', 0 ] } ]
    OR 
        From Title #1
        After Section #1
*
function call_traverse(document_structure, box_match){  
    var Q           = require('Q');
    var deferred    = Q.defer();

    if(box_match.length == 1){                                                  // No chain exists e.g. From Title #1
        
        var from_elem = box_match[0].function_param;                            // The first element in executables[] is always a from statement
        var box_elem  = from_elem[0];

        var n = 0, m = 0;
    
        if( from_elem.length > 1 ){ n = from_elem[1]; }                         // Assign a box number, n, if an n exist, by checking the from_elem length
        if( from_elem.length > 2 ){ m = from_elem[2]; }                         // Assign a box number, m, if an m exist

        var op_string = traverse_single(document_structure, box_elem, n, m);
        deferred.resolve(op_string);
    
    }else if(box_match.length == 2){                                            // Chained description
        
        var from_param          = box_match[0].function_param;                  // The first element in executables[] is always a from statement
        var from_box            = from_param[0];   
        var chained_operator    = box_match[1].function;                        // The chained operator e.g. after
        var chained_params      = box_match[1].function_param;                  // The parameters of after e.g. [ 'Box', 'Section', 0 ] 
        var chained_param_type  = chained_params[0];                            // The first param for the chained operator indicates type of parameters e.g. Regex, or Box
        var from_n              = 0, from_m     = 0;                            // n and m from the From clause
        
        if( from_param.length > 1 ){ from_n = from_param[1]; }                  // Assign a box number, n, if an n exist, by checking the from_elem length
        if( from_param.length > 2 ){ from_m = from_param[2]; }                  // Assign a box number, m, if an m exist
        
        if(chained_operator == 'after' && chained_param_type == 'regex' ){   

        }else if(chained_operator == 'after' && chained_param_type == 'string' ){   
            var op_string       = [];                                                   // Get an array of all sections. Essentially transform the document structure to retrieve the right one 
            var string_find     = chained_params[1];
            var collect_flag    = false;
            var from_limit      = from_m - from_n + 1;
            traverse_custom(document_structure, function(curr_box, content){            //Moves from bigger boxes into smaller one. Thus collecting would be "correct"
                if(isMatch(curr_box, 'Line') ){
                    if(op_string.length < from_limit && content.text.indexOf(string_find) != -1 ){      // Make sure we don't exceed collecting what we really don't need from the From clause's m and n. And we check if the content's line actually contains text                               // Check if content contains the string
                        collect_flag = true;
                    }else if( isMatch(curr_box, from_box) && collect_flag){     // Collect if the current box matches the from box
                        op_string.push(content);                    
                        if(op_string.length >= from_limit){
                            collect_flag = false;
                        }
                    }
                    
                }
            });
            console.log(op_string)

        }else if(chained_operator == 'after' && isPrimitiveBox(chained_param_type) ){   
            var after_n = 0, after_m = 0;                            // n and m from the second clause 
            if( chained_params.length > 1 ){ after_n = chained_params[1]; }         // Assign a box number, n, if an n exist, by checking the from_elem length
            if( chained_params.length > 2 ){ after_m = chained_params[2]; }         // Assign a box number, m, if an m exist

            /*var chained_arr = [];                                               // Get an array of all sections. Essentially transform the document structure to retrieve the right one 
            
            traverse_custom(document_structure, function(curr_box, content){
                if(isMatch(curr_box, chained_param_type)){      
                    var after = gather_box_after(document_structure, from_box, chained_param_type, after_n, after_m);    // Gather all boxes that match the From's box e.g. Title after 
                    chained_arr.push({'box':curr_box, 'content':content.text, 'after':after});              // Gather all chained-specified parts e.g. Section
                }
                if(chained_arr.length > (after_m-after_n+1)){
                    return;
                }
            });
            miscutils.logMessage(JSON.stringify(chained_arr), 1);
            *
            // Filter out the one we need:

        }

    }
    return deferred.promise;

}
exports.call_traverse = call_traverse;

/*
    Gather all elements after a particular one given by @begin_box and @begin_n
    @return is an array of all @box_part e.g. Title after @begin_box e.g. Section and @begin_n e.g. 0
*/
function gather_box_after(document_structure, box_part, begin_box, begin_n, end_m){
    var after_flag  = false;
    var after       = [];
    var count_n     = 0;
    traverse_custom(document_structure, function(curr_box, content){
        if(isMatch(curr_box, begin_box)){                           // Check if we have reached the box that will indicate begin collecting @box_part's
            if(count_n == begin_n ){
                after_flag = true;
            }else if(count_n >= end_m){
                after_flag = false;
                return;
            }
            count_n++;
        }
        if(after_flag && curr_box == box_part){                     // Gather when the flag is true and when the curr_box strictly equals  box_part. 
            // Gather all boxes that match the From's box e.g. Title after 
            after.push({'box':content.type,'content':content.text});
        }

    });

    return after;
}


/*  
    @document_structure to traverse
    @custom_function is called every page, every section, every line. 
    custom_function passes current box type e.g. Page, Section, Line, and also passes the content within it e.g. contents of page, etc
*/
function traverse_custom(document_structure, custom_function){
    var curr_box    = "";
    for (var i=0; i<document_structure.length; i++){
        var page_content    = document_structure[i].page_content; 
        curr_box            = 'Page';                           // Set current box to Page

        custom_function(curr_box, page_content);

        for(var j=0; j<page_content.length; j++){ 
            var group   = page_content[j].group;  
            curr_box    = 'Section';                            // Set current box to Section

            custom_function(curr_box, group);

            for (var k=0; k<group.length; k++){ 
                var line_obj = group[k];
                curr_box = line_obj.type//'Line';                               // Set current box to Line

                custom_function(curr_box, line_obj);
            }
        }
    }
}
/*

*/
function traverse_chained(document_structure, box, n, m){

}
/*

    Only accepts non nested and non chained boxes
    Traverses a document structure in the form of a json structure.
    @input document_structure, box e.g. section, n e.g. 1, m e.g. 2
    @returns a string that matches the input
*/
function traverse_single(document_structure, box, n, m){
    // For now we assume n = m e.g. we only extract one box
    var n_count     = -1;                                       // This keeps track the number of times the box has been found. Traverse returns when n_count = n.
    var curr_box    = "";
    for (var i=0; i<document_structure.length; i++){ 
        var page_content    = document_structure[i].page_content;  
        curr_box            = 'Page';                           // Set current box to Page

        if( isMatch(box, curr_box) ){                           // For every match, increase by one
            n_count = n_count + 1;
            if (n_count == n){           
                return getText(curr_box, page_content, n, m);
            }
        }

        for(var j=0; j<page_content.length; j++){ 
            var group   = page_content[j].group;  
            curr_box    = 'Section';                            // Set current box to Section

            if (isMatch(box, curr_box)){
                n_count = n_count + 1;
                if( n_count == n){                      
                    return getText(curr_box, group, n, m);
                }
            }
            for (var k=0; k<group.length; k++){ 
                var line_obj = group[k];
                curr_box = 'Line';                               // Set current box to Line

                if (isMatch(box, curr_box)){
                    n_count = n_count + 1;
                    if( n_count == n){                
                        return getText(curr_box, line_obj, n, m);
                    }
                }
            }
        }
    }
}
/*    
    A box_type of Page will return an array of all the text within the page eg. [textline1, textline2, ...]
    A box_type of Section will return an array of all the text within the section eg. [textline1fromsection, textline2fromsection, ...]
    A box_type of Line will return an array of only that line
*/
function getText(box_type, box_obj, n, m){
    var arr = [];

    if (box_type == 'Page'){
        for(group_ctr in box_obj){
            for(line_obj in group_ctr['group']){
                arr.push(line_obj['text']);
            }
        }
        return arr;
        //return [ line_obj['text'] for group_ctr in box_obj for line_obj in group_ctr['group'] ]
    }
    if (box_type == 'Section'){
        for(line_obj in box_obj){
            arr.push(line_obj['text']);
        }
        return arr;
        //return [ line_obj['text'] for line_obj  in box_obj ]
    }
    if (box_type == 'Line'){
        return [ box_obj ['text'] ]
    }
    return [];
}

/*
    If box1 = page, then box2 = page in order to return True
    If box1 = section | paragraph | group | lines and box2 = section | paragraph | group | lines, then return True
    If box1 = title | heading | line and box2 = title | heading | line, then return True
*/
function isMatch(box1, box2){
    if(box1 == 'Page' && box2 == 'Page'){
        return true;
    }else if( (box1 == 'Section' || box1 == 'Paragraph' || box1 == 'Group' || box1 == 'Lines') && (box2 == 'Section' || box2 == 'Paragraph' || box2 == 'Group' || box2 == 'Lines') ){
        return true;
    }else if( (box1 == 'Title' || box1 == 'Heading' || box1 == 'Line' ) && (box2 == 'Title' || box2 == 'Heading' || box2 == 'Line') ){
        return true;
    }
    return false;
}

/*
    @box is a string
    @return boolean indicating whether the @box is a valid box e.g. Paragraph
*/
function isPrimitiveBox(box){
    var index = _.findIndex(VALID_BOX, function(val){
        return val == box;
    });
    if(index == -1){
        return false;
    }
    return true;
}
/*
	Call a python traverser to return the string that matches the descriptions within the @command
	@command is the command line to execute in order to call traverse.py


    Important! When callers call this function, the paths to the python file must be with respect to the current
    working directory. Thus temporarily change it, and then revert back to the old one.

function old_call_traverse(in_command){
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
*/