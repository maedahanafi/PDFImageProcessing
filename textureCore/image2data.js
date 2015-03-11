/**
 * Created by mh4047 on 3/1/15.
 *
 * This script takes in a cropped image e.g. bounding box cropped so that the appropriate section
 * of the document is displayed.
 *
 * The script outputs the text per line and sorts out the lines to OCR elements
 *
 *
    a. Basic types:
        line
    b. Other
        section: a set of lines that have the same height
        title: a line that has a height bigger than the lines within a section
    c. Extras
        images
        tables

 *
 */
// First turn all alpha into white. 
// Then call crop_morphology.py to do the following
// 1. Cut the image up by lines and vertical white spaces. Use bounding boxes to figure out where the text is
// 2. For each individual section, which would consist a line of words,
//    label and group them.
// We should get a datastructure of grouped lines

var imagemagick = require('./imageutils.js');
var jsesc = require('jsesc');
var _ = require('lodash');
var util = require('util');
var miscutils = require('./miscutils');
var ocr = require('./ocr');
var hocr = require('./hocr');


//IMP, before calling iterate(), remember to init gatheredLeaves[]
var gatheredLeaves = [];

//BEGIN
//var path = 'img/';
//var justname = 'taylorscrugstest';
//var image_ext = 'png';
var ocr_path = 'ocr/';
var hocr_path = 'hocr/';

/*
    @path is the path to the image file e.g. 'img/'
    @onlyfilename is just the filename of the image without extension or path e.g. 'taylorscrugstest'
    @image_ext is the image type e.g. 'png'

    Example call: image2data('img/', 'taylorscrugstest', 'png');
*/
function image2data (path, onlyfilename, image_ext, callback){
    var Q = require('Q');

    var filename = path+onlyfilename; //e.g. 'img/taylorscrugstest';

    //Firstly process the image via image processing and then get a list of grouped lines
    imageprocess_page(filename, image_ext, function(result){
        if(result!='err'){
            var ctr = 0;

            var arr_promises = [];  //Array of promises for ocr
            var arr_read_promises = []; //Array of promises for reading the results of ocr

            //Secondly, perform OCR per line in our datastructure, result. 
            result.forEach(function(groupElem){
                //Loop through each line in a group
                groupElem.group.forEach(function(lineElem){
                    //And add the output file as a property in each line and add as a promise
                    var out_file = ocr_path+onlyfilename+ctr;
                    lineElem.textFile = out_file+'.txt';
                    arr_promises.push(ocr.OCR(lineElem.filename, out_file));

                    ctr++;

                });
               
            });

            //Thirdly, after all the OCR is done on all files, assign each OCR line result to 
            //each line in our datastructure, result.
            var allPromise = Q.all(arr_promises ).then(function(ocrResults){
                
                //Assign the results of OCR to our datastructure, result
                var index = 0;
                result.forEach(function(groupElem){
                    //Loop through each line in a group
                    groupElem.group.forEach(function(lineElem){
                        //Assign the text to lineElem.text
                        lineElem.text = ocrResults[index];
                        index++;
                        
                    });
                });

                miscutils.logMessage('Results after the OCR:', 1)
                miscutils.logMessage(JSON.stringify(result), 1);
                
                //Fourthly, call hocr in order to assign lines line types, which involves getting font types
                assignType(result, path, onlyfilename, image_ext, hocr_path).then(function(datastructure){
                    miscutils.logMessage('Done assigning types', 1);

                    callback(datastructure);
                });

            });
     
        }else{
            miscutils.logMessage('Error in Reading Page.', 1);
            callback('err');
        }
    });
}
exports.image2data = image2data;

/*
    @datastructure contains the grouped lines
    @image_path is the image_path
    @image_ext is the image_ext
    @filename of the image
    @hocr_path is the hocr result folder
*/
function assignType(datastructure, image_path, filename, image_ext, hocr_path){
    var Q = require('Q');
    var deferred = Q.defer()

    getFontInfo(datastructure, image_path, filename, image_ext, hocr_path, function(indatastructure){
        deferred.resolve(datastructure);
    });

    return deferred.promise // the promise is returned
}

/*
See assignType() for parameter information
Get font information. Given the image filename, hocr it in order to get font information. Then 
read that hocr file and then assign the information into the datastructure
@returns via callback the font information embedded in each line of the datastructure e.g.
[{group:[ {line1+fontinfo}, {line2_fontinfo} ]}, {group...}...]
*/
function getFontInfo(datastructure, image_path, filename,image_ext, hocr_path, callback){
    var out_file = hocr_path+filename+'.html';
    hocr.HOCR(image_path+filename+'.'+image_ext, hocr_path+filename).then(function(){
        //Read HOCR file:
        miscutils.fs_readFile(out_file).then(function(hocr_result){
            //Output and log
            miscutils.logMessage('Done Reading HOCR to '+out_file+':\"'+hocr_result+'\" ', 2);
            miscutils.logMessage('Begin parsing HOCR results', 1);
            //Manipulate the DOM using cheerio (jquery-like manipulation)
            var cheerio   = require('cheerio'),
                    $     = cheerio.load(hocr_result);

            //Loop through each word and assign a font type to each word 
            //e.g. {word:'Maeda', font:['Bold', italic, text-size]}
            var font_per_word = [];
            //Go through each word
            $('.ocrx_word').each(function () {
                //@i is the ith word in the whole page
                var curr_word = $(this).text();
                var curr_word_id = $(this).attr('id');
                var i = curr_word_id.match(/[0-9]+/)[0];

                var font_info = {'i': i,
                                 'word': curr_word, 
                                 'bold': 0, 
                                 'italic': 0,
                                 'height':0,
                                 'width':0};

                miscutils.logMessage(curr_word, 2); // "this" is the current element in the loop

                //Bold is equal to strong
                if( $(this).has('strong').length || $(this).has('B').length){
                    miscutils.logMessage('Bold', 2);
                    font_info.bold = 1;
                }
                //Italic?
                if( $(this).has('I').length){
                    miscutils.logMessage('Italic', 2);
                    font_info.italic = 1;
                }
                //Size cannot be measured because that ultimately requires client side rendering 
                //var size = $(this).height(); //which is impossible in cheerio
                //The alternative would be to use the title attribute that contains information on b
                //bounding boxes e.g.  "bbox 203 222 374 299". So, bboxinfo is [203, etc]
                var title_attr = $(this).attr('title');
                var bboxinfo = title_attr.match(/[0-9]+/g);
                bboxinfo = _.map(bboxinfo, function(num_str){
                    return parseInt(num_str); //Convert the string into int
                });

                font_info.height = bboxinfo[3] - bboxinfo[1];
                font_info.width = bboxinfo[2] - bboxinfo[0];

                miscutils.logMessage('Width: '+font_info.width+' Height: '+font_info.height, 2);
                miscutils.logMessage('Size: '+JSON.stringify(bboxinfo), 2);

                miscutils.logMessage('----------------------------------', 2);

                font_per_word.push(font_info);

            });
            
            //Sort the words by numbers
            font_per_word = _.sortBy(font_per_word, function(n) {
                return n.i;
            });
           
            miscutils.logMessage('Done gathering font info', 1);
            miscutils.logMessage(JSON.stringify(font_per_word), 1);

            /* Identify which font is generic, meaning that the font type is popular. Since a 
               combination of italic, bold, or non-italic/non-bold would indicate which is the popular combination,
               we gather stats on each one (except for plain). Also look into 
               the stats of the heights.
            */
            var aver_heights = mean(_.pluck(font_per_word, 'height'));
            console.log(aver_heights)
            var italic_freq = sum(_.pluck(font_per_word, 'italic'));
            console.log(italic_freq)
            var bold_freq = sum(_.pluck(font_per_word, 'bold'));
            console.log(bold_freq)




            //Challenge is: which word belongs to which line
            //Identify pages
            //

            //callback(datastructure);

        }, function(err){
            miscutils.logMessage('Error in HOCR:'+err, 1);
            callback('err');
            
        })
        
    });
}




/*
    Converts all alphas into white and then dilates the image to extract text areas.
    Then it groups them based on distances between each text areas.
    @filename is the path and filename minus extention e.g. 'img/taylorscrugstest'
    @image_ext is the image_ext
    @callback is the function to execute after all is done. imageprocess_page passes
     gatheredLeaves[] e.g. [{'group':[line1,line2]}, {group:[line3,line4]}]

 */
function imageprocess_page(filename, image_ext, callback){
    //First turn all alphas into white
    var input_file = filename+'.'+image_ext; //'img/taylorscrugstest.png';
    var trans_file = filename+'BW.'+image_ext;//'img/taylorscrugstestBW.png';

    imagemagick.transparency2white(input_file, trans_file, function(){

        //Secondly, invoke a child process that calls crop_morphology
        var exec = require('child_process').exec;  
        var cmd = 'python crop_morphology.py '+trans_file;  
        var child = exec(cmd);

        child.stdout.on('data', function(data){

            var data_sort = JSON.parse(data).data;
            //Sort the array by 'line_number'
            data_sort = _.sortBy(data_sort, function(n) {
                return parseInt(n.line_number);
            });

            miscutils.logMessage('Page data Line by line:', 1);
            miscutils.logMessage(data_sort, 1);
            
            //Thirdly, group the lines based on distances between them
            var data_classify = classify(data_sort);
            miscutils.logMessage('Page data grouped:', 2);
            miscutils.logMessage(JSON.stringify(data_classify), 2);

            gatheredLeaves = [];
            iterate(data_classify)
            miscutils.logMessage('Page data grouped and unnested:', 1);
            miscutils.logMessage(JSON.stringify(gatheredLeaves), 1);
            
            //Finally return to the user
            callback(gatheredLeaves);
        });

        child.stderr.on('data', function(data){
            miscutils.logMessage('stderr:'+data, 1);
            callback('err');
        });

        child.on('close', function(code){
            miscutils.logMessage('closing code for exec python:'+code, 1);
        });
    });

    
}

//Gather all the leaf nodes
function iterate(data_classify){
    //Iterate through each element
    //An element can be a nested or leaf
    //A leaf is : {group:[{line:1}, {line:2}]}
    //A nested is :{group:[{group:[]}]}
    //If nested, call iterate
    //If leaf, add to gather[]

    var i=0;
    while(i<data_classify.length){
        var element = data_classify[i];
        if(isLeaf(element)){
            miscutils.logMessage("A leaf:", 2)
            miscutils.logMessage(JSON.stringify(element), 2);

            gatheredLeaves.push(element);
        }else{
            miscutils.logMessage("A nest:", 2)
            miscutils.logMessage(JSON.stringify(element),2);
            iterate(element.group);
        }

        i++;
    }
}

//A leaf is : {group:[{line:1}, {line:2}]}
//A nested is :{group:[{group:[]}]}    
function isLeaf(inElem){
    //If there exists an element in inElem that contains the property 'group',
    //then, inElem is nested
    for(var t=0; t<inElem.group.length; t++){
        var anElem = inElem.group[t];
        if('group' in anElem){
            return false;
        }
    }
    return true;
}

//Classify the lines of the arr based on std
function classify(arr){
    var mean_line_height = mean(_.pluck(arr, 'line_height'));
    //std is the STD of the array of distances between lines
    var stdVal = std(getLineDistanceArr(arr));

    miscutils.logMessage("aver line height: "+mean_line_height+", std: "+stdVal, 2);
    miscutils.logMessage(arr, 2);
    
    /* If the std is smaller than the average mean of line heights, 
       then return the same arr (no need to classify again because the line heights
       are smaller than the distances between the lines)
       or if the stdVal is the same as the previous round (which means there is no chance of change)
       or if the number of lines in arr is one
     */
    if(stdVal<mean_line_height
        || arr.length<=2
    ){
        return arr;
    }else{
        // Otherwise, for each line, gather them into arrays of groups based on 
        // 'modes'. e.g. [{group:[...]}, {group:[...]}]
        var group = [];
        // Maximum diff within this group e.g. max(array_of_distances for arr, 
        // which is the current group )
        var curr_max_diff = _.max(getLineDistanceArr(arr)); 

        // Add an initial group to group[] 
        // e.g. [{group:[
        //          line 0, etc
        //      ]}]
        group.push({ 'group': [ arr[0] ] });

        //Debugging purposes and to keep track of the current iteration of stdVal for future comparisons
        arr[0].diff = arr[1].y1 - arr[0].y2;
        arr[0].stdVal = stdVal;
        arr[0].curr_max_diff = curr_max_diff;

        //Pointer to which group we are adding to e.g. the 0th group in group[]
        var curr_group_index = 0;

        //Create groups based on modes
        var i=1;    //The var that points to which element we want to group
        while(i<arr.length-1){
            //Current group mode e.g. same_group, etc
            var curr_group_mode = getLineMode(arr[i], arr[i+1], stdVal, curr_max_diff);
            
            //Debugging purposes
            arr[i].diff = arr[i+1].y1 - arr[i].y2;
            arr[i].stdVal = stdVal;
            arr[i].curr_max_diff = curr_max_diff;
            
            /*  The following logic explained:
                IF curr is of the same group, 
                then add arr[i] to the curr_group_index.
                ELSE then it is a new group we create. 
                then we create the new group   
                curr_group_index++. 
            */

            if(_.isEqual('same_group', curr_group_mode) ){
                //Adding a line to the current group
                group[curr_group_index].group.push(arr[i]);

            }else{
                //Adding a line to the current group
                group[curr_group_index].group.push(arr[i]);

                //Creating a new group
                group.push({ 'group':[ ] });
                curr_group_index++;                
            } 

            i++;

        }

        //Once this loop this over, arr is left with the last element 
        //It's grouping is the same as the previous one
        group[curr_group_index].group.push(arr[i]);
    
        //Once all the groups are created, for each group, classify.
        for(var j=0; j<group.length; j++){
            var clone_elem = _.clone(group[j], true).group;

            //Call classify only if the group's STD is different than the current one
            //otherwise the recursion will be infinite
            var group_stdVal = std(getLineDistanceArr(clone_elem));
            if(stdVal!=group_stdVal){
                miscutils.logMessage("-------------------------------------------------", 2);
                group[j].group = classify(clone_elem);
            }
        }

        return group;
    }
}

/*
  Given data from crop_morphology e.g. {'line_number':i, 'filename':this_out_path, 
                                'line_type':line_type, #We figure out the classfication later on
                                'x1':ct['x1'],        # The original bounding box coordinates are kept for classifcation purposes
                                'y1':ct['y1'],
                                'x2':ct['x2'],
                                'y2':ct['y2'],
                                'line_height': ct['y2']-ct['y1'] }, 
  calculate the difference between the two line information
  and then based on the comparison between array and difference,
  get the mode of the array.
  The modes are: line_break or same_group. 
  If the distance is greater than the STD, then there is a wide gap between the two lines.
  Otherwise, they lie in the same group.
  We assume max_diff to be the maximum difference in within a group.
*/
function getLineMode(curr_elem, next_elem, std, max_diff){
    var diff = next_elem.y1 - curr_elem.y2;

    if(diff>max_diff){
        return 'line_break';//'greater_than_max_diff';
    }else if(diff>std){
        return  'line_break'; //'greater_than_std';
    }else if(diff<=std){
        return  'same_group';//'smaller_equal_to_std';
    }
}

//Given an array return the std
//Calculation of STD
function std(arr){
    var sum = _.reduce(arr, function(sumt, n){
        return sumt + n;
    });

    var mean = sum / arr.length;

    var diffmean = [];
    arr.forEach(function(n){
        diffmean.push(Math.pow((n-mean), 2));
    })

    var sumdiffmean = _.reduce(diffmean, function(sumt1, n){
        return sumt1 + n;
    })

    var variance = sumdiffmean/diffmean.length;
    var std = Math.sqrt(variance);
    return std;
}

function sum(arr){
    return _.reduce(arr, function(sumt, n){
        return sumt + n;
    });
}
//
function mean(arr){
    var sum = _.reduce(arr, function(sumt1, n){
        return sumt1 + n;
    })
    return sum/arr.length;

}

//Return the array of diffs
function getDiffArr(arr){
    var diff = [];
    for(var i=0; i<arr.length-1; i++){
        var diff = arr[i+1]-arr[i];
        diffs.push(diff);
    }
    return diff;
}

//Given data from crop_morphology e.g. [{'line_number':i, etc }], 
//get the array of distances between lines
function getLineDistanceArr(arr){
    var diffs = [];
    for(var i=0; i<arr.length-1; i++){
        var curr_line_y = arr[i].y2;
        var next_line_y = arr[i+1].y1;
        var diff = next_line_y-curr_line_y;
        diffs.push(diff);

        //console.log(diff+" "+data_sort[i].line_number+" and "+data_sort[i+1].line_number);
    }
    return diffs;

}


