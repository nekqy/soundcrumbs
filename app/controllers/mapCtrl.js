define(['mapbox-gl'], function(mapboxgl) {
    function mapCtrl($scope, geolocation) {

       /***************** BEGIN FireBase *******************/
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

       var
          ref = firebase.database().ref('SoundCrumbs');

       function applySnapshot(snapshot) {
          var
             x = parseFloat($scope.crumbsFilter.x),
             y = parseFloat($scope.crumbsFilter.y),
             radius = Math.pow(parseFloat($scope.crumbsFilter.radius), 2),
             val, px, py;
          $scope.markers = [];
          snapshot.forEach(function(point) {
             val = point.val();
             px = val['coord_x'];
             py = val['coord_y'];
             if (Math.pow(px - x, 2) + Math.pow(py - y, 2) <= radius) {
                $scope.markers.push({
                   "type": "Feature",
                   "geometry": {
                      "type": "Point",
                      "coordinates": [px, py]
                   }
                });
             }
          });
          if ($scope.$$phase !== '$apply' && $scope.$$phase !== '$digest') {
             $scope.$apply();
          }
       }

       $scope.crumbsFilter = {
          x: 50,
          y: 50,
          radius: 50
       };
       $scope.applyCrumbsFilter = function(crumbsFilter) {
          var
             startX = parseFloat(crumbsFilter.x) - parseFloat(crumbsFilter.radius),
             endX = parseFloat(crumbsFilter.x) + parseFloat(crumbsFilter.radius);
          ref.orderByChild('coord_x').startAt(startX).endAt(endX).on('value', function(snapshot) {
             applySnapshot(snapshot);
          });
       };
       $scope.applyCrumbsFilter($scope.crumbsFilter);
       /***************** END FireBase *******************/

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
