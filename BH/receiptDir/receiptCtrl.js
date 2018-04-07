/// <reference path="../scripts/libs/angular/angular.min.js" />

(function () {
    'use strict';
angular
    .module("app")
    .controller("receiptCtrl",receiptCtrl);
    receiptCtrl.$inject = ['$scope', '$rootScope', '$filter', '$uibModal', '$state', '$stateParams', '$ocLazyLoad', 'dataService', 'msgConfirm', 'receiptService','supplierService', 'debugMode'];
    itemModalCntrl.$inject = ['$scope', '$rootScope', 'modalMode', 'itemToEdit', '$uibModalInstance', 'dataService', 'msgConfirm', 'debugMode'];

    function receiptCtrl($scope, $rootScope, $filter, $uibModal, $state, $stateParams, $ocLazyLoad, dataService, msgConfirm, receiptService, supplierService, debugMode) {
        var debugThis = false;
        var api_receipt = "/api/receipt/";
        var api_receiptItemRemoveRestore = "/api/receiptItem/remove_restore/";
        var api_receiptItemDelete = "/api/receiptItem/";
        var api_packageTypes = "/api/common/";
        $scope.isSideItemsMenuOpen = false;
        $scope.isReceiptItemsCollapse = false;
        $scope.isSearchSupplierOpen = true;
        $scope.setReceiptSupplierInfo = setReceiptSupplierInfo;
        $scope.loadMostCommomItemsBySelectedSupplier = loadMostCommomItemsBySelectedSupplier;
        $scope.saveReceipt = saveReceipt;
        $scope.msgConfirmCancel = msgConfirm.msgConfirmCancel;
        $scope.msgConfirmRemove = msgConfirm.msgConfirmRemove;
        $scope.msgConfirmDelete = msgConfirm.msgConfirmDelete;
        $scope.isAuthorized = $rootScope.currentUser.UserRole != 'registrar' || !$rootScope.isAuthorized($rootScope.currentUser.UserLogin);
        $scope.receipt = {};
        $scope.isFocused = false;

        $scope.dragControlListeners = {
            accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
                if (angular.isDefined(sourceItemHandleScope.itemScope.item)) {
                        $scope.isFocused = true;
                        var itemBeingAdded = $filter('filter')($scope.receipt.ReceiptItems, function (d) { return d.itemId === sourceItemHandleScope.itemScope.item.itemId; })[0];
                        if (angular.isDefined(itemBeingAdded)) {
                            $scope.itemAlreadyExist ={"status": true,'item':itemBeingAdded};
                        }
                        else {
                            $scope.itemAlreadyExist = { "status": false, 'item': null };
                        }
                        return !angular.isDefined(itemBeingAdded);
                }
                else {//it's an INTERNAL sorting rather than actual move
                    return true;
                }

            }
        };
        $scope.isShortActionDone = false;
        $scope.onHoldShortStart = function ($event, $promise,itemId) {
            $promise.then(function (success) {
                //Called if the promise is resolved, ie the button is hold long enough
                //$scope.isShortActionDone = !$scope.isShortActionDone
                $scope.isShortActionDone = true;
            }, function (reason) {
                //Called if the promise is rejected, ie the button is not hold long enough
                $scope.selectedItemId = null;
                $scope.isShortActionDone = false;
                $scope.holdShortStyle = {
                    'background-image': 'inherit'
                }
            }, function (update) {
                $scope.selectedItemId = itemId;
                //This is the progress function, called multiple times before the promise is either resolved or rejected.
                /* Don't apply style on the normal Clik. Wait a bit.*/
                if (update > 0.34) {
                    $scope.holdShortStyle = {
                        'background-image': 'linear-gradient(to top, #3f8 ' + update * 100 + '%, transparent ' + update * 100 + '%)'
                    }
                }
            })
        }

        debugThis && debugMode && console.log('$stateParams.receiptId: ', $stateParams.receiptId);
      //debugThis && debugMode && console.log('$stateParams.dataLoad.ReceiptItems[0].itemCost: ', typeof ($stateParams.dataLoad.ReceiptItems[0].itemCost));
        function prepareNewReceipt (){
            $scope.receipt = {
                receiptId: null,
                receiptDate: moment().toDate(),
                supplierId: null,
                ReceiptItems: []
            };
            $scope.mode = 'add';
        }

        if ($stateParams.receiptId == 'undefined' || $stateParams.receiptId == null) {
            prepareNewReceipt();
        }
        else {
            $scope.mode = $stateParams.mode;
            dataService.get(api_receipt + '?receiptId=' + $stateParams.receiptId)
                .then(function (response) {
                        $scope.receipt = receiptService.calcReceiptTotals(response.data);
                        loadMostCommomItemsBySelectedSupplier($scope.receipt.supplierId);
                    },
                    (err) =>{ console.log(err); }
                );
        }

        function openSearchSupplier() { $scope.isSearchSupplierOpen = !($scope.mode == 'edit'); };
        openSearchSupplier();

        $scope.searchText = null; // initial search input value
        $scope.noCache = false;

        $scope.querySearch = function (text) { return supplierService.searchByName(text); }
        
        /* load package types for the <select> menu */
        dataService.get(api_packageTypes + 'packageTypes', false)
                        .then(function (response) {
                            $scope.packageTypes = response.data;
                        }, function (reason) { debugMode && debugThis && console.log(reason, "Error, recieptCtrl/packageTypes.") });

        function setReceiptSupplierInfo(supplier) {
                console.log(supplier);
                if (angular.isDefined(supplier) && supplier !== null) {
                $scope.supplier = supplier;
                $scope.receipt.supplierId = supplier.supplierId;
                $scope.receipt.supplierName = supplier.supplierName;
                $scope.receipt.ReceiptItems = [];
                $scope.isSearchSupplierOpen = false;
            }
        }
        $scope.supplierData = function () {
            if (angular.isDefined($scope.supplier)) return $scope.supplier;
            else  return $scope.receipt.supplierId;
        }

        function itemPrepareProperties(itemRawData) {
            var itemFixed = angular.copy(itemRawData);
                itemFixed.itemCost = null;
                itemFixed.itemQnty = null;
                itemFixed.itemPackageCount = null;
                
                itemFixed.createdAt = null; //reset it, as this this for the original [Items] table
                itemFixed.createdBy = null; //reset it, as this this for the original [Items] table
                itemFixed.modifiedAt = null; //reset it, as this this for the original [Items] table
                itemFixed.modifiedBy = null; //reset it, as this this for the original [Items] table
                itemFixed.changed = false; //initialize the status
                itemFixed.$id = undefined;
                itemFixed.itemCategory = undefined;
                itemFixed.ReceiptItems = undefined;
                itemFixed.supplierId = undefined;
                itemFixed.PackageType = undefined;
            return itemFixed
        }

        function itemsPrepareProperties(itemsRawData) {
            var itemsFixed = [];
            angular.forEach(itemsRawData, function (value, key) {
                itemsFixed.push(itemPrepareProperties(value));
            });
            return itemsFixed;
        }

        function loadMostCommomItemsBySelectedSupplier(supplierId) {
            if (angular.isDefined(supplierId) && supplierId !== null) {
                dataService.get('/api/item/itemsOfSupplier' + '?splrId=' + supplierId, false)
                            .then(function (result) {
                                $scope.items = result.data; //console.log( $scope.items);
                                $scope.itemsPerparedForReceipt = itemsPrepareProperties($scope.items); //console.log($scope.itemsPerparedForReceipt);
                            },
                            (b) => { console.log('2nd callback param:', b)},
                            (c) => { console.log('3rd callback param:', c)}
                            )
                            .catch(function (error) {
                                $scope.items = [];
                                $scope.itemsPerparedForReceipt = [];
                            })
                            .finally(
                                (a) => { console.log(a); $scope.searchingItems = false; },
                                (b) => { console.log(b); $scope.searchingItems = false; }
                            );
            }
        }
        //..........................
        $scope.searchItemsInput = '';
        $scope.searchingItems = false;
        $scope.searchItems = function (inputText) {
            $scope.searchingItems = true;
            if (inputText.length > 0) {
                return dataService.get('/api/item/findItem' + '?strName=' + inputText, false)
                                .then(function (result) {
                                    $scope.items = result.data;
                                    $scope.itemsPerparedForReceipt = itemsPrepareProperties($scope.items);
                                    $scope.searchingItems = false;
                                })
                                .catch(function (error) {
                                    $scope.items = [];
                                    $scope.itemsPerparedForReceipt = [];
                                    $scope.searchItemsNotFound = true;
                                    $scope.searchingItems = false;
                                });
            }
            else {
                if ($scope.supplier && $scope.supplier.supplierId)
                    loadMostCommomItemsBySelectedSupplier($scope.supplier.supplierId);
                else if ($scope.receipt && $scope.receipt.supplierId)
                    loadMostCommomItemsBySelectedSupplier($scope.receipt.supplierId);
                else 
                    $scope.searchingItems = false;
            }
        }

        $scope.isSideItemsMenuOpen = true;

        $scope.isItemJustAdded = function (createdAt) {
            return !(createdAt === null);
        }

        //..........................

        function saveReceipt(receipt) {
            console.log('beforeDoingAnything: ', receipt);
            var userLogin=$rootScope.currentUser.UserLogin;
            if ($scope.mode === 'edit') {
                receipt.modifiedBy = userLogin;
                angular.forEach(receipt.ReceiptItems, function (receiptItem) {
                    receiptItem.receiptId = receipt.receiptId;
                    if (receiptItem.createdBy === null) //it's edit session but new item added
                    {
                        receiptItem.createdBy = userLogin;
                    }
                    if (receiptItem.changed === true)
                    {
                        receiptItem.modifiedAt = moment().toDate();
                        receiptItem.modifiedBy = userLogin;
                    }
                }); console.log('put: ', receipt)
                return dataService.put(api_receipt, receipt)
                       .then(function (response) {
                           $state.go('layout.receipts');
                       })
                       .catch(function (reason) { console.log(reason); })
            }
            else  //($scope.mode === 'add')
            {
                receipt.createdBy = userLogin;
                angular.forEach(receipt.ReceiptItems, function (receiptItem) {
                    receiptItem.receiptId = receipt.receiptId; // for new receipt, receiptId is auto-generated (so here it's null! but it's just to add the property)
                    receiptItem.createdBy = userLogin;
                });
                return dataService.post(api_receipt, receipt)
                        .then(function (response) {
                            prepareNewReceipt();
                            openSearchSupplier();
                        },function (reason) { })
            }
            //var userLoginAndReceipt = {  <<<<< trying to send "userLogin" alongside with the Receipt by couldn't handle it in C#
            //    'user': $rootScope.currentUser.UserLogin,
            //    'receipt': receipt
        };

        $scope.restoreReceiptItem = function (receiptItemToRestore) {
            dataService.put(api_receiptItemRemoveRestore + '?receiptItem_rId=' + receiptItemToRestore.receiptId + '&receiptItem_iId=' + receiptItemToRestore.itemId + '&isDeleted=' + false )
                .then(function (response) {
                    $scope.receipt.ReceiptItems.push(receiptItemToRestore);
                }, function (reason) { console.log(reason); });
        };

        $scope.removeReceiptItem = function (receiptItemToRemove) {
            dataService.put(api_receiptItemRemoveRestore + '?receiptItem_rId=' + receiptItemToRemove.receiptId + '&receiptItem_iId=' + receiptItemToRemove.itemId)
                .then(function (response) {
                    var indx = $scope.receipt.ReceiptItems.indexOf(receiptItemToRemove)
                    $scope.receipt.ReceiptItems.splice(indx, 1);
                }, function (reason) { console.log(reason); });
        };

        $scope.deleteReceiptItem = function (receiptItemToDelete) {
            dataService.delete(api_receiptItemDelete + '?receiptItem_rId=' + receiptItemToDelete.receiptId + '&receiptItem_iId=' + receiptItemToDelete.itemId)
                .then(function (response) {
                    var indx = $scope.receipt.ReceiptItems.indexOf(receiptItemToDelete)
                    $scope.receipt.ReceiptItems.splice(indx, 1);
                }, function (reason) {
                    console.log(reason);
                });
        };
        /*Open Modal (for ALL ACTIONS: |Add, Update, Del)
             @modalMode: addMode | editMode
             @initialData: object
         */
        $scope.openModalItem = function (modalMode, itemId, modalSize) {
            var initialData = $filter('filter')($scope.items, function (item) { return item.itemId === itemId; })[0];
            var initialDataCopy = angular.copy(initialData);  // isolate the dialog change from the list

            var openModal = function () {
                $uibModal.open({
                    templateUrl: 'item/_itemModal.html',
                    animation: true,
                    size: modalSize,
                    controller: itemModalCntrl,
                    controllerAs: 'ctrl',
                    resolve: {
                        modalMode: function () {
                            return modalMode;
                        },
                        itemToEdit: function () {
                            return initialDataCopy;
                        }
                    }
                }).result.then(function (result) {
                    console.info('built-in Dialog call back[success]', result.obj, result.action);
                    if (modalMode === 'addMode') {
                        $scope.items.push(result.obj);
                        var itemForReceiptWithUpdateImg = angular.copy(result.obj);
                        itemForReceiptWithUpdateImg.updateImg = true;
                        $scope.itemsPerparedForReceipt.push(itemPrepareProperties(itemForReceiptWithUpdateImg));
                    }

                    if (modalMode === 'editMode') {
                        console.log('modal_obj returned: ', result.obj)

                        /* in both cases: del or update */
                        var indx = $scope.items.map(function (i) { return i.itemId }).indexOf(result.obj.itemId);
                        $scope.items.splice(indx, 1);
                        $scope.itemsPerparedForReceipt.splice(indx, 1);
                        if (result.action === 'update') {
                            $scope.items.push(result.obj);
                            $scope.itemsPerparedForReceipt.push(itemPrepareProperties(result.obj));
                        }
                    }
                }, function (reason) {
                    console.log('modal-component dismissed at: ' + new Date(), reason);
                });
            };
            $ocLazyLoad.load(['ngMessages', 'ngFileUpload', 'ngImgCrop', 'webcam', 'imgHandler', 'scripts/app/webcam.service.js'])
                        .then(function () {
                            openModal();
                        });
        };

        //Date picker
        $scope.isOpenReceiptDate = false;
        $scope.xeditableReceiptDateOnShow = function(value) {
            $scope.isOpenReceiptDate = value;
        }

        $scope.updateTotal = function () { $scope.receipt = receiptService.calcReceiptTotals($scope.receipt) };

        /*Open Modal (for ALL ACTIONS: |Add, Update, Del)
             @modalMode: addMode | editMode
             @initialData: object
         */
        $scope.supplierOpenModal = function (modalMode, modalData, modalSize) {
            //var initialData = $filter('filter')($scope.items, function (item) { return item.itemId === itemId; })[0];
            //var initialDataCopy = angular.copy(initialData);  // isolate the dialog change from the list
            var initialDataCopy = '';
            var openModal = function () {
                    $uibModal.open({
                        templateUrl: 'supplierDir/supplierModal.html',
                        animation: true,
                        size: modalSize,
                        controller: 'supplierModalCtrl',  //controllerAs: 'ctrl',
                        resolve: {
                            modalMode: function () {
                                return modalMode;
                            },
                            supplierToEdit: function () {
                                return modalData;
                            }
                        }
                    }).result.then(function (result) {
                        console.info('built-in Dialog call back[success]', result.obj, result.action);
                        if (modalMode === 'add') {
                            //send the new supplier
                            setReceiptSupplierInfo(result.obj);
                        }

                        if (modalMode === 'edit') {
                            console.log('modal_obj returned: ', result.obj);

                            /* in both cases: del or update */
                            var indx = $scope.items.map(function (i) { return i.itemId }).indexOf(result.obj.itemId);
                            $scope.items.splice(indx, 1);
                            $scope.itemsPerparedForReceipt.splice(indx, 1);
                            if (result.action === 'update') {
                                $scope.receipt.supplierName = result.obj.supplierName;
                                /*any other change will not affect the receipt*/
                            }
                        }
                    }, function (reason) {
                        console.log('modal-component dismissed at: ' + new Date(), reason);
                    });
            };
            $ocLazyLoad.load('supplierDir/supplierModalCtrl.js').then(function () {
                openModal();
            });
        };

    };


    function itemModalCntrl($scope, $rootScope, modalMode, itemToEdit, $uibModalInstance, dataService, msgConfirm, debugMode) {
        var debugThis = true;
        var ctrl = this;
        var api_item_httpActions = "/api/item/";
        var api_item_remove_restore = "/api/item/remove_restore";
        var user = $rootScope.currentUser.UserLogin;
        ctrl.msgConfirmCancel = msgConfirm.msgConfirmCancel;
        ctrl.msgConfirmRemove = msgConfirm.msgConfirmRemove;
        ctrl.msgConfirmDelete = msgConfirm.msgConfirmDelete;

        ctrl.modalMode = modalMode;

        if (ctrl.modalMode === 'editMode') {
            ctrl.itemSelected = itemToEdit;
        } else {
            ctrl.itemSelected = {};
        }

        ctrl.itemSelected.imgIsChanged = false;

        //dataService.get(api_item_httpActions + 'GetNationalities').then(function (result) { ctrl.nationalities = result.data; });

        ctrl.imgHandlerApi = null;

        //Close Item Modal
        ctrl.closeModal = function (result) {
            $uibModalInstance.close(result);
        }

        ctrl.cancelModal = function (reason) {
            $uibModalInstance.dismiss(reason);
        }

        ctrl.addItem = function (itemJSON) {
            itemJSON.createdBy = user;
            dataService.post(api_item_httpActions, itemJSON, 'إسم الصنف موجود سابقاً').then(function (result) {
                /*store the returned obj that has the server-side stamped data "itemId" (but not that in the form "itemToUpdate")*/
                ctrl.closeModal({ 'obj': result.data, 'action': 'add' }); //push data to the view
                saveItemImg(itemJSON.imgIsChanged, result.data.itemId);
            }, function (reason) { debugMode && debugThis && console.log(reason, "Error, recieptCtrl/addItem/Post.") });
        }

        // SAVE changes
        ctrl.saveItem = function (itemToUpdate) {
            itemToUpdate.modifiedBy = user;
            dataService.put(api_item_httpActions, itemToUpdate)
                .then(function (response) {
                    console.log(response);
                    /*
                    * store the returned obj that has the server-side stamped data "createdAt" (but not that in the form "itemToUpdate")
                    */
                    ctrl.closeModal({ 'obj': response.data, 'action': 'update' }); //SPLICE then PUSH the record from the view
                }, function (reason) { debugMode && debugThis && console.log(reason); });
            saveItemImg(itemToUpdate.imgIsChanged, itemToUpdate.itemId);
        }

        // Restore Item
        ctrl.restoreItem = function (itemToRestore) {
            dataService.put(api_item_remove_restore + '?itemId=' + itemToRestore.itemId + "&isDeleted=" + false)
                .then(function (response) {
                    ctrl.closeModal({ 'obj': response.data, 'action': 'add' }); //push data to the view
                }, function (reason) { debugMode && debugThis && console.log(reason); });
        }

        // Remove Item
        ctrl.removeItem = function (itemToRemove) {
            dataService.put(api_item_remove_restore + '?itemId=' + itemToRemove.itemId)
                .then(function () {
                    ctrl.closeModal({ 'obj': itemToRemove, 'action': 'remove' }); //splice the record from the view
                }, function (reason) { debugMode && debugThis && console.log(reason); });
        }
        // Delete Item
        ctrl.deleteItem = function (itemToDelete) {
            dataService.delete(api_item_httpActions + '?itemIdToDelete=' + itemToDelete.itemId)
                .then(function () {
                    ctrl.closeModal({ 'obj': itemToDelete, 'action': 'remove' }); //splice the record from the view
                }, function (reason) { debugMode && debugThis && console.log(reason); });
        }

        /* Save the img*/
        function saveItemImg(imgIsChanged, itemId) {
            if (imgIsChanged === true) {
                console.log('ssssssssave img', imgIsChanged,itemId)
                //CALL API TO UPLOAD THE IMG (PROVIDE api URL)
                ctrl.imgHandlerApi.uploadImg({url: '/api/file?subDirectory=items', imgName: itemId + '.png'});
            }
        }
    }
})();
