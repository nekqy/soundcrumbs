define(['./MainCtrl.es6', './AudioListCtrl', './CreateAudioCtrl', './RecordAudioCtrl'], function(MainCtrl, AudioListCtrl, CreateAudioCtrl, RecordAudioCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'MainCtrl': ['$scope', 'VKApi', MainCtrl],
        'AudioListCtrl': ['$scope', 'VKApi', '$sce', AudioListCtrl],
        'CreateAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', CreateAudioCtrl],
        'RecordAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', 'geolocation', RecordAudioCtrl]
    });
});
