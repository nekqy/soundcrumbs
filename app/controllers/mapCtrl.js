define(['supercluster.min'], function(supercluster) {
    function mapCtrl($scope, VKApi, geolocation, AUDIO_RATING_INITIAL) {
        // R = 0.000009 = ~1 метр, формула: http://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
       const crumbsFilterRadius = 0.000640; // 71.2444741076951 метров

        // пересчет в метры + еще чуть чуть чтобы окружность точки была внутри окружности охвата
        function calcMeters(coordDiff) {
            var koef = 100/0.000440;
            return coordDiff * koef;
        }

       /***************** BEGIN FireBase *******************/
      // Initialize firebase module
      firebase.initializeApp({
         apiKey: "AIzaSyBKj6ihhb0upcL8cdclGN7PUeCNzCRom5I",
         authDomain: "soundcrumbs-168a9.firebaseapp.com",
         databaseURL: "https://soundcrumbs-168a9.firebaseio.com",
         storageBucket: "soundcrumbs-168a9.appspot.com",
         messagingSenderId: "443143749176"
      });

       var ref = firebase.database().ref('SoundCrumbs');

       function applySnapshot(snapshot) {
          var
             x = $scope.geoData.coords.longitude,
             y = $scope.geoData.coords.latitude,
             sqrRadius = Math.pow(crumbsFilterRadius, 2),
             val, px, py;
          $scope.markers = [];
          snapshot.forEach(function(point) {
             val = point.val();
             px = val['coord_x'];
             py = val['coord_y'];
             if (!val.removed && Math.pow(px - x, 2) + Math.pow(py - y, 2) <= sqrRadius) {
                $scope.markers.push({
                   "type": "Feature",
                   "properties": val,
                   "key": point.getKey(),
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
              var intervalIndex = setInterval(function() {
                  if ($scope.map.loaded()) {
                      updateMarkers();
                      clearInterval(intervalIndex);
                  }
              }, 1000);
          }
       }

       $scope.applyCrumbsFilter = function(crumbsFilter) {
          var
             startX = $scope.geoData.coords.longitude - crumbsFilterRadius,
             endX = $scope.geoData.coords.longitude + crumbsFilterRadius;
          ref.orderByChild('coord_x').startAt(startX).endAt(endX).on('value', function(snapshot) {
             applySnapshot(snapshot);
          });
       };

       $scope.createCrumb = function (properties) {
          firebase.database().ref('SoundCrumbs' + '/' + chance.guid()).set(properties);
       };
       /***************** END FireBase *******************/

       $scope.goToRecord = function() {
           rb1.move('right');
       };

       $scope.goToHistory = function() {
           rb1.move('left');
       };

        function getLocation(init) {
            isDevelopment && log('<p class="tempLog">Загрузка локации...</p>');
            isLocating = true;
            geolocation.getLocation().then(function(geoData){
                isDevelopment && $('.tempLog').remove();
                isLocating = false;

                window.geoData = $scope.geoData = geoData;

                init && init();

                $scope.applyCrumbsFilter();

                if ($scope.map && $scope.map.loaded()) {
                   $scope.map.setCenter([$scope.geoData.coords.longitude, $scope.geoData.coords.latitude]);
                   $scope.map.getSource('userCircle').setData({
                      "type": "Feature",
                      "geometry": {
                         "type": "Point",
                         "coordinates": [$scope.geoData.coords.longitude, $scope.geoData.coords.latitude]
                      }
                   });
                }
            }, function(err) {
                isLocating = false;
                log(JSON.stringify(err))
            });
        }

        var isLocating = false;
        setInterval(function() {
            if (!isLocating && isMapScreen()) {
                getLocation();
            }
        }, 10000);

        getLocation(function() {
            mapboxgl.accessToken = 'pk.eyJ1Ijoic291bmRjcnVtYnMiLCJhIjoiY2l2NWljOG5rMDAwaTJ5bmllNDdsZnk0bCJ9.RJEBZJSiTUPBXi4sOQkrTw';
            window.mapboxInst = $scope.map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
                center: [$scope.geoData.coords.longitude, $scope.geoData.coords.latitude], // starting position
                zoom: 17, // starting zoom
                minZoom: 17,
                maxZoom: 20,
                dragPan: false,
                scrollZoom: false,
                boxZoom: false,
                doubleClickZoom: false,
                touchZoomRotate: false
            });

            $scope.map.on('error', function(err) {
                //evented.fire('error', err);
                log(JSON.stringify(err));
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
                        "coordinates": [$scope.geoData.coords.longitude, $scope.geoData.coords.latitude]
                     }
                  },
                  cluster: false
               });

               $scope.map.addLayer({
                  "id": "userCircle2",
                  "source": "userCircle",
                  "type": "circle",
                  "paint": {
                     "circle-radius": calcMeters(crumbsFilterRadius),
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
                        "circle-radius": 18
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


                // When a click event occurs near a place, open a popup at the location of
                // the feature, with description HTML from its properties.
                $scope.map.on('click', function (e) {
                    var features = $scope.map.queryRenderedFeatures(e.point, { layers: ['layer1', 'layer2'] });

                    if (!features.length) {
                        return;
                    }
                    var feature = features[0];

                    var begin = 0,
                        foundFeatures = [];
                    var superclusters = supercluster($scope.map.getSource('route').workerOptions.superclusterOptions).load($scope.map.getSource('route')._data.features);
                    var clusters17 = superclusters.getClusters([-180, -90, 180, 90], 17);
                    var clusters18 = superclusters.getClusters([-180, -90, 180, 90], 18);
                    clusters17.forEach(function(point, index) {
                        var numPoints = superclusters.trees[17].points[index].numPoints;
                        if (Math.abs(point.geometry.coordinates[0] - feature.geometry.coordinates[0]) < 0.000001 &&
                            Math.abs(point.geometry.coordinates[1] - feature.geometry.coordinates[1]) < 0.000001) {
                            var count = numPoints;
                            foundFeatures = clusters18.slice(begin, begin + count);
                        }
                        begin += numPoints;
                    });

                    var audios = foundFeatures.map(function(feature) {
                        var res = feature.properties;
                        res.dateStr = new Date(res.date).toLocaleDateString();
                        res.description = res.description || '[ нет описания ]';
                        res.rating = AUDIO_RATING_INITIAL + (res.liked ? Object.keys(res.liked).length : 0) - (res.disliked ? Object.keys(res.disliked).length : 0);
                        res.key = feature.key; // Передаем также первичный ключ записи, чтобы дальше было в БД легко найти нужную запись
                       return res;
                    });
                    audios = audios.sort(function(a, b) {
                        return a.date > b.date;
                    });

                    var audioListener = $('[ng-controller="AudioListenerCtrl"]');
                    var scope = angular.element(audioListener[0]).scope();
                    scope.audioList = audios;
                    scope.ref = ref;

                    VKApi.getSession().then(function (session) {
                        scope.mid = session.mid;
                        rb1.move('bottom');
                    }, function(err) {
                        alert(JSON.stringify(err));
                    });
                });

                // Use the same approach as above to indicate that the symbols are clickable
                // by changing the cursor style to 'pointer'.
                $scope.map.on('mousemove', function (e) {
                    var features = $scope.map.queryRenderedFeatures(e.point, { layers: ['layer1', 'layer2'] });
                    $scope.map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
                });

                ref.on('value', $scope.applyCrumbsFilter);
            });
        });
    }
    return mapCtrl;
});
