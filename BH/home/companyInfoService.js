(function () {
    'use strict';

    angular
        .module('app')
        .service('companyInfoService', companyInfoService);

    companyInfoService.$inject = ['$rootScope', '$window', 'dataService', 'debugMode'];

    function companyInfoService($rootScope, $window, dataService, debugMode) {
        var debugThis = false;
        var api_companyInfo = 'api/company/';
        var selft = this;
        this.grab = grab;

        function loadCompanyInfo() {
            dataService.get(api_companyInfo + '')
                .then(function (response) {
                    $rootScope.companyInfo = response.data;
                    $window.sessionStorage.setItem('companyInfo', JSON.stringify($rootScope.companyInfo));
                },
                function (reason) {
                    debugMode && debugThis && console.log('Error, companyInfo: ', reason);
                });
        }

        function grab() {
            if ($window.sessionStorage.getItem('companyInfo')) {
                debugMode && debugThis && console.log('COMPANY INFO ALREADY EXIST')
                $rootScope.companyInfo = JSON.parse($window.sessionStorage.getItem('companyInfo'));
            } else {
                debugMode && debugThis && console.log('NO COMPANY INFO, trying to grab it from the server...')
                loadCompanyInfo();
            }
        }
    }
})();