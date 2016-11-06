define([], function() {
    function AudioListenerCtrl($scope, $sce) {

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.goToBack = function() {
            rb1.move('top');
        };

    }

    return AudioListenerCtrl;
});
