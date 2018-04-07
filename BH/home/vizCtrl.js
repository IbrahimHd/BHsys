/// <reference path="../scripts/libs/angular/angular_1.5.min.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/d3/d3.min.js"/>
/// <reference path="../scripts/libs/dc/crossfilter.js"/>
/// <reference path="../scripts/libs/dc/reductio.min.js" />
/// <reference path="../scripts/libs/dc/dc.min.js"/>
/// <reference path="../home/vizService.js" />
/// <reference path="../home/vizCtrl.js" />

(function () {
    'use strict';
        angular
        .module("app")
        .factory('dc_',dcFactory)
        .directive('widgetControls', widgetControls)
        .directive('onSizeChange', ['$window', function ($window) {
            return {
                restrict: 'A',
                scope: {
                    onSizeChange: '&'
                },
                link: function (scope, $element, attr) {
                    var element = $element[0];

                    cacheElementSize(scope, element);
                    $window.addEventListener('resize', onWindowResize);

                    function cacheElementSize(scope, element) {
                        scope.cachedElementWidth = element.offsetWidth;
                        scope.cachedElementHeight = element.offsetHeight;
                    }

                    function onWindowResize() {
                        var isSizeChanged = scope.cachedElementWidth != element.offsetWidth || scope.cachedElementHeight != element.offsetHeight;
                        if (isSizeChanged) {
                            var expression = scope.onSizeChange();
                            expression();
                        }
                    };
                }
            }
        }])
        .controller("vizCtrl", vizCtrl);

        dcFactory.$inject = ['$window'];
        widgetControls.$inject = ['$window', '$document', '$compile', '$templateRequest','$timeout'];
        
        function dcFactory($window) { var dc_= $window.dc; return dc_; }
        function widgetControls($window, $document, $compile, $templateRequest, $timeout) {
            return {
                restrict: 'AE',
                scope:{
                    widgetControls: '='
                },
                //controller: ['$scope', function ($scope) { $scope.isloading = true; }],
                compile: function (tElement, tAttrs) {
                    /* for the reason of not make the chart/map overlaied, ng-hide added initially.*/
                    //var loadingSpinner = angular.element('<i class="fa fa-spinner fa-pulse fa-3x gray-light text-center vertically-center"></i>');
                    //loadingSpinner.attr('ng-hide', 'isloading');
                    tElement.parent().append('<i class="viz fa fa-spinner fa-pulse fa-3x gray-light text-center vertically-center"></i>');
                    tElement.addClass('ng-hide');
                    return {
                        pre: function (scope, element, attrs, ctrl){                    
                        },
                        post: linkFn
                    }
                },
              //link: linkFn,
            }
            function linkFn(scope, element, attrs, ctrl) {
                    var adjustX = 20, adjustY = 40, chartFrameHeaderHeight = 80;
                    var container;
                    scope.isloading = true;
                    scope.expanded = false;

                    /* wait for the data to be grabed from the server */
                    var watcher = scope.$watch('widgetControls', (loadedWedetData) => {
                        if(loadedWedetData){
                            /* stop the $watcher as the data has been loaded */
                            watcher();
                            var param = scope.widgetControls; //angular.fromJson(scope.widgetControls);
                            scope.chartId = attrs.id;
                            scope.type = param.type;
                            scope.chart = param.chart;
                            scope.chartTitle = param.title;
                            scope.iconClass = param.iconClass;

                            if (scope.type === 'table') {
                                container = element.parent().parent();
                            } else {
                                container = element;
                            }

                            var mapEle;
                            $timeout(function () {
                                mapEle=element.children()[3];
                            });//, 1500

                            container.addClass('dashboardWidget-body');

                            /* add overlay ICON */
                            var iconHTML = '<div class="chartIconOverlay hide"><i class="fa ' + scope.iconClass + ' fa-5x"></i></div>';

                            container.parent().prepend(angular.element(iconHTML));

                            $templateRequest('home/widgetControls.html').then(function (tpl) {
                                var outerEle = angular.element(tpl);
                                var innerEle = outerEle.children();

                                container.prepend(innerEle);
                                $compile(innerEle)(scope);
                            }, function () {
                                if (scope.$$destroyed) { return; }
                            })

                            $window.addEventListener('resize', onWindowResize);
                            function onWindowResize() {
                                setChartSize();
                            }

                            scope.toggleChartSize = function () {
                                container.toggleClass('expanded');

                                var iconEle = (scope.type === 'table') ? 
                                        angular.element(element.parent().parent().parent().children('.chartIconOverlay')[0]) :
                                        angular.element(element.parent().children('.chartIconOverlay')[0])  ;
                                iconEle.toggleClass('hide');

                                scope.expanded = !scope.expanded;
                                setChartSize();
                            }

                            function setChartSize() {
                                var chartSize;
                                var chartSizeExpanded = {
                                    chartWidth: $window.innerWidth - adjustX,
                                    chartHeight: $window.innerHeight - (adjustY + 100)
                                }
                                var chartSizeSmall = {
                                    chartWidth: element.parent()[0].clientWidth,
                                    chartHeight: element.parent()[0].clientHeight - chartFrameHeaderHeight
                                }
                                var isChartExpanded = element.hasClass('expanded');
                                chartSize = isChartExpanded ? chartSizeExpanded : chartSizeSmall; //console.log(chartSize)
                                scope.chart
                                    .width(chartSize.chartWidth)
                                    .height(chartSize.chartHeight);
                                (scope.type === 'pie' || scope.type === 'rowChart' || scope.type === 'table' || scope.type === 'geoChoropleth' || scope.type.includes('map')) ? null : scope.chart.rescale();
                                scope.chart.redraw();

                                if (scope.type === 'geoChoropleth') {  // << this is a member of the core dc.js (not dc.leaflet)
                                    var dif = window.innerWidth * 0.002;
                                    scope.chart.projection(d3.geo.mercator()
                                                .scale(10000)
                                                .center(scope.expanded ? [37.6, 33.5] : [37.6 - dif, 33.6])
                                                )
                                }

                                if (scope.type.includes('map')) {
                                    var mapEle = d3.selectAll('#' + scope.chartId).selectAll('.dc-leaflet');

                                    mapEle.style('width', chartSize.chartWidth - 20 + "px");
                                    mapEle.style('height', chartSize.chartHeight + "px");

                                    // wait again till the map div is drawn & then calebrate the map
                                    $timeout(function () {
                                        //console.log(scope.chartId, scope.chart.map().getLayers().getBounds());
                                        scope.chart.map().invalidateSize();
                                        scope.chart.map().flyToBounds(scope.chart.map().getBounds());
                                    }); //, 350
                                }

                                /* Clean up/hide the Spinner*/
                                //element.parent().removeNode('i');
                                //element.parent().getElementsByClassName('.fa-spinner').css('display', 'none');
                                scope.isloading = false;
                                angular.element(document.getElementsByClassName('viz fa-spinner')).css('display', 'none');

                                /* for the reason of not make the chart/map overlaied, ng-hide added initially.
                                As the chart/map now is fitted properly, remove the class.*/
                                element.removeClass('ng-hide');
                            }

                            /* set the initial chart size*/
                            //wait a bit till the chart is rendered
                            $timeout(function () {
                                setChartSize();
                            });//,300

                            // Bind 'esc' keyup event to close edit popover
                            $document.on('keyup', function (e) {
                                if (e.keyCode === 27 && scope.expanded) {
                                    scope.$apply(function () {
                                        scope.toggleChartSize();
                                    });
                                }
                            });

                            scope.resetChart = function (chart) {
                                chart.filterAll();
                                $timeout(() => chart.redrawGroup(), 0);
                            }
                        }
                    });
                }
        }
    
        vizCtrl.$inject = ['$scope', '$location', '$filter', '$http', '$timeout', 'urlQueryStringService', 'dc_', 'dataService', 'debugMode'];
    
        function vizCtrl($scope, $location, $filter, $http, $timeout, urlQueryStringService, dc_, dataService, debugMode) {
            var debugThis = false, isContextualMenuOpen = false;
            var default_filters = { bubbleChart: null, map: null, mapLeafletChoropleth: null, receiptsAmountByYearPieChart :null};
            $scope.filters = urlQueryStringService.getFilters(default_filters);
            $scope.filtersList = [];
            for (var key in $scope.filters) {
                if ($scope.filters[key] != null && $scope.filters[key] != '') {
                    $scope.filtersList.push({ key: key, value: $scope.filters[key] });
                }
            }
            var yearFormat = d3.time.format("%Y"),
                //monthFormat = d3.format('02d'),
                monthNameFormat = d3.time.format("%B"),
                yearMonthNameFormat = d3.time.format("%Y %B"),
                monthAbbrNameFormat = d3.time.format("%b"),
                dayNameFormat = d3.time.format("%A"),
                dayAbbrNameFormat = d3.time.format("%A"),
                dateTimeFormat = d3.time.format("%Y-%m-%dT%H:%M:%SZ"), //('%m/%d/%Y');
                dateFormat = d3.time.format("%d/%m/%Y"), //('%m/%d/%Y');
                numberFormat = d3.format('.2f'),
                percentageFormat = d3.format(".0%"),
                siPrefixFormat = d3.format(".2s"),   // SI-prefix with two significant digits, "42M"
                commaSeparatedFormat = d3.format(",.2"),// 4213=> grouped thousands with two significant digits, "4,213"
                roundCommaSeparatedFormat = d3.format(",.2r");// 4213=> grouped thousands with two significant digits, "4,200"
            var rowStackChart,
                stackChart,
                receiptsAmountByMonthBarChart,
                amountClassesPieChart,
                receiptsAmountByYearPieChart,
                bubbleChart,
                visTableByYear,
                geoChoropleth,
                map,
                mapBubble,
                mapLeafletChoropleth,
                receiptCountByMonthRowChart,
                visCount;
            $scope.dateIntervals = [
                { name: "Days", fn: d3.time.day, g: 'This', disabled: false }, { name: "Weeks", fn: d3.time.week, g: 'This', disabled: false }, { name: "Months", fn: d3.time.month, g: 'That', disabled: false }, { name: "Quarter", fn: d3.time.quarter, g: 'This', disabled: true }, { name: "Years", fn: d3.time.year, g: 'That', disabled: false }
            ];
            $scope.dateInterval = $scope.dateIntervals[2].fn; // setting the default DateInterval

            var receiptTotalAccessor = function (d) { return d.receiptTotal; };

            $scope.aggrPatterns = [
                { name: "avg", title: "Average", g: 'This', disabled: false },
                { name: "median", title: "Median", g: 'That', disabled: false },
                { name: "count", title: "Count", g: 'That', disabled: false },
                { name: "sum", title: "Sum", g: 'That', disabled: false },
                { name: "max", title: "Max", g: 'This', disabled: false },
                { name: "min", title: "Min", g: 'This', disabled: false }
            ];
            $scope.aggrPattern = $scope.aggrPatterns[2].name; // setting the default aggrPattern

            $scope.expanded = false;
            var data = [];

            function filterData(rawData) {
                var originalDataJustForExportToJson = [
                        { date: '2016-04-10T12:05:00Z', receiptId: 1, receiptTotal: 4543, receiptItemsCount: 5, receiptAccount: 'Debt', geo: '43.45330,28.55529', city: '43.45330,28.55529', district: 'Bent Jbayl' },
                        { date: '2016-04-17T12:05:00Z', receiptId: 11, receiptTotal: 55655, receiptItemsCount: 8, receiptAccount: 'Cash', geo: '43.44930,28.54611', city: '43.08045,25.52840', district: 'Bent Jbayl' },
                        { date: '2016-06-11T12:05:00Z', receiptId: 12, receiptTotal: 542145, receiptItemsCount: 9, receiptAccount: 'Debt', geo: '43.64595,28.39734', city: '43.45330,28.55529', district: 'Bent Jbayl' },
                        { date: '2016-06-02T22:05:00Z', receiptId: 15, receiptTotal: 85478, receiptItemsCount: 7, receiptAccount: 'Credit Card', geo: '43.05273,26.58972', city: '43.45330,28.55529', district: 'Batroun' },
                        { date: '2017-04-07T12:05:00Z', receiptId: 17, receiptTotal: 96589, receiptItemsCount: 11, receiptAccount: 'Debt', geo: '41.46445,23.79593', city: '43.45330,28.55529', district: 'Bent Jbayl' },
                        { date: '2016-04-10T12:05:00Z', receiptId: 1, receiptTotal: 4543, receiptItemsCount: 5, receiptAccount: 'Cheque', geo: '43.42400,28.38867', city: '43.08045,25.52840', district: 'Bent Jbayl' },
                        { date: '2016-04-17T12:05:00Z', receiptId: 11, receiptTotal: 156550, receiptItemsCount: 8, receiptAccount: 'Debt', geo: '43.42400,28.38867', city: '43.45330,28.55529', district: 'Batroun' },
                        { date: '2016-06-11T12:05:00Z', receiptId: 12, receiptTotal: 542145, receiptItemsCount: 9, receiptAccount: 'Cash', geo: '43.44332,28.01264', city: '43.45330,28.55529', district: 'Akkar' },
                        { date: '2016-06-02T22:05:00Z', receiptId: 15, receiptTotal: 85478, receiptItemsCount: 7, receiptAccount: 'Cash', geo: '43.26003,26.55461', city: '43.45330,28.55529', district: 'Bent Jbayl' },
                        { date: '2017-04-07T12:05:00Z', receiptId: 17, receiptTotal: 96589, receiptItemsCount: 11, receiptAccount: 'Debt', geo: '43.08045,25.52840', city: '43.08045,25.52840', district: 'Bent Jbayl' },
                        { date: '2016-04-10T12:05:00Z', receiptId: 1, receiptTotal: 1543, receiptItemsCount: 5, receiptAccount: 'Debt', geo: '43.07265,25.56961', city: '43.08045,25.52840', district: 'Bent Jbayl' },
                        { date: '2016-04-17T12:05:00Z', receiptId: 11, receiptTotal: 55655, receiptItemsCount: 8, receiptAccount: 'Cash', geo: '43.7016762,28.0396345', city: '43.45330,28.55529', district: 'Akkar' },
                        { date: '2016-06-11T12:05:00Z', receiptId: 12, receiptTotal: 542145, receiptItemsCount: 9, receiptAccount: 'Cheque', geo: '42.61463,26.26801', city: '43.42400,28.38867', district: 'Bent Jbayl' },
                        { date: '2016-06-02T22:05:00Z', receiptId: 15, receiptTotal: 85478, receiptItemsCount: 7, receiptAccount: 'Debt', geo: '43.3877799,27.8614071', city: '43.45330,28.55529', district: 'Bent Jbayl' },
                        { date: '2017-04-07T12:05:00Z', receiptId: 17, receiptTotal: 139989, receiptItemsCount: 11, receiptAccount: 'Cash', geo: '42.83254,24.23429', city: '43.42400,28.38867', district: 'Akkar' },
                        { date: '2013-06-11T12:05:00Z', receiptId: 12, receiptTotal: 542145, receiptItemsCount: 9, receiptAccount: 'Credit Card', geo: '42.61463,26.26801', city: '43.42400,28.38867', district: 'Bent Jbayl' },
                        { date: '2013-06-17T12:05:00Z', receiptId: 12, receiptTotal: 502145, receiptItemsCount: 6, receiptAccount: 'Cheque', geo: '42.61463,26.26801', city: '43.42400,28.38867', district: 'Bent Jbayl' },
                        { date: '2014-10-02T22:05:00Z', receiptId: 15, receiptTotal: 81478, receiptItemsCount: 5, receiptAccount: 'Credit Card', geo: '43.3877799,27.8614071', city: '43.45330,28.55529', district: 'Bent Jbayl' },
                        { date: '2014-10-07T22:05:00Z', receiptId: 15, receiptTotal: 85478, receiptItemsCount: 7, receiptAccount: 'Debt', geo: '43.3877799,27.8614071', city: '43.45330,28.55529', district: 'Bent Jbayl' },
                        { date: '2015-04-05T12:05:00Z', receiptId: 17, receiptTotal: 96589, receiptItemsCount: 11, receiptAccount: 'Cheque', geo: '42.83254,24.23429', city: '43.42400,28.38867', district: 'Akkar' },
                        { date: '2015-04-07T12:05:00Z', receiptId: 17, receiptTotal: 66589, receiptItemsCount: 11, receiptAccount: 'Cash', geo: '42.83254,24.23429', city: '43.42400,28.38867', district: 'Akkar' },
                        { date: '2017-05-27T12:05:00Z', receiptId: 27, receiptTotal: 46584, receiptItemsCount: 14, receiptAccount: 'Cash', geo: '43.66459,22.83579', city: '43.08045,25.52840', district: 'Bent Jbayl' }
                ];
                if (angular.equals($scope.filters, default_filters)) return rawData;
                return $filter('filter')(rawData, (record) => {
                    console.log(angular.equals(record.receiptAccount , $scope.filters.a));                    
                    //    if($scope.filters.dF) record.date >= $scope.filters.dF &&
                    //if (angular.isDefined($scope.filters.dT)) return record.date <= $scope.filters.dT &&
                    if(angular.isDefined($scope.filters.a)) return angular.lowercase(record.receiptAccount) == angular.lowercase($scope.filters.a) //&&
                    //    if($scope.filters.d) record.district == $scope.filters.d;
                    else return false;
                }
                );
            }

            function applyChartFilters() {
                for (var key in $scope.filters) {
                    var chart = eval(key);
                    chart.filter($scope.filters[key]);
                    //$timeout(() => chart.redraw(), 0);
                    //$timeout(() => chart.redrawGroup(), 0);
                }
                $timeout(() => dc_.redrawAll(), 0);
                visCount.redraw(); //<-- redrawAll() is not refreshing this!
            }

            function initialize(){
                data.forEach(function (d) {
                    d.date = new Date(d.date);
                    d.month = d3.time.month(d.date);
                    d.monthName = monthAbbrNameFormat(d.date);
                    d.year = yearFormat(d.date); //d3.time.year(d.date).getFullYear();
                });

                $scope.logResize = function () {
                    console.log('element resized');
                };
                
                /* callback when data is ADDED to the current filter results */
                function reduceAddGrp(key) {             
                    return function (p, v) {
                        ++p.count;
                        p.total += v[key];
                        p.avg = Math.floor(p.total / p.count);
                        p.receiptAccount = v.receiptAccount;
                        (v.receiptAccount === 'Cash') ? ++p.receiptAccountCash : ++p.receiptAccountDebt;
                        p.receiptAccountCashPercent = Math.round(100 * p.receiptAccountCash / p.count, 1) + '%';
                        p.receiptAccountDebtPercent = Math.round(100 * p.receiptAccountDebt / p.count, 1) + '%';
                        //if (v.receiptAccount === 'Cash') { ++p.receiptAccountCash; p.receiptAccountCashPercent = Math.round(p.receiptAccountCash / p.count, 1) + '%' }
                        //else { ++p.receiptAccountDebt; p.receiptAccountDebtPercent = Math.round(p.receiptAccountDebt / p.count, 1) + '%' }

                        return p;
                    }
                };
                /* callback when data is REMOVED from the current filter results */
                function reduceRemoveGrp(key) {
                    return function (p, v) {
                        --p.count;
                        p.total -= v[key];
                        p.avg = Math.floor(p.total / p.count);
                        p.receiptAccount = v.receiptAccount;
                        (v.receiptAccount === 'Cash') ? --p.receiptAccountCash : --p.receiptAccountDebt;
                        p.receiptAccountCashPercent = Math.round(100 * p.receiptAccountCash / p.count, 1) + '%';
                        p.receiptAccountDebtPercent = Math.round(100 * p.receiptAccountDebt / p.count, 1) + '%';
                        //if (v.receiptAccount === 'Cash') { --p.receiptAccountCash; p.receiptAccountCashPercent = Math.round(p.receiptAccountCash / p.count, 1) + '%' }
                        //else { --p.receiptAccountDebt; p.receiptAccountDebtPercent = Math.round(p.receiptAccountDebt / p.count, 1) + '%' }

                        return p;
                    }
                };
                /* INITIALIZE p */
                function reduceInitialGrp() {
                    return function () {
                        return { count: 0, total: 0, avg: 0, receiptAccountCash: 0, receiptAccountDebt: 0, receiptAccountCashPercent: 0, receiptAccountDebtPercent: 0 };
                    };
                };

                var xf = crossfilter(data);
                var all = xf.groupAll();
                var groupName = 'A';
                rowStackChart = dc_.rowChart("#rowStackChart");
                stackChart = dc_.barChart("#stackChart");
                receiptsAmountByMonthBarChart = dc_.barChart("#receiptsAmountByMonthBarChart");
                amountClassesPieChart = dc_.pieChart("#amountClassesPieChart");
                receiptsAmountByYearPieChart = dc_.pieChart("#receiptsAmountByYearPieChart");
                bubbleChart = dc_.bubbleChart("#bubbleChart");
                visTableByYear = dc_.dataTable('#visTable');
                geoChoropleth = dc_.geoChoroplethChart('#geoChoropleth');
                map = dc_leaflet.markerChart("#map", groupName);
                mapBubble = dc_leaflet.bubbleChart('#mapBubble', groupName);
                mapLeafletChoropleth = dc_leaflet.choroplethChart("#mapLeafletChoropleth", groupName);
                receiptCountByMonthRowChart = dc_.rowChart("#receiptCountByMonthRowChart");
                visCount = dc_.dataCount('#visCount');

                var quantizeAmountClasses = d3.scale.quantize().domain(d3.extent(data, receiptTotalAccessor)).range(['lowest', 'low', 'medium', 'high', 'highest']);
           
                var quantizeAmountDim = xf.dimension(
                    function (d) {
                        return quantizeAmountClasses(d.receiptTotal);
                    }
                ),
                quantizeAmountGroup = quantizeAmountDim.group().reduceCount(receiptTotalAccessor);
                console.log(quantizeAmountDim.top(1)[0]); console.log(quantizeAmountGroup.all());

                var center = [33.8579, 35.5325];

                //$scope.charts = [
                //    { id: 'receiptsAmountByMonthBarChart', title: 'الإستلامات الشهرية', type: 'bar', order: 9 },
                //    { id: 'patientCategoryPieChart', title: 'جدول الموردين', type: 'pie', order: 2 },
                //    { id: 'yearChart', title: 'yearChart', type:'row', order: 3 },
                //    { id: 'ageChart', title: 'ageChart', type: 'bar', order: 4 },
                //    { id: 'ageChart2', title: 'ageChart2', type: 'bar', order: 5 },
                //];

                //---------------------------------------------
                /*
                  @Discription
                  This to make sure not to take any filter out of the defined filters
                  @example: /?author=aa&title=tt&other=xx
                  "other" filter will not taken into account because it is not a property of Filters obj defined below:
                 */
                $scope.filerAutocomplete = (query) =>[
                    { key: 'map', value: '43.05273,26.58972' },
                    { key: 'mapLeafletChoropleth', value: ['Batroun', 'Akkar'] },
                    { key: 'receiptsAmountByYearPieChart', value: '2017' },
                    { key: 'cKey', value: 'cValue' }
                ];
                $scope.filterTagAdded = (tag) => {
                    var chart = eval(tag.key);
                    chart.filter(tag.value);
                    $timeout(() =>chart.redrawGroup(), 0);
                    console.log('filter added', tag);
                }
                $scope.filterTagRemoved = (tag) => {
                    console.log('filter removed', tag.key);
                    var chart = eval(tag.key);
                    chart.filterAll();
                    /*wait a bit. if more than 1 chart are filtered, digest needs time to finish*/
                    $timeout(() =>chart.redrawGroup());//, 0
                    /* update the query search url*/
                    var paramsString = $location.search();
                    var searchParams = new URLSearchParams(paramsString);
                    //for (let p of searchParams) {
                    //    console.log(p);
                    //}                    
                    searchParams.delete(tag.key);
                    //searchParams.set(tag.key, tag.value); //or simply: $location.search('f', [1, 2]);
                    $location.search(searchParams);
                    //clearQuerySearchUrl();
                };

                // read filters from the query string
                $scope.readUrlQueryString = () => { $timeout(() => { $scope.$apply(() => { $scope.filters = urlQueryStringService.getFilters(default_filters); }); }); }

                //---------------------------------------------
                var receiptAccountDimension = xf.dimension(function (d) { return d.receiptAccount; }),
                    dateIntervalDim,
                    receiptAmountDateIntervalGrp,
                    dayDimension = xf.dimension(function (d) { return dayNameFormat(d.date) }),
                    monthDimension = xf.dimension(function (d) { return d.month; }),
                    receiptAmountMonthGrp = monthDimension.group().reduceSum(receiptTotalAccessor),
                    yearDimension = xf.dimension(function (d) { return d.year; }),
                    receiptAmountYearGrp = yearDimension.group().reduceSum(receiptTotalAccessor),
                
                    dateDim = xf.dimension(function (d) { return d["date"]; }),
                    districtDim = xf.dimension(function(d) { return d["district"]; }),
                    totalreceiptsByDistrict = districtDim.group().reduceSum(receiptTotalAccessor);
                var temp='', obj={};
                var receiptCountByAccount = receiptAccountDimension.group().reduce(
                        function (p, v) {
                            ++p.count;
                            p.total += parseInt(v.receiptTotal);
                            p.avg = Math.floor(p.total / p.count);
                            p[v.receiptAccount] = (p[v.receiptAccount] || 0) + 1;
                            //p[v.receiptAccount] = (p[v.receiptAccount] || 0) + ( p[v.receiptAccount] == v.receiptAccount ? 1 : 0)
                            p[v.receiptAccount + 'Percent'] = p[v.receiptAccount] / p.count;
                            temp=angular.copy(p);
                            return p;
                        },
                        function (p, v) {
                            --p.count;
                            p.total -= parseInt(v.receiptTotal);
                            p.avg = Math.floor(p.total / p.count);
                            p[v.receiptAccount] = (p[v.receiptAccount] || 0) - 1;
                            //p[v.receiptAccount] = (p[v.receiptAccount] || 0) - (p[v.receiptAccount] == v.receiptAccount ? 1 : 0);
                            p[v.receiptAccount + 'Percent'] = p[v.receiptAccount] / p.count;
                            temp=angular.copy(p);
                            return p;
                        },
                        function () {
                            console.log(temp);
                            for (var property in temp) {
                                console.log(property);
                                obj[property] = 0;
                            };
                            console.log('obj: ', obj);
                            return {
                                Cash: 0,
                                CashPercent:0,
                                Cheque:0,
                                ChequePercent:0,
                                'Credit Card': 0,
                                'Credit CardPercent':0,
                                Debt:8,
                                DebtPercent:0,
                                avg:0,
                                count: 0,
                                total: 0
                            };
                        }
                    );
                console.log(receiptCountByAccount.all());
                var receiptCountMonthGroup = monthDimension.group().reduce(reduceAddGrp('receiptItemsCount'), reduceRemoveGrp('receiptItemsCount'), reduceInitialGrp());
                var receiptAmountMonthGrpReduce = monthDimension.group().reduce(reduceAddGrp('receiptTotal'), reduceRemoveGrp('receiptTotal'), reduceInitialGrp());


                var minDate = dateDim.bottom(1)[0]["date"];
                var maxDate = dateDim.top(1)[0]["date"];

                var minYear = d3.min(data, function (d) { return d.year; }),
                    maxYear = d3.max(data, function (d) { return d.year; }),
                    minMonth = d3.min(data, function (d) { return d.month; }),
                    maxMonth = d3.max(data, function (d) { return d.month; });

                var minMonthOffset = d3.time.month.offset(minMonth, -1),
                    maxMonthOffset = d3.time.month.offset(maxMonth, 2);

                console.log(minMonthOffset, maxMonthOffset);

                $scope.records = [];
                $scope.toggleContextualMenu = function (isOpen)
                {
                    if (isOpen) {

                    } else
                    {
                        var months = angular.copy(receiptAmountMonthGrp.all());
                        months.forEach(function (d) {
                            d.key = yearMonthNameFormat(d.key);
                            d.value = commaSeparatedFormat(d.value);
                            return d;
                        }); 
                        $scope.records = months;
                    }
                    $scope.isContextualMenuOpen = !isOpen;
                }

                $scope.resetFilterAll = function () {
                    dc_.chartRegistry.list(groupName).forEach(chart => {
                        if (chart.filters().length > 0) {
                            chart.filterAll();
                            $timeout(() => chart.redrawGroup(), 0);
                        }
                    });
                };


                //var tip = d3.tip().attr('class', 'd3-tip').html(function(p) {
                //    return '<span><h2>' + p.key + "</h2><ul>" + "<li>Number of MEPs: " + p.value.count + "</li>" + "<li>Average participation: " + Math.floor(p.value.effort / p.value.count) + "</li>" + "<li>Average score: " + Math.floor(p.value.score / p.value.count);
                //    '</li></ul></span>'
                //}).offset([-12, 0])

                //.on("postRender", function(c) {
                //    c.svg().selectAll("circle").call(tip).on('click.setHash', function(d) {
                //        window.location.hash = encodeURIComponent("party" + d.key);
                //    }).on('mouseover', function(d) {
                //        tip.attr('class', 'd3-tip animate').show(d)
                //    }).on('mouseout', function(d) {
                //        tip.attr('class', 'd3-tip').show(d)
                //        tip.hide()
                //    })
                //})
                var receiptAccountsByMonth = monthDimension.group().reduce(
                        function(p, v) {
                            p[v.receiptAccount] = (p[v.receiptAccount] || 0) + 1;
                            return p;}, 
                        function(p, v) {
                            p[v.receiptAccount] = (p[v.receiptAccount] || 0) - 1;
                            return p;}, 
                        function() {
                            return {};
                        }
                    );

                function createGrpFnForStack(valueKey) {
                    return function(d) {
                        return d.value[valueKey];
                    }
                }
                console.log(receiptAccountsByMonth.all());
                stackChart
                .chartGroup(groupName)
                .dimension(monthDimension)
                .group(receiptAccountsByMonth, 'Cash', createGrpFnForStack('Cash'))
                .x(d3.time.scale().domain(d3.extent(data, function (d) {
                    return d.date;
                })))
                .xUnits(d3.time.months)
                .title(function (p) {
                    return  [ 'Month: ' + monthNameFormat(p.key)
                            , 'Cash: ' + p.value.Cash
                            , 'Cheque: ' + p.value.Cheque
                            , 'Credit Card: ' + p.value['Credit Card']
                            , 'Debt: ' + p.value.Debt
                    ].join(',')//.concat('\n')
                })
                .brushOn(false)
                .controlsUseVisibility(true)
                .legend(dc_.legend()/*.x(400).y(5).itemHeight(15).gap(5).horizontal(true)*/)

                var receiptAccounts = receiptCountByAccount.all().map(r=> r.key)
                receiptAccounts.forEach(function (receiptAccount, i) {
                    stackChart.stack(receiptAccountsByMonth, receiptAccount, createGrpFnForStack(receiptAccount));
                });
                stackChart
                //pretransition renderlet
                    .on('pretransition', function (chart) {
                        chart.selectAll('rect.bar')
                            .on('click', function (d) {
                                chart.filter(d.layer);
                                dc_.redrawAll();
                            })
                            .classed('stack-deselected', function (d) {
                                // display stack faded if the chart has filters AND
                                // the current stack is not one of them
                                var key = d.layer;
                                return chart.filter() && chart.filters().indexOf(key) === -1;
                            });
                    })
                    .on('renderlet', function (chart) {
                        chart.selectAll('.dc-legend-item')
                            .on('click', function(d) {
                                chart.filter(d.name);
                                dc_.redrawAll();
                            })
                    })
                    .render();

                $scope.stackChartInfo = {
                    id: stackChart.anchorName(),
                    type: 'bar',
                    chart: stackChart,
                    title: 'التراكمات',
                    iconClass: 'fa-bar-chart'
                }



                var receiptsCountByDay = dayDimension.group();
                var reducer = reductio()
                  //.value('receiptTotal')
                    .sum(receiptTotalAccessor)
                    .count(true)
                    .min(receiptTotalAccessor)
                    .max(true)
                    .median(true)
                    .avg(true);
                reducer(receiptsCountByDay);
                console.log(receiptsCountByDay.all());
                var days = receiptsCountByDay.all().map(r=> r.key)
           
                rowStackChart
                    .chartGroup(groupName)
                    .dimension(dayDimension, days[0])
                    .group(receiptsCountByDay)
                    .valueAccessor(function (d) { return d.value.count; })
                    .x(d3.scale.ordinal())
                    .elasticX(true)
                    .controlsUseVisibility(true)
                /* STACK for the rowChart is not supported as of v2.0.2 */
                //days.slice(1).forEach(function (day, i) {
                //    rowStackChart.stack(receiptsCountByDay, day, createGrpFnForStack(day));
                //});
                rowStackChart.render();

                $scope.rowStackChartInfo = {
                    id: rowStackChart.anchorName(),
                    type: 'rowChart',
                    chart: rowStackChart,
                    title: 'التداولات وفق أيام الأسبوع',
                    iconClass: 'fa-bar-chart'
                }

                $scope.onaggrPatternChange = function () {
                    var accessor = $scope.aggrPattern;
                    rowStackChart
                        //.xAxisLabel(function (d) { return accessor; })
                        //.chartTitle(accessor)
                        .valueAccessor(function (d) { return d.value[accessor]; })
                        .render();
                    dc_.redrawAll();
                }

                var max_district = totalreceiptsByDistrict.top(1)[0].value; //console.log(max_district);

                geoChoropleth
                    .width(1000)
                    .height(430)
                    .chartGroup(groupName)
                    .dimension(districtDim)
                    .group(totalreceiptsByDistrict)
                    .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
                    .colorDomain([0, max_district])
                    // * 1st param - geojson data
                    // * 2nd param - name of the layer which will be used to generate css class
                    // * 3rd param - (_optional_) a function used to generate key for geo path, it should match the dimension key in order for the coloring to work properly
                    .overlayGeoJson(geojsonLbnFeatureColl.features, 'DISTRICT', function (d) {
                        return d.properties.DISTRICT;
                    })
                    .projection(d3.geo.mercator()
                        .scale(10000)
                        //[35.3, 33.6]
                        .center([37.6, 33.5]))
                    .title(function (p) {
                        return "District: " + p.key
                                + "\n"
                                + "Total Receipts: " + commaSeparatedFormat(p.value ? p.value : 0) + "$"; //Math.round(p.value)
                    })
                    .controlsUseVisibility(true)
                    .render();

                $scope.geoChoroplethInfo = {
                    id: geoChoropleth.anchorName(),
                    type: 'geoChoropleth',
                    chart: geoChoropleth,
                    title: 'المناطق الجغرافية',
                    iconClass: 'fa-map-marker'
                }

                mapLeafletChoropleth
                    .width(400)
                    .height(300)
                    .chartGroup(groupName)
                    .dimension(districtDim)
                    .group(totalreceiptsByDistrict)
                    .geojson(geojsonLbnFeatureColl)
                    .center(center)
                    .zoom(7)
                    .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
                    .colorDomain([0, max_district])
                    .colorAccessor(function (d, i) {
                        return d.value;
                    })
                    .featureKeyAccessor(function (feature) {
                        return feature.properties.DISTRICT;
                    })
                    .renderPopup(true)
                    .popup(function (d, feature) {
                        return feature.properties.DISTRICT + " : " + d.value;
                    })
                    .controlsUseVisibility(true)
                    .legend(dc_leaflet.legend().position('bottomright'))
                    .render();
                $scope.mapLeafletChoroplethInfo = {
                    id: mapLeafletChoropleth.anchorName(),
                    type: 'mapLeafletChoropleth',
                    chart: mapLeafletChoropleth,
                    title: 'المناطق الجغرافية',
                    iconClass: 'fa-map-marker'
                }

                receiptsAmountByMonthBarChart
                    .chartGroup(groupName)
                    //.valueAccessor(function (p) {
                    //    return p.value.count; //> 0 ? p.value.total / p.value.count : 0;//p.value;
                    //})
                    //.x(d3.time.scale().domain([minDate, maxDate]))
                    .x(d3.time.scale()) //.domain([minMonth, maxMonth])//.domain([new Date('2016-1-1'), new Date('2017-11-31')]))
                    //.x(d3.time.scale().domain([d3.time.month.offset(minMonth, -1), d3.time.month.offset(maxMonth, 2)]))
                    //.round(d3.time.month.round)
                    .xUnits($scope.dateInterval.range) //d3.time.months
                    //.gap(5)
                    .elasticX(true)
                    //.y(d3.scale.linear().domain([0, 4])) //ordinal()
                    .elasticY(true)
                    //.yAxisLabel('Amount')
                    //.barPadding(0.1)
                    //.outerPadding(0.05)
                    //.yAxisPadding('15%')
                    .title(function (d) { return d.key; })
                    .label(function (d) {
                        //console.log(d.data.value);
                        return commaSeparatedFormat(d.data.value);
                    })
                    .margins({left:70, right:30, top:10, bottom:20})
                    .brushOn(true)
                    .turnOnControls(true)
                    .controlsUseVisibility(true);
                receiptsAmountByMonthBarChart.yAxis().tickFormat(siPrefixFormat);
                receiptsAmountByMonthBarChart.yAxis().orient('right');
                //receiptsAmountByMonthBarChart.yAxis().ticks().tickSize(5, 0).tickFormat(d3.format("0"));

                $scope.onDateIntervalChange = function () {
                    if (dateIntervalDim) {
                        dateIntervalDim.dispose();
                        receiptAmountDateIntervalGrp.dispose();
                    }
                    dateIntervalDim = xf.dimension(function (d) { return $scope.dateInterval(d.date) });
                    receiptAmountDateIntervalGrp = dateIntervalDim.group().reduceSum(receiptTotalAccessor);
                    receiptsAmountByMonthBarChart
                        .dimension(dateIntervalDim)
                        .group(receiptAmountDateIntervalGrp)
                        .render();
                }
                $scope.onDateIntervalChange(); //initiate the dimention & group
                $scope.receiptsAmountByMonth = {
                    id: receiptsAmountByMonthBarChart.anchorName(),
                    type: 'bar',
                    chart: receiptsAmountByMonthBarChart,
                    title: 'الإستلامات الشهرية',
                    iconClass: 'fa-bar-chart'
                }

                receiptsAmountByYearPieChart
                    .chartGroup(groupName)
                    .dimension(yearDimension)
                    .group(receiptAmountYearGrp)
                    //.radius(105)
                    .innerRadius(60)
                    //.externalLabels(20)
                    //.externalRadiusPadding(20)
                    //.slicesCap(4)
                    //.drawPaths(true)
                    .legend(dc_.legend().x(60)) //.legend(dc_.legend().x(5).y(20).itemHeight(13).gap(5))
                    .title(function (d) {
                        return               d.key + '\n' +
                               'Amount: ' + commaSeparatedFormat(d.value) + '\n' +
                               'Percent: ' + percentageFormat(d.value / all.value());
                    })
                    //.label(function (d) { return numberFormat(d.value) + '\n' + Math.round(Math.floor(d.value / all.value() * 100),1) + '%' })
                    .controlsUseVisibility(true)
                    //.renderLabel(true)
                    .render();
                $scope.receiptsAmountByYear = {
                    id: receiptsAmountByYearPieChart.anchorName(),
                    type:'pie',
                    chart: receiptsAmountByYearPieChart,
                    title: 'الإستلامات السنوية',
                    iconClass: 'fa-pie-chart'
                }

                amountClassesPieChart
                    .chartGroup(groupName)
                    .dimension(quantizeAmountDim)
                    .group(quantizeAmountGroup)
                    //.radius(105)
                    .innerRadius(60)
                    .title(function (d) {
                        return d.key + '\n' +
                                '# of Receipts: ' + commaSeparatedFormat(d.value) + '\n' +
                                'Percent: ' + percentageFormat(d.value / all.value());
                    })
                    //.label(function (d) { return d.key + ' ' + d.value + '\n' + Math.round(Math.floor(d.value / all.value() * 100), 1) + '%' })
                    .controlsUseVisibility(true)
                    .render();
                $scope.amountClassesPieChartInfo = {
                    id: amountClassesPieChart.anchorName(),
                    type: 'pie',
                    chart: amountClassesPieChart,
                    title: 'التقسيمات',
                    iconClass: 'fa-pie-chart'
                }

                visCount
                    .chartGroup(groupName)
                    .dimension(xf)
                    .group(all)
                    .render();

                var tableFltrs = [];
                visTableByYear
                    .chartGroup(groupName)
                    .dimension(monthDimension)
                    //DataTable does not use crossfilter group but rather a closure as a grouping function
                    .group(function (d) {                   
                        return d.year + '/' + d.monthName;
                    })
                    .columns([
                        'monthName',
                        {
                            label: 'Receipt Total',
                            format: function (d) {
                                return commaSeparatedFormat(d.receiptTotal);
                            }
                        }
                    ])
                    .on('renderlet',function (table) {
                        table.selectAll('.dc-table-group').classed('bg-black-light-overlay', true);
                    })
                    .on('pretransition', function (table) {
                        table.selectAll('.dc-table-column')
                            .on('click', d => {
                                console.log(d);
                                var filterValue = d.month;
                                //monthDimension.filterFunction(d => { console.log(d); return d == filterValue /*(d.date < Date('2016-10-10'))*/})
                                monthDimension.filter(filterValue);
                                visTableByYear.redraw();
                                dc_.redrawAll();
                            });
                    })
                    //.filterHandler(function (dim, filters) {
                    //    console.log(dim, filters);
                    //    if (filters[0]) if (tableFltrs.indexOf(filters[0]) > -1) tableFltrs.splice(0, 1); else tableFltrs.push(filters[0])
                    //    dim.filter(tableFltrs) //fltrs.length > 0 ? fltrs : null;
                    //    //dc_.filterAll(fltrs);
                    //    dc_.redrawAll();
                    //    console.log('vizTable Filter: ', tableFltrs);
                    //    return tableFltrs;
                    //})
                    //.controlsUseVisibility(true)
                    .render();

                $scope.visTableConfig = {
                    id: visTableByYear.anchorName(),
                    type: 'table',
                    chart: visTableByYear,
                    title: 'جدول الموردين',
                    iconClass: 'fa-table'
                }

                var locations = xf.dimension(function (d) { return d.geo; });
                var locationsGroup = locations.group().reduceCount();

                map
                   .dimension(locations)
                   .group(locationsGroup)
                   .width(360)
                   .height(360)
                   .center([42.69, 25.42])
                   .zoom(7)
                   .cluster(true)
                 //.tiles()
                   .controlsUseVisibility(true)
                   .render();

                $scope.mapInfo = {
                    id: map.anchorName(),
                    type: 'mapMarker',
                    chart: map,
                    title: 'التوزّع الجغرافي',
                    iconClass: 'fa-map-marker'
                }

                var cities = xf.dimension(function (d) { return d.city; });
                var citiesGroup = cities.group().reduceCount();
                var fltrs = [];
                mapBubble
                    .dimension(cities)
                    .group(citiesGroup)
                    //.locationAccessor(function (d) {
                    //    return d.key;
                    //})
                    .r(function (d) {                  
                        return d * 1.5;//console.log(d);
                    })
                    .selectedColor(function (d) { return console.log('mapBubble selectedColor', d); })
                    .controlsUseVisibility(true)
                    //.selectedColor()
                    //.colorAccessor(function (d, i) {
                    //    return d.value;
                    //})
                    //.featureKeyAccessor(function (feature) {
                    //    return feature.properties.code;
                    //})
                    //.renderPopup(true)
                    //.popup(function (d, feature) {
                    //    return feature.properties.nameEn + " : " + d.value;
                    //})
                    .center([43.06086137134326, 27.213134765625004])
                    .zoom(7)
                    .title(function (d) {
                        return 'City (lng, lat): ' + d.key
                                + '\n'
                                + 'COUNT: ' + d.value;
                    })
                    .filterHandler(function (dim, filters) {
                        //            console.log(dim, filters);
                        if (filters[0]) if (fltrs.indexOf(filters[0]) > -1) fltrs.splice(0, 1); else fltrs.push(filters[0])
                        dim.filter(fltrs) //fltrs.length > 0 ? fltrs : null;
                        //             dc_.filterAll(fltrs);
                        dc_.redrawAll();
                        console.log('mapBubble Filter: ', fltrs);                    
                        return fltrs;
                    })
                    .on('renderlet', function (chart) {
                        console.log(chart.filters());
                        //chart.on('click',function(d){//'filtered'
                        //    chart.dimention().filter();
                        //})
                        //chart.selectAll('.leaflet-interactive') //path.leaflet-interactive
                        //    .on('click', function (d) {
                        //        console.log(d);
                        //        chart.filter(d.name);
                        //        dc_.redrawAll();
                        //    })
                    })
                    .controlsUseVisibility(true)
                    .render();
                mapBubble.map().on('moveend', function (map) { console.log('mapBubble moveend', map.target.getCenter()); });
                mapBubble.map().on('filter', function (map) { console.log('>>> mapBubble filter' )});

                $scope.mapBubbleInfo = {
                    id: mapBubble.anchorName(), //mapBubble.anchor() << this gives the (#) with the name
                    type: 'mapBubble', //mapBubble
                    chart: mapBubble,
                    title: 'الموقع الجغرافي',
                    iconClass: 'fa-map-marker'
                }

                bubbleChart
                    .chartGroup('A')
                    .dimension(monthDimension)
                    .group(receiptAmountMonthGrpReduce)//receiptCountMonthGroup //receiptCountByAccount
                    .valueAccessor(function (p) {
                        return p.value.total; //p.value.count > 0 ? p.value.total / p.value.count : 0;
                    })
                    .radiusValueAccessor(function (p) {
                        return p.value.count;
                    })
                    .colors(d3.scale.category10())
                    .minRadiusWithLabel(20).elasticRadius(true).maxBubbleRelativeSize(0.06)
                    .title(function (d) {
                        return 'TOTAL: ' + commaSeparatedFormat(d.value.total)
                                + '\n'
                                + 'COUNT: ' + d.value.count;
                    })
                    .label(function (d) {
                        return 'TOTAL: ' + commaSeparatedFormat(d.value.total)
                                + '\n'
                                + 'DATE: ' + dateFormat(d.key);
                    })
                    .controlsUseVisibility(true)
                    //.x(d3.scale.linear())
                    //.x(d3.time.scale().domain([minMonthOffset, maxMonthOffset]))//.domain([minMonth, maxMonth])
                    .x(d3.time.scale().domain(d3.extent(data, function(d) {
                        return d.date;
                    })))
                    .elasticX(true)
                    .elasticY(true)
                    .yAxis().tickFormat(siPrefixFormat);
                bubbleChart.render();

                $scope.bubbleChartInfo = {
                    id: bubbleChart.anchorName(),
                    type: 'bubbleChart',
                    chart: bubbleChart,
                    title: 'الإستلامات',
                    iconClass: 'fa-map-marker'
                }

                receiptCountByMonthRowChart
                    .chartGroup(groupName)
                    .dimension(receiptAccountDimension)
                    .group(receiptCountByAccount)
                    .x(d3.scale.ordinal()) //.xUnits(dc_.units.ordinal)
                    .valueAccessor(function (p) {
                        return p.value.count;//> 0 ? p.value.total / p.value.count : 0;
                    })                
                    //.y(d3.time.scale().domain([d3.time.month.offset(minMonth, -1), d3.time.month.offset(maxMonth, 2)]))
                    //.yUnits(d3.time.months)
                    .elasticX(true)
                    .turnOnControls(true)
                    .ordering(d3.descending)
                    .legend(dc_.legend()) //dc_.legend().x(400).y(10).itemHeight(13).gap(5)
                    //.renderVerticalGridLines(false)
                    .title(function (d) {
                        var output = 'Account: ' + d.key + '\n';
                        for (var property in d.value) {
                            output += property +':' + d.value[property] + '\n';
                        };
                        return output;
                    })
                    .height(150)
                    .width(300)
                    .controlsUseVisibility(true)
                    .render();

                $scope.receiptCountByMonthRowChartInfo = {
                    id: receiptCountByMonthRowChart.anchorName(),
                    type: 'rowChart',
                    chart: receiptCountByMonthRowChart,
                    title: 'عدد الإستلامات الشهرية',
                    iconClass: 'fa-bar-chart'
                }

                //ageChart2
                //    .chartGroup('1')
                //    .dimension(ageDimension)
                //    .group(ageCountGroup)
                //    .barPadding(0.1)
                //    .outerPadding(0.05)
                //    .gap(3)
                //    .width(400)
                //    .brushOn(true)
                //    .valueAccessor(function (p) {
                //        return p.value.count;//> 0 ? p.value.total / p.value.count : 0;
                //    })
                //    .x(d3.scale.ordinal().domain([0, d3.max(data, function (d) { return d.age; })]))
                //    //.y(d3.scale.linear().domain([0, 4])) //ordinal()
                //    //.x(d3.scale.linear().domain([0, 9]))
                //    //.xAxis(d3.scale.linear().domain([0, 9]))
                //    .xUnits(dc_.units.ordinal)
                //    //.ticks(d3.time.month, 2)
                //    .elasticX(true)
                //    .elasticY(true)
                //    .yAxisLabel("This is the Y Axis!")
                //    .yAxisPadding('15%')
                //    .title(function (d) {
                //        return 'Count: ' + d.value.count
                //                + '\n'
                //                + 'Category: ' + d.value.category
                //                + '\n'
                //                + 'CatInPatient: ' + d.value.CatInPatient + ', CatOutPatient: ' + d.value.CatOutPatient
                //                + '\n'
                //                + 'InPatientPercent: ' + d.value.CatInPatientPercent
                //                + '\n'
                //                + 'OutPatientPercent: ' + d.value.CatOutPatientPercent
                //    })
                //    .width(300)
                //    .height(200)
                //    //.margins({left: 80, top: 20, right: 10, bottom: 20})
                //    .controlsUseVisibility(true)
                //    .render();
                //    ageChart2.yAxis().tickSize(3, 0).tickFormat(d3.format("d"))
                //    //ageChart2.yAxis().ticks().tickSize(5, 0).tickFormat(d3.format("0"))

                function clearQuerySearchUrl() {
                    $location.search({});
                }

                dc_.renderlet(function (e) {
                    dc_.events.trigger(function () {
                        var isFiltered, htmlCode = "<small>FILTERS APPLIED | ";
                        if ($scope.filtersList.length > 0) {
                            /* force the inputTag to update the UI */
                            $scope.$apply(function () {
                                //clearQuerySearchUrl();  //<<- don't clear the url
                                /*to avoid duplicate, clean it up and it will be rebuild just below*/
                                $scope.filtersList = [];
                            });
                        }
                        dc_.chartRegistry.list(groupName).forEach(chart => {
                            //trying to automatically grab the <dimention> key
                            //console.log(chart.dimension().top(1)[0], chart.group().top(1)[0].key);

                            if (chart.filters().length > 0) {
                                isFiltered = true;
                                var f = chart.filters();
                                f = f.map((r) => {
                                    if (r instanceof Array) r = r.map((rr) => { if (rr instanceof Date) rr = dateFormat(rr); return rr; })
                                    else if (r instanceof Date) r = dateFormat(r);
                                    return r;
                                });
                                htmlCode += '<i class="fa fa-filter"></i> <span class="text-md">' + chart.anchorName() + '</span>=<span class="text-md">' + f + "</span>";

                                $scope.$apply(function () {
                                    $location.search(chart.anchorName(), f);
                                    $scope.filtersList.push({ key: chart.anchorName(), value: f });
                                });
                            }
                            /*when removing all filters, clean the url*/
                            //clearQuerySearchUrl();
                        });
                        // do the following once
                        if (isFiltered) htmlCode += '<a href="" class="reset"> <strong>RESET</strong></a>'; //ng-click="resetFilterAll()"
                        htmlCode += '</small>';
                        d3.select("#filters").html(htmlCode);
                        d3.select("#filters").classed('ng-hide', !isFiltered);
                        /* in case filters removed individually (not through RESET ALL) */
                        //if (!isFiltered) clearQuerySearchUrl();
                    });
                });
                $scope.stackedBar = [
                    { value: 23, type: 'success' },
                    { value: 34, type: 'info' },
                    { value: 15, type: 'danger' },
                    { value: 19, type: 'warning' }
                ];
            }

            //$timeout(() => {
                $http.get('./home/data.json').then(
                    (dd) => {
                       /*OPTION 1: filter the raw data*/
                        //data = filterData(dd.data);
                        //if (data.length>0) initialize();
                       /*OPTION 2: apply chart filters*/
                        data = dd.data;
                        if (data.length > 0) {
                            initialize();
                            applyChartFilters();
                        }
                    },
                    (err) => console.log(err)
                    );
        //    grapData();
            
        //}, 2000);
        }
    })();