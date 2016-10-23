define([], function() {
    function FriendsCtrl($scope, friends) {
        var self = this;
        self.$scope = $scope;
        self.friends = friends;
    }

    return FriendsCtrl;
});
