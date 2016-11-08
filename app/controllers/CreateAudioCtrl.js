define([], function() {
    function CreateAudioCtrl($scope, VKApi, $http, $sce) {
        var self = this;
        self.$scope = $scope;
        self.VKApi = VKApi;

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.uploadUrl = window.location.origin + '/upload';

        // надо иметь актуальный sid
        setInterval(function() {
            VKApi.getSession().then(function(session) {
                $scope.sid = session.sid;
            });
        }, 60 * 1000);
        VKApi.getSession().then(function(session) {
            $scope.sid = session.sid;
        });

        $scope.submitClick = function() {
            $scope.wait = 'Please wait! Audio file uploading.......';
        };

        $('#uploadForm').ajaxForm(function(res) {
            res = JSON.parse(res);
            if (res.error) {
                console.error(res.error);
                $scope.wait = 'Error.';
                self.$scope.$apply();
                return;
            }

            console.log('audio loaded.');
            self.$scope.audio = res.response;
            self.$scope.text = 'text';
            $scope.wait = 'Done.';
            self.$scope.$apply();
        });
    }

    return CreateAudioCtrl;
});
