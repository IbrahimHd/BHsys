/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/dc/crossfilter.js"/>
/// <reference path="../scripts/libs/dc/dc.min.js"/>
/// <reference path="../scripts/libs/d3/d3.min.js"/>

(function () {
    'use strict';
    angular
    .module("app")
    .service('vizService',vizService)

    vizService.$inject = ['$window', 'debugMode'];
        
    function vizService($window, debugMode) {
        var debugThis = true;
        var self = this;
        self.resize = resize;

        var find_query = function () {
            var _map = window.location.search.substr(1).split('&').map(function (a) {
                return a.split('=');
            }).reduce(function (p, v) {
                if (v.length > 1)
                    p[v[0]] = decodeURIComponent(v[1].replace(/\+/g, " "));
                else
                    p[v[0]] = true;
                return p;
            }, {});
            return function (field) {
                return _map[field] || null;
            };
        }();

        var resizeMode = find_query('resize') || 'widhei';

        function resize(chart, w, h, onresize) {
            function adjustSize(chart, w, h) {
                chart
                    //.width(window.innerWidth - adjustX) //-20
                    //.height(window.innerHeight - adjustY) //-20
                    .width(w) //-20
                    .height(h) //-20
                    .rescale()
                    .redraw();
            }

            if (resizeMode.toLowerCase() === 'viewbox') {
                chart
                    .width(600)
                    .height(400)
                    .useViewBoxResizing(true);
                //d3.select(chart.anchor()).classed('fullsize', true);
            } else {
                //adjustX = adjustX || 0;
                //adjustY = adjustY || adjustX || 0;

                adjustSize(chart, w, h);

                //window.onresize = function () {
                //    adjustSize(chart, window.innerWidth -70 , window.innerHeight -170);
                //    if (angular.isFunction(onresize)) {
                //        onresize(chart);
                //    }
                //};
            }
        }    
    }
})();

