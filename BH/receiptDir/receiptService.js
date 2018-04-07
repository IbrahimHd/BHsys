(function () {
    'use strict';

    angular
        .module('app')
        .service('receiptService', receiptService);

    receiptService.$inject = ['$filter', 'formulas', 'debugMode'];

    function receiptService($filter, formulas, debugMode) {
        var debugThis = false;
        var selft = this;

        selft.calcReceiptTotals = function (receipt) {
            var sum = 0;
            angular.forEach(receipt.ReceiptItems, function (receiptItem) {
                receipt.ReceiptItems[receipt.ReceiptItems.indexOf(receiptItem)].total = $filter('number')(eval(formulas.receiptItemTotalCost));
                sum += eval(formulas.receiptItemTotalCost);
            });
            receipt.total = $filter('number')(sum);;
            return receipt;
        }
    };
})();