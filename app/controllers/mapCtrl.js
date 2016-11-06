define(['mapbox-gl'], function(mapboxgl) {
    function mapCtrl($scope, geolocation) {

       function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
          var R = 6378.137; // Radius of earth in KM
          var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
          var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
             Math.sin(dLon/2) * Math.sin(dLon/2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          var d = R * c;
          return d * 1000; // meters
       }

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
          function updateMarkers() {
             var route = $scope.map.getSource('route');
             if (route) {
                route.setData({
                   "type": "FeatureCollection",
                   "features": $scope.markers
                });
             }
          }
          if ($scope.map.loaded()) {
             updateMarkers();
          } else {
             $scope.map.on('load', function() {
                updateMarkers();
             });
          }
       }

       $scope.crumbsFilter = {
          x: 50,
          y: 50,
          radius: 0.000225 //R = 0.00045 / 2 - примерно 25 метров, формула: http://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
       };
       $scope.applyCrumbsFilter = function(crumbsFilter) {
          var
             startX = parseFloat(crumbsFilter.x) - parseFloat(crumbsFilter.radius),
             endX = parseFloat(crumbsFilter.x) + parseFloat(crumbsFilter.radius);
          ref.orderByChild('coord_x').startAt(startX).endAt(endX).on('value', function(snapshot) {
             applySnapshot(snapshot);
          });
       };
       /***************** END FireBase *******************/

        function getLocation(init) {
            geolocation.getLocation().then(function(geoData){
                $scope.geoData = geoData;

                $scope.crumbsFilter.y =  geoData.coords.latitude;
                $scope.crumbsFilter.x =  geoData.coords.longitude;

                init && init();

                $scope.applyCrumbsFilter($scope.crumbsFilter);

                if ($scope.map.loaded()) {
                   $scope.map.setCenter([$scope.geoData.coords.longitude, $scope.geoData.coords.latitude]);
                   $scope.map.getSource('userCircle').setData({
                      "type": "Feature",
                      "geometry": {
                         "type": "Point",
                         "coordinates": [$scope.geoData.coords.longitude, $scope.geoData.coords.latitude]
                      }
                   });
                }
            });
        }

        setInterval(function() {
            getLocation();
        }, 3000);

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

               $scope.map.addSource('userCircle', {
                  "type": "geojson",
                  "data": {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates": [$scope.crumbsFilter.x, $scope.crumbsFilter.y]
                     }
                  },
                  cluster: false
               });

               $scope.map.addLayer({
                  "id": "userCircle2",
                  "source": "userCircle",
                  "type": "circle",
                  "paint": {
                     "circle-radius": 50,
                     "circle-color": '#aff',
                     "circle-opacity": 0.3,
                     "circle-pitch-scale": 'viewport'
                  }
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
