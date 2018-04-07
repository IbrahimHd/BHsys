/// <reference path="../scripts/libs/angular/angular.js"/>
/// <reference path="../scripts/app/dataService.js"/>
/// <reference path="../scripts/libs/leaflet/leaflet.min.js" />
/// <reference path="../scripts/libs/leaflet/leaflet.markercluster.min.js" />

(function () {
    'use strict';
    angular
    .module("app")
    .controller("mapLeafletCtrl", mapLeafletCtrl);
    mapLeafletCtrl.$inject = ['$scope', '$timeout', 'dataService', 'debugMode'];

    function mapLeafletCtrl($scope,$timeout, dataService, debugMode)
    {
        var iconMarker = L.ExtraMarkers.icon({
            //innerHTML:'',
            icon: 'fa-bank',
            iconColor: '#2c3e50',
            extraClasses: 'fa-5x faa-flash animated', //faa-burst animated //faa-pulse animated //faa-float animated //faa-flash animated //[faa-fast faa-slow]
            markerColor: 'orange', //'red', 'orange-dark', 'orange', 'yellow', 'blue-dark', 'cyan', 'purple', 'violet', 'pink', 'green-dark', 'green', 'green-light', 'black', or 'white'
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
        var randomFeatures = {
            type: 'FeatureCollection',
            features: randomFeaturesGenerate(undefined, 177)
        };
        var resturantsFeatures = {
            type: randomFeatures.type,
            features: randomFeatures.features.filter(f => { if (f.properties && f.properties.dataSet === 'resturants') return f })
        };
        var carRentalsFeatures ={
            type: randomFeatures.type,
            features: randomFeatures.features.filter(f => { if (f.properties && f.properties.dataSet === 'carRentals') return f })
        };

        var mymap = L.map('mapid', {
                //fullscreenControl: true,
                // OR
                fullscreenControl: {
                    pseudoFullscreen: false // if true, fullscreen to page width and height
                }
        }).setView(center, 12);
        var drawnFeatures = new L.FeatureGroup().addTo(mymap);

        // or, add to an existing map:
        //map.addControl(new L.Control.Fullscreen());

        //mymap.isFullscreen();

        /* easyButton */
        L.easyButton({
            states: [{
                stateName: 'zoom-to-forest',        // name the state
                icon: 'fa-tree',               // and define its properties
                title: 'zoom to a forest',      // like its title
                onClick: function (btn, map) {       // and its callback
                    map.setView([46.25, -121.8], 10);
                    btn.state('zoom-to-school');    // change state on click!
                }
            }, {
                stateName: 'zoom-to-school',
                icon: 'fa-university',
                title: 'zoom to a school',
                onClick: function (btn, map) {
                    map.setView([42.3748204, -71.1161913], 16);
                    btn.state('zoom-to-forest');
                }
            }]
        }).addTo(mymap);

        /* The BUILT-IN geoLocation Locate functionality with easyButton*/
        L.easyButton('fa-map-marker', function (btn, map) {
            map.locate({ setView: true, maxZoom: 16 });
        }).addTo(mymap);

        /* GPS enabled geolocation control set to follow the user's location */
        var locateControl = L.control.locate({
            position: "bottomright",
            drawCircle: true,
            follow: true,
            setView: true,
            keepCurrentZoomLevel: true,
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

        //'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        //'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        //'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        //"http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        //'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png'
        //'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
        //"http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg"
        //'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        //'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg'
        var tileCartoDB = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(mymap);
        var tileMB = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://mapbox.com">MapBox</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 22,
            id: 'mapbox.streets', //mapbox.satellite
            accessToken: 'pk.eyJ1IjoibGV3aXM1MDAiLCJhIjoiY2l0Z2V3ZWRhMDBsbjJvbWs4cHVvNzdrdSJ9.7d92mc2FzeKfYeraoLIljg'
        });
        console.log(tileMB._url, tileMB._tileZoom);
        var tileOSM = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 22
        });
        var tileOCM = L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://opencyclemap.org">OpenCycleMap</a> contributors',
            maxZoom: 22
        });
        var tileTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://opentopomap.org">opentopomap.org</a> contributors',
            maxZoom: 22
        });
        var tileHERE = L.tileLayer('https://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/{scheme}/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
            attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
            subdomains: '1234',
            mapID: 'newest',
            app_id: 'tFZyfnyJAmhfh5gdoGcR',
            app_code: 'vJ8o9OCQ1o0Y2wwbRspzSA',
            base: 'aerial',
            scheme: 'hybrid.day', //'pedestrian.day'
            maxZoom: 20,
            type: 'maptile',
            language: 'eng',
            format: 'png8',
            size: '256'
        });

        /* create SCALE */
        L.control.scale().addTo(mymap);

        /* create the Legend */
        createLegend();

        /* create control's' using the core Leaflet library */
        controlCoreMethodCreate();

        /* Map 1 |  create GeoJSON Cluster */
        createGeoJsonResturants();

        /* Map 2 |  create GeoJSON Cluster */
        createGeoJSONCarRentals();

        /* create Toolbar of CUSTOMIZED control's' using the leaflet.toolbar library */
//        toolbarCustomCreate();

        /* create set of CONFIGURABLE drawing & editing control's' using the leaflet.draw library */
        drawEditToolbarCreate();

        /* create Toolbar of control's' using the leaflet.toolbar library & leaflet.draw library through "extend" approcah */
//        toolbarDrawExtendCreate();

        var marker = L.marker([33.8579, 35.5325], { icon: iconMarker })
                      .addTo(mymap);

        var circle = L.circle([33.8579, 35.5325], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(mymap);

        var polygon = L.polygon([
            [33.86186, 35.52739],
            [33.88096, 35.52876],
            [33.87868, 35.5473],
            [33.85986, 35.55966]
        ]).addTo(mymap);

        marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
        circle.bindPopup("I am a circle.");
        polygon.bindPopup("I am a polygon.");

        var popup = L.popup()
            .setLatLng([33.8579, 35.5325])
            .setContent("I am a standalone popup.")
            .openOn(mymap);

        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(mymap);
        }

        mymap.on('contextmenu', onMapClick);

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
                        coordinates: [randomer(center[1], 0.5), randomer(center[0], 0.4)]  // swaping: center[0] <==> center[1]
                    },
                    properties: {
                        dataSet: (dataSetTitle || (i % 2 === 0 ? 'resturants' : 'carRentals')), //'not-assigned'
                        dataSetColor:(i % 2 === 0 ? 'red' : 'blue'),
                        category: i % 2 === 0 ? (i % 4 === 0? 'Resto Cafe' : 'Fast Food') : 'Coupe',
                        customProperty: 'custom DATA ' + i
                    }
                };
            }
            return features
        }
        
        var geoJSONResturants, markersClusterGroup;

        function createGeoJsonResturants() {
            geoJSONResturants = L.geoJSON(resturantsFeatures, {
                pointToLayer: (feature, latlng) => {
                    var marker = L.circleMarker(latlng, geojsonMarkerOptions);
                    marker.bindPopup(feature.properties.customProperty);
                    marker.on('mouseover', function (e) {
                        this.openPopup();
                    });
                    marker.on('mouseout', function (e) {
                        this.closePopup();
                    });
                    return marker;
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mouseover: function (e) {
                            var layer = e.target;
                            layer.setStyle({
                                weight: 3,
                                color: "#555",
                                opacity: 1
                            });
                            if (!L.Browser.ie && !L.Browser.opera) {
                                layer.bringToFront();
                            }
                        },
                        mouseout: function (e) {
                            geoJSONResturants.resetStyle(e.target);
                        }
                    });
                }
            });

            markersClusterGroup = L.markerClusterGroup().addLayer(geoJSONResturants).addTo(mymap);
        }


        // Lebanon geoJSON

        var lbnDistrictsLayer1, lbnDistrictsLayer2;

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
                             { sticky: true, opacity: 0.8, className:'bg-warning' }); // permanent: true, direction:auto
           layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        lbnDistrictsLayer2 = L.geoJSON(geojsonLbnGeoColl, {
        }).addTo(mymap);

        lbnDistrictsLayer1= L.geoJSON(geojsonLbnFeatureColl, {
            style: stylePolyFn,
            onEachFeature: onEachFeatureFn,
        }).addTo(mymap);

        //....... Util ..................................................  
        // Truncate value based on number of decimals
        var _round = function (num, len) {
            return Math.round(num * (Math.pow(10, len))) / (Math.pow(10, len));
        };
        // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
        var strLatLng = function (latlng) {
            return "(" + _round(latlng.lat, 6) + ", " + _round(latlng.lng, 6) + ")";
        };

        // Generate popup content based on layer type
        // - Returns HTML string, or null if unknown object
        var getPopupContent = function (layer) {
            // Marker - add lat/long
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                return strLatLng(layer.getLatLng());
                // Circle - lat/long, radius
            } else if (layer instanceof L.Circle) {
                var center = layer.getLatLng(),
                    radius = layer.getRadius();
                return "Center: " + strLatLng(center) + "<br />"
                      + "Radius: " + _round(radius, 2) + " m";
                // Rectangle/Polygon - area
            } else if (layer instanceof L.Polygon) {
                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    area = L.GeometryUtil.geodesicArea(latlngs);
                return "Area: " + L.GeometryUtil.readableArea(area, true);
                // Polyline - distance
            } else if (layer instanceof L.Polyline) {
                var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    distance = 0;
                if (latlngs.length < 2) {
                    return "Distance: N/A";
                } else {
                    for (var i = 0; i < latlngs.length - 1; i++) {
                        distance += latlngs[i].distanceTo(latlngs[i + 1]);
                    }
                    return "Distance: " + _round(distance, 2) + " m";
                }
            }
            return null;
        };

        //..... geoJSON CLUSTER GROUP (2) ............

        var geoJSONCarRentals;

        function createGeoJSONCarRentals() {
            geoJSONCarRentals = L.geoJSON(carRentalsFeatures, {
                pointToLayer: (feature, latlng) => { 
                    var marker = L.marker(latlng, { icon: iconMarkerShopping, title: feature.properties.customProperty });
                    marker.bindPopup(feature.properties.customProperty);
                    marker.on('mouseover', function (e) {
                        this.openPopup();
                    });
                    marker.on('mouseout', function (e) {
                        this.closePopup();
                    });
                    return marker;
                }
            });

            var markersClusterGroup2 = L.markerClusterGroup({
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

        //..... LEGEND ............
        function createLegend() {
            var legend = L.control({ position: 'bottomright' });

            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'bg-info legend'),
                    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                    labels = [];

                // loop through our density intervals and generate a label with a colored square for each interval
                var elmHtml = '<ul class="no-style">';
                for (var i = 0; i < grades.length; i++) {
                    elmHtml +=
                        '<li>' +
                            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                            '<span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] : '+') + '</span>' +
                        '</li> ';
                }
                elmHtml += '</ul>'
                div.innerHTML = elmHtml;
                return div;
            };

            legend.addTo(mymap);
        }

        //........ CONTROL .................
        function controlCoreMethodCreate() {
            var zoomRestCtrl= L.control({
                    position: 'topleft'
                });
                zoomRestCtrl.onAdd = function (map) {
                    var container = L.DomUtil.create('div', ''), //'leaflet-control leaflet-bar'
                        link = L.DomUtil.create('a', '', container);
                    link.href = '#';
                    link.title = 'Reset Zoom';
                    link.innerHTML = '<i class="btn-circle fa fa-stop-circle-o"></i>';
                    L.DomEvent.on(link, 'click', function () {
                        //map.setView(center, 12);
                        //map.setView(center, map.getZoom());
                        map.setView(center, 12, {
                            "animate": true,
                            "pan": {
                                "duration": 2
                            }
                        });
                    });
                    return container;
                }
                zoomRestCtrl.addTo(mymap);

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

        // ...... TOOLBAR .............
        function toolbarCustomCreate() {
            var action1 = L.ToolbarAction.extend({
                options: {
                    toolbarIcon: {
                        html: '&#9873;',
                        tooltip: 'tooltip text'
                    },
                    addHooks: function () {
                        map.setView([48.85815, 2.29420], 19);
                    }
                }
            });
            var action2 = L.ToolbarAction.extend({
                options: {
                    toolbarIcon: {
                        html: '&#7873;',
                        tooltip: 'tooltip 2'
                    },
                    addHooks: function () {
                        map.setView([40.85815, 4.29420], 19);
                    }
                }
            });
            var toolbar = new L.Toolbar.Control({
                    position: 'topright',
                    actions: [
                        action1,
                        action2
                    ],
                    className: 'leaflet-draw-toolbar'
            });
            toolbar.addTo(mymap);
        }

        function toolbarDrawExtendCreate() {
            L.DrawToolbar = L.Toolbar.Control.extend({
                options: {
                    actions: [
                        L.Draw.Polygon,
                        L.Draw.Polyline,
                        L.Draw.Marker,
                        L.Draw.Rectangle,
                        L.Draw.Circle
                    ],
                    className: 'leaflet-draw-toolbar' // Style the toolbar with Leaflet.draw's custom CSS
                }
            });
            new L.DrawToolbar().addTo(mymap);
            new L.DrawToolbar.Control({
                position: 'topleft',
                className: 'leaflet-draw-toolbar'
            }).addTo(map);
        }

        //--------- DRAW ..................
        function drawEditToolbarCreate() {
            drawnFeatures.addTo(mymap);
            var drawOptions = {
                position: 'topleft',
                draw: {
                    polyline: {
                        shapeOptions: {
                            color: '#f357a1',
                            weight: 2
                        },
                        metric: true,
                        feet: false,
                        showDistance: true //showLength:true
                    },
                    polygon: {
                        allowIntersection: false, // Restricts shapes to simple polygons
                        drawError: {
                            color: '#e1e100', // Color the shape will turn when intersects
                            message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                        },
                        shapeOptions: {
                            color: '#bada55'
                        },
                        metric: false,
                        feet: true,
                        showArea: true
                    },
                    circle: {
                        shapeOptions: {
                            color: '#bada55'
                        },
                        repeatMode:true,
                        showRadius: true
                    },
                    rectangle: {
                        shapeOptions: {
                            clickable: false
                        },
                        showArea: true
                    },
                    marker: {
                        icon: greenIcon, //new MyCustomMarker()
                    }
                },
                edit: {
                    featureGroup: drawnFeatures, //REQUIRED!!
                    remove: false
                }
            };

            mymap.addControl(new L.Control.Draw(drawOptions));

            mymap.on(L.Draw.Event.CREATED, function (e) {
                var type = e.layerType,
                        layer = e.layer;

                if (type === 'marker') {
                    layer.bindPopup('A popup!');
                }
                var content = getPopupContent(layer);
                if (content !== null) {
                    layer.bindPopup(content);
                }
                drawnFeatures.addLayer(layer);
            });

            mymap.on('draw:edited', function (e) {
                var layers = e.layers;
                layers.eachLayer(function (layer) {
                    content = getPopupContent(layer);
                    if (content !== null) {
                        layer.setPopupContent(content);
                    }
                });
            });
        }

        //..... LAYERS / CONTROLS ............
        var baseMaps = {
            'Map Box': tileMB,
            'Open Street Map': tileOSM,
            'Open Cycle Map': tileOCM,
            'Topology': tileTopo,
            'HERE - aerial': tileHERE,
            'CartoDB Dark': tileCartoDB
        },
           overlayMaps = {
               'Resturants': geoJSONResturants,
               'Car Rentals': geoJSONCarRentals,
               'Lbn Districts': lbnDistrictsLayer1,
               'Lbn Districts (old)': lbnDistrictsLayer2,
               'Drawing layer': drawnFeatures
           }
        L.control.layers(baseMaps, overlayMaps, { position: 'topright', collapsed: true }).addTo(mymap);

        /*fix: layers/markers are not being displayed until the window is resized.*/
        $timeout(function () { mymap.invalidateSize(); }, 300)

    }
})();
