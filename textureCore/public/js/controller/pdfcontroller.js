/**
 * Created by mh4047 on 2/28/15.
 *
 * pdfController controls the whole pdf list table.
 */


//load in data into the pdf lists
app.controller('pdfController', function($scope, $http){
    $scope.pdf_list = [];

    $http.get('/index/filenames').success(function(filename) {  //List of strings
        //$scope.pdf_list = filename
        //pdf_list is a list of objects containng information on that filename
        filename.forEach(function(stringname){
            $scope.pdf_list.push({filename:stringname})
        })
    })
    console.log('Show list of pdfs');

    //This function sets the filename for the specific intance controller, pdfOpenController
    $scope.loadpdf = function(filename){
        $scope.filename = filename;
        //$scope.displaypdf(filename);

    }

    $scope.limitStep = 5;
    $scope.limit = $scope.limitStep;
    $scope.incrementLimit = function() {
        $scope.limit += $scope.limitStep;
    };
    $scope.decrementLimit = function() {
        $scope.limit = $scope.limitStep;
    };
    $scope.showAll = function() {
        $scope.limit = $scope.pdf_list.length;
    };
    // watch for creation of an element which satisfies the selector ".pdfTableRow"
    $(document).arrive(".pdfTableRow", function() {
        setTimeout(function () {
            var constantmargins = 26;
            $scope.canvas_width = $(".pdfTableRow").width() -constantmargins;
            //console.log("width of canvas_width:"+$scope.canvas_width);
            //console.log("width of pdf table row:"+$(".pdfTableRow").width());
            // unbind all arrive events on document element
            $(document).unbindArrive();
        }, 100);

    });




});
