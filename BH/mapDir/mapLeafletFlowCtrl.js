/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/leaflet/leaflet.min.js" />
/// <reference path="../scripts/libs/leaflet/flow/CanvasFlowmapLayer.js" />

(function () {
    'use strict';
    angular
    .module("app")
    .controller("mapLeafletFlowCtrl", mapLeafletFlowCtrl);
    mapLeafletFlowCtrl.$inject = ['$timeout'];
    function mapLeafletFlowCtrl($timeout)
    {
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
        var center = [7, 139];
        var layersArray = [];
        var map = L.map('map1', {
                fullscreenControl: {
                    pseudoFullscreen: false
                }
        }).setView(center, 3);

        var tileCartoDB = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        var flowLayer;
        var customLayerId = 0;

        /* LOAD DATA FROM CSV FILE*/
        function loadData(csvFilePath) {
            d3.csv(csvFilePath, function (csvResult) {
                var geoJsonFeatureCollection = {
                    type: 'FeatureCollection',
                    features: csvResult.map(function (datum) {                    
                        return {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [datum.s_lon, datum.s_lat]
                            },
                            properties: datum
                        }
                    })
                }

                flowLayer = L.canvasFlowmapLayer(geoJsonFeatureCollection, {
                    originAndDestinationFieldIds: {
                        originUniqueIdField: 's_city_id',
                        originGeometry: {
                            x: 's_lon',
                            y: 's_lat'
                        },
                        destinationUniqueIdField: 'e_city_id',
                        destinationGeometry: {
                            x: 'e_lon',
                            y: 'e_lat'
                        }
                    },
                    pathDisplayMode: 'selection', //'all'
                    animationStarted: true,
                    animationEasingFamily: 'Cubic',
                    animationEasingType: 'In',
                    animationDuration: 2000,
                    customLayerId: customLayerId
                }).addTo(map)

                layersArray.push(flowLayer);

               //..... LAYERS / CONTROLS ............
                var baseMaps = {
                    'CartoDB Dark': tileCartoDB
                    },
                   overlayMaps = {
                       'Flow layers': flowLayer
                   }

                L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: true }).addTo(map);

                // since this demo is using the optional "pathDisplayMode" as "selection",
                // it is up to the developer to wire up a click or mouseover listener
                // and then call the "selectFeaturesForPathDisplay()" method to inform the layer
                // which Bezier paths need to be drawn
                flowLayer.on('click', function (e) {
                    if (e.sharedOriginFeatures.length) {
                        flowLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
                    }
                    if (e.sharedDestinationFeatures.length) {
                        flowLayer.selectFeaturesForPathDisplay(e.sharedDestinationFeatures, 'SELECTION_NEW');
                    }
                });

                // immediately select an origin point for Bezier path display,
                // instead of waiting for the first user click event to fire
                flowLayer.selectFeaturesForPathDisplayById('s_city_id', '642', true, 'SELECTION_NEW');

                // populate animation easing options for select drop-down
                var pathAnimationStyleSelect = document.getElementById('pathAnimationStyleSelect');
                var tweenEasingFamilies = flowLayer.getAnimationEasingOptions();
                Object.keys(tweenEasingFamilies).forEach(function (family) {
                    tweenEasingFamilies[family].types.forEach(function (type) {
                        var option = document.createElement('option');
                        option.value = family + ',' + type;
                        option.text = (type === 'None') ? family : (family + ', ' + type);

                        if (
                          family === flowLayer.options.animationEasingFamily &&
                          type === flowLayer.options.animationEasingType
                        ) {
                            option.selected = true;
                        }

                        pathAnimationStyleSelect.add(option);
                    });
                });
            });
        }

        loadData('mapDir/Flowmap_Cities_one_to_many.csv');

        // establish references to form elements in the control panel card
        var oneToManyLayerButton = document.getElementById('oneToManyLayerButton');
        var manyToOneLayerButton = document.getElementById('manyToOneLayerButton');
        var oneToOneLayerButton = document.getElementById('oneToOneLayerButton');
        var pathAnimationButton = document.getElementById('pathAnimationButton');
        var pathAnimationStyleSelect = document.getElementById('pathAnimationStyleSelect');
        var pathAnimationDurationInput = document.getElementById('pathAnimationDurationInput');
        var userInteractionSelect = document.getElementById('userInteractionSelect');
        var pathSelectionTypeSelect = document.getElementById('pathSelectionTypeSelect');

        // establish actions for form elements in the control panel card
        oneToManyLayerButton.addEventListener('click', toggleActiveLayer);
        manyToOneLayerButton.addEventListener('click', toggleActiveLayer);
        oneToOneLayerButton.addEventListener('click', toggleActiveLayer);

        function toggleActiveLayer(evt) {
            oneToManyLayerButton.classList.remove('btn-primary');
            manyToOneLayerButton.classList.remove('btn-primary');
            oneToOneLayerButton.classList.remove('btn-primary');

            layersArray.forEach(function (layer) {
                if (layer.options.customLayerId === Number(evt.target.value)) {
                    map.addLayer(layer);
                } else {
                    map.removeLayer(layer);
                }
            });

            layerListenerChange({
                target: userInteractionSelect
            });

            evt.target.classList.add('btn-primary');
        }

        pathAnimationStyleSelect.addEventListener('change', function (evt) {
            var optionValueToArray = evt.target.value.split(',');
            var easingFamily = optionValueToArray[0];
            var easingType = optionValueToArray[1];

            layersArray.forEach(function (layer) {
                layer.setAnimationEasing(easingFamily, easingType);
            });
        });

        pathAnimationButton.addEventListener('click', function (evt) {
            if (evt.target.innerHTML === 'Pause') {
                evt.target.classList.add('btn-primary');
                evt.target.innerHTML = 'Play';
            } else {
                evt.target.classList.remove('btn-primary');
                evt.target.innerHTML = 'Pause';
            }

            layersArray.forEach(function (layer) {
                if (layer.options.animationStarted) {
                    layer.stopAnimation();
                } else {
                    layer.playAnimation();
                }
            });
        });

        pathAnimationDurationInput.addEventListener('input', function (evt) {
            layersArray.forEach(function (layer) {
                layer.setAnimationDuration(evt.target.value);
            });
        });

        // toggle click or mouseover listeners
        userInteractionSelect.addEventListener('change', layerListenerChange);

        function layerListenerChange(e) {
            if (e.target.value === 'click') {
                layersArray.forEach(function (layer) {
                    layer.off('mouseover', handleLayerInteraction);
                    layer.off('click', handleLayerInteraction);
                    layer.on('click', handleLayerInteraction);
                });
            } else {
                layersArray.forEach(function (layer) {
                    layer.off('click', handleLayerInteraction);
                    layer.off('mouseover', handleLayerInteraction);
                    layer.on('mouseover', handleLayerInteraction);
                });
            }
        }

        function handleLayerInteraction(e) {
            if (e.sharedOriginFeatures.length) {
                e.target.selectFeaturesForPathDisplay(e.sharedOriginFeatures, pathSelectionTypeSelect.value);
            }
            if (e.sharedDestinationFeatures.length) {
                e.target.selectFeaturesForPathDisplay(e.sharedDestinationFeatures, pathSelectionTypeSelect.value);
            }
        }

        /*fix: layers/markers are not being displayed until the window is resized.*/
        $timeout(function () { map.invalidateSize(); }, 500)

    }
})();
