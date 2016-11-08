define([], function() {
    function AudioListCtrl($scope, VKApi, $sce) {
        var self = this;
        self.$scope = $scope;
        self.VKApi = VKApi;

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.searchString = '';

        $scope.getAudio = function() {
            VKApi.getAudio({
                q: $scope.searchString
            }).then(function(audioList) {
                self.$scope.audioList = audioList;
            });
        };

    }

    return AudioListCtrl;
});
