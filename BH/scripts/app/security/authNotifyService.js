(function () {
    'use strict';
    angular
        .module('app')
        .service('authNotifyService', authNotifyService);
    authNotifyService.$inject = ['$rootScope', 'toaster', 'debugMode'];

    function authNotifyService($rootScope, toaster, debugMode) {
        var debugThis = true;
        var self = this;
        self.notify = notify;

        function notify() {
            arguments.length > 0 && console.log('autNotify:', arguments.length, arguments[0]);
            return {
                'notAuthenticated' : notAuthenticated,
                'notAuthorized' : notAuthorized
            }

            //this.notAuthenticated = notAuthenticated;
            //this.notAuthorized = notAuthorized;

            function notAuthenticated() {
                debugMode && debugThis && console.warn("=============> notAuthenticated, redirect to Login.");
                toaster.warning({
                    title: 'Not Authenticated',
                    body: 'Sorry, you have to log in first.',
                    size: 'sm',
                    toasterId: 2
                });
            }

            function notAuthorized() {
                debugMode && debugThis && console.warn('>>>===== NOT Authorized');
                toaster.error({
                    title: 'Not Authorized',
                    body: 'Sorry, the user account you logged in with is not authorized to see that information. Log in with a different user account or contact the focal point of the system.',
                    size: 'sm',
                    toasterId: 2
                });
            }
        }

    }
})();