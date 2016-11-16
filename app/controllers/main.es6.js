define(['./MainCtrl.es6', './AudioListCtrl', './audioListenerCtrl', './CreateAudioCtrl', './RecordAudioCtrl', './FirebaseCtrl', './mapCtrl'], function(MainCtrl, AudioListCtrl, AudioListenerCtrl, CreateAudioCtrl, RecordAudioCtrl, FirebaseCtrl, mapCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'MainCtrl': ['$scope', 'VKApi', MainCtrl],
        'AudioListCtrl': ['$scope', 'VKApi', '$sce', AudioListCtrl],
        'AudioListenerCtrl': ['$scope', '$sce', AudioListenerCtrl],
        'CreateAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', CreateAudioCtrl],
        'RecordAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', 'geolocation', RecordAudioCtrl],
        'FirebaseCtrl': ['$scope', FirebaseCtrl],
        'mapCtrl': ['$scope', 'VKApi', 'geolocation', mapCtrl]
    });
});
