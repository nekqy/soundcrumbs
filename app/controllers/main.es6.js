define(['./MainCtrl.es6', './AudioListCtrl', './CreateAudioCtrl'], function(MainCtrl, AudioListCtrl, CreateAudioCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'MainCtrl': ['$scope', 'VKApi', MainCtrl],
        'AudioListCtrl': ['$scope', 'VKApi', '$sce', AudioListCtrl],
        'CreateAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', CreateAudioCtrl]
    });
});
