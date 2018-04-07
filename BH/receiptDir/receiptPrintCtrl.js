/// <reference path="../scripts/libs/angular/angular.min.js" />

(function () {
    'use strict';
angular
    .module("app")
    .controller("receiptPrintCtrl", receiptPrintCtrl);
receiptPrintCtrl.$inject = ['$scope', '$rootScope', '$stateParams', 'dataService', 'receiptService', 'utilityService', 'debugMode'];

function receiptPrintCtrl($scope, $rootScope, $stateParams, dataService, receiptService, utilityService, debugMode) {
        var debugThis = false;
        var api_receipt = "/api/receipt/";
        debugMode && debugThis && console.log($stateParams.dataLoad)

        //..........................
        if ($stateParams.dataLoad == 'undefined' || $stateParams.dataLoad == null) {
            console('>>> no data sent via $stateParams');
        }
        else if (angular.isObject($stateParams.dataLoad)) {
            $scope.receipt = $stateParams.dataLoad;
        }
        else if (angular.isNumber($stateParams.dataLoad) || angular.isString($stateParams.dataLoad)) {
            var receiptId = $stateParams.dataLoad;
            dataService.get(api_receipt + '?receiptId=' + receiptId, false)
                  .then(function (response) {
                      $scope.receipt = receiptService.calcReceiptTotals(response.data);
                  });
        }
        //..........................

        $scope.companyInfo = $rootScope.companyInfo;
        $scope.goBackState = function () {
            utilityService.goBack();
        }
    };
})();
