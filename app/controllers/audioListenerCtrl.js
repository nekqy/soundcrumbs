define([], function() {
    function AudioListenerCtrl($scope, $sce) {

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.goToBack = function() {
            rb1.move('top');
        };
        $scope.isMyAudio = function(audio) {
            return audio.uid.toString() === $scope.mid.toString();
        };
        $scope.deleteAudio = function(audio) {
            var isOk = confirm('Вы уверены?');
            if (!isOk) return;

            var ref = $scope.ref;

            // todo надо было так структурировать чтобы можно было несколько запросов делать
            // https://codedump.io/share/U5MXVQDGfPS/1/firebase---how-do-i-write-multiple-orderbychild-for-extracting-data
            ref.orderByChild("date").equalTo(audio.date).on('value', function(snapshot){
                // todo тут будет баг, если записей с одинаковой датой больше 10, 11ю не найдем
                snapshot.forEach(function(point) {
                    var val = point.val();
                    if (val.uid.toString() === $scope.mid.toString()) {
                        ref.child(point.getKey()).remove();
                        $scope.audioList.splice($scope.audioList.indexOf(audio), 1);
                    }
                });
            });

        };

    }

    return AudioListenerCtrl;
});
