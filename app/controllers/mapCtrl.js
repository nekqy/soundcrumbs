define(['mapbox-gl'], function(mapboxgl) {
    function mapCtrl($scope, geolocation, $firebaseArray) {

        try {
            // Initialize firebase module
            firebase.initializeApp({
                apiKey: "AIzaSyBKj6ihhb0upcL8cdclGN7PUeCNzCRom5I",
                authDomain: "soundcrumbs-168a9.firebaseapp.com",
                databaseURL: "https://soundcrumbs-168a9.firebaseio.com",
                storageBucket: "soundcrumbs-168a9.appspot.com",
                messagingSenderId: "443143749176"
            });
        } catch(e) {
        }

        var ref = firebase.database().ref('SoundCrumbs');

        $scope.crumbs = $firebaseArray(ref);
        $scope.markers = [];



        function getLocation(init) {
            function setMarkers(markerPoints) {
                var route = $scope.map.getSource('route');
                if (route) {
                    route.setData({
                        "type": "FeatureCollection",
                        "features": markerPoints
                    });
                }
            }

            geolocation.getLocation().then(function(geoData){
                $scope.geoData = geoData;

                init && init();

                $scope.markers = [];
                $scope.crumbs.forEach(function(crumb) {
                    $scope.markers.push({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [crumb.coord_y, crumb.coord_x]
                        }
                    });
                });

                if ($scope.map.loaded()) {
                    setMarkers($scope.markers);
                } else {
                    $scope.map.on('load', function() {
                        setMarkers($scope.markers);
                    });
                }

            });
        }

        setInterval(function() {
            getLocation();
        }, 30000);

        getLocation(function() {
            mapboxgl.accessToken = 'pk.eyJ1Ijoic291bmRjcnVtYnMiLCJhIjoiY2l2NWljOG5rMDAwaTJ5bmllNDdsZnk0bCJ9.RJEBZJSiTUPBXi4sOQkrTw';
            $scope.map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
                center: [$scope.geoData.coords.longitude, $scope.geoData.coords.latitude], // starting position
                zoom: 17, // starting zoom
                minZoom: 17,
                maxZoom: 20,
                dragPan: false,
                scrollZoom: false,
                boxZoom: false,
                doubleClickZoom: false
            });

            $scope.map.on('load', function() {
                $scope.map.addSource("route", {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": []
                    },
                    cluster: true,
                    clusterMaxZoom: 20, // Max zoom to cluster points on
                    clusterRadius: 30 // Radius of each cluster when clustering points (defaults to 50)
                });

                $scope.map.addLayer({
                    "id": "layer1",
                    "type": "circle",
                    "source": "route",
                    "paint": {
                        "circle-color": '#f28cb1',
                        "circle-radius": 18
                    },
                    "filter": [">=", "point_count", 0]
                });

                $scope.map.addLayer({
                    "id": "layer2",
                    "type": "circle",
                    "source": "route",
                    "filter": ["!has", "point_count"],
                    "paint": {
                        "circle-color": '#f28cb1',
                        "circle-radius": 12
                    }
                });

                // Add a layer for the clusters' count labels
                $scope.map.addLayer({
                    "id": "layer3",
                    "type": "symbol",
                    "source": "route",
                    "filter": ["has", "point_count"],
                    "layout": {
                        "text-field": "{point_count}",
                        "text-font": [
                            "DIN Offc Pro Medium",
                            "Arial Unicode MS Bold"
                        ],
                        "text-size": 12
                    }
                });
                $scope.map.addLayer({
                    "id": "layer4",
                    "type": "symbol",
                    "source": "route",
                    "filter": ["!has", "point_count"],
                    "layout": {
                        "text-field": "1",
                        "text-font": [
                            "DIN Offc Pro Medium",
                            "Arial Unicode MS Bold"
                        ],
                        "text-size": 12
                    }
                });
            });
        });
    }
    return mapCtrl;
});
