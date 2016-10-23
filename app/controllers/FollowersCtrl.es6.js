define([], function() {
    function FollowersCtrl($scope, followers) {
        var self = this;
        self.$scope = $scope;
        self.followers = followers;
    }

    return FollowersCtrl;
});
