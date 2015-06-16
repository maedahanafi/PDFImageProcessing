/**
 * Created by mh4047 on 2/28/15.
 * pdfOpenController controls individual pdf buttons and pdf canvas
 */


//Load in data into the pdf lists
//Controls pdfContainer.html
app.controller('pdfOpenController', [ '$scope', '$http', 'learningService', function($scope, $http, learningService) {


    console.log('Open pdf: '+ $scope.filename);

    $scope.learningService = learningService;

    $scope.this_filename    = $scope.filename;

    //Url of the pdf
    $scope.pdfURL           = "/pdf/"+$scope.this_filename;

    //Canvas stuff
    $scope.canvas_id        = 'canvas'+$scope.$index;
    //$('.scrollable').width($scope.canvas_width);
    console.log("Rendering: " + $scope.filename + " into " + $scope.canvas_id);


    $scope.showprogress     = true;
    //Where the canvas height is now
    $scope.curr_canvas_y    = 0;

    //When the request for display occurs, set up the canvas and drawing tools
    $scope.displaypdf       = function(){

        var req             = '/convertpdf/'+$scope.this_filename;
        console.log('Requesting server for pdf conversion:'+req);

        //Conversion of pdf to images
        //Once the confirmation of the images is received, load it into the canvas
        //and set up the canvas's drawing tools.
        $http.get(req).success(function(arrFiles){ //The return is an array of links to the images ['maeda.jpg'...]
            //Load all images first and then display them
            console.log(arrFiles);

            loadAllImages($scope.canvas_id, arrFiles.resultfilepath, function(arrLoadedFilesNames, arrImgContent){
                //Initialize the Drawing tools
                initCanvas($scope.canvas_id, arrLoadedFilesNames, arrImgContent, $scope.learningService);

            });

            $scope.showprogress = false;

        }).error(function(err){
            console.log("Error in conversion:");
            console.log(err);

            $('#'+$scope.canvas_id).drawText({
                fillStyle   : '#9cf',
                strokeStyle : '#25a',
                strokeWidth : 2,
                x           : 5,
                y           : 5,
                fontSize    : 48,
                fontFamily  : 'Verdana, sans-serif',
                text        : 'Error rendering.' + err
            });

            $scope.showprogress = false;
        });
    }
    //Display the pdf
    $scope.displaypdf();

}]);

//CANVAS
function initCanvas(canvas_id, imageArr, arrImgContent, learningService){
    var mouseIsDown         = false;
    var startX;
    var startY;
    var strokeStyle         = "black",
        lineWidth           = 14;

    //Set the drawing functionalities
    var canvas              = $('#'+canvas_id).get(0);
    var context             = $('#'+canvas_id).get(0).getContext('2d');
    var cur_x = 0, cur_y = 0;
    var viewport_height     = context.canvas.height
    var viewport_width      = context.canvas.width 
    //@currentHeight keeps track of the y coordinate of where the next picture should be displayed e.g. currheight = currheight + prev image height
    var currentHeight       = 10;
    redraw(canvas, context, arrImgContent, currentHeight, cur_x , cur_y, viewport_width, viewport_height)


    //setTimeout(drawTooltipAndHighlight(canvas, ctx, '#'+canvas_id), 15000);

    //Add mouse event scrolling
    canvas.addEventListener("mousewheel", function(e) {

        // cross-browser wheel delta
        var e       = window.event || e; // old IE support
        var delta   = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        //myimage.style.width = Math.max(50, Math.min(800, myimage.width + (30 * delta))) + "px";
        cur_y = cur_y - delta;
        console.log(delta)
        console.log(cur_y)

        redraw(canvas, context, arrImgContent, currentHeight, cur_x , cur_y, viewport_width, viewport_height);

        return false;
    }, false);
    // Firefox
    //canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false);

    /*$('#'+canvas_id).mousedown(function(e){
        var rect            = canvas.getBoundingClientRect();

        var mouseClickX     = e.clientX - rect.left;
        var mouseClickY     = e.clientY - rect.top;
        mouseIsDown         = true;
        startX              = mouseClickX ;
        startY              = mouseClickY ;
        canvas.style.cursor = "crosshair";

        console.log("Start mouse coor: " + startX + ", " + startY);

    });

    $('#'+canvas_id).mouseup(function(e){
        var rect            = canvas.getBoundingClientRect();

        var mouseClickX     = e.clientX - rect.left;
        var mouseClickY     = e.clientY - rect.top;
        mouseIsDown         =   false;
        ctx.beginPath();
        ctx.globalAlpha     = 0.5
        ctx.rect(startX, startY, mouseClickX - startX, mouseClickY - startY);
        ctx.fillStyle       = 'yellow';
        ctx.fill();
        canvas.style.cursor = "default";

        console.log("End box width and height: " + (mouseClickX - startX) + ", " + (mouseClickY - startY));

        // Trigger a loading bar on the rules and results table.
        startLearning(learningService);
    });*/


}
function redraw(canvas, context, imgArr, currentHeight, cur_x , cur_y, viewport_width, viewport_height){
    context.clearRect(0, 0, canvas.width, canvas.height);

    for(var i = 0; i < imgArr.length; i++){

        //context.drawImage(imgArr[i], 0, currentHeight);
        //if(cur_y>=currentHeight && cur_y<currentHeight + imgArr[i].height +10){
            context.drawImage(imgArr[i], cur_x, cur_y, viewport_width, viewport_height, 0, 0, viewport_width, viewport_height)
            //context.drawImage(imgArr[i], cur_x, cur_y)

        //context.drawImage(imgArr[i], 
        //        33, 71, 104, 124, 21, 20, 87, 104);
        //}
        //console.log("draw at "+cur_x+" "+cur_y);
        //console.log("viewport height and width at "+viewport_width+" "+viewport_height);

        //console.log(context.getImageData(0,currentHeight,context.canvas.width,context.canvas.height))
        //Set the y coordinate for the next image
        currentHeight       = currentHeight + imgArr[i].height +10;
    }
}

//Used by pdf controllers
function loadAllImages(canvas_name, arrImgSrc, callback){
    var loadedArr   = []; //Array of promise objects
    var imgArr      = [];    //Array of image objects that are loaded
    for(var i = 0; i < arrImgSrc.length; i++) {
        var src     = arrImgSrc[i];
        var sprite  = new Image();

        imgArr.push(sprite);
        loadedArr.push(loadAnImage(canvas_name, sprite, src));
    }
    //When all the promises are met, draw the images onto canvas
    $.when.apply(null, loadedArr).done(function(){
        console.log("A resolve has been made!")
        
        
        
        var totHeight   = 0;
        var maxWidth    = 0;
        for(var i = 0; i < imgArr.length; i++){
            totHeight   = totHeight + imgArr[i].height;
            if(imgArr[i].width > maxWidth){
                maxWidth = imgArr[i].width;
            }
        }

        
       
        // callback when everything was loaded
        callback(loadedArr, imgArr);
    });

}



function loadAnImage(canvas_name, sprite, src){
    //Defer it
    var deferred    = $.Deferred();

    sprite.onload   = function() {
        deferred.resolve();
    };
    sprite.src      = src;
    return deferred.promise();
}

// This is triggering the learning a name example.
// Trigger a loading bar on the rules and results table.
function startLearning(learningService){
    learningService.beginLearning();
}

// Specifically for adelejenkinsSCSU.pdf
function drawTooltipAndHighlight(canvas, ctx, canvas_name){



    // Highlight for Name
    /*ctx.beginPath();
    ctx.globalAlpha     = 0.3
    ctx.rect(290, 34, 80, 10);
    ctx.fillStyle       = '#fdff21'//'#66c2a5';
    ctx.fill();

    // Highlight for Phone
    ctx.beginPath();
    ctx.globalAlpha     = 0.3
    ctx.rect(295, 83, 72, 11);
    ctx.fillStyle       = '#fdff21'//'#fc8d62';
    ctx.fill();*/

    // Highlight for Education
    /*ctx.beginPath();
    ctx.globalAlpha     = 0.2
    ctx.rect(204, 180, 195, 18);    //Conn
    ctx.rect(182, 146, 209, 12);    //Central
    ctx.fillStyle       = '#a6d854';
    ctx.fill();*/

    // Highlight for School
    /*ctx.beginPath();
    ctx.globalAlpha     = 0.3
    ctx.rect(169, 133, 105, 12);    //Conn Univ
    ctx.rect(191, 157, 83, 12);     //Central
    ctx.fillStyle       = '#fdff21'//'#8da0cb';
    ctx.fill();

    // Highlight for Year
    ctx.beginPath();
    ctx.globalAlpha     = 0.3
    ctx.rect(549, 132, 51, 11);     //Conn year
    ctx.rect(550, 157, 50, 11);    //central year
    ctx.fillStyle       = '#fdff21'//'#e78ac3';
    ctx.fill();*/

    /*var myOpentip = new Opentip(canvas_name, "Name &emsp;&emsp;&emsp;&emsp; <span class='glyphicon glyphicon-pencil' ></span>", {
        tipJoint: "bottom", background:'rgba(52, 97, 135, 0.2)', borderColor: 'rgba(52, 97, 135, 1.0)'
    })*/
}

