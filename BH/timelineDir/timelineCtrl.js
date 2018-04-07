/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/leaflet/leaflet.min.js" />

(function () {
    'use strict';
    angular
    .module("app")
    .controller("timelineCtrl", timelineCtrl);
    
    function timelineCtrl()
    {
        var timelineOptions = {
            //debug: true,
            //hash_bookmark: true,
            //height: 40,
            start_at_end: false,
            default_bg_color: { r: 0, g: 0, b: 0 },
            //timenav_height: 50,
            //initial_zoom: 5,
            //scale_factor: 2,
            //zoom_sequence: [0.5, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
            //timenav_position:"top",
            //timenav_height_percentage: 15,
            //timenav_mobile_height_percentage: 25,
            //language: "en" // other language needs extra file to be loaded
        };

        var timeline = new TL.Timeline('timeline-embed', timeline_json_data, timelineOptions);
         // 'https://docs.google.com/spreadsheets/d/1cWqQBZCkX9GpzFtxCWHoqFXCHg-ylTVUWlnrdYMzKUI/pubhtml');
    }
})();