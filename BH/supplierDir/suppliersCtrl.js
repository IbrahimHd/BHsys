/// <reference path="../scripts/libs/angular/angular.min.js" />
/// <reference path="../scripts/libs/moment.min.js" />
(function () {
    'use strict';
    angular
    .module("app")
    .controller("suppliersCtrl", suppliersCtrl)
    .directive('addDomIf',addDomIfDirective);
    suppliersCtrl.$inject = ['$scope', '$rootScope', '$state', '$stateParams','$filter', 'dataService', 'utilityService', 'debugMode'];
    addDomIfDirective.$inject = [];
    
    function suppliersCtrl($scope, $rootScope, $state, $stateParams, $filter, dataService, utilityService, debugMode) {
        var debugThis = true;
        $scope.loading = false;
        var api_supplier = 'api/supplier/';
        $scope.dataToggle = 'supplierSummary';
        $scope.sortColumn = 'supplierName';
        $scope.viewToggle = 'tile';
        $scope.sortOrder = false;

        $scope.sortData = function () {
            $scope.suppliers = $filter('orderBy')($scope.suppliers, $scope.sortColumn, $scope.sortOrder);
            console.log($scope.suppliers);
        }

        function fillRelativeDate(suppliers) {
            return suppliers.map(function (supplier) {
                supplier.receiptsSum = $filter('number')(supplier.receiptsSum);
                supplier.latestReceiptDateRelative = moment(supplier.latestReceiptDate, "YYYY-MM-DDTHH:mm:ss.zzz").fromNow();
                return supplier;
            });
        }
        //$scope.suppliers = [];
        $scope.updateSuppliersDataset = function () {
            $scope.loading = true;
            //$scope.suppliers = [{ supplierId: 1, supplierName: 'A' }, { supplierId: 2, supplierName: 'B' }]; return $scope.suppliers;
            var url= api_supplier + ($scope.dataToggle == 'supplierSummary' ? 'getSummary' : '');
            dataService.get(url, false)
                .then(function (response) {
                        $scope.suppliers = fillRelativeDate(response.data);
                        debugMode && debugThis && console.log($scope.suppliers);
                },
                    function (reason) { debugMode && debugThis && console.log(reason, "Error, supplier/suppliersCtrl.") })
                .finally(function () { $scope.loading = false; });
            //return $scope.suppliers;
        }
        $scope.updateSuppliersDataset();


        $scope.isLongPressDone = false;
        $scope.onHoldShortStart = function ($event, $promise, supplierId) {
            $promise.then(function (success) {
                //Called if the promise is resolved, ie the button is hold long enough
                $scope.isLongPressDone = true;
            }, function (reason) {
                //Called if the promise is rejected, ie the button is not hold long enough
                $scope.selectedSupplierId = null;
                $scope.isLongPressDone = false;
                $scope.holdShortStyle = {
                    'background-image': 'inherit'
                }
            }, function (update) {
                $scope.selectedSupplierId = supplierId;
                //This is the progress function, called multiple times before the promise is either resolved or rejected.
                /* Don't apply style on the normal Clik. Wait a bit.*/
                if (update > 0.34) {
                    $scope.holdShortStyle = {
                        'background-image': 'linear-gradient(to top, #3f8 ' + update * 100 + '%, transparent ' + update * 100 + '%)',
                        'color':'#666'
                    }
                }
            })
        }

        moment.locale('ar');
        console.log(moment.locale());
        //var timeAgo = moment().humanize();
        $scope.relativeTime = moment("2017 7 27 11 11 11", "YYYY MM DD HH mm ss").fromNow();
        //moment("2010 2 29", "YYYY MM DD")
        //moment.duration(t).humanize(true)
        console.log($scope.relativeTime);
    }

    function addDomIfDirective() {
        /* add-dom-if="isLongPressDone && selectedSupplierId === supplier.supplierId" */
        return {
            //template: '<h2>dooooooooooooom</h2',
            scope:{
                addDomIf:'='
            },
            link: function (scope, element, attrs) {
                console.log(scope.addDomIf);      
                scope.$watch('addDomIf', function (isLongPressDone) {
                    if (isLongPressDone===true) { element.append('<h2>dooooooooooooom</h2'); console.log(scope.addDomIf); }
                });
            }
        }
    }
})();
