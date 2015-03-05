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

//IMP, before calling iterate(), remember to init gatheredLeaves[]
var gatheredLeaves = [];

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

    //console.log(data_sort);
    
    var data_classify = classify(data_sort);
    console.log(JSON.stringify(data_classify));

    gatheredLeaves = [];
    iterate(data_classify)
    console.log(JSON.stringify(gatheredLeaves));
    
});

child.stderr.on('data', function(data){
    console.log('stderr:'+data);
});

child.on('close', function(code){
    console.log('closing code:'+code);
});


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
            //console.log("A leaf:")
            //console.log(JSON.stringify(element));

            gatheredLeaves.push(element);
        }else{
            //console.log("A nest:")
            //console.log(JSON.stringify(element));
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

    //console.log("aver line height: "+mean_line_height+", std: "+stdVal);
    //console.log(arr);
    
    /* If the std is smaller than the average mean of line heights, 
       then return the same arr (no need to classify again because the line heights
       are smaller than the distances between the lines)
       or if the stdVal is the same as the previous round (which means there is no chance of change)
       or if the number of lines in arr is one
     */
    if(stdVal<mean_line_height/2 
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

        //Debugging purposes
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

        //Not so nested grouping
        //var groupArr =[];

        //Once all the groups are created, for each group, classify.
        for(var j=0; j<group.length; j++){
            var clone_elem = _.clone(group[j], true).group;

            //Call classify only if the group's STD is different than the current one
            //otherwise the recursion will be infinite
            var group_stdVal = std(getLineDistanceArr(clone_elem));
            if(stdVal!=group_stdVal){
                //console.log("-------------------------------------------------");
                group[j].group = classify(clone_elem);
            }

            //console.log('**************************************************************')
            //console.log(JSON.stringify(groupArr));
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


