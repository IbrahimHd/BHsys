/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/leaflet/leaflet.min.js" />
/// <reference path="../scripts/libs/leaflet/leaflet.markercluster.min.js" />

(function () {
    'use strict';
    angular
    .module("app")
        .directive('ihMapMarkerEvent', ihMapMarkerEvent)
        .controller("mapSearchCtrl", mapSearchCtrl);
    mapSearchCtrl.$inject = ['$scope', '$timeout', '$compile', 'dataService', 'debugMode'];
    
    function ihMapMarkerEvent() {
        return {
            link: (scope, element, attrs, ctrl) => {
                //var markers = document.getElementsByClassName('leaflet-marker-icon');
                //scope.markers = markers;
                //scope.$watch('markers.length', (value) => {
                //    console.log(value);
                //    if (value) {
                //        for (var i = 0; i < markers.length; i++) {
                //            console.log(markers[i].localName);
                //        }
                //    }
                //});
            }
        }
    }

    function mapSearchCtrl($scope, $timeout, $compile, dataService, debugMode)
    {
        $scope.filter = {
            value:30,
            slider: {
              //min: 10,
                max: 180,
                options: {
                    step: 5,
                    floor: 0,
                    ceil: 250,
                    minLimit: 10,
                    maxLimit: 150,
                    minRange: 50,
                  //maxRange: 50,
                    pushRange: true,
                  //showTicks: 50,
                  //showTicksValues: 100,//true,
                    translate: function(value, sliderId, label) {
                        switch (label) {
                            case 'model':
                                return '<small>Min price:</small> <b>$' + value +'</b>'
                            case 'high':
                                return '<small>Max price:</small> <b>$' + value +'</b>'
                            default:
                                return '$' + value
                        }
                    },
                    ticksValuesTooltip: function (v) {
                        return 'Tooltip for ' + v
                    },
                    selectionBarGradient: {
                        from: 'white',
                        to: '#0db9f0'
                    },
                    rightToLeft: true
                }
            },
            typeOfService:''
        };

        function generateIcon(iconOptions, feature) {
            var iconMarkerValue = L.ExtraMarkers.icon({
                //innerHTML:'',
                icon: 'fa-number',
                iconColor: iconOptions.textColor || 'white',
                extraClasses: 'fa-5x faa-pulse animated', //faa-burst animated //faa-pulse animated //faa-float animated //faa-flash animated //faa-fast faa-slow
                markerColor: iconOptions.iconColor || 'purple', //'red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light', 'black', or 'white'
                number: feature.properties.price, //'$34', //Instead of an icon, define a plain text. '1' or 'A', must set icon: 'fa-number'
                shape: 'square',
                prefix: 'fa'
            });
            return iconMarkerValue;
        }
        var iconMarkerRestaurant = L.ExtraMarkers.icon({
            //innerHTML:'',
            icon: 'fa-birthday-cake',
            iconColor: 'blue',
            extraClasses: 'fa-5x faa-pulse animated', //faa-burst animated //faa-pulse animated //faa-float animated //faa-flash animated //faa-fast faa-slow
            markerColor: 'cyan', //'red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light', 'black', or 'white'
            //number:'', //Instead of an icon, define a plain text. '1' or 'A', must set icon: 'fa-number'
            shape: 'square',
            prefix: 'fa'
        });        
        var iconMarkerShopping = L.ExtraMarkers.icon({
            //innerHTML:'',
            icon: 'fa-shopping-bag',
            iconColor: 'blue',
            extraClasses: 'fa-5x faa-pulse animated', //faa-burst animated //faa-pulse animated //faa-float animated //faa-flash animated //faa-fast faa-slow
            markerColor: 'cyan', //'red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light', 'black', or 'white'
            //number:'', //Instead of an icon, define a plain text. '1' or 'A', must set icon: 'fa-number'
            shape: 'square',
            prefix: 'fa'
        });
        var iconMarkerTaxi = L.ExtraMarkers.icon({
            //innerHTML:'',
            icon: 'fa-taxi',
            iconColor: 'orange',
            extraClasses: 'fa-5x faa-pulse animated', //faa-burst animated //faa-pulse animated //faa-float animated //faa-flash animated //faa-fast faa-slow
            markerColor: 'cyan', //'red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light', 'black', or 'white'
            //number:'', //Instead of an icon, define a plain text. '1' or 'A', must set icon: 'fa-number'
            shape: 'square',
            prefix: 'fa'
        });
        var greenIcon = L.icon({
            iconUrl: 'images/marker-icon.png',
            shadowUrl: 'images/leaf-shadow.png',
            iconSize: [24, 32], // size of the icon
            shadowSize: [24, 24], // size of the shadow
            iconAnchor: [40, 40], // point of the icon which will correspond to marker's location
            shadowAnchor: [40, 40],  // the same for the shadow
            popupAnchor: [-3, -40] // point from which the popup should open relative to the iconAnchor
        });
        var geojsonMarkerOptions = {
            radius: 15,
            fillColor: "#cd0000",
            // color: "#fff",
            weight: 0,
            opacity: 1,
            fillOpacity: 0.5
        };
        var center = [33.8579, 35.5325];

        var mymap = L.map('mapid', {
            fullscreenControl: {
                pseudoFullscreen: false // if true, fullscreen to page width and height
            }
        }).setView(center, 12);
        var tileOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 22
        });
        var tileCartoDB = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(mymap);

        /* Lebanon geoJSON */
        var lbnDistrictsLayer1;

        /* create Lebanon GeoJSON layer */
        createLbnLayer();

        var randomFeatures = {
            type: 'FeatureCollection',
            features: randomFeaturesGenerate(undefined, 277)
        };
        var RestaurantsFeatures = {
            type: randomFeatures.type,
            features: randomFeatures.features.filter(f => { if (f.properties && f.properties.dataSet === 'Restaurants') return f })
        };
        var carRentalsFeatures ={
            type: randomFeatures.type,
            features: randomFeatures.features.filter(f => { if (f.properties && f.properties.dataSet === 'carRentals') return f })
        };
        var shoppingFeatures ={
            type: randomFeatures.type,
            features: randomFeatures.features.filter(f => { if (f.properties && f.properties.dataSet === 'shopping') return f })
        };
        /* The BUILT-IN geoLocation Locate functionality with easyButton*/
        var locateFn = function () {
            var locateOptions = { setView: true, maxZoom: 16, watch: true, drawCircle: true, enableHighAccuracy: true, maximumAge: 15000, timeout: 3000000, }
            mymap.locate(locateOptions);
            console.log('"map.locate" has been run out!');
        }

        L.easyButton('fa-map-marker', function (btn, map) {
            // map. (something) before executing the action
            locateFn();
        }).addTo(mymap);
        // call locate every 3 seconds... forever
     //   setInterval(locateFn, 3000); /* "locateFn", without (), represents the fn instance rather than calling() */


        /* GPS enabled geolocation control set to follow the user's location */
        var locateControl = L.control.locate({
            position: "bottomright",
            drawCircle: true,
            follow: true,
            setView: true, //false,
            keepCurrentZoomLevel: false, //true,
            flyTo: true,
            markerStyle: {
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.8
            },
            circleStyle: {
                weight: 1,
                clickable: false
            },
            icon: "fa fa-location-arrow",
            metric: false,
            strings: {
                title: "My location",
                popup: "You are within {distance} {unit} from this point",
                outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
            },
            locateOptions: {
                maxZoom: 16,
                watch: true,
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000
            }
        }).addTo(mymap);

        /* create control's' using the core Leaflet library */
        controlCoreMethodCreate();

        /* Features/Markers/Layers |  create GeoJSON Cluster */
        createGeoJsonRestaurants();
        createGeoJSONCarRentals();
        createGeoJSONShopping();

        //=====CREATE FAKE DATA=====
        function randomFeaturesGenerate(dataSetTitle, size) {
            function randomer(x, scale) {
                return x + (Math.random() - 0.5) * scale
            }
            var n = size || 200;
            var features = Array(n);

            for (var i = 0; i < n; i++) {
                features[i] = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [randomer(center[1], 0.7), randomer(center[0], 0.6)]  // swaping: center[0] <==> center[1]
                    },
                    properties: {
                        dataSet: (dataSetTitle || (i % 6 === 0 ? 'Restaurants' :
                                                   i % 3 === 0 ? 'shopping' : 'carRentals')), //'not-assigned'
                        dataSetColor:(i % 2 === 0 ? 'red' : 'blue'),
                        category: i % 6 === 0 ? (i % 12 === 0 ? 'Resto Cafe' : 'Fast Food') :
                                  i % 3 === 0 ? (i % 9 === 0 ? 'Cosmatics' : 'Clothes') :
                                  i % 6 != 0 && i % 3 != 0 ? (i % 4 === 0 ? 'Cosmatics' : 'Clothes'):'Not-Specified',
                            //      i % 6 === 0 && i % 12 === 0 ? 'Resto Cafe' : 'Fast Food' ||
                            //      i % 3 === 0 && i % 9 === 0 ? 'Cosmatics' : 'Clothes' ||
                            //      i % 6 != 0 && i % 3 != 0 ? 'Sidan' : 'Coupe',
                        price: '$' + Math.round((Math.random() * 100),0),
                        name: 'Name',
                        id: i
                    }
                };
            }
            return features
        }
        
        function createLbnLayer() {
            function getColor(d) {
                return d > 1000 ? '#800026' :
                       d > 500 ? '#BD0026' :
                       d > 200 ? '#E31A1C' :
                       d > 100 ? '#FC4E2A' :
                       d > 50 ? '#FD8D3C' :
                       d > 20 ? '#FEB24C' :
                       d > 10 ? '#FED976' :
                                '#FFEDA0';
            }

            function stylePolyFn(feature) {
                return {
                    fillColor: getColor(feature.properties.ID_2),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }

            function resetHighlight(e) {
                lbnDistrictsLayer1.resetStyle(e.target);
            }

            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({
                    weight: 1,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.4
                });

                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
            }

            function zoomToFeature(e) {
                mymap.fitBounds(e.target.getBounds());
            }

            function onEachFeatureFn(feature, layer) {
                //layer.bindPopup(feature.properties.DISTRICT + '</br>' + feature.properties.ID_2); //.openPopup();
                layer.bindTooltip(feature.properties.DISTRICT + '</br><i class="fa fa-bathtub text-lg gray-light"></i>&nbsp;' + feature.properties.ID_1 + '</br><i class="fa fa-balance-scale text-lg gray-light"></i>&nbsp;' + feature.properties.ID_2,
                                  { sticky: true, opacity: 0.8, className: 'bg-warning' }); // permanent: true, direction:auto
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }

            lbnDistrictsLayer1 = L.geoJSON(geojsonLbnFeatureColl, {
                style: stylePolyFn,
                onEachFeature: onEachFeatureFn,
            }).addTo(mymap);
        }


        function pointToLayerFn(customIconOptions) {
            var iconArgumentType = (customIconOptions instanceof L.ExtraMarkers.Icon || customIconOptions instanceof L.Icon)? 'obj': 'options';
            var customOptions = // specify popup options 
                {
                    'maxHeight': '200',
                    'maxWidth': '200',
                    'className': 'custom'
                }
            function createCustomPopup(feature) {
                return '<h4>' + feature.properties.price + '</h4>'
                    + '<br/><img src="images/itemNoImageGreen.png" alt="image" width="150px"/>'
                    + '<button type="button" class="btn btn-circle" onclick="setSelectedFeature(' + JSON.stringify(feature).replace(/"/g, "'") + ')"><i class="fa fa-expand"></i></button>';

                //var dom= '<h4>' + feature.properties.price + '</h4>'
                //    + '<br/><img src="images/itemNoImageGreen.png" alt="image" width="150px"/>'
                //    + '<button type="button" class="btn btn-circle" ng-click="setSelectedFeature(' + feature + ')"><i class="fa fa-expand"></i></button>';
                //dom = angular.element($compile(dom)($scope));
                //dom.data=;
                //dom.attr('ng-click', 'setSelectedFeature(' + feature + ')');
                //console.log(dom);
                //dom = angular.element($compile(dom)($scope)); console.log(dom.contents);
                //return dom.html;
            }

            return function pointToLayerFn(feature, latlng) {
                // create popup contents

                var marker = L.marker(latlng, {
                    icon: iconArgumentType == 'obj'?
                            customIconOptions :                                                                     // icon obj received
                            generateIcon(customIconOptions, feature),                                               // bound data inside custom icon
                    title: feature.properties.category
                });

                marker.bindPopup(iconArgumentType == 'obj'? feature.properties.price : feature.properties.name);
               
                marker.on('mouseover', function (e) {
                    geoJSONRestaurants.eachLayer(function (layer) { layer.closePopup() });
                    geoJSONCarRentals.eachLayer(function (layer) { layer.closePopup() })
                    this.openPopup();
                });
                marker.on('mouseout', function (e) {
                    //this.closePopup();
                    /* Wait a bit */
                    //$timeout(function () { e.target.closePopup(); }, 3000);
                });
                marker.on('click', function (e) {
                    /* change the content*/
                    marker.bindPopup(createCustomPopup(feature), customOptions);
                    this.openPopup();
                });
                return marker;
            }
        };

        function onEachFeatureFn_(feature, layer) {
            layer.on({
                mouseover: function (e) {
                    var layer = e.target;
                    //layer.setStyle({
                    //    weight: 3,
                    //    color: "#555",
                    //    opacity: 1
                    //});
                    //if (!L.Browser.ie && !L.Browser.opera) {
                    //    layer.bringToFront();
                    //}
                },
                mouseout: function (e) {
                    geoJSONRestaurants.resetStyle(e.target);
                }
            });
        }

        var geoJSONRestaurants, markersClusterGroup;

        function createGeoJsonRestaurants() {
            geoJSONRestaurants = L.geoJSON(RestaurantsFeatures, {
                pointToLayer: pointToLayerFn({iconColor: 'blue', textColor: 'yellow'}), //iconMarkerRestaurant
                onEachFeature: onEachFeatureFn_
            });

            markersClusterGroup = L.markerClusterGroup().addLayer(geoJSONRestaurants).addTo(mymap);
        }

        //..... geoJSON CLUSTER GROUP (2) ............
        var geoJSONCarRentals, markersClusterGroup2;
        function createGeoJSONCarRentals() {
            geoJSONCarRentals = L.geoJSON(carRentalsFeatures, {
                pointToLayer: pointToLayerFn({iconColor: 'orange', textColor: 'blue' }),
                onEachFeature: onEachFeatureFn_
            });

            markersClusterGroup2 = L.markerClusterGroup({
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: true,
                zoomToBoundsOnClick: true,
                removeOutsideVisibleBounds: true, //for performance enhancement
                //maxClusterRadius: 80,  //Decreasing will make more, smaller clusters
                singleMarkerMode: false, //overrides the icon for all added markers to make them appear as a 1 size cluster
                chunkedLoading: true //split the addLayers processing in to small intervals so that the page does not freeze
            });
            markersClusterGroup2.addLayer(geoJSONCarRentals).addTo(mymap);
        }

        //..... geoJSON CLUSTER GROUP (3) "Shopping" ............

        var geoJSONShopping, markersClusterGroup3;

        function createGeoJSONShopping() {
            geoJSONShopping = L.geoJSON(shoppingFeatures, {
                pointToLayer: pointToLayerFn(iconMarkerShopping),
                onEachFeature: onEachFeatureFn_
            });

            markersClusterGroup3 = L.markerClusterGroup({
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: true,
                zoomToBoundsOnClick: true,
                removeOutsideVisibleBounds: true, //for performance enhancement
                //maxClusterRadius: 80,  //Decreasing will make more, smaller clusters
                singleMarkerMode: false, //overrides the icon for all added markers to make them appear as a 1 size cluster
                chunkedLoading: true //split the addLayers processing in to small intervals so that the page does not freeze
            });
            markersClusterGroup3.addLayer(geoJSONShopping).addTo(mymap);
        }
        //........ CONTROL .................
        function controlCoreMethodCreate() {
            //... FlyTo control
                var flyToCtrl = L.control({
                    position: 'topleft'
                })
                flyToCtrl.onAdd = function (map) {
                    var containerX = L.DomUtil.create('div', ''),
                        linkX = L.DomUtil.create('a', '', containerX);
                        linkX.href = '#';
                        linkX.title = 'FlyTo ..';
                        linkX.innerHTML = '<i class="btn-circle fa fa-paper-plane-o"></i>';
                        L.DomEvent.on(linkX, 'click', function () {
                            map.flyTo([33.8555, 35.5222], 10, {
                                animate: true,
                                duration: 2 // in seconds
                            });
                        });
                        return containerX;
                }
                flyToCtrl.addTo(mymap);
        }

        //..... LAYERS / CONTROLS ............
        var baseMaps = {
            'CartoDB Map': tileCartoDB,
            'Open Street Map': tileOSM,
        },
           overlayMaps = {
               'Restaurants': markersClusterGroup, //geoJSONRestaurants,
               'Car Rentals': markersClusterGroup2, //geoJSONCarRentals,
               'Shopping Distinations': markersClusterGroup3, //'Health Services'
               'Lbn Districts': lbnDistrictsLayer1,
           }
        L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: true }).addTo(mymap);


        //-----------------------------------------------------------------
        /*------ inspired from http://bmcbride.github.io/bootleaf/ ------*/
        //-----------------------------------------------------------------

        $scope.featureList = []; //randomFeatures.features;

        function syncSidebar() {
            /* merge all layerGroups togeter */
       //  var geoJsonAllLayers = [].concat(geoJSONRestaurants).concat(geoJSONCarRentals).concat(geoJSONShopping);
            /* Empty sidebar features */
            $scope.featureList = [];
            /* Loop through theaters layer and add only features which are in the map bounds */
            geoJSONRestaurants.eachLayer(function (layer) {
                /*check whether the map has this layer as (ON/visible)*/
                // if (map.hasLayer(theaterLayer)) {
                if (mymap.getBounds().contains(layer.getLatLng())) {
                  //$scope.featureList.push(layer);
                    $scope.featureList.push({
                        layerStamp: L.stamp(layer),
                        bounds: layer.getLatLng(),
                        properties: layer.feature.properties,
                        expanded: false
                    })
                }
                // }
            });
            geoJSONCarRentals.eachLayer(function (layer) {
                /*check whether the map has this layer as (ON/visible)*/
                // if (map.hasLayer(theaterLayer)) {
                if (mymap.getBounds().contains(layer.getLatLng())) {
                    //$scope.featureList.push(layer);
                    $scope.featureList.push({
                        layerStamp: L.stamp(layer),
                        bounds: layer.getLatLng(),
                        properties: layer.feature.properties,
                        expanded: false
                    })
                }
                // }
            });
            geoJSONShopping.eachLayer(function (layer) {
                /*check whether the map has this layer as (ON/visible)*/
                // if (map.hasLayer(theaterLayer)) {
                if (mymap.getBounds().contains(layer.getLatLng())) {
                    //$scope.featureList.push(layer);
                    $scope.featureList.push({
                        layerStamp: L.stamp(layer),
                        bounds: layer.getLatLng(),
                        properties: layer.feature.properties,
                        expanded: false
                    })
                }
                // }
            });
            $timeout(function () { $scope.featureList = $scope.featureList; /*force refreshing the array*/ });
        };

        $scope.isFeatureExpanded = false;

        /* Filter sidebar feature list to only show features in current map bounds */
        mymap.on("moveend", function (e) {
            if ($scope.isFeatureExpanded!=true) syncSidebar();
        });

        $scope.zoomLevel = 12;

        function getLayer(layerStamp) {
            var layer = markersClusterGroup.getLayer(layerStamp); /*<< not needed if sending Layer Obj from DOM*/
            if (layer == undefined) {
                layer = markersClusterGroup2.getLayer(layerStamp);
                if (layer == undefined) {
                    layer = markersClusterGroup3.getLayer(layerStamp);
                }
            }
            return layer;
        }

        $scope.flyTo = function (layerStamp) {// or receive layer obj: featureLayer
            var layer = getLayer(layerStamp);
            mymap.setView([layer.getLatLng().lat, layer.getLatLng().lng], $scope.zoomLevel);
          //or
            //mymap.fitBounds(e.target.getBounds()); //markersClusterGroup.getBounds()
          //or
            //markersClusterGroup.zoomToShowLayer(layer, function () {
            //    layer.openPopup();
            //});
            //layer.fire("click");
        }


        //dom = document.createElement('a');
        //doom = document.createAttribute('onmouseover')
        //var el = document.querySelectorAll('.card');
        //angular.element(el).addEventListener('mouseover', function () { console.log('mouseeeeeeeeeeeeee'); });

        $scope.mapGoToFeature = function (layerStamp) {// or receive layer obj: featureLayer
            if (!$scope.isFeatureExpanded) {
                var layer = getLayer(layerStamp);
                layer.fire("mouseover");
            }
        }
        $scope.featureMouseout = function (layerStamp) {// or receive layer obj: featureLayer
            if (!$scope.isFeatureExpanded) {
                var layer = getLayer(layerStamp);
                layer.fire("mouseout");
            }
        }

        //exposeing this fn to global to be accessed by onClick "rather than ng-click, dosen't work"
        window.setSelectedFeature = $scope.setSelectedFeature = function setSelectedFeature(feature) {
            $scope.selected = feature ? angular.copy(feature, {}) : undefined;
            console.log("selected feature: ", $scope.selected);
        }

        $scope.keydownFn = function (event) {
            console.log(event);
        }
        $scope.toggleExpandFeature = function (layerStamp, value) {
            if($scope.featureList.length>0) {
                $scope.featureList.filter(f => { if (f.layerStamp === layerStamp) return f })[0].expanded = !value;
                $scope.isFeatureExpanded = !value;
            }
        }

        /*-----------------------------------------------*/
        $scope.querySearch = function (text) {
            console.log(text); 
            console.log(randomFeatures.features);
            var result = randomFeatures.features.filter(f => { if (f.properties && f.properties.name === text) return f });
            console.log(result);
            return result;
        }


        /*fix: layers/markers are not being displayed until the window is resized.*/
        $timeout(function () { mymap.invalidateSize(); }, 300);
        $timeout(function () { mymap.invalidateSize(); }, 1500);
    }
})();
