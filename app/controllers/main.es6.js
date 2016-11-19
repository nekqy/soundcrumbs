define(['./audioListenerCtrl', './CreateAudioCtrl', './RecordAudioCtrl', './mapCtrl', './HistoryCtrl'],
    function(AudioListenerCtrl, CreateAudioCtrl, RecordAudioCtrl, mapCtrl, HistoryCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'AudioListenerCtrl': ['$scope', 'AUDIO_RATING_MINIMAL', 'AUDIO_RATING_INITIAL', '$sce', 'VKApi', AudioListenerCtrl],
        'CreateAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', CreateAudioCtrl],
        'RecordAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', 'geolocation', RecordAudioCtrl],
        'HistoryCtrl': ['$scope', 'VKApi', HistoryCtrl],
        'mapCtrl': ['$scope', 'VKApi', 'geolocation', mapCtrl]
    });
});
