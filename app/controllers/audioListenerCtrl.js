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
               liked,
               disliked;
            fbAudioLikeField.once('value', function(likeSn) {
                rating += likeSn.numChildren();
                liked = likeSn.numChildren();
                if (likeSn.hasChild($scope.mid)) {
                    rating--;
                }
                fbAudioDislikeField = fbAudio.child('disliked');
                fbAudioDislikeField.once('value', function(dislikeSn) {
                    rating -= dislikeSn.numChildren();
                    disliked = dislikeSn.numChildren();
                    if (dislikeSn.hasChild($scope.mid)) {
                        rating++;
                    }
                    if (like) {
                        fbAudioLikeField.child($scope.mid).set(true);
                        fbAudioDislikeField.child($scope.mid).remove();
                        rating++;
                    } else {
                        fbAudioLikeField.child($scope.mid).remove();
                        fbAudioDislikeField.child($scope.mid).set(true);
                        rating--;
                    }
                    audio.rating = rating;
                    if (disliked != 0 && liked != 0 && liked / disliked <= AUDIO_LIKE_RATIO_MINIMAL) {
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
        $scope.addToHistory = function(audio) {
            VKApi.getSession().then(function(session) {
                saveToHistory(audio, session.mid);
            });
        };

        function saveToHistory(audio, mid) {
            firebase.database().ref('History' + '/' + btoa(mid + audio.sound)).set({
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
