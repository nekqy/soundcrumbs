define([], function() {
    function CreateAudioCtrl($scope, VKApi, $http, $sce) {
        var self = this;
        self.$scope = $scope;
        self.VKApi = VKApi;

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        VKApi.getSession().then(session => {
            $scope.sid = session.sid;
        });

        $scope.submitClick = function() {
            $scope.wait = 'Please wait! Audio file uploading.......';
        };

        $('#uploadForm').ajaxForm(function(res) {
            //alert("Thank you for your comment!");
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
