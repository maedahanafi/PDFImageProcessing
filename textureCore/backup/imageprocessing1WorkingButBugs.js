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
// We should get a nested datastructure of which group lines belong to

var imagemagick = require('./imageutils.js');
var jsesc = require('jsesc');
var _ = require('lodash');
var util = require('util');

var input_file = 'img/taylorscrugstest.png';
var trans_file = 'img/taylorscrugstestBW.png';
imagemagick.transparency2white(input_file, trans_file);

//Invoke a child process that calls crop_morphology
var exec = require('child_process').exec;  
var cmd = 'python crop_morphology.py '+trans_file;  
var child = exec(cmd);

child.stdout.on('data', function(data){

    var data_sort = JSON.parse(data).data;
    //Sort the array by 'line_number'
    data_sort = _.sortBy(data_sort, function(n) {
        return parseInt(n.line_number);
    });

    console.log(data_sort);
    
    var data_classify = classify(data_sort);
    console.log(JSON.stringify(data_classify));
    
    //Organize the filenames by line numbers and sections based on the spacings 
    //in between the lines

    //Calculate the std on the diffs
    //collect all the diffs first
    /*var diffs = [];
    var line_heights = [];
    for(var i=0; i<data_sort.length-1; i++){
        var curr_line_y = data_sort[i].y2;
        var next_line_y = data_sort[i+1].y1;
        var diff = next_line_y-curr_line_y;
        diffs.push(diff);

        line_heights.push(data_sort[i].y2 - data_sort[i].y1);

        console.log(diff+" "+data_sort[i].line_number+" and "+data_sort[i+1].line_number);
    }


   console.log("aver line height: "+mean(line_heights)+", std: "+std(diffs));
   */
});

child.stderr.on('data', function(data){
    console.log('stderr:'+data);
});

child.on('close', function(code){
    console.log('closing code:'+code);
});


//Classify the lines of the arr based on std
function classify(arr){
    var mean_line_height = mean(_.pluck(arr, 'line_height'));
    //std is the STD of the array of distances between lines
    var stdVal = std(getLineDistanceArr(arr));

    console.log("aver line height: "+mean_line_height+", std: "+stdVal);
    console.log(arr);
    /* If the std is smaller than the average mean of line heights, 
       then return the same arr (no need to classify again because the line heights
       are smaller than the distances between the lines)
       or if the stdVal is the same as the previous round (which means there is no chance of change)
       or if the number of lines in arr is one
     */
    if(stdVal<mean_line_height/2 
        || arr.length<=2
        //|| ( ( arr[0].stdVal) && arr[0].stdVal != stdVal)
    ){
        return arr;
    }else{
        // Otherwise, for each line, gather them into arrays of groups based on 
        // 'modes'. e.g. [{group:[...]}, {group:[...]}]
        var group = [];
        // Maximum diff within this group e.g. max(array_of_distances for arr, 
        // which is the current group )
        var curr_max_diff = _.max(getLineDistanceArr(arr)); 

        // Initial prev group mode e.g. greater_than_std between line 0 and line 1
        var prev_group_mode = getLineMode(arr[0], arr[1], stdVal, curr_max_diff);
        // Add this group to group[] 
        // e.g. [{group:[
        //          line 0, etc
        //      ]}]
        group.push({'type':prev_group_mode, 'group': [ arr[0] ] });

        //Debugging purposes
        arr[0].diff = arr[1].y1 - arr[0].y2;
        arr[0].stdVal = stdVal;
        arr[0].curr_max_diff = curr_max_diff;

        //Pointer to which group we are adding to e.g. the 0th group in group[]
        var curr_group_index = 0;

        //Create groups based on modes
        var i=1;    //The var that points to which element we want to group
        while(i<arr.length-1){
            //Current group mode e.g. greater_than_std, etc
            var curr_group_mode = getLineMode(arr[i], arr[i+1], stdVal, curr_max_diff);
            
            //Debugging purposes
            arr[i].diff = arr[i+1].y1 - arr[i].y2;
            arr[i].stdVal = stdVal;
            arr[i].curr_max_diff = curr_max_diff;
            
            /*  The following logic explained:
                IF curr and prev are of the same group, 
                then add arr[i] to the curr_group_index.
                ELSE then it is a new group we create. 
                then we create the new group   
                set prev_group_mode into the current one
                curr_group_index++. 
            */

            if(_.isEqual(prev_group_mode, curr_group_mode) ){
                //Adding a line to the current group
                group[curr_group_index].group.push(arr[i]);

            }else{
                //Creating a new group
                group.push({'type':curr_group_mode, 'group': [ ] });

                /* We add current elem to a group.
                   Which group does current element belong to??
                   It's previous one if prev group mode is smaller than std
                   It's the one after that if curr group mode is greater than std
                   which indicates a break.
                 */
                if(! _.isEqual(prev_group_mode, 'smaller_equal_to_std')){
                    //This only happens when the the prev group mode isn;t smaller _equal_to_std
                    //Update our current group pointer, in order to add to the next group
                    curr_group_index++;
                }
                //Add to current group
                group[curr_group_index].group.push(arr[i]);

                //Setting the prev_group_mode to the current one, which would be
                //valid for the next iteration
                prev_group_mode = curr_group_mode;
                
            } 

            i++;

        }

        //Once this loop this over, arr is left with the last element 
        //It's grouping is the same as the previous one
        group[curr_group_index].group.push(arr[i]);

        //Once all the groups are created, for each group, classify.
        /*for(var j=0; j<group.length; j++){
            var clone_elem = _.clone(group[j], true).group;

            //Classify if the group's STD is different than the current one
            //otherwise the recursion will be infinite
            var group_stdVal = std(getLineDistanceArr(clone_elem));
            if(stdVal!=group_stdVal){
                console.log("-------------------------------------------------");
                group[j].group = classify(clone_elem);
            }
        }*/

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
  These are the modes: less_than_zero, greater_than_std, smaller_equal_to_std, greater_than_max_diff
  We assume max_diff to be the maximum difference in within a group.
*/
function getLineMode(curr_elem, next_elem, std, max_diff){
    var diff = next_elem.y1 - curr_elem.y2;

    /*
      Lines distances that are negative are in the same group as 'smaller_equal_to_std'. 
      Putting it in a new group goes against the idea of grouping lines of same area 
      together. the Purpose of assignin modes is to differentiate their distances, not 
      group by difference values.

    if(diff<0){   
        return 'less_than_zero';
    }else*/ 
    if(diff>max_diff){
        return 'greater_than_max_diff';
    }else if(diff>std){
        return 'greater_than_std';
    }else if(diff<=std){
        return 'smaller_equal_to_std';
    }
}
//OCR
//image to text
//0.037907603196799755.pdf-2.png

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
    //console.log("std: "+std + " variance:"+variance);
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


