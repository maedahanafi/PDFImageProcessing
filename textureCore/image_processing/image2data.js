/**
 * Created by mh4047 on 3/1/15.
 *
    This script:
    1. Takes in result from crop_morphology, which returns a basic document_structure.
    2. Does additional groupings based on the standard deviations between lines and reassign line types. 
    3. Assigns OCR results to each line.
    
    Result is a datastructure of grouped lines i.e.  {[page1:[group1, group2], page2:[group3, group4], page3...]}
 
    IMPORTANT: Note that there is a chance of stdout clashes (I don't know from where yet), 
    so call imagedocument2structure() sequentially with promises.

 *
 */


var imagemagick     = require('./imageutils.js');
var jsesc           = require('jsesc');
var _               = require('lodash');
var util            = require('util');
var miscutils       = require('./../miscutils');
var ocr             = require('./ocr');

var ocr_path        = 'ocr/';
var doc_struct_dir  = 'document_structure/';

imagedocuments2structure(['img/worthy0.png', 'img/worthy1.png'], true)
.then(imagedocuments2structure(['img/miller0.png', 'img/miller1.png'], true))
.then(imagedocuments2structure(['img/patricia0.png', 'img/patricia1.png'], true))
.then(imagedocuments2structure(['img/ravi0.png', 'img/ravi1.png'], true))
.then(imagedocuments2structure(['img/richard0.png', 'img/richard1.png'], true))
.then(imagedocuments2structure(['img/sam0.png'], true))
.then(imagedocuments2structure(['img/sample0.png'], true))
.then(imagedocuments2structure(['img/scott0.png', 'img/scott1.png'], true))
.then(imagedocuments2structure(['img/sierra0.png', 'img/sierra1.png'], true))
.then(imagedocuments2structure(['img/smith0.png', 'img/smith1.png'], true))
.then(imagedocuments2structure(['img/susan0.png', 'img/susan1.png', 'img/susan2.png', 'img/susan3.png'], true))


/*
    @arr_files is the array of full file names to the images to process e.g. ['img/image.png', '...'. ...]
    arr_files must refer to an array of images belonging to a document since this function
    returns the document structure of all images.
    @isWriteToFile is a boolean that indicates whether to write the document structure out to a file. 
    If so, then write to folder document_structure/ with the first image's filename e.g. 'image' and concatenated with '.txt'

    @returns document_stucture has format {[page1:[group1, group2], page2:[group3, group4], page3...]}
*/
function imagedocuments2structure(arr_files, isWriteToFile){
    var Q                   = require('Q');
    var deferred            = Q.defer();
    var arr_promises        = [];                                                   //Array of promises for image processing

    for(var i = 0; i < arr_files.length; i++){

        var full_filename   = arr_files[i];
        var filename        = full_filename.match(/\/([a-zA-Z0-9_ \-\.]+)+\./)[1];  //Matches the just the filename
        var pathyfilename   = full_filename.match(/(.+\/.+)\./)[1];                 //Matches the path and the filename excluding the file extension
        var image_ext       = full_filename.match(/\.(\w+)$/)[1];                   //Matches the extension
        arr_promises.push( imageprocess_page(i, pathyfilename, filename, image_ext) );
    
    }

    var allPromise   = Q.all(arr_promises)
                        .then(ocr_on_page)
                        .then(function(document_stucture){

                            var out_file =      arr_files[0].match(/\/([a-zA-Z0-9_ \-\.]+)+\./)[1];
                            if(isWriteToFile){
                                                miscutils.write_to_file(doc_struct_dir + out_file + '.json', JSON.stringify(document_stucture));
                            }
                            deferred.resolve(document_stucture);

                        });

    return deferred.promise;
}

/*
    @path is the path to the image file e.g. 'img/'
    @onlyfilename is just the filename of the image without extension or path e.g. 'taylorscrugstest'
    @image_ext is the image type e.g. 'png'

    Example call: image2data('img/', 'taylorscrugstest', 'png');
*/
function image2data (path, onlyfilename, image_ext, callback){
    var filename = path + onlyfilename;     //e.g. 'img/taylorscrugstest';
    imageprocess_page(filename, image_ext); //Firstly process the image via image processing and then get a list of grouped lines
}
exports.image2data = image2data;


/*
    Converts all alphas into white and then call crop_morphology which 
    1) Dilates the image to extract text areas and then extracts lines from text areas.
    2) Then it groups the lines and assigns a line type per line.
    @page_number is an int for page number to place a correct name for paging in the whole structure
    @pathyfilename is the path and filename minus extention e.g. 'img/taylorscrugstest'
    @filename is just the filename e.g. 'taylorscrugstest'
    @image_ext is the image_ext
    @return is {page_number:n, page_content:[ group:[line1, line2], group:[line3, ...], ]}
 */
function imageprocess_page(page_number, pathyfilename, filename, image_ext){
    var Q           = require('Q');
    var deferred    = Q.defer();
                                                            // First turn all alphas into white
    var input_file  = pathyfilename + '.'   + image_ext;    // e.g. 'img/taylorscrugstest.png';
    var trans_file  = pathyfilename + 'BW.' + image_ext;    // e.g. 'img/taylorscrugstestBW.png';

    imagemagick.transparency2white(input_file, trans_file, function(){
                                                            //Secondly, invoke a child process that calls crop_morphology
        var exec            = require('child_process').exec;  
        var cmd             = 'python crop_morphology.py ' + trans_file;  
        var child           = exec(cmd);
        var org_doc_struct  = [];

        child.stdout.on('data', function(data){             //Data format is {data:[{group:[line1, line2]}, {group:[line3]}, etc]}
            try{
                org_doc_struct  = JSON.parse(data).data;
                miscutils.logMessage('Document Structure from crop_morphology:', 1);
                miscutils.logMessage(JSON.stringify(org_doc_struct), 1);
            }catch(err){
                miscutils.logMessage('Reading from stdout err:' + err, 1);
            }
        });

        child.stderr.on('data', function(data){
            miscutils.logMessage('stderr:' + data, 1);
        });

        child.on('close', function(code){
            miscutils.logMessage('closing code for exec python:' + code, 1);
            deferred.resolve({
                'page_number' :     page_number,
                'page_content':     org_doc_struct
            });
        });
    });

    return deferred.promise;
    
}


/*
    @document_structure takes in a document structure 
    @return is the document_structure with the text field assigned with the results of the ocr

*/
function ocr_on_page(document_structure){
    var Q           = require('Q');
    var deferred    = Q.defer();

    var ctr = 0;

    var arr_promises        = [];                                   //Array of promises for ocr
    var arr_read_promises   = [];                                   //Array of promises for reading the results of ocr

                                                                    //Secondly, perform OCR per line in our datastructure, document_structure. 
    document_structure.forEach(function(page_structure){
        page_structure.page_content.forEach(function(groupElem){
            groupElem.group.forEach(function(lineElem){             //Loop through each line in a group
                
                                                                    //And add the output file as a property in each line and add as a promise
                var onlyfilename    = lineElem.filename.match(/\/([a-zA-Z0-9_ \-\.]+)+\./)[1];;
                var out_file        = ocr_path + onlyfilename + ctr;
                lineElem.textFile   = out_file + '.txt';
                arr_promises.push(ocr.OCR(lineElem.filename, out_file));

                ctr++;
            });
           
        });

    });
    
    //Thirdly, after all the OCR is done on all files, assign each OCR line result to 
    //each line in our datastructure, document_structure.
    var allPromise = Q.all(arr_promises ).then(function(ocrResults){
        
        var index  = 0;
        document_structure.forEach(function(page_structure){                //Assign the results of OCR to our datastructure, document_structure
            page_structure.page_content.forEach(function(groupElem){
                groupElem.group.forEach(function(lineElem){                 //Loop through each line in a group
                    
                    lineElem.text = ocrResults[index];                      //Assign the text to lineElem.text
                    index++;
                    
                });
            });
        });

        miscutils.logMessage('Results after the OCR:', 1)
        miscutils.logMessage(JSON.stringify(document_structure), 1);
        
        deferred.resolve(document_structure);
    });

    return deferred.promise;

}


