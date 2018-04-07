/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/visJS/vis-timeline-graph2d.min.js" />
/// <reference path="../scripts/libs/leaflet/leaflet.min.js" />

(function () {
    'use strict';
    angular
    .module("app")
    .controller("mapLeafletTimelineCtrl", mapLeafletTimelineCtrl);
    
    function mapLeafletTimelineCtrl()
    {
        var txtData = document.getElementById('data');

        // Create an empty DataSet.
        // This DataSet is used for two way data binding with the Timeline.
        var items = new vis.DataSet();
        var container = document.getElementById('timeline');
        var timelineOptions = {
            //stack: false,
            //start: '2014-01-10',
            //end: '2014-02-10',
            //editable: true
            "width":  "100%",
            "height": "120px",
            showTooltips:true,
            //"type": "box", //style: ""
            //"axisOnTop": true,
        };

        var startTime = new Date(demoTracks[0].properties.time[0]);
        var endTime = new Date(demoTracks[0].properties.time[demoTracks[0].properties.time.length - 1]);
        // Create a DataSet with data
        var timelineData = new vis.DataSet([{ start: startTime, end: endTime, content: 'Demo GPS Tracks' }]);

        var timeline = new vis.Timeline(container, timelineData, timelineOptions);

        // Set custom time marker (blue)
        timeline.addCustomTime(startTime, 'timelineMarker');  //setCustomTime()

        function loadDataTimeline () {
            var data = JSON.parse(txtData.value);
            items.add(data);
            timeline.fit();
        }

        // load the initial data
//        loadDataTimeline();


        var iconMarker = L.ExtraMarkers.icon({
            //innerHTML:'',
            icon: 'fa-bank',
            iconColor: 'blue',
            extraClasses: 'fa-5x fa-pulsate', //faa-burst animated //faa-pulse animated //faa-float animated //faa-flash animated //faa-fast faa-slow
            markerColor: 'cyan', //'red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light', 'black', or 'white'
            //number:'', //Instead of an icon, define a plain text. '1' or 'A', must set icon: 'fa-number'
            shape: 'square',
            prefix: 'fa'
        });
        var center = [44.5, -123.6];


             var map = L.map('map1', {
                fullscreenControl: {
                    pseudoFullscreen: false
                }
            }).setView(center, 10);

            var tileCartoDB = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(map);


            //..... LAYERS / CONTROLS ............
            //var baseMaps = {
            //    'CartoDB Dark': tileCartoDB
            //},
            //   overlayMaps = {
            //       'Playback layers': timelineLayer
            //   }

            //L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: true }).addTo(map);

        // =====================================================
        // =============== Playback ============================
        // =====================================================

        // Playback options
        var playbackOptions = {

            playControl: true,
            dateControl: true,

            // layer and marker options
            layer: {
                pointToLayer: function (featureData, latlng) {
                    var result = {};

                    if (featureData && featureData.properties && featureData.properties.path_options) {
                        result = featureData.properties.path_options;
                    }

                    if (!result.radius) {
                        result.radius = 5;
                    }

                    return new L.CircleMarker(latlng, result);
                }
            },

            marker: {
                getPopup: function (featureData) {
                    var result = '';

                    if (featureData && featureData.properties && featureData.properties.title) {
                        result = featureData.properties.title;
                    }

                    return result;
                }
            }

        };

        // Initialize playback
        var playback = new L.Playback(map, null, onPlaybackTimeChange, playbackOptions);

        playback.setData(demoTracks);
//        playback.addData(blueMountain);

        // Uncomment to test data reset;
        //playback.setData(blueMountain);    

        // Set timeline time change event, so cursor is set after moving custom time (blue)
        timeline.on('timechange', onCustomTimeChange);

        // A callback so timeline is set after changing playback time
        function onPlaybackTimeChange(ms) {
            console.log('onPlaybackTimeChange');
            timeline.setCustomTime(new Date(ms), 'timelineMarker');
        };

        // 
        function onCustomTimeChange(properties) {
            console.log('onCustomTimeChange');
            if (!playback.isPlaying()) {
                console.log('onCustomTimeChange:if');
                playback.setCursor(properties.time.getTime());
            }
        }
    }
})();