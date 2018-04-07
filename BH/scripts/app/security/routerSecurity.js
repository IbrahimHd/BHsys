/// <reference path="../../libs/angular/angular.min.js" />

(function () {
    'use strict';
    angular
    .module('app')
    .run(['$transitions','$trace', function ($transitions, $trace) {
        //$trace.enable('TRANSITION', "RESOLVE"); //"RESOLVE", "HOOK", "INVOKE", "UIVIEW", "VIEWCONFIG"
        $transitions.onError({}, trans => {
            console.warn('WARNING: ui-router transition "onError" has been invoked.', 'file: routerSecurity.js');
            /* stopping "redirect" for now as onError is invoked even when checking user previllages.*/
            //return trans.router.stateService.target('login', null, { reload: true });
        });
    }])
    .run(['$transitions', '$rootScope', '$location', 'authService', 'authNotifyService', 'toaster', 'debugMode', function ($transitions, $rootScope, $location, authService, authNotifyService, toaster, debugMode) {
        var debugThis = true;
        function stopOrRedirect(trans) {
            /*check whether the transition has to be canceled or diverted to some where (original-source url/state)*/
            if (trans.from().name === '')
                return trans.router.stateService.target('layout.landing', null, { reload: true });
            else
                return false; //stop where you are.
        }

        $transitions.onStart({/* to:'protected.**' */ }, function (trans) {
            /*
            trans.params() reads the params from the state definition (which is not always the case, e.g. viz)
            alternatively, $location.search() is used instead.
            */
            $rootScope.redirectPath = $location.path();
            $rootScope.redirectSearchQuery = $location.search();
            let nextState = trans.to();
            let nextParams = trans.params();
            //var auth = trans.injector().get('authService');
            console.log(nextState.name, 'authService.isAuthenticated() ', authService.isAuthenticated());
            if (nextState.name === 'login' && authService.isAuthenticated()) {
                debugMode && debugThis && console.log('ALREADY LOGGED IN!');
                toaster.pop({
                    type: 'info',
                    title: 'تم الدخول سابقاً',
                    body: 'لقد تم الدخول سابقاً. إن كنت تريد الدخول بإسم مستخدم آخر, قم بالخروج ثم قم بالدخول بإسم المستخدم الذي تريد.',
                    toasterId: 2
                });
                return stopOrRedirect(trans);
                //return false;
            }
            if (angular.isUndefined(nextState.access)) {
                //throw "authorization is not set on this state.";
                console.warn("WARNING: authorization is not set on this state: ", nextState.name);
            } else {
                if (authService.isAuthenticated()) {
                   var authorizedRoles = nextState.access.authorizedRoles;
                   $rootScope.authorizedRoles = authorizedRoles;
                   console.log('authService.isAuthorized(authorizedRoles)', authService.isAuthorized(authorizedRoles));
                   if (authService.isAuthorized(authorizedRoles)) {
                       console.warn("OK =============> Authorized");
                   }
                   else {
                       /* Abort transition */ //trans.redirectedFrom();
                       authNotifyService.notify('customized notification message goes here!');
                       authNotifyService.notify().notAuthorized();
                       return stopOrRedirect(trans);
                    }
                }
                else {
                    // User isn't authenticated. Redirect to login
                    authNotifyService.notify().notAuthenticated();
                    return trans.router.stateService.target('login', null, { reload: true });
                }
            }
        });
    }]);
})();