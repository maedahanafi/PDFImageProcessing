/**
 * Created by Maeda on 2/9/2015.
 *
 * Controllers for index.html
 */

var app = angular.module('pdfApp', ['ngRoute',  'ui.bootstrap', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.edit']);

app.config(['$routeProvider', function ($routeProvider) {

}]);

app.factory('learningService', function ($rootScope) {
    var learningCommunication = {
        isLearning : false,
        endLearning: function(){

            this.isLearning = false;
            $rootScope.$emit('EndLearning');

        }, beginLearning: function(){

            this.isLearning = true;
            // Toggle the show for rules to be showned
            $rootScope.$emit('BeginLearning');
            // After supposedly learning, toggle the boolean
            setTimeout(function (){
                this.isLearning = false;
                $rootScope.$emit('EndLearning');
            }, 5000);

        },
        isRuleRunning : false,
        run_rule : function(){
            this.isRuleRunning = true;
            console.log("beginning running rule")
            // Emit an event signifying the rule is being applied
            $rootScope.$emit('BeginRunning');
            // After supposedly running, toggle the boolean
            setTimeout(function (){
                console.log("ending running rule")
                this.isRuleRunning = false;
                $rootScope.$emit('EndRunning');
            }, 5000);

        }
    };

    return learningCommunication;
});


app.controller('toolboxController', function($scope){
    //Indicates the mode in which the user is in.
    $scope.selectOn         = false;
    $scope.annotate         = false;

    $scope.setAllButtonsOff = function (){
        $scope.selectOn     = false;
        $scope.annotate     = false;
    };

    $scope.toggleSelectOn   = function (){
        $scope.selectOn     = !$scope.selectOn;
        $scope.drawRectangle();
        console.log( "Select on; the rectable should draw" );

    };

    $scope.toggleAnnotate   = function (){
        $scope.annotate     = !$scope.annotate;
    };

    $scope.drawRectangle    = function (){

    }

    $scope.crop             = function (){
        console.log('Crop!');
    };


})


