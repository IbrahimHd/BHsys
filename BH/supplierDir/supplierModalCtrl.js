/// <reference path="../scripts/libs/angular/angular.min.js" />

(function () {
    'use strict';
    angular
    .module("app")
    .controller("supplierModalCtrl", supplierModalCtrl);
    supplierModalCtrl.$inject = ['$scope', '$rootScope', '$state', '$uibModalInstance', 'modalMode', 'supplierToEdit', 'supplierService', 'dataService', 'utilityService', 'msgConfirm', 'debugMode'];

    function supplierModalCtrl($scope, $rootScope, $state, $uibModalInstance, modalMode, supplierToEdit, supplierService, dataService, utilityService, msgConfirm, debugMode) {
        var debugThis = true;
        var api_supplier = "api/supplier/";
        $scope.msgConfirmCancel = msgConfirm.msgConfirmCancel;
        $scope.msgConfirmRemove = msgConfirm.msgConfirmRemove;
        $scope.msgConfirmDelete = msgConfirm.msgConfirmDelete;

        console.log(modalMode)
        $scope.mode = modalMode;
        $scope.enableRemove = (modalMode == 'fullControl'); //!(modalMode == 'add');

        debugMode && debugThis && console.log(supplierToEdit);

        /* Load the injected data*/
        if (modalMode === 'edit') {
            if (supplierToEdit == 'undefined' || supplierToEdit == null) {
                $scope.supplier = {}; // new supplier
                console.log('>>> no data sent via supplierToEdit');
            }
            else if (angular.isObject(supplierToEdit)) {
                $scope.supplier = supplierToEdit;
            }
            else if (angular.isNumber(supplierToEdit)) {
                var supplierId = supplierToEdit;
                dataService.get(api_supplier + '?id=' + supplierId, false)
                            .then(function (response) {
                                $scope.supplier = response.data;
                            }, function (reason) { debugMode && debugThis && console.log(reason, "Error, supplierModal.") });
            }
        }

        $scope.supplierSearch = function (text) { return supplierService.searchByName(text); }

        //.......................... 
        var user = $rootScope.currentUser.UserLogin;   

        $scope.closeModal = function (result) {
            $uibModalInstance.close(result);
        }

        $scope.cancelModal = function (reason) {
            $uibModalInstance.dismiss(reason);
        }

        $scope.addSupplier = function (supp) {
             debugMode && debugThis && console.log(supp);
            supp.createdBy = user;
            dataService.post(api_supplier, supp, 'إسم المورّد موجود سابقاً').then(function (response) {
                //push data to the view
                $scope.closeModal({ 'obj': response.data, 'action': 'add' }); //push data to the view
            }, function (reason) {
                debugMode && debugThis && console.log(reason, "Error, supplierModalCtrl/addSupplier/Post.");
                console.log(reason.statusText == "Not Acceptable");
            });
        }

        // SAVE changes
        $scope.saveSupplier = function (suppToUpdate) {
            suppToUpdate.modifiedBy = user;
            var msg = { successMsg: 'تم تعديل بيانات المورّد بنجاح.', errorMsg: 'حصل خطأ في تعديل بيانات المورّد.' }
            dataService.put(api_supplier, suppToUpdate, msg)
                .then(function (response) {
                    console.log(response);
                    /*
                    * store the returned obj that has the server-side stamped data "createdAt" (but not that in the form "suppToUpdate")
                    */
                    $scope.closeModal({ 'obj': response.data, 'action': 'update' }); //SPLICE then PUSH the record from the view
                }, function (reason) { debugMode && debugThis && console.log(reason); });
          //saveItemImg(suppToUpdate.imgIsChanged, suppToUpdate.itemId);
        }
        $scope.removeSupplier = function (suppToRemove) {
            //dataService.put(api_supplier + '?supplierToEdit=' + JSON.stringify(suppToRemove) + '&isDeleted=' + true, null, 'حصل خطأ في التعديل.')
            suppToRemove.Receipts = undefined;
            suppToRemove.isDeleted = true;
            var msg={successMsg:'تم حذف المورّد بنجاح.', errorMsg:'حصل خطأ في الحذف.'}
            dataService.put(api_supplier, suppToRemove, msg)
            .then(function (response) {
                    console.log(response);
                    /*
                    * store the returned obj that has the server-side stamped data "createdAt" (but not that in the form "suppToUpdate")
                    */
                    $scope.closeModal({ 'obj': response.data, 'action': 'remove' }); //SPLICE then PUSH the record from the view
                }, function (reason) { debugMode && debugThis && console.log(reason); });
        }

        $scope.goBackState = function () {
            utilityService.goBack();
        }
    };
})();
