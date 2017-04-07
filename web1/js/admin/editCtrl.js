/**
 * Created by zhaohongzhu on 1/27/17.
 */
angular
    .module('ustc-oj')
    .controller("editCtrl", function ($routeParams, $scope, $http, $rootScope, $window,
                                      networkService, problemService, adminService) {
    $scope.problemId = null;
    $scope.contestId = null;
    $scope.isContest = false;
    $scope.problemData = null;
    $scope.problemEdit = null;
    $scope.finishLoading = false;

    console.log($routeParams);

    if ($routeParams.problem_ID == null) {

    }
    else {
        $scope.problemId = $routeParams.problem_ID;
        problemService.getProblemData(function(data){
            $scope.problemData = data;
            $scope.problemEdit = data.problem;
            $scope.finishLoading = true;
            startRender();
        }, $scope.problemId);
    }

    $scope.submitProblem = function () {
        var problemData = {

        };
        adminService.getProblemData();
    }

});


