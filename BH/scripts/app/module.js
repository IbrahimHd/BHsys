/// <reference path="../libs/angular/angular.js" />

(function() {
    'use strict';

    angular
        .module('app', [
            'ngAnimate', //required by ngMaterial
            'ngAria',//required by ngMaterial
            //'ngTouch', //Angular Material already has mobile click, tap, and swipe support 
            'ngMaterial', //required by autoComplete (it uses decarator and cannot Lazy loaded!)
            'ngSanitize', //needed by ui.bootstrap
            'ui.router',
            //'ct.ui.router.extras', // using: "sticky" & "dsr"
            'oc.lazyLoad',
            'angular-loading-bar',
            'angularPromiseButtons',
            //'pascalprecht.translate',
            //'eehNavigation', //ui-router based Navigation Menu
            'toaster', //notification module
            'ui.bootstrap', //needed for dialog, ui-tooltip-html
            'pageslide-directive',
            //'xeditable',
        ])
        /* Disable Debug Info */
        .config(function ($compileProvider) {
            $compileProvider.debugInfoEnabled(false);
        })
        /* Cache Template */
        .run(function ($templateCache) {
            $templateCache.put('templateId.html','this is my content');
        })
        /* Adding the auth interceptor here, to check every $http request*/
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        })

        /* angular-loading-bar */
        //.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        //    cfpLoadingBarProvider.includeBar = false;
        //cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
        //cfpLoadingBarProvider.spinnerTemplate = '<div><span class="fa fa-spinner">Loading...</div>';
        //}])

        //Angular xeditable
        //.run(function (editableOptions) {
        //    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        //    editableOptions.icon_set = 'font-awesome';
        //})
        /* Promise Buttons */
        .config(function (angularPromiseButtonsProvider)
        {
            angularPromiseButtonsProvider.extendConfig({
                spinnerTpl: '<span class="promise-btn-loader">&nbsp;&nbsp;<i class="fa fa-spinner fa-pulse fa-2x"></i></span>', //class="fa fa-circle-o-notch fa-spin fa-2x"
            });
        })
        /* md-themes are loaded crazyly!! Disabling auto-load */
        .config(['$mdThemingProvider', function ($mdThemingProvider) {
            $mdThemingProvider.generateThemesOnDemand(true);
        }]);
})();   