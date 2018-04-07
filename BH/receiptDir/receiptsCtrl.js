/// <reference path="../scripts/libs/angular/angular.min.js" />

(function () {
    'use strict';
angular
    .module("app")
    .controller("receiptsCtrl", receiptsCtrl);
receiptsCtrl.$inject = ['$scope', '$rootScope', '$state', '$filter', '$timeout', 'dataService', 'dateRangePickerPresetService', 'msgConfirm', 'debugMode'];

function receiptsCtrl($scope, $rootScope, $state, $filter, $timeout, dataService, dateRangePickerPresetService, msgConfirm, debugMode) {
        var debugThis = true;
        var api_receipts = "/api/receipt/";
        var api_receiptsRemovedList = "/api/receipt/removedList";
        var api_receiptRemoveRestore = "/api/receipt/remove_restore";
        var api_receiptDelete = "/api/receipt/";
        $scope.isBottomSlideOpen = false;
        $scope.toggleBottomSlide = function (value) {
            $scope.isBottomSlideOpen = !value;
        }
        //..................Date Range Picker.............................
        $scope.dateRangePreset = dateRangePickerPresetService.dateRangePreset();
        var rangeDefault = $filter('filter')($scope.dateRangePreset, function (range) { return range.id === $rootScope.companyInfo.receiptListDefaultDateRange; })[0];
        $scope.dateRangeStart = rangeDefault.start;
        $scope.dateRangeEnd = rangeDefault.end;

        //Used for trNgGrid (server-side Pagination, Filtering, & Sorting)
        $scope.isLoading = false;
        $scope.receipts = [];
        $scope.recordCount = 0;
        $scope.currentPage = 1;
        $scope.pageFrom = 1;
        $scope.pageItems = 5;
        $scope.filterBy = null;
        $scope.filterByFields = null;
        $scope.orderBy = null;
        $scope.orderByReverse = null;
        $scope.mySelectedItems = [];
        $scope.ngGridFields = ['receiptId', 'receiptDate', 'supplierName','itemsCount','TotalCost'];

        $scope.trNgGridGetServerSideItems = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
            $scope.isLoading = true;
            $scope.currentPage = currentPage;
            $scope.pageItems = pageItems;
            $scope.filterBy = filterBy;
            $scope.filterByFields = filterByFields;
            $scope.filterByFieldsJSON = $filter('json')(filterByFields);
            $scope.orderBy = orderBy;
            $scope.orderByReverse = orderByReverse;

            var dFrom = $scope.dateRangeStart.format('YYYY-MM-DD HH:mm:ss');
            var dTo = $scope.dateRangeEnd.format('YYYY-MM-DD HH:mm:ss');
            var filterByConstructor = function (fieldsObject, andOr) {
                var andOrOperator = ' ' + andOr + ' '
                var s = "";
                if (filterBy) {
                    angular.forEach($scope.ngGridFields, function (field, key) { // loop through all available fields of the Grid
                        //s = s.concat('Convert.ToString(' + field + ').Contains(\"' + filterBy + '\")');
                        //s = s.concat('outerIt.' + field + '.Contains(\"' + filterBy + '\")'); {{{{http://stackoverflow.com/questions/43272152/generate-dynamic-linq-query-using-outerit}}}}
                        s = s.concat(field + '.Contains(\"' + filterBy + '\")');
                        s = s.concat(key < $scope.ngGridFields.length - 1 ? andOrOperator : '');
                    });
                    return s; //'outerIt(receiptId).Contains("2")';
                } else {
                    return true; // True is for All records
                }
            };
            var filterByFieldsConstructor = function (fieldsObject, andOr) {
                var andOrOperator = ' ' + andOr + ' '
                var s = "", count = 0;
                if (Object.keys(fieldsObject).length > 0) {
                    for (var fieldName in fieldsObject) {
                        if (fieldsObject.hasOwnProperty(fieldName)) {
                            ++count;
                          //s = s.concat(fieldName + '=="' + fieldsObject[fieldName] + '"');
                            s = s.concat(fieldName + '.Contains(\"' + fieldsObject[fieldName] + '\")');
                            s = s.concat(count < Object.keys(fieldsObject).length ? andOrOperator : '');
                        };
                    };
                    return s;
                } else {
                    return true; // True is for All records
                };
            };
            debugMode && debugThis && console.log('filterBy Argument:', filterByConstructor(filterBy, 'OR'));

            debugMode && debugThis && console.log('filterByFields Argument:', filterByFieldsConstructor(filterByFields, 'AND'));

            dataService.get(api_receipts + 'GetPagedFilteredReceipts' + '?filterBy=' + filterByConstructor(filterBy, 'OR') + '&filterByFields=' + filterByFieldsConstructor(filterByFields, 'AND') + '&orderBy=' + orderBy + (orderByReverse ? '' : ' desc') + '&dFrom=' + dFrom + '&dTo=' + dTo + '&pageSize=' + pageItems + '&pageFrom=' + (currentPage + 1))
                .then(function (response) {
                    $scope.receipts = response.data.records;
                    $scope.recordCount = response.data.recordCount;
                    $scope.pageFrom = response.data.pageFrom;
                    $scope.isLoading = false;
                },
                function (reason) {
                    debugMode && debugThis && console.log('Error, GetPagedFilteredReceipts: ', reason);
                    $scope.isLoading = false;
                });
        };

        $scope.datetimeRangeChanged = function () {
            $scope.trNgGridGetServerSideItems($scope.currentPage, $scope.pageItems, $scope.filterBy, $scope.filterByFields, $scope.orderBy, $scope.orderByReverse)
        };

        /*Restore the Receipt*/
        $scope.restoreReceipt = function (receiptToRestore) {
            dataService.put(api_receiptRemoveRestore + '?receiptId=' + receiptToRestore.receiptId + '&isDeleted='+false)
                .then(function (response) {
                    var indx = $scope.receiptsRemovedList.indexOf(receiptToRestore);
                    $scope.receiptsRemovedList.splice(indx, 1);
                    $scope.receipts.push(receiptToRestore);
                }, function (reason) { console.log(reason); });
        };

        // Remove Receipt
        $scope.msgConfirmRemove = msgConfirm.msgConfirmRemove;

        $scope.removeReceipt = function (receiptToRemove) {
            dataService.put(api_receiptRemoveRestore + '?receiptId=' + receiptToRemove.receiptId)
                .then(function (response) {
                    var indx = $scope.receipts.indexOf(receiptToRemove);
                    $scope.receipts.splice(indx, 1);
                }, function (reason) { console.log(reason); });
        };

        // Delete Receipt
        $scope.msgConfirmDelete = msgConfirm.msgConfirmDelete;

        $scope.deleteReceipt = function (receiptToDelete) {
            dataService.delete(api_receiptDelete + '?receiptIdToDelete=' + receiptToDelete.receiptId)
                .then(function (response) {
                    var indx = $scope.receipts.indexOf(receiptToDelete)
                    $scope.receipts.splice(indx, 1);
                }, function (reason) { console.log(reason); });
        };

        //$scope.$watch("pageSize", function (newVal) { if (newVal) { $scope.pageChangeHandler($scope.pageFrom) }; }, true);

    /*LOAD REMOVED RECEIPTS FOR RESTORE*/
        $scope.isLoading_receiptRemovedList = false;

        $scope.loadReceiptsRemovedList = function () {
            $scope.isLoading_receiptRemovedList = true;
            dataService.get(api_receiptsRemovedList + '')
                .then(function (response) {
                    angular.forEach(response.data, function (receipt) {
                        receipt.receiptDate = $filter('date')(receipt.receiptDate, "yyyy-MM-dd");
                    });
                    $scope.receiptsRemovedList = response.data;
                    $scope.isLoading_receiptRemovedList = false;
                },
                function (reason) {
                    debugMode && debugThis && console.log('Error, ReceiptsRemoved list: ', reason);
                    $scope.isLoading_receiptRemovedList = false;
                });
        }

        $timeout(function () {
            var tbody = angular.element(document.querySelector('.tableWithScroll tbody'));
            tbody.addClass('scroll-custom');
        }, 500);
};
})();
