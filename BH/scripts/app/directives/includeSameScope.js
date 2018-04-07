(function(){
    'use strict';
    angular.module('app')
    .directive('includeSameScope', includeSameScope);
    function includeSameScope() {
        return {
            restrict: 'AE',
            templateUrl: function (ele, attrs) {
                return attrs.includeSameScope;
            }
        };
    };
})();