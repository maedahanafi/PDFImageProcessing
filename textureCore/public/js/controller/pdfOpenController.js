/**
 * Created by mh4047 on 2/28/15.
 * pdfOpenController controls individual pdf buttons and pdf canvas


    Update on the drawing situation: below is code that allows drawing on the canvas via directive. 
    But the coordinates are still inaccurate. It seems that the coordinates from the directive
    are much more accurate than the other alternative (see next paragraph), because the bindings
    are accurate. The next thing to do is to figure out which of the combinations of attributes
    returns the accurate mouse coordinates e.g. offset with rect.top/left, etc.

    The other alternative is to bind events via javascript in the initCanvas() method, however,
    my suspisicion is that the bindings are not accurate. I binded via addEvenLIstener to docuemnt
     and canvs and compared the two coordinates from various attributes e.g. offset,etc --and not
     a single difference between the two. I think the source of this is due to the angularjs controlling 
     the show or not show property of these canvas; thus we must test extensively with the angular js 
     directive. We have tested all combinations through the bindings in initCanvas through addEventListener
     and to no avail. 

     TODO: Mess around with following directive
 *//*
app.directive("drawing", function(){
  return {
    restrict: "A",
    link: function(scope, element){
      var ctx = element[0].getContext('2d');
      
      // variable that decides if something should be drawn on mousemove
      var drawing = false;
      
      // the last coordinates before the current move
      var lastX;
      var lastY;
      
      element.bind('mousedown', function(event){
        
        lastX = event.offsetX;
        lastY = event.offsetY;
        
        // begins new line
        ctx.beginPath();
        
        drawing = true;
      });
      element.bind('mousemove', function(event){
        if(drawing){
          // get current mouse position
          currentX = event.offsetX;
          currentY = event.offsetY;
          
          draw(lastX, lastY, currentX, currentY);
          
          // set current coordinates to last one
          lastX = currentX;
          lastY = currentY;
        }
        
      });
      element.bind('mouseup', function(e){
        // stop drawing
        drawing = false;
        console.log(
        'page: ' + e.pageX + ',' + e.pageY, 
        'client: ' + e.clientX + ',' + e.clientY, 
        'screen: ' + e.screenX + ',' + e.screenY,
        'offset:' + e.offsetX + ','+e.offsetY, e) 
      });
        

      // canvas reset
      function reset(){
       element[0].width = element[0].width; 
      }
      
      function draw(lX, lY, cX, cY){
        // line from
        ctx.moveTo(lX,lY);
        // to
        ctx.lineTo(cX,cY);
        // color
        ctx.strokeStyle = "#4bf";
        // draw it
        ctx.stroke();
      }
    }
  };
});*/

//Load in data into the pdf lists
//Controls pdfContainer.html
app.controller('pdfOpenController', [ '$scope', '$http', '$q', 'learningService', function($scope, $http, $q, learningService) {


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

    //document.getElementById($scope.canvas_id).width = "600px"
    //document.getElementById($scope.canvas_id).height = "300px"

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

            loadAllImages($q, 1, $scope.canvas_id, arrFiles.resultfilepath).then(function(arrImgContent){
                //Initialize the Drawing tools
                initCanvas($scope.canvas_id, arrImgContent.loadedArr, arrImgContent.imgArr, $scope.learningService);
                //initCanvas($scope.canvas_id, loadedArr, imgArr , $scope.learningService);

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

/*
    @canvas_id is the current canvas id we are dealing with
    @arrImgContent is the array filled with the image sprites
    @imageArr is the meta data on the images
    @learningService links us to the learning service in the server

*/
//CANVAS
function initCanvas(canvas_id, imageArr, arrImgContent, learningService){
    var mouseIsDown         = false;
    var startX;
    var startY;
    var strokeStyle         = "black",
        lineWidth           = 14;

    //Set the drawing functionalities
    var canvas              = document.getElementById(canvas_id);//$('#'+canvas_id).get(0);
    var context             = canvas.getContext('2d');//$('#'+canvas_id).get(0).getContext('2d');
    var drawInformation     = {
        'delta':10,     //The starting point of drawing an image
        'totHeight':0,  //The total height of the sprites all together on screen
        'scroll_x':0,
        'scroll_y':0,
        'viewport_height':context.canvas.height,
        'viewport_width':context.canvas.width,
        'zoom':1
    } 
    //Array containing all highlight coordinates
    var allHighlights = [];
    
    redraw(canvas, context, arrImgContent, drawInformation, allHighlights)


    //setTimeout(drawTooltipAndHighlight(canvas, ctx, '#'+canvas_id), 15000);

    //Add mouse event scrolling
    canvas.addEventListener("mousewheel", function(e) {

        // cross-browser wheel delta
        var e       = window.event || e; // old IE support
        var delta   = Math.max(-3, Math.min(3, (e.wheelDelta || -e.detail)));

        //TODO: prevent infinite scrolling. See redraw(), where drawInformation.totHeight is not accurate
        //move the images when the current height doesn't go beyond the image. Prevent infinite vertical scrolling
        var candidate_scroll_y = drawInformation.scroll_y + delta;  //This is negative e.g. -1244
        if(candidate_scroll_y<=0 && 
            (0-candidate_scroll_y+drawInformation.viewport_height)<drawInformation.totHeight){  //Negate the candidate_scroll_y e.g. 1244 to compare against the tot height of images rendered and factor in the viewport height
            drawInformation.scroll_y = candidate_scroll_y
            redraw(canvas, context, arrImgContent, drawInformation, allHighlights);
            e.preventDefault();
            return true;
        }
    }, false);

    //var rect            = canvas.getBoundingClientRect();
    //console.log(rect)
   /*canvas.addEventListener("mouseover", function(e) {
        //var rect            = canvas.getBoundingClientRect();
        console.log(e)
        console.log(canvas)

        console.log(drawInformation);
        //console.log("e offset:", e.offsetX, e.offsetY)
        //console.log((e.clientX-rect.left)+", "+(e.clientY-rect.top));
        //console.log((e.pageX-canvas.offsetLeft)+", "+(e.pageY-canvas.offsetTop));
         console.log(
            'page: ' + e.pageX + ',' + e.pageY, 
            'client: ' + e.clientX + ',' + e.clientY, 
            'screen: ' + e.screenX + ',' + e.screenY,
            'offset:'+"Top/Left: "+rect.top+" / "+rect.left+" "+"Right/Bottom: "+rect.right+" / "+rect.bottom ) 
       
   });*/

   /*FOR DEMO PURPOSES*/
    canvas.addEventListener('click', function(e) { 
  
        //begin drawing
        allHighlights.push({'x':18, 'y':80, 'width':100, 'height':10});
        redraw(canvas, context, arrImgContent, drawInformation, allHighlights);

        // Trigger a loading bar on the rules and results table.
        startLearning(learningService);
    }, false);

    //Set listeners to allow user to draw highlights
    //$('#'+canvas_id).mousedown(function(e){
    /*canvas.addEventListener("mousedown", function(e) {
        console.log(rect)
        var mouseClickX     = e.offsetX-rect.left//offsetX//e.clientX - (rect.left)//e.clientX - rect.left;
        var mouseClickY     = e.y-rect.top//e.clientY - (rect.top)//e.clientY - rect.top;
        mouseIsDown         = true;
        startX              = mouseClickX ;
        startY              = mouseClickY ;
        canvas.style.cursor = "crosshair";

        allHighlights.push({'x':startX, 'y':startY, 'width':10, 'height':10});

        redraw(canvas, context, arrImgContent, drawInformation, allHighlights);

        console.log("New coor: ", allHighlights);
    }, false);
*/
    /*canvas.addEventListener("mouseup", function(e) {
    //$('#'+canvas_id).mouseup(function(e){
        var rect            = canvas.getBoundingClientRect();

        var mouseClickX     = e.clientX - rect.left;
        var mouseClickY     = e.clientY - rect.top;
        mouseIsDown         =   false;
        
        canvas.style.cursor = "default";

        //allHighlights.push({'x':startX, 'y':startY, 'width':mouseClickX - startX, 'height':mouseClickY - startY});

        //console.log("End box width and height: " + (mouseClickX - startX) + ", " + (mouseClickY - startY));
        redraw(canvas, context, arrImgContent, drawInformation, allHighlights);

        // Trigger a loading bar on the rules and results table.
        //startLearning(learningService);
    }, false);*/


}
/*
    @imgArr is the array of sprites
    @cur_y refers to the scrollview position e.g. the starting point of rendering
    @drawInformation contains information such as current scroll y pixel, etc. See initCanvas
    @allHighlights is an array containing {x:__, y:__, width:__, height:___ }
*/
function redraw(canvas, context, imgArr, drawInformation, allHighlights ){
    context.clearRect(0, 0, canvas.width, canvas.height);
   
    //@currentHeight keeps track of the y coordinate of where the next picture should be displayed e.g. currheight = currheight + prev image height
    var currentHeight = 0//drawInformation.delta;  //start the rendering by the delta gap e.g. start drawing at the 10th pixel
    
    //Redraw sprites
    for(var i = 0; i < imgArr.length; i++){
        var sprite = imgArr[i];
        //Adjust width and the height, dependent on the width
        var old_height = sprite.height, 
            old_width  = sprite.width;
        var new_width  = drawInformation.viewport_width;
        var new_height = old_height / old_width * drawInformation.viewport_width;

        printDebug("Old height and width:" + old_height+" " + old_width, 2);
        printDebug("Sprite height and width:"+new_width+" "+new_height, 2);

        context.drawImage(sprite, drawInformation.scroll_x, drawInformation.scroll_y+currentHeight, new_width, new_height);
        
        //Set the y coordinate for the next image
        currentHeight  = currentHeight + new_height //+ drawInformation.delta;
    }
     //Store the total height rendered
    drawInformation.totHeight = currentHeight//+drawInformation.scroll_y;
    printDebug('totHeight:' + drawInformation.totHeight, 2);


    //Draw highlights
    for(var j=0; j<allHighlights.length; j++){
        var highlightInfo = allHighlights[j];
        context.beginPath();
        context.globalAlpha     = 0.5
        context.rect(highlightInfo.x, highlightInfo.y, highlightInfo.width, highlightInfo.height);
        context.fillStyle       = 'yellow';
        context.fill();
    }

    //Goal is to draw on this red box
    /*context.beginPath();
    context.globalAlpha     = 0.5
    context.rect(25, 25, 50, 100);
    context.fillStyle       = 'yellow';
    context.fill();*/
    context.globalAlpha     = 1

    return drawInformation;
}

//Used by pdf controllers
function loadAllImages($q, zoom, canvas_name, arrImgSrc){
    var deferred = $q.defer();

    var loadedArr   = [];   //Array of promise objects
    var imgArr      = [];   //Array of image objects that are loaded
    
    for(var i = 0; i < arrImgSrc.length; i++) {
        var src     = arrImgSrc[i];
        var sprite  = new Image();

        imgArr.push(sprite);
        loadedArr.push(loadAnImage(canvas_name, sprite, src));
    }
    //When all the promises are met, draw the images onto canvas
    $.when.apply(null, loadedArr).done(function(){
        printDebug("All images loaded!", 0)
       
        // callback when everything was loaded
        deferred.resolve({'loadedArr':loadedArr, 'imgArr':imgArr})
    });
    return deferred.promise;
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

