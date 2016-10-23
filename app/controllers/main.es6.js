define(['./MainCtrl.es6', './FriendsCtrl.es6', './FollowersCtrl.es6', './UserDetailCtrl.es6'], function(MainCtrl, FriendsCtrl, FollowersCtrl, UserDetailCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'MainCtrl': ['$scope', 'VKApi', '$sce', MainCtrl],
        'FriendsCtrl': ['$scope', 'friends', FriendsCtrl],
        'FollowersCtrl': ['$scope', 'followers', FollowersCtrl],
        'UserDetailCtrl': ['$scope', 'user', UserDetailCtrl]
    });
});
