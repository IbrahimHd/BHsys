/// <reference path="security.js" />

(function () {
    'use strict';
    angular
        .module('app')
        .factory('authService', authService);
    authService.$inject = ['$http', '$rootScope', '$window', 'securityManager', 'toaster', 'dataService', 'debugMode'];
    function authService($http, $rootScope, $window, securityManager, toaster, dataService, debugMode) {
        var debugThis = false;
        var api_auth = "api/Home/";
        var authService = {};

	    //the login function
        authService.login = function (userCredentials, success, error) {
            if (!authService.isAuthenticated()) {
                var msg = { successMsg: 'تم تعديل بيانات المستخدم بنجاح.', errorMsg: 'حصل خطأ في تعديل بيانات المستخدم.' }
                //for the initial http request, get credentials from the Login View
                $rootScope.currentUser = {};
                $rootScope.currentUser.UserLogin = userCredentials.userLogin;
                $rootScope.currentUser.UserPassword = userCredentials.password;
                console.log($rootScope.currentUser);
                //Authentication is being implemented at server-side by the http request via (Token)
                dataService.get(api_auth + 'GetUserAccount?user=' + userCredentials.userLogin, true, 'إسم المستخدم أو كلمة المرور غير صحيحة!')
                    .then(function (response) {
                        $rootScope.currentUser = response.data; //grap the FULL user account info (e.g: preferences)
                        $rootScope.currentUser.UserPassword = userCredentials.password; //(as password is not being sent via http)

                        $window.sessionStorage["userInfo"] = JSON.stringify($rootScope.currentUser);

                        dataService.put(api_auth + 'PutLogin?userLogin=' + $rootScope.currentUser.UserLogin + '&dateTime=' + $rootScope.now, null, msg);

                        //run success function
                        success($rootScope.currentUser);
                        toaster.pop({ type: 'success', title: 'تم الدخول بنجاح', body: 'Welcome ' + $rootScope.currentUser.UserName + '!', toasterId: 2 });
                        /* clear msgs of any previous unsuccessful attempts*/
                        //toaster.clear(toasterId, toastInstance.toastId); //toasterId (* -> all containers)
                        toaster.clear(1, null);
                    }, function (response) {
                        //notification for the user done at dataService
                        error(response);
                        debugMode && debugThis && console.log($rootScope.currentUser);
                        /* remove the stored token key in order to create new one for the correct passoword*/
                        sessionHandler();
                    });
            }
        };

	    //check if the user is authenticated
	    authService.isAuthenticated = function() {
	        var data =$window.sessionStorage.userInfo ? JSON.parse($window.sessionStorage.userInfo) : null;
            return data ? !!data.UserRole : false;
	    };
	
	    //check if the user is authorized to access the next route
	    //this function can be also used on element level
	    //e.g. <p ng-if="isAuthorized(authorizedRoles)">show this only to admins</p>
	    authService.isAuthorized = function(authorizedRoles) {
		    if (!angular.isArray(authorizedRoles)) {
	          authorizedRoles = [authorizedRoles];  
		    }

		    var data = $window.sessionStorage.userInfo ? JSON.parse($window.sessionStorage.userInfo) : null;

	        return (authService.isAuthenticated() &&
	          authorizedRoles.indexOf(data.UserRole) !== -1);
	    };
	    
	    function sessionHandler() {
	        /* remove the stored (key) from the session*/
	        $window.sessionStorage.removeItem('sessionAuth');
	        $window.sessionStorage.removeItem("userInfo");
	        $rootScope.currentUser = undefined;
	        securityManager.clear();
	    }
	    //log out the user and broadcast the logoutSuccess event
	    authService.logout = function (userLogin) {
            /* try to log the user logout action */
		    dataService.put(api_auth + 'PutLogOut?userLogin=' + userLogin + '&dateTime=' + $rootScope.now);
		    sessionHandler();
		    debugMode && debugThis && console.log("user has been logged out");
            /* >> redirect to Login handled in the routhing state */
	    }

	    return authService;
    };
})();