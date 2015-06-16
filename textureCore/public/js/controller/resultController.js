/**
 * Created by mh4047 on 2/28/15.
 * resultController controls the result div in the main page
 */


// Controls resultsContainer.html
// Load in data into the results table
app.controller('resultController', [ '$scope', '$http', '$rootScope', 'learningService', function($scope, $http, $rootScope, learningService){
    $scope.learningService = learningService;

    // Detects event from the service that evokes learning
    $rootScope.$on('BeginRunning', function(event, args) {
        //$scope.$apply(function(){
            $scope.showResults      = false;
            $scope.showLoadResults  = true;
        //});
    });

    $rootScope.$on('EndRunning', function(event, args) {
        $scope.$apply(function(){
            $scope.showResults      = true;
            $scope.showLoadResults  = false;
        });
    });

    $scope.labels_list = [
        { field: 'DocumentName',    enableCellEdit: true },
        { field: 'School',          enableCellEdit: true }
    ];

    $scope.extraction_results = [                                               // The hardcode data into the table
        {
            "DocumentName"      : "obama.pdf",
            "School"            : "HARVARD LAW SCHOOL, COLUMBIA UNIVERSITY"
        },{
            "DocumentName"      : "adelejenkins.pdf",
            "School"            : "THE UNIVERSITY OF COLARADO"
        },{
            "DocumentName"      : "MaedaHanafiResume2014.pdf",
            "School"            : "Southern Connecticut State University"
        },{
            "DocumentName"      : "jacob.pdf",
            "School"            : "North Edhington College Workforce Training Center"
        },{
            "DocumentName"      : "robertnorberg.pdf",
            "School"            : "Wayne State University"
        },{
            "DocumentName"      : "JuanBeltran.pdf",
            "School"            : "New York University"
        },{
            "DocumentName"      : "AzzaAbouzied.pdf",
            "School"            : "Yale University"
        },{
            "DocumentName"      : "JayChen.pdf",
            "School"            : "Southern Connecticut State University"
        },{
            "DocumentName"      : "AyshaHanafi.pdf",
            "School"            : "Central Connecticut State University"
        },{
            "DocumentName"      : "IdrisAdam.pdf",
            "School"            : "University of Connecticut"
        },{
            "DocumentName"      : "LoriManson.pdf",
            "School"            : "Western Connecticut State Univ."
        },{
            "DocumentName"      : "ZaynKhan.pdf",
            "School"            : "Eastern Connecticut State Univ."
        },{
            "DocumentName"      : "MalikAbdul.pdf",
            "School"            : "Wayne State University"
        }
    ];
    /*$scope.extraction_results = [                                               // The hardcode data into the table
        {
            "DocumentName"      : "AdeleJenkins.pdf",
            "School"            : "Connecticut University, Central University"
        },{
            "DocumentName"      : "AyshaSiddique.pdf",
            "School"            : "Carnegie Mellon University"
        },{
            "DocumentName"      : "JuanBeltran.pdf",
            "School"            : "New York University"
        },{
            "DocumentName"      : "AzzaAbouzied.pdf",
            "School"            : "Yale University"
        },{
            "DocumentName"      : "JayChen.pdf",
            "School"            : "Southern Connecticut State University"
        },{
            "DocumentName"      : "AyshaHanafi.pdf",
            "School"            : "Central Connecticut State University"
        },{
            "DocumentName"      : "IdrisAdam.pdf",
            "School"            : "University of Connecticut"
        },{
            "DocumentName"      : "LoriManson.pdf",
            "School"            : "Western Connecticut State Univ."
        },{
            "DocumentName"      : "ZaynKhan.pdf",
            "School"            : "Eastern Connecticut State Univ."
        },{
            "DocumentName"      : "MalikAbdul.pdf",
            "School"            : "Wayne State University"
        }
    ];


                                                                                // This contains a list of unique labels e.g. Name, Address, etc

    /*$scope.labels_list = [
                            { field: 'Name',    enableCellEdit: true },
                            { field: 'Phone',   enableCellEdit: true },
                            { field: 'School',  enableCellEdit: true }
    ];

    $scope.extraction_results = [                                               // The hardcode data into the table
        {
            "Name"      : "Adele Jenkins",
            "Phone"     : "(203)-444-9268",
            "School"    : "Connecticut University, Central University"
        },{
            "Name"      : "Aysha Siddique",
            "Phone"     : "(712)-628-4039",
            "School"    : "Carnegie Mellon University"
        },{
            "Name"      : "Juan Beltran",
            "Phone"     : "(712)-322-9439",
            "School"    : "New York University"
        },{
            "Name"      : "Azza Abouzied",
            "Phone"     : "(203)-933-8071",
            "School"    : "Yale University"
        },{
            "Name"      : "Jay Chen",
            "Phone"     : "(232)-543-1344",
            "School"    : "Southern Connecticut State University"
        },{
            "Name"      : "Aysha Hanafi",
            "Phone"     : "(203)-234-5321",
            "School"    : "Central Connecticut State University"
        },{
            "Name"      : "Idris Adam",
            "Phone"     : "(322)-325-5333",
            "School"    : "University of Connecticut"
        },{
            "Name"      : "Lori Manson",
            "Phone"     : "(124)-322-9439",
            "School"    : "Western Connecticut State Univ."
        },{
            "Name"      : "Zayn Khan",
            "Phone"     : "(203)-933-8071",
            "School"    : "Eastern Connecticut State Univ."
        },{
            "Name"      : "Malik Abdul",
            "Phone"     : "(232)-543-1344",
            "School"    : "Wayne State University"
        }
    ];*/

    $scope.gridOptions  = {                                                     // Load data and options into the table
        enableSorting   :  true,
        columnDefs      :  $scope.labels_list,
        data            :  $scope.extraction_results,
        onRegisterApi   :  function( gridApi ) {
                                $scope.gridApi = gridApi;
                            }
    };

    $scope.addData      = function() {
        var n           = $scope.gridOptions.data.length + 1;
        $scope.gridOptions.data.push({

        });
    };

    $scope.removeRow    = function(index) {
        //if($scope.gridOpts.data.length > 0){
        $scope.gridOptions.data.splice(index, 1);
        //}
    };

                                                                                // Adds a unique keyword, $scope.search_box, to the list of keywords
    $scope.submit_keyword = function(){
        if( isExists($scope.labels_list, $scope.search_box) ){                   // Check for uniqueness of $scope.search_box within $scope.labels_list
            $scope.labels_list.push(
                {
                    field           :   $scope.search_box,
                    enableSorting   :   false,
                    enableCellEdit  :   true
                }
            );
        }else{
            $scope.addAlert("Keyword " + $scope.search_box + " already exists!");   // Alert user of already existing keyword
        }

        $scope.search_box = "";                                                 // Clear textbox

    };

    $scope.alerts       = [ ];

    $scope.addAlert     = function(msg) {
        $scope.alerts.push(
            {
                type    :   'danger',
                msg     :   msg
            }
        );
        var ind         = $scope.alerts.length - 1;
        setTimeout( function(){
            $scope .closeAlert(ind);
            console.log("close alert at "+ind);
        }, 5000);
    };

    $scope.closeAlert   = function(index) {
        $scope.alerts.splice(index, 1);
    };
}]);
