define([], function() {
    function MainCtrl($scope, VKApi) {
        var self = this;
        var fields = ['uid', 'first_name', 'last_name', 'nickname', 'sex',
            'birthdate', 'city', 'country', 'timezone', 'photo', 'photo_medium',
            'photo_big', 'domain', 'has_mobile', 'rate', 'contacts', 'education', 'online', 'counters'];

        self.$scope = $scope;
        self.VKApi = VKApi;

        VKApi.getUser(fields).then(user => {
            self.$scope.user = user;
            self.countFriends = user.counters.friends;
            self.countFollowers = user.counters.followers;
        });
    }

    return MainCtrl;
});
