define([], function() {
    function MainCtrl($scope, VKApi, $sce) {
        var self = this;
        var fields = ['uid', 'first_name', 'last_name', 'nickname', 'sex',
            'birthdate', 'city', 'country', 'timezone', 'photo', 'photo_medium',
            'photo_big', 'domain', 'has_mobile', 'rate', 'contacts', 'education', 'online', 'counters'];

        self.$scope = $scope;
        self.VKApi = VKApi;
        $scope.readonly = true;

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        VKApi.getUser(fields).then(user => {
            self.$scope.user = user;
            self.$scope.isOnline = (user.online !== 0);
            self.countFriends = user.counters.friends;
            self.countFollowers = user.counters.followers;
        });

        //VKApi.getAudio({
        //    q: 'the Beatles'
        //}).then(audioList => {
        //    self.$scope.audioList = audioList;
        //});
    }

    return MainCtrl;
});
