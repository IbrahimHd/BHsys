(function () {
    'use strict';
    angular
        .module("urlQueryString", [])
        .service('urlQueryStringService', function ($location) {
            this.getFilters = function (filterObj) {
                var qs = $location.search();
                //isolate this obj from the original
                var filterObjCopy = angular.copy(filterObj);
                for (var param in filterObjCopy) {
                    if (param in qs) {
                        filterObjCopy[param] = qs[param];
                    }
                }
                return filterObjCopy;
            };
        })
        .directive('filterField', function () {
            return {
                restrict: 'E',
                scope: {
                    filters: '=',
                    field: '@'
                },
                template: '<input type="text" ng-model="filters[field]" ng-model-options="{ debounce: 250 }" ng-change="doFilter()">',
                controller: function ($scope, $location) {
                    $scope.doFilter = function () {
                        // update the query string
                        if ($scope.filters[$scope.field] != '') {
                            $location.search($scope.field, $scope.filters[$scope.field]);
                        } else {
                            // remove from query string if empty
                            $location.search($scope.field, null);
                        }
                    }
                }
            }
        });
})();