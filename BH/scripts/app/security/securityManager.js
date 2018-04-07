/// <reference path="../../libs/angular/angular.min.js" />
/// <reference path="security.js" />

/* Token-based authentication for ASP .NET MVC REST web services.
   Copyright (c) 2015 Kory Becker
   http://primaryobjects.com/kory-becker
   License MIT
*/
(function () {
    'use strict';
    angular
        .module('app')
        .factory('securityManager', securityManager);
    securityManager.$inject = ['$http','$q', '$window', 'debugMode'];
    function securityManager($http, $q, $window, debugMode) {
            var debugThis = false;
            var api_ipAddress = "api/Ip/";

            if ($window.sessionStorage["userInfo"]) {
                var sessionUser = JSON.parse($window.sessionStorage["userInfo"]);
            };

            var sessionAuth = {};
            if ($window.sessionStorage.getItem('sessionAuth')) {
                sessionAuth = JSON.parse($window.sessionStorage.getItem('sessionAuth'));
            };

            var SecurityManager = {
                salt: 'rz8LuOtFBXphj9WQfvFh',
                username:sessionUser ? sessionUser.UserLogin : '',
                key: sessionAuth.key || null,
                ip: sessionAuth.ip || null,

                generate: function (username, password) {
                    // Generates a token to be used for API calls. The first time during authentication, pass in a username/password. All subsequent calls can simply omit username and password, as the same token key (hashed password) will be used.
                    if (username && password) {
                        debugMode && debugThis && console.log('SecurityManager: username/password provided>', username, password);
                        // If the user is providing credentials, then create a new key.
                        //SecurityManager.logout();
                        SecurityManager.clear();
                    }

                    // Set the username.
                    SecurityManager.username = SecurityManager.username || username;
                    debugMode && debugThis && console.log('SecurityManager.username:', SecurityManager.username);
                    // Set the key to a hash of the user's password + salt.

                    debugMode && debugThis && console.log('existing key:', SecurityManager.key);
                    SecurityManager.key = SecurityManager.key || CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256([password, SecurityManager.salt].join(':'), SecurityManager.salt));

                    debugMode && debugThis && console.log("created key: ", SecurityManager.key);
                    // Set the client IP address.
                    var deferred = $q.defer();
                    if (SecurityManager.ip) {
                        debugMode && debugThis && console.warn('"IP addr", it is already stored');
                        var token = getToken(SecurityManager.ip); //filling "IP addr", it's already stored
                        deferred.resolve(token);
                    } else {
                        debugMode && debugThis && console.warn('"IP addr", NOT stored');
                        $http.get(api_ipAddress + 'GetIp')
                            .then(function (response) {
                                var token = getToken(response.data); //injecting "IP addr"
                                    return deferred.resolve(token);
                            }, function (error) {
                                //toaster.displayError('Data cannot be loaded.', 'Sorry');
                                console.log('>> IP cannot be gotten << ', error);
                                return deferred.reject('>>Promise: IP cannot be gotten << ');
                            });
                    }
                    return deferred.promise;

                    function getToken(ip) {
                        SecurityManager.ip = ip;
                        debugMode && debugThis && console.log('SecurityManager.ip: ' + SecurityManager.ip);
                        debugMode && debugThis && console.log('username inside getToken: ' + SecurityManager.username);
                        // Persist key pieces.
                        if (SecurityManager.username) {
                            sessionAuth.key = SecurityManager.key;
                            sessionAuth.ip = SecurityManager.ip;
                            $window.sessionStorage.setItem('sessionAuth', JSON.stringify(sessionAuth));
                        }

                        // Get the (C# compatible) ticks to use as a timestamp. http://stackoverflow.com/a/7968483/2596404
                        var ticks = ((new Date().getTime() * 10000) + 621355968000000000);
                        debugMode && debugThis && console.log("Client ticks: " + ticks);
                        // Construct the hash body by concatenating the username, ip, and userAgent.
                        var message = [SecurityManager.username, SecurityManager.ip, navigator.userAgent.replace(/ \.NET.+;/, ''), ticks].join(':');
                        debugMode && debugThis && console.log('Token message>', message);

                        // Hash the body, using the key.
                        var hash = CryptoJS.HmacSHA256(message, SecurityManager.key);

                        // Base64-encode the hash to get the resulting token.
                        var token = CryptoJS.enc.Base64.stringify(hash);

                        // Include the username and timestamp on the end of the token, so the server can validate.
                        var tokenId = [SecurityManager.username, ticks].join(':');

                        // Base64-encode the final resulting token.
                        var tokenStr = CryptoJS.enc.Utf8.parse([token, tokenId].join(':'));

                        debugMode && debugThis && console.log("Client token: " + CryptoJS.enc.Base64.stringify(tokenStr));
                        return CryptoJS.enc.Base64.stringify(tokenStr);
                    }

                },
                clear: function () {
                    SecurityManager.username = null;
                    SecurityManager.key = null;
                    SecurityManager.ip = null;
                }
            };
        return SecurityManager;
    };
})();