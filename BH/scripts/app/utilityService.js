(function () {
    'use strict';

    angular
        .module('app')
        .service('utilityService', utilityService);

    utilityService.$inject = ['$window', 'debugMode'];

    function utilityService($window, debugMode) {
        var debugThis = false;
        var selft = this;

        this.goBack = function () { return $window.history.back(); };

    };
})();