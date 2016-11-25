app.controller("navbarCtrl", function($scope, $rootScope){

    defaultSearchContent = "ID/Search";
    $scope.searchContent = defaultSearchContent;

    $scope.changeTab = function(toTab) {
        $rootScope.tabShow = toTab;
    };

    $scope.searchFire = function(content) {
        if (content != defaultSearchContent) {
            if (Number(content).toString() == content && Number(content) >= 1000 && Number(content) <= 9999) {
                $scope.changeTab("showProblem");
            }
        }
    };

});