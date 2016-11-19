define([], function() {
    function AudioListenerCtrl($scope, AUDIO_RATING_INITIAL, AUDIO_LIKE_RATIO_MINIMAL, $sce, VKApi) {

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
    }

    return AudioListenerCtrl;
});
