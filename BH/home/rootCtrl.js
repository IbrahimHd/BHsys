/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/security/authService.js" />
/// <reference path="../scripts/app/dataService.js"/>

(function () {
    'use strict';
        angular
        .module("app")
        .controller("rootCtrl", rootCtrl);
    
        rootCtrl.$inject = ['$scope', '$rootScope', '$document', '$timeout', 'dataService', 'companyInfoService', '$state', '$window', '$ocLazyLoad', 'authService', 'toaster', 'debugMode'];
    
        function rootCtrl($scope, $rootScope,$document, $timeout, dataService, companyInfoService, $state, $window, $ocLazyLoad, authService, toaster, debugMode) {
            var debugThis = false;
            $rootScope.nowMoment = $scope.nowMoment = moment();
            $rootScope.now = $scope.now = moment().format('DD MMMM YYYY HH:mm:ss');
            $rootScope.milliseconds = $rootScope.nowMoment.format('HHmmss');
            $rootScope.currentDate = $scope.currentDate = moment().format('DD MMMM YYYY');
            $rootScope.currentYear = $scope.currentYear = moment().format('YYYY');
            //$scope.isCollapsed = true;
            $scope.isNavCollapsed = true;
            $scope.currentUser = $rootScope.currentUser;

            // if a session exists for current user (page was refreshed) log him in again
            // BUT NOT in the FIRST normal login
             if (typeof $rootScope.currentUser == 'undefined') { //Is the user really OFF?? (checking UserRole, not Name and Pswd coz they've been assigned in the login from view before grapping the Full info from the db.)
                 if ($window.sessionStorage["userInfo"]) { //there is already a stored session
                    var sessionUserInfo = JSON.parse($window.sessionStorage["userInfo"]);
                    $scope.currentUser = $rootScope.currentUser = sessionUserInfo;
                 }
	        }

             debugMode && debugThis && console.log('RootCtrl:', $rootScope.currentUser);

             if ($rootScope.currentUser) {
                 $scope.lastServerRefreshTime = moment().format('Do [at] HH:mm');
             }

            /*Doc Direction*/
             $scope.isDocDirRtl = true;

             $scope.docDirOnChange = function () {
                 var userDir = $scope.isDocDirRtl ? 'ltr' : 'rtl';/*switching to opp dir*/
                 toggleDocDir(userDir);
             }
             function toggleDocDir(dir) {
                 document.dir = dir;
                 var styleRtlBootstrap = document.querySelector('#rtl_bs');
                 var htmlTag = document.querySelector('html');
                 if (styleRtlBootstrap) {
                     if (dir == 'ltr') {
                         styleRtlBootstrap.setAttribute("href", '');
                         htmlTag.setAttribute("lang", 'en');
                     } else {
                         styleRtlBootstrap.setAttribute("href", "css/bootstrap-rtl.css");
                         htmlTag.setAttribute("lang", 'ar');
                     }
                 }
                 $scope.isDocDirRtl = !$scope.isDocDirRtl;
             }

             document.onload = function () { toggleDocDir('ltr'); };
             document.onbeforeunload = function () { toggleDocDir('rtl'); };

            /*
            Responsive Nav
            */
             $scope.sidebar = {};
             $scope.sidebar.width = '220px';
             $window.addEventListener('resize', onWindowResize);
             function onWindowResize() {
                 $scope.isSidebarOpen = true;
                 //if($scope.isSidebarOpen){
                 //    $scope.sidebar.width = '220px';
                 //}
                 //else {
                     //var sidebarHtml = document.getElementsByClassName('.sidebar'); //.querySelectorAll                
                     //var sidebarEle = angular.element(sidebarHtml);
                     //sidebarEle.addClass('sidebar-mini');
                     //xs: < 576px
                     //sm: min 576px
                     //md: min 768px
                     //lg: min 992px
                     //xl: min 1200px

                    //document.body.clientWidth <= 767
                     $scope.sidebar.width = $window.innerWidth >= 1200 ? '220px' :
                                                $window.innerWidth >= 992 ? '60px' :
                                                $window.innerWidth >= 768 ? '45px' :
                                                '45px'; //'0px';
                     console.log($window.innerWidth, $scope.sidebar.width);
                 //}

             }

            /*
            Auto Generate Navegator
            */
              //console.log($state.get());
             $scope.navList = stateList();
             function stateList(){
                 return $state.get()
                     .filter(state => { if (state.options && state.options.showOnNav === true) return state })
                     .map(function (state) { return { state: state.name, hasChildren: false, isCollapsed: true, options: state.options } })
                     .sort(function (a, b) {return a.options.order - b.options.order;});
             }
            
             var testParentChildState = {
                 state: 'parent',
                 options:{
                     showOnNav: true,
                     title: "TestParentChildState",
                     iconCls: "fa-street-view",
                     order: 0
                 },
                 isCollapsed: true,
                hasChildren: true, //children.length
                children: [
                    {
                        state: 'layout.childTest1',
                        options:{
                                title: "child A",
                                iconCls: "fa-pencil",
                                order: 0,
                            }
                    },
                    {
                        state: 'layout.childTest2',
                        options:{
                                title: "child B",
                                iconCls: "fa-search",
                                order: 1
                        }
                    }
                ]
             };
             $scope.navList.push(testParentChildState); //console.log($scope.navList);

            /*
             * The initial data will be grabed through the loginCtrl
             * It's needed here as well grab the data again in case of reload as the loginCtlr will not be evaluated
             >>$rootScope-level defined "isUserAuthenticated" is not accessible here at root initialization
            /* isUserAuthorized && */authService.isAuthenticated() && companyInfoService.grab(); //< checking the sessionStorage handled at the service level

            //.........pageSlide...........
            /* BROKEN WHEN CLOSING BY CLICK-OUTSIDE, ALTERNATIVELY, USE [isBottomMenuOpen=!isBottomMenuOpen] RATHER THAN toggle()*/
            //$scope.isSidebarOpen = false;
             $scope.toggle = function () {
                 //$scope.isSidebarOpen = !$scope.isSidebarOpen
             }
             $scope.onPageSlideClose = function () {
                 //$scope.toggle();
                 debugMode && debugThis && console.log('sidebar closed!');
             }

	         var setCurrentUser = function () {
	            $scope.currentUser = $rootScope.currentUser;
	            debugMode && debugThis && console.log("setCurrentUser: " , $scope.currentUser.UserLogin);
	        };

	        $timeout(function () {
	            $scope.appLoaded = true;
	        }, 2000);
        };
    })();