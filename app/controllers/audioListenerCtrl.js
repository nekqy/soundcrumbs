define([], function() {
    function AudioListenerCtrl($scope, $sce) {

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.goToBack = function() {
            rb1.move('top');
        };
        $scope.isMyAudio = function(audio) {
            return audio.uid === '299971';
        };
        $scope.deleteAudio = function(audio) {
            console.log(audio);
        };

    }

    return AudioListenerCtrl;
});
