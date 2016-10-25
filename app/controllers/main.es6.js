define(['./MainCtrl.es6', './AudioListCtrl'], function(MainCtrl, AudioListCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'MainCtrl': ['$scope', 'VKApi', '$sce', MainCtrl],
        'AudioListCtrl': ['$scope', 'VKApi', '$sce', AudioListCtrl]
    });
});
