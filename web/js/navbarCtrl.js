angular
    .module('ustc-oj')
    .controller("navbarCtrl", function($scope, $rootScope, $location, $window, $log, problemService, siteService){

        defaultSearchContent = "ID/Search";
        $scope.searchContent = "";
        $scope.siteService = siteService;

        $scope.searchFire = function(content) {
            if (problemService.checkValidProblemId(content)) {
                $window.location.href = siteService.problemLink + content;
            }
        };

        $scope.toProfile = function() {
            $window.location.href = siteService.profileLink;
        };

        $scope.toProblem = function() {
            $window.location.href = siteService.problemLink;
        };
        $scope.toContest = function() {
            $window.location.href = siteService.contestLink;
        };
        $scope.toStatus = function() {
            $window.location.href = siteService.statusLink;
        };
        $scope.toSubmit = function() {
            $window.location.href = siteService.submitLink;
        };

});