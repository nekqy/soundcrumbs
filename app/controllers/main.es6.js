define(['./MainCtrl.es6', './AudioListCtrl', './CreateAudioCtrl', './RecordAudioCtrl', './FirebaseCtrl', './mapCtrl'], function(MainCtrl, AudioListCtrl, CreateAudioCtrl, RecordAudioCtrl, FirebaseCtrl, mapCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'MainCtrl': ['$scope', 'VKApi', MainCtrl],
        'AudioListCtrl': ['$scope', 'VKApi', '$sce', AudioListCtrl],
        'CreateAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', CreateAudioCtrl],
        'RecordAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', 'geolocation', RecordAudioCtrl],
        'FirebaseCtrl': ['$scope', '$firebaseArray', FirebaseCtrl],
        'mapCtrl': ['$scope', 'geolocation', '$firebaseArray', mapCtrl]
    });
});
