(function () {
    'use strict';

    angular
        .module('app')
        .service('supplierService', supplierService);

    supplierService.$inject = ['dataService', 'debugMode'];

    function supplierService(dataService, debugMode) {
        var debugThis = false;
        var self = this;
        var api_supplier = "/api/supplier/";

        self.searchByName = function (text) {
            return dataService.get(api_supplier + 'findSupplier' + '?idOrName=' + escape(text))
                              .then(function (response) {
                                  debugThis && debugMode && console.log('Suppliers, search result: ', response.data);
                                  return response.data;
                              }, function (reason) {
                                  return [];
                                  debugMode && debugThis && console.log(reason, "Error, supplierService.")
                              }
                                );
        }
    };
})();