/// <reference path="../scripts/libs/angular/angular.min.js" />
/// <reference path="../scripts/libs/toaster/toaster.js" />

(function () {
    'use strict';
    function loginCtrl($rootScope, $window, $state, $location, $timeout, authService, companyInfoService, toaster) {
        var ctrl = this;
        let state, params, options;
        //ctrl.goBackTo = {};
        //capture the router-resolved functions (not available at initialization time)
        //ctrl.$onInit = function () {
        //    state = ctrl.returnTo.state();
        //    params = ctrl.returnTo.params();
        //    options = Object.assign({}, ctrl.returnTo.options(), { reload: true });
        //};
        ctrl.$onInit = function () {
            ctrl.goBackTo = angular.copy(ctrl.returnTo);
            console.log(ctrl.goBackTo);
        };
        /* component hook as a solution for not ready bindings */
        ctrl.$onChanges = function (changes) {
            if (changes.returnTo) {
                ctrl.goBackTo = angular.copy(ctrl.returnTo);
            }
        };
        // Use es6 destructuring to extract exactly what we need
        //ctrl.$onChanges = function ({returnTo}) {
        //    if (angular.isDefined(returnTo)) {
        //        state = ctrl.returnTo.state();
        //        params = ctrl.returnTo.params();
        //        options = Object.assign({}, ctrl.returnTo.options(), { reload: true });
        //        console.log('onchange',state);
        //    }
        //};

        //Performs the login function, by sending a request to the server with the authService
        function login(credentials) {
            ctrl.loading = true;
            authService.login(
                credentials,
                function successCallback (user) {
                    ctrl.loading = false;
                    //ctrl.$onInit = function () {
                    if (ctrl.goBackTo) {
                        /*
                        trans.params(), which is sent by ui-router config, reads the params from the state definition (which 
                        is not always the case, e.g. viz) alternatively, $location.search() is used instead.
                        */
                        state = ctrl.goBackTo.state();
                        params = ctrl.goBackTo.params();
                        options = Object.assign({}, ctrl.goBackTo.options(), { location: true, inherit: true, relative: $state.$current, notify: true, reload: true });
                        console.log(state, params, options);
                        //$state.go(state.name, params, options);
                        //$timeout(function () {
                            $rootScope.redirectSearchQuery ? $location.path($rootScope.redirectPath).search($rootScope.redirectSearchQuery)
                                                           : $state.go(state.name);
                            
                        //});
                    } else {
                        //$timeout(function () {
                            $state.go('layout.landing');
                        //});
                    }

                    companyInfoService.grab(); //needed here as well for the first time
                    console.log('LoginCtrl:RootScope:', $rootScope.currentUser.UserLogin);
                },
                function failureCallback (err) {
                    console.error("authService.login throw error ", err.status, err.statusText, err.data.Message);
                    ctrl.loading = false;
                }
            );
        }
        ctrl.credentials = {};
        ctrl.login = login;

        //if (ctrl.loginForm.$valid) 

        //// if a session exists for current user (page was refreshed)
	    //// log him in again
	    //if ($window.sessionStorage["userInfo"]) {
	    //    console.log('session already AVAILABLE');
		//    //var sessionCredentials = JSON.parse($window.sessionStorage["userInfo"]);
		//    //ctrl.login(sessionCredentials);
	    //}

	    var containerElement = angular.element(document.querySelectorAll(".container"));

	    ctrl.toggle = function () {
	        containerElement.addClass('active');
	    };

	    ctrl.close = function () {
	        containerElement.removeClass('active');
	    };
        };
    var loginCtrlInjection = ['$rootScope', '$window', '$state', '$location', '$timeout', 'authService', 'companyInfoService', 'toaster', loginCtrl]
    //loginCtrl.$inject = ['$rootScope', '$window', 'authService', '$state', '$location', 'trans', 'returnTo', 'companyInfoService', 'toaster'];

    angular
        .module ('app')
        .component("loginCpt",
         {
             bindings: {
                 test: '<',
                 trans: '<',
                 returnTo: '<'
             },
             controller: loginCtrlInjection,
             controllerAs: '$ctrl',
             templateUrl: 'loginDir/login.html',
         }
        );
})();