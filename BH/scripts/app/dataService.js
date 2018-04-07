/// <reference path="../libs/angular/angular.min.js" />
/// <reference path="../libs/toaster/toaster.js" />
(function (angular) {
    'use strict';

    angular
        .module('app')
        .service('dataService', dataService);

    dataService.$inject = ['$http', '$state', 'toaster', '$rootScope', '$q', 'securityManager', '$injector', 'debugMode'];

    function dataService($http, $state, toaster, $rootScope, $q, securityManager, $injector, debugMode) {
        var debugThis = false;
        var self = this;
         self.get = get;
         self.post = post;
         self.put = put;

         function removeInvalidChar(errMsg) {
             if (errMsg) errMsg = errMsg.replace(/[\']/g, '-').replace(/[\"]/g, '-');
                //errMsg = errMsg.replace(/[\"]/g, '-');
             return errMsg || '';
         }

         function errorHandler(error, status, errMsgCustom) {
             console.log(error,status,errMsgCustom);
             var errMsg = (angular.isDefined(errMsgCustom) && (errMsgCustom.length > 0)) ? errMsgCustom : 'لم يتم إضافة/تعديل السجل الجديد!';
             if (status == 406) {//406:"Not Acceptable"
                errMsg = (angular.isDefined(errMsgCustom) && (errMsgCustom.length > 0)) ? errMsgCustom : 'الإسم موجود سابقاً';
                toaster.warning({ title: 'تكرار!', body: errMsg, toasterId: 2 });
             }
             else if (status == 401 || status == 404) {   // 401, 404: Unauthorized. Authorization has been denied for this request.
                 if (sessionStorage["userInfo"]) {// LogOut only if it's logged in but not if log in failed at initial attempt.
                     $state.go('logout');
                 }
                 var bdy = "{template: 'toasterTpl.html', data: {message:'" + errMsg + "', details:'" + removeInvalidChar(error.Message) + '\n'+ removeInvalidChar(error.MessageDetail) + "'}}";
                 toaster.error({ title: 'حدث خطأ', body: bdy, bodyOutputType: 'templateWithData', tapToDismiss: false, toasterId: 1 });
             }
             else {
                 var bdy = "{template: 'toasterTpl.html', data: {message:'" + errMsg + "', details:'" + removeInvalidChar(error.Message) + '\n'+ removeInvalidChar(error.MessageDetail) + '\n' + removeInvalidChar(error.ExceptionMessage || '') + "'}}";
                 toaster.error({ title: 'حدث خطأ', body: bdy, bodyOutputType: 'templateWithData', tapToDismiss: false, toasterId: 1 });
             }
         }

        /* ignore a particular $http GET: */
         //$http.get('/status', {
         //    ignoreLoadingBar: true
         //});

         function get(url, notifyPopup, errMsgCustom) {
            debugMode && debugThis && console.log(url);
            debugMode && debugThis && console.log(notifyPopup);
            var deferred = $q.defer();
            var notify = false;
            if (notifyPopup) { notify = true;};

            url_token(url).then(
                function (urlQueryToken) {
                    console.log(urlQueryToken);
                           //$http.get(urlQueryToken).success(function (data) { console.log(data); });
                                //.then(function (response) {
                                //    notify && toaster.success('Loaded successfully.', 'Data Records');
                                //}
                                //, function (error) {
                                //    notify && toaster.error('Data cannot be loaded.', 'Sorry');
                    //});
                    function successCallback(response) {
                        //(response.data, response.status, response.headers, response.config, response.statusText
                    }
                    function failierCallback(response) {
                        errorHandler(response.data, response.status, errMsgCustom);
                    }
                    var getHttpAction = $http.get(urlQueryToken);
                    getHttpAction.then(successCallback, failierCallback);
                    return deferred.resolve(getHttpAction);
                }, function (err) {
                    return deferred.reject('>>$http.get: error in url_token fn << ');
                }
            );
            return deferred.promise;
        };

         function post(url, data, errMsgCustom) {
             var deferred = $q.defer();
             url_token(url).then(
                function (urlQueryToken) {
                    var req = $http({
                        traditional: true,
                        url: urlQueryToken,
                        method: 'POST',
                        data: data,
                        dataType: "JSON"
                    })
                    .success(function (data, status, headers, config, statusText) {
                        toaster.success({title:'Record added!', body:'Success', toasterId: 2});
                    })
                    .error(function (error, status, headers, config, statusText) {
                        console.log('Nothing added!', error, status, headers, config);
                        errorHandler(error, status, errMsgCustom);
                        //if (status == 406) {
                        //    var errMsg = (angular.isDefined(errMsgCustom) && (errMsgCustom.length > 0)) ? errMsgCustom : 'الإسم موجود سابقاً'; //406:"Not Acceptable"
                        //    toaster.warning('تكرار!', errMsg) //406:"Not Acceptable"
                        //}
                        //else {
                        //    var bdy = "{template: 'toasterTplx.html', data: {message:'لم يتم إضافة السجل الجديد!', details:'" + removeInvalidChar(error.Message) + "'}}";
                        //    toaster.error('حدث خطأ', bdy, null, 'templateWithData');
                        //}
                    });
                    return deferred.resolve(req);
                }, function (err) {
                    return deferred.reject('>>$http.post: error in url_token fn << ');
                }
            );
            return deferred.promise;
        };

         function put(url, data, msgCustom) {
            var deferred = $q.defer();
            url_token(url).then(
               function (urlQueryToken) {
                   var req = $http({
                       traditional: true,
                       url: urlQueryToken,
                       method: 'PUT',
                       data: data, // JSON.stringify(data),
                       //params: data,
                       dataType: "JSON"
                   },function (result) {
                       debugMode && debugThis && console.log('Put result:::', result);
                       var msg = (msgCustom && msgCustom.successMsg) ? msgCustom.successMsg : 'تم تعديل السجل بنجاح.';
                       toaster.success({ title: 'تم بنجاح', body: msg, toasterId: 2 });
                   },function (error, status, headers, config, statusText) {
                        debugMode && debugThis && console.log('Nothing saved! ', error, status, headers, config);
                        errorHandler(error, status, msgCustom.errorMsg);
                    });
                   return deferred.resolve(req);
               }, function (err) {
                   return deferred.reject('>>$http.put: error in url_token fn << ');
               }
           );
            return deferred.promise;
        };

        this.delete = function (url) {
           var deferred = $q.defer();
           url_token(url).then(
              function (urlQueryToken) {
                  var req = $http({
                                    url: urlQueryToken,
                                    method: 'DELETE'
                                })
                                .success(function (response) {
                                    toaster.success({ title: 'تم بنجاح', body: 'تم', toasterId: 2 });
                                })
                                .error(function (err) {
                                    toaster.error({ title: 'Record Not Deleted!', body: 'Failed', toasterId: 2 });
                                });
                  return deferred.resolve(req);
              }, function (err) {
                  return deferred.reject('>>$http.put: error in url_token fn << ');
              }
          );
           return deferred.promise;
        };

        //Add the Token to the url
        function url_token(url) {
            var credentials = {
                userLogin : $rootScope.currentUser ? $rootScope.currentUser.UserLogin : null,
                password : $rootScope.currentUser ? $rootScope.currentUser.UserPassword : null,
            };

            if (angular.isUndefined(authService)) var authService = $injector.get('authService');
                //console.log('dataService Auth',Auth.isAuthenticated());
            var generateTokenFn;
            if (authService.isAuthenticated()) {
                generateTokenFn = securityManager.generate();
            }
            else {
                generateTokenFn = securityManager.generate(credentials.userLogin, credentials.password);
            }
            return generateTokenFn.then(
                        function (token) {
                            if (url.indexOf('?') > -1) return url + '&token=' + token;
                            else return url + '?token=' + token;
                        },
                        function (err) {
                            console.log('token error: ', err);
                        }
                );
        };
    };

})(angular);