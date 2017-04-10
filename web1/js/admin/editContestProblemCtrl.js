/**
 * Created by vollt on 2017/4/6.
 */
angular
    .module('ustc-oj')
    .controller("editContestProblemCtrl", function ($routeParams, $scope, $http, $rootScope, $window,
                                      networkService, problemService, adminService) {
        $scope.problem_id = null;
        $scope.problem_title = null;
        $scope.time_limit = "1000";
        $scope.memory_limit = "268435456";
        $scope.input_method = "stdin";
        $scope.output_method = "stdout";
        $scope.author = null;
        $scope.source = null;
        $scope.description = null;
        $scope.input_description = null;
        $scope.output_description = null;
        $scope.input_sample = [];
        $scope.output_sample = [];
        $scope.hint = null;

        $scope.data_dir = null;
        $scope.sort_index = null;
        $scope.contest_id = null;

        $scope.finishLoading = false;

        if ($routeParams.sortIndex == null) {
            $scope.contest_id = $routeParams.contest_ID;
        }
        else {
            $scope.contest_id = $routeParams.contest_ID;
            $scope.sort_index = $routeParams.sortIndex;
            adminService.getProblem(function(data){
                var problem = data.problem;
                adminService.Populate(problem, $scope);
            }, $scope.sort_index, $scope.contest_id, null);
        }

        $scope.Fire = function () {
            var Data = {
                problem_title : $scope.problem_title,
                time_limit : $scope.time_limit,
                memory_limit : $scope.memory_limit,
                input_method : $scope.input_method,
                output_method : $scope.output_method,
                author : $scope.author,
                source : $scope.source,
                description : $scope.description,
                input_description : $scope.input_description,
                output_description : $scope.output_description,
                contest_id : $scope.contest_id,
                sort_index : $scope.sort_index,
                data_dir : $scope.data_dir,
                hint : $scope.hint
            };

            adminService.arrayPopulate("input_sample", $scope.input_sample, Data);
            adminService.arrayPopulate("output_sample", $scope.output_sample, Data);

            // if ($scope.problem_id)
            //     Data["problem_id"] = $scope.problem_id

            adminService.addContestProblem(function(data){
                $window.location.href = '#/';
            }, Data);
        }

        $scope.addSample = function() {
            $scope.input_sample.push('');
            $scope.output_sample.push('');
        }
    });