/**
 * Created by mh4047 on 2/28/15.
 * productionController controls the production div in the main page index.html
 */


app.controller('productionController', function($scope, $http,  $rootScope, learningService){

    $scope.learningService      = learningService;
    $scope.showSuggestedRules   = learningService.isLearning; //false;
    $scope.showLoadLearning     = false;


    // Detects event from the service that evokes learning
    $rootScope.$on('BeginLearning', function(event, args) {
        $scope.$apply(function(){
            $scope.showSuggestedRules   = false;
            $scope.showLoadLearning     = true;
        });
    });

    $rootScope.$on('EndLearning', function(event, args) {
        $scope.$apply(function(){
            $scope.showSuggestedRules   = true;
            $scope.showLoadLearning     = false;
        });
    });


    $scope.runRule = function(){
        // Run the rule on the documents e.g. show the loading bar on the results section of the html
        learningService.run_rule();

    }


    /*$scope.extraction_rules = [
        {
            rule:   "Degree := /[\\w+]@[\\w\\.]+/\n"            +
                    "from Lines\n"                              +
                    "after Line /Education/\n"
        },{
            rule:   "Author := /[A-Z][a-z]+\\s*[A-Z][a-z]+/g\n"   +
                    "from Line\n"                                 +
                    "after Heading #1\n"
        }
    ];

    $scope.gridOptions  = {                                                     // Load data and options into the table
        data            :  $scope.extraction_rules,
        headerTemplate  :  "<div class='ui-grid-top-panel' style='text-align: center'></div>",
        onRegisterApi   :  function( gridApi ) {
            $scope.gridApi = gridApi;
        }
    };*/

});
