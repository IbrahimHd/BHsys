
(function(){
    'use strict';
    angular.module('app')

    /*{{data|sumByKey:'key'}}*/
    .filter('sumByKey', function () {
        return function (data, key) {
            if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
                return 0;
            }

            var sum = 0;
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i][key]) {
                    sum += parseInt(data[i][key]);
                }
            }

            return sum;
        };
    })
    /*{{data|sumByKey:'key'}}*/
    .filter('sumByKeyDecimal', function () {
        return function (data, key) {
            if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
                return 0;
            }

            var sum = 0;
            angular.forEach(data, function (obj, objKey) {
                if (obj[key]) {
                    sum += parseFloat(obj[key]);
                }
            });

            return sum;
        };
    })
     /* {{data | totalSumPriceQty:'quantity':'price'}} */
    .filter('totalSumPriceQty', function () {
        return function (data, key1, key2) {
            if (angular.isUndefined(data) || angular.isUndefined(key1) || angular.isUndefined(key2))
                return 0;
            var sum = 0;
            angular.forEach(data, function (value) {
                sum = sum + (parseInt(value[key1]) * parseInt(value[key2]));
            });
            return sum;
        }
    })

    .filter('amountReceiptItem', amountReceiptItem)
    amountReceiptItem.$inject = ['$filter', 'formulas'];
    function amountReceiptItem($filter, formulas) {
        function doCalc(receiptItem) {
            return eval(formulas.receiptItemTotalCost);
        }

        return function (data) {
            if (angular.isUndefined(data))
                return 0;
            var sum = 0;
            if (Object.prototype.toString.call(data) === '[object Array]') {
                angular.forEach(data, function (receiptItem) {
                    sum += doCalc(receiptItem);
                });
            }
            else {
                sum = doCalc(data);
            }
                
            return $filter('number')(sum);
        }
    };
})();