define([], function() {
    function AudioListenerCtrl($scope, AUDIO_RATING_INITIAL, AUDIO_LIKE_RATIO_MINIMAL, $sce, VKApi) {

        // Initialize firebase module
        try {
          firebase.initializeApp({
             apiKey: "AIzaSyBKj6ihhb0upcL8cdclGN7PUeCNzCRom5I",
             authDomain: "soundcrumbs-168a9.firebaseapp.com",
             databaseURL: "https://soundcrumbs-168a9.firebaseio.com",
             storageBucket: "soundcrumbs-168a9.appspot.com",
             messagingSenderId: "443143749176"
          });
        } catch(e) {}

        var ref = firebase.database().ref('SoundCrumbs');
        
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.goToBack = function() {
            rb1.move('top');
        };
        $scope.isMyAudio = function(audio) {
            return audio.uid.toString() === $scope.mid.toString();
        };
        $scope.toggleLikeAudio = function(audio, like) {
            var
               fbAudio = $scope.ref.child(audio.key),
               fbAudioLikeField = fbAudio.child('liked'),
               fbAudioDislikeField,
               rating = AUDIO_RATING_INITIAL,
               liked = like ? 1 : 0,
               disliked = like ? 0 : 1;
            fbAudioLikeField.once('value', function(likeSn) {
                rating += likeSn.numChildren();
                liked += likeSn.numChildren();

                if (likeSn.hasChild($scope.mid)) {
                    rating--;
                    
                }
                fbAudioDislikeField = fbAudio.child('disliked');
                fbAudioDislikeField.once('value', function(dislikeSn) {
                    
                    rating -= dislikeSn.numChildren();
                    disliked += dislikeSn.numChildren();
                    if (dislikeSn.hasChild($scope.mid)) {
                        rating++;
                    }
                    if (like) {
                        if(audio.likeState == 'liked'){
                            audio.likeState = '';
                            fbAudioDislikeField.child($scope.mid).remove();
                        } else {
                            fbAudioLikeField.child($scope.mid).set(true);
                            fbAudioDislikeField.child($scope.mid).remove();
                            rating++;

                            audio.likeState = "liked";
                        }
                    } else {
                        if(audio.likeState == 'disliked'){
                            fbAudioDislikeField.child($scope.mid).remove();
                            audio.likeState = '';
                        } else {
                            fbAudioLikeField.child($scope.mid).remove();
                            fbAudioDislikeField.child($scope.mid).set(true);
                            rating--;
                            audio.likeState = 'disliked';
                        }
                    }
                    audio.rating = rating;
                    if (liked == 0 && disliked > 5 ||
                            liked > 0 && disliked/liked > 5 ||
                            liked + disliked > 5 + countRecordsInCrumbsArea() / 5 && disliked/liked > 1.5) {
                        fbAudio.child('removed').set(true);
                    }
                });
            });
        };
        $scope.deleteAudio = function(audio) {
            if (confirm('Вы уверены?')) {
                $scope.ref.child(audio.key + '/removed').set(true);
                $scope.audioList.splice($scope.audioList.indexOf(audio), 1);
            }
        };
        $scope.addToHistory = function(audio, event) {
            VKApi.getSession().then(function(session) {
                saveToHistory(audio, session.mid);
            });
            changePlayerTarget(event);
        };

        function changePlayerTarget(event) {
          if (window.playerTarget != null) {
            window.playerTarget.pause();
            window.playerTarget.currentTime = 0;
          }
          window.playerTarget = event.target;
        }

        $scope.getShareUrl = function(data) {
          var title; 
          if (data.description)
            title = "Прийди туда и послушай " + data.description + " в SoundCrumbs";
          else
            title = "Прийди туда и послушай запись в SoundCrumbs";
          title = encodeURIComponent(title);

          var image = encodeURIComponent('http://static-maps.yandex.ru/1.x/?lang=en-US&ll=' + data.coord_x +
                ',' + data.coord_y + '&z=13&l=map&size=600,300&pt='+ data.coord_x +
                ',' + data.coord_y +',pmgrm');
          var link = encodeURIComponent('http://www.openstreetmap.org/?mlat=' + data.coord_y + '&mlon=' + data.coord_x + 
                 '&zoom=18#map=18/' + data.coord_y + '/' + data.coord_x);

          return "https://vk.com/share.php?url=" + link + "&title=" + title + "&description=" + title +
               "&image=" + image + "&noparse=false";
        }

        function saveToHistory(audio, mid) {
            firebase.database().ref('History' + '/' + audio.key + mid).set({
                uid: mid,
                date: Date.now(),
                sound: audio.sound
            });
        }

        function countRecordsInCrumbsArea() {
            const crumbsFilterRadius = 0.00450; // ~500 метров
            var
               x = window.geoData.coords.longitude,
               y = window.geoData.coords.latitude,
               sqrRadius = Math.pow(crumbsFilterRadius, 2),
               resultObjects = [];
            ref.orderByChild('coord_x').startAt(x - crumbsFilterRadius).endAt(x + crumbsFilterRadius).on('value', function(snapshot) {
               snapshot.forEach(function(point) {
                   val = point.val();
                   if (!val.removed && Math.pow(val['coord_x'] - x, 2) + Math.pow(val['coord_y'] - y, 2) <= sqrRadius) {
                     resultObjects.push(point)
                   }
               });
            });
            return resultObjects.length;
        }
    }

    return AudioListenerCtrl;
});
