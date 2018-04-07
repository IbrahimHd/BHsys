/// <reference path="../libs/angular/angular.min.js" />
/// <reference path="../libs/angular-ui-route/angular-ui-router.min.js" />
/// <reference path="../libs/angular-ui-route/ui-router-core.min.js" />
/// <reference path="../libs/angular-ui-route/ui-router-sticky-states.js" />
/// <reference path="../libs/angular-ui-route/ui-router-dsr.min.js" />

(function () {
    'use strict';
    angular
        .module('app')
        .config(routeConfig)
        .run(function($rootScope) {
            $rootScope.$on("$stateChangeError", console.log.bind(console));
        })

    routeConfig.$inject = ['$uiRouterProvider', '$stateProvider', '$locationProvider', '$urlMatcherFactoryProvider', '$ocLazyLoadProvider', 'USER_ROLES', 'debugMode'];
    function routeConfig($uiRouter, $stateProvider, $locationProvider, $urlMatcherFactoryProvider, $ocLazyLoadProvider, USER_ROLES, debugMode) {
        var debugThis = false;
        const $urlService = $uiRouter.urlService;
        const $stateRegistry = $uiRouter.stateRegistry;

        var uiRouterStickyStates = window['@uirouter/sticky-states'],
            uiRouterDSR = window['@uirouter/dsr'];
        $uiRouter.plugin(uiRouterStickyStates.StickyStatesPlugin);
        $uiRouter.plugin(uiRouterDSR.DSRPlugin);
        $ocLazyLoadProvider.config({
            debug: debugThis && debugMode,
            events: true,
            serie: true,
            modules: [
                {
                    name: 'ngTagsInput',
                    files: ['scripts/libs/ngTagsInput/ng-tags-input.min.css', 'scripts/libs/ngTagsInput/ng-tags-input.min.js'],
                    serie: true
                },
                {
                    name: 'urlQueryString',
                    files: ['scripts/app/modules/urlQueryString.js'],
                    serie: true
                },
                {
                    name: 'xeditable',
                    files: ['scripts/libs/angular-xeditable/xeditable.min.css', 'scripts/libs/angular-xeditable/xeditable.min.js'],
                    serie: true
                },
                {
                    name: 'rzModule', //input range slider
                    files: ['scripts/libs/rangeSlider/rzslider.min.css', 'scripts/libs/rangeSlider/rzslider.min.js'],
                    serie: true
                },
                {
                    name: 'angular-vs-repeat',
                    files: ['scripts/libs/angular-vs-repeat.min.js'],
                    serie: true
                },
                {
                    name: 'ngTouch',
                    files: ['scripts/libs/angular/angular-touch.min.js'],
                    serie: true
                },
                {
                    name: 'angular-carousel',
                    files: ['scripts/libs/angular-carousel/angular-carousel.min.css', 'scripts/libs/angular-carousel/angular-carousel.min.js'],
                    serie: true
                },
                {
                    name: 'imgHandler',
                    files: [
                            'scripts/libs/imgHandler/imgHandler.css',
                            'scripts/libs/imgHandler/imgHandler.js'
                            ],
                    serie: true
                },
                {
                    name: 'ngFileUpload',
                    files: ['scripts/libs/ng-file-upload/ng-file-upload-all.min.js']
                },
                {
                    name: 'ngImgCrop',
                    files: [ 'scripts/libs/ngImgCrop/ng-img-crop.css','scripts/libs/ngImgCrop/ng-img-crop.js']
                },
                {
                    name: 'webcam',
                    files: ['scripts/libs/webCam/webCam.min.js']
                },
                {
                    name: 'as.sortable', //ng-sortable
                    files: ['scripts/libs/ng-sortable/ng-sortable.css','scripts/libs/ng-sortable/ng-sortable-style.css','scripts/libs/ng-sortable/ng-sortable.min.js']
                },
                {
                    name: 'ngImgCrop',
                    files: ['scripts/libs/ngImgCrop/ng-img-crop.js','scripts/libs/ngImgCrop/ng-img-crop.css']
                },
                {
                    name: 'datetimePicker',
                    files: ['scripts/libs/datetimePicker/datetime-range.css',
                            'scripts/libs/datetimePicker/datetime-input.css',
                            'scripts/libs/datetimePicker/datetimePicker.js'
                    ]
                },
                {
                    name: 'ngMessages', //form validation, autoCompleteDropdown
                    files:  ['scripts/libs/angular/angular-messages.min.js'
                    ]
                },
                {
                    name: 'mwl.confirm', //pop up confim dialg
                    files: ['scripts/libs/angular-bootstrap-confirm/angular-bootstrap-confirm.js'
                    ]
                },
                {
                    name: 'trNgGrid',
                    files: ['scripts/libs/trNgGrid/trNgGrid.min.css','scripts/libs/trNgGrid/trNgGrid.min.js']
                }
            ]
        });

        $locationProvider.html5Mode(true);
        $urlMatcherFactoryProvider.caseInsensitive(true);

        var sitePrefix = '';

        debugThis && debugMode && $stickyStateProvider.enableDebug(true);

        $stateProvider
            .state('login', {
                url: sitePrefix + "/login",
                //component: 'loginCpt',
                views: {
                    "main": {
                        component: 'loginCpt',
                        //templateUrl: 'loginDir/login.html'
                        //template: '<login-cpt></login-cpt>'
                    }
                },
                resolve: {
                    test:()=>'teeeeeeeee',
                    trans: ['$transition$', function($transition$) { return $transition$; }],
                    returnTo: returnToFn,
                    loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'loginDir/loginCpt.js'
                        ]).then(function () { console.log('loginCtrl File Loaded!'); });
                    }]
                }
            })
            .state('logout', {
                url: sitePrefix + "/login",
                //redirectTo: 'login', // <- does not make the "resolve" working!
                resolve: {
                    LOGOUT: ['$rootScope', '$state', '$timeout', 'authService', function ($rootScope, $state, $timeout, authService) {
                        if ($rootScope.currentUser) authService.logout($rootScope.currentUser.UserLogin); //redirect handled by router config
                        //do in all cases 
                        $timeout(function () {
                            $state.go('login', null, { reload: true });
                        });
                    }]
                },
                options: { showOnNav: true, title: 'خروج', iconCls: 'fa-sign-out', order: 11 }
            })
            .state('layout', {
                abstract:true,
                sticky: true, //When the modal state tree is activated, the sticky "app" state is inactivated. (navigating back to the "app" state will reactivate the [previous] app state {using DSR})
                // If this state is directly activated, redirect the transition to the most recent
                // child state that was previously activated, or that state defined in 'default'.
                deepStateRedirect: { //true, //dsr //enable Deep State Redirect.  
                    default: { state: 'layout.landing' }
                },
                views: {
                    "main": {
                        templateUrl: 'home/layout.html'
                    }
                }
            })
            .state('layout.landing', {
                url: sitePrefix + "/", //?{mapLeafletChoropleth, bubbleChart} //"/?mapLeafletChoropleth&bubbleChart"
                //reloadOnSearch: false, //<-- search Query
                //params:{
                //    bubbleChart: { type: 'date', value: null, raw: true },
                //    mapLeafletChoropleth: {
                //        type: 'string',
                //        array: true,
                //        value: []
                //    }
                //},
                views: {
                    "content@layout": {
                        templateUrl: 'home/landing.html'
                    }
                },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                                                'scripts/libs/leaflet/leaflet.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.Default.css',
                                                'scripts/libs/dc/dc.min.css',
                                                //'./home_viz_BUNDLE.min.js',
                                                'scripts/libs/d3/d3.min.js',
                                                'scripts/libs/dc/crossfilter.js',
                                                'scripts/libs/dc/reductio.min.js',
                                                'scripts/libs/dc/dc.min.js',
                                                'scripts/libs/leaflet/leaflet.min.js',
                                                'scripts/libs/leaflet/leaflet.markercluster.min.js',
                                                'scripts/libs/dc/dc.leaflet/dc.leaflet.min.js',
                                                'mapDir/geojson-lbn.min.js',
                                              //'ngTouch', //required by Carousel
                                              //'angular-carousel',
                                                'ngTagsInput',
                                                'urlQueryString',
                                                'home/vizCtrl.js'
                        ], { serie: true });
                    }]
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'Home', iconCls: 'fa-bank', order: 1 }
            })
            .state('modalView', {
                url: sitePrefix + '/modal',
                params: { htmlUrl: null, ctrlUrl: null, ctrlName: null, dataLoad: null, mode: null, viewName:'aaa'},
                views: {
                    "modalView": {
                        templateUrl: function (stateParams) { return stateParams.htmlUrl; }, //['$stateParams', function ($stateParams) { return $stateParams.htmlUrl; }],
                       // controller: function (stateParams) { return stateParams.ctrlName; } //['$stateParams', function ($stateParams) { return $stateParams.ctrlName; }]
                    }
                },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', '$stateParams', function ($ocLazyLoad, $stateParams) {
                        return $ocLazyLoad.load([$stateParams.ctrlUrl]);
                    }]
                },
                access: { //<<<<<<<<<<<<<<<<<< this needs to be dynamic as well
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                }
            })
            .state('modalViewUrl', {
                url: sitePrefix + "/modal?htmlUrl, ctrlUrl, ctrlName, {dataId:int}, {dataLoad:json}, mode, viewName",
                views: {
                    "modalView": {
                        templateUrl: function (stateParams) { return stateParams.htmlUrl; }, //['$stateParams', function ($stateParams) { return $stateParams.htmlUrl; }],
                        // controller: function (stateParams) { return stateParams.ctrlName; } //['$stateParams', function ($stateParams) { return $stateParams.ctrlName; }]
                    }
                },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', '$stateParams', function ($ocLazyLoad, $stateParams) {
                        return $ocLazyLoad.load([$stateParams.ctrlUrl]);
                    }]
                },
                access: { //<<<<<<<<<<<<<<<<<< this needs to be dynamic as well
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                }
            })
            .state('layout.map', {
                url: sitePrefix + "/map",
                views: {
                    "content@layout": {
                        templateUrl: 'mapDir/mapLeaflet.html',
                        controller: 'mapLeafletCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'الخرائط', iconCls: 'fa-map-marker', order: 6 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['scripts/libs/leaflet/leaflet.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.Default.css',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.css',
                                                'scripts/libs/leaflet/easyButton/easy-button.min.css',
                                                'scripts/libs/leaflet/leaflet.draw.min.css',
                                                'scripts/libs/leaflet/locate/leaflet-locate.min.css',
                                              //'scripts/libs/leaflet/leaflet.toolbar.min.css',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.css',
                                                'scripts/libs/leaflet/leaflet.min.js',
                                                'scripts/libs/leaflet/leaflet.markercluster.min.js',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.js',
                                              //'scripts/libs/leaflet/leaflet.toobar.min.js',  // leaflet.draw plugin is already supports Toolbar, is it needed for something else?
                                                'scripts/libs/leaflet/easyButton/easy-button.min.js',
                                                'scripts/libs/leaflet/leaflet.draw.min.js',
                                                'scripts/libs/leaflet/locate/leaflet-locate.min.js',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.js',
                                                'mapDir/geojson-lbn.min.js',
                                                'mapDir/mapLeafletCtrl.js'
                        ], { serie: true, order: 7 });
                    }]
                }
            })
            .state('layout.mapSearch', {
                url: sitePrefix + "/mapSearch",
                views: {
                    "content@layout": {
                        templateUrl: 'mapDir/mapSearch.html',
                        controller: 'mapSearchCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'البحث عبر الخريطة', iconCls: 'fa-street-view', order: 6 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['scripts/libs/leaflet/leaflet.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.Default.css',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.css',
                                                'scripts/libs/leaflet/easyButton/easy-button.min.css',
                                                'scripts/libs/leaflet/locate/leaflet-locate.min.css',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.css',
                                                'rzModule', // range slider
                                                'scripts/libs/leaflet/leaflet.min.js',
                                                'scripts/libs/leaflet/leaflet.markercluster.min.js',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.js',
                                                'scripts/libs/leaflet/easyButton/easy-button.min.js',
                                                'scripts/libs/leaflet/locate/leaflet-locate.min.js',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.js',
                                                'mapDir/geojson-lbn.min.js',
                                                'mapDir/mapSearchCtrl.js'
                        ], { serie: true, order: 6 });
                    }]
                }
            })
            .state('layout.mapFlow', {
                url: sitePrefix + "/mapFlow",
                views: {
                    "content@layout": {
                        templateUrl: 'mapDir/mapLeafletFlow.html',
                        controller: 'mapLeafletFlowCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'Map Flow', iconCls: 'fa-street-view', order: 7 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['scripts/libs/leaflet/leaflet.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.Default.css',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.css',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.css',
                                                'scripts/libs/leaflet/leaflet.min.js',
                                                'scripts/libs/leaflet/leaflet.markercluster.min.js',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.js',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.js',
                                                'scripts/libs/d3/d3.min.js', // needed for loading data from CSV file
                                                'scripts/libs/tween.min.js',
                                                'scripts/libs/leaflet/flow/CanvasFlowmapLayer.js',
                                                'mapDir/mapLeafletFlowCtrl.js'
                        ], { serie: true });
                    }]
                }
            })
            .state('layout.mapTimeline', {
                url: sitePrefix + "/mapTimeline",
                views: {
                    "content@layout": {
                        templateUrl: 'mapDir/mapLeafletTimeline.html',
                        controller: 'mapLeafletTimelineCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'Map Timeline', iconCls: 'fa-map-marker', order: 8 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['scripts/libs/leaflet/leaflet.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.css',
                                                'scripts/libs/leaflet/leaflet.markerCluster.Default.css',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.css',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.css',
                                                'scripts/libs/visJS/vis-timeline-graph2d.min.css',
                                                'scripts/libs/leaflet/leaflet.min.js',
                                                'scripts/libs/leaflet/leaflet.markercluster.min.js',
                                                'scripts/libs/leaflet/leaflet.extra-markers.min.js',
                                                'scripts/libs/leaflet/fullscreen/leaflet.fullscreen.js',
                                                'scripts/libs/visJS/vis-timeline-graph2d.min.js',  // for Timeline UI
                                                'scripts/libs/leaflet/timeline/LeafletPlayback.min.js',
                                                'mapDir/playback_data.js',
                                                'mapDir/mapLeafletTimelineCtrl.js'
                        ], { serie: true });
                    }]
                }
            })
            .state('layout.timelineVis', {
                url: sitePrefix + "/timelineVis",
                views: {
                    "content@layout": {
                        templateUrl: 'timelineDir/timelineVis.html',
                        controller: 'timelineVisCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'Timeline Vis', iconCls: 'fa-retweet', order: 9 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['scripts/libs/visJS/vis-timeline-graph2d.min.css',
                                                 'scripts/libs/visJS/vis-timeline-graph2d.min.js',  // for Timeline UI
                                                 'timelineDir/timelineVisCtrl.js'
                        ], { serie: true });
                    }]
                }
            })
            .state('layout.timeline', {
                url: sitePrefix + "/timeline",
                views: {
                    "content@layout": {
                        templateUrl: 'timelineDir/timeline.html',
                        controller: 'timelineCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'Timeline', iconCls: 'fa-retweet', order: 10 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['scripts/libs/timeline-knightlab/timeline.css',
                                                 'scripts/libs/timeline-knightlab/timeline.min.js',
                                                 'timelineDir/timeline_data.js',
                                                 'timelineDir/timelineCtrl.js'
                        ], { serie: true, title: 'Timeline', order: 10 });
                    }]
                }
            })
            .state('layout.supplier', {
                url: sitePrefix + "/supplier",
                views: {
                    "content@layout": {
                        templateUrl: 'supplierDir/supplier.html',
                        controller: 'supplierCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'Add Supplier', iconCls: 'fa-user-plus', order: 5 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['ngMessages',
                                                 'supplierDir/supplierService.js',
                                                 'supplierDir/supplierCtrl.js'
                        ]);
                    }]
                }
            })
            .state('layout.suppliers', {
                url: sitePrefix + "/suppliers",
                views: {
                    "content@layout": {
                        templateUrl: 'supplierDir/suppliers_SpotFocus.html',
                        controller: 'suppliersCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'لائحة المورّدين', iconCls: 'fa-id-card-o', order: 4 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['supplierDir/suppliers.css', 'css/pretty-checkbox.min.css', 'supplierDir/suppliersCtrl.js', 'scripts/app/directives/onLongPress.js'
                        ]);
                    }]
                }
            })
            .state('layout.receipts', {
                url: sitePrefix + "/receipts",
                views: {
                    "content@layout": {
                        templateUrl: 'receiptDir/receipts.html',
                        controller: 'receiptsCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor, USER_ROLES.registrar]
                },
                options: { showOnNav: true, title: 'لائحة الإســتلام', iconCls: 'fa-tasks', order: 2 },
                resolve: {
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['trNgGrid',
                                                 'scripts/libs/datetimePicker/datetime-range.css',
                                                 'scripts/libs/datetimePicker/datetimeRangePicker.js',
                                                 'receiptDir/receiptsCtrl.js',
                                                 'receiptDir/receiptService.js', // for print preview
                                                 'scripts/app/nbrToWordsFltr.js',// for print preview
                                                 'common/datetimeRangePicker/dateRangePickerPresetService.js',
                                                 'mwl.confirm'
                        ]);
                    }]
                }
            })
            .state('layout.receipt', {
                url: sitePrefix + '/receipt?{receiptId,mode}', //<<< using {} makes param OPTIONAL //'/receipt/:receiptId/:mode', //'/receipt?receiptId:receiptId&mode:mode', //"/receipt?{receiptId:receiptId&mode:mode}"
                //params: {  //<<<< this makes the modal (print preview) reloads the view!!! (query params is an alternative solution)
                //    receiptId: { value: null, squash: true },  //'squash' is to make it optional
                //    mode: { value: null, squash: true }
                //},             
                views: {
                    "content@layout": {
                        templateUrl: 'receiptDir/receipt.html',
                        controller: 'receiptCtrl'
                    }
                },
                access: {
                    authorizedRoles: [USER_ROLES.manager, USER_ROLES.doctor]
                },
                options: { showOnNav: true, title: 'إســتلام البضاعة', iconCls: 'fa-plus', order: 3 },
                resolve: {
                    xEditable: ['$ocLazyLoad', '$injector', function ($ocLazyLoad, $injector) {
                        return $ocLazyLoad.load(['xeditable']).then(function () {
                            var editableOptions = $injector.get("editableOptions");
                            editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
                            editableOptions.icon_set = 'font-awesome';
                        })
                    }],
                    loadMyModule: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['receiptDir/receipt.css', 'as.sortable', 'mwl.confirm',
                                                 'receiptDir/receiptService.js', /*'receiptDir/receiptCtrl.js',*/
                                                //'scripts/app/directives/directive_receipt_BUNDLE.min.js',
                                                 //'scripts/app/directives/inputFormatDirective.js', 'scripts/app/directives/onLongPress.js', 'scripts/app/directives/setFocus.js', 'scripts/app/directives/ihInput/ihInput.js',
                                                 //'scripts/app/nbrToWordsFltr.js',// for print prview
                                                 'supplierDir/supplierService.js'
                        ]);
                    }]
                }
            })
            .state('layout.childTest1', {
                url: sitePrefix + "/childTest1",
                views: {
                    "content@layout": {
                        template: '<h1>testing child state..[1] </h1>'
                    }
                },
                options: { showOnNav: false, },
            })
            .state('layout.childTest2', {
                url: sitePrefix + "/childTest2",
                views: {
                    "content@layout": {
                        template: '<h1>testing child state..[2] </h1>'
                    }
                }, options: { showOnNav: false, },
            })
            //.state('otherwise',{
            //    url:'*path',
            //    views: {
            //        "content@layout": {
            //            template: '<h4>Can not be found</h4><br/><h5>Go to <a ui-sref="layout.landing">main app interface <i class="fa fa-home"></i></a>.</h5>'
            //        }
            //    }
            //})
;
        //$urlRouterProvider.otherwise(sitePrefix + '/');
        $urlService.rules.otherwise((matchValue, urlParts, router) => {
            console.log('otherwwwwwwwwwwwwwwwwww');
            //router.stateService.go('/'); //or:
            return { state: 'layout.landing' };
        });

        //$urlService.rules.otherwise({ state: 'layout.landing' });

        returnToFn.$inject = ['$transition$'];
        function returnToFn($transition$) {
            /*or just $transition$.from()*/
            if ($transition$.redirectedFrom() != null && $transition$.from().name !== 'login' && $transition$.from().name !== 'logout') {
                // The user was redirected to the login state (e.g., via the requiresAuth hook when trying to activate contacts)
                // Return to the original attempted target state (e.g., contacts)
                return $transition$.redirectedFrom().targetState();
            }

            let $state = $transition$.router.stateService;

            // The user was not redirected to the login state; they directly activated the login state somehow.
            // Return them to the state they came from.
            if ($transition$.from().name !== '' && $transition$.from().name !== 'login' && $transition$.from().name !== 'logout') {
  //>              return $state.target($transition$.from(), $transition$.params("from"));
            }

            // If the fromState's name is empty, then this was the initial transition. Just return them to the home state
  //>          return $state.target('layout.landing');
        }
    };
})();