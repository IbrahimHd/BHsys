(function () {
    'use strict';
    angular
    .module("app")
    .controller("supplierCtrl", supplierCtrl);
    supplierCtrl.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'supplierService', 'dataService', 'utilityService', 'msgConfirm', 'debugMode'];

    function supplierCtrl($scope, $rootScope, $state, $stateParams, supplierService, dataService, utilityService, msgConfirm, debugMode) {
        var debugThis = true;
        var api_supplier = "api/supplier/";

        $scope.msgConfirmCancel = msgConfirm.msgConfirmCancel;
        $scope.msgConfirmRemove = msgConfirm.msgConfirmRemove;
        $scope.msgConfirmDelete = msgConfirm.msgConfirmDelete;

        debugMode && debugThis && console.log('dataLoad', $stateParams.dataLoad);
        debugMode && debugThis && console.log('mode', $stateParams.mode);

        $scope.enableRemove = !$stateParams.mode == 'add';

        //..........................
        if ($stateParams.dataLoad == 'undefined' || $stateParams.dataLoad == null) {
            $scope.supplier = {}; // new supplier
            console.log('>>> no data sent via $stateParams');
            //$state.go('layout.landing');
        }
        //Data object {}
        else if (angular.isObject($stateParams.dataLoad)) {
            $scope.supplier = $stateParams.dataLoad;
        }
        //Id
        else if (angular.isNumber($stateParams.dataLoad)) {
            var supplierId = $stateParams.dataLoad;
            dataService.get(api_supplier + '?id=' + supplierId, false)
                        .then(function (response) {
                            $scope.supplier = response.data;
                        }, function (reason) { debugMode && debugThis && console.log(reason, "Error, recieptCtrl/supplier/findSupplier.") });
        }

        $scope.supplierSearch = function (text) { return supplierService.searchByName(text); }

        //.......................... 
        var user = $rootScope.currentUser.UserLogin;    

        $scope.addSupplier = function (supp) {
             debugMode && debugThis && console.log(supp);
            supp.createdBy = user;
            dataService.post(api_supplier, supp).then(function (response) {
                //push data to the view
                var r = { supplierId: response.supplierId, supplierName: response.supplierName, receiptItems: [] }
                $state.go('layout.receipt', r);
                $scope.goBackState();
            }, function (reason) { debugMode && debugThis && console.log(reason, "Error, recieptCtrl/addItem/Post.") });
        }

        $scope.goBackState = function () {
            utilityService.goBack();
        }
    };
})();
