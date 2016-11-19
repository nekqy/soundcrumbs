define(['./audioListenerCtrl', './CreateAudioCtrl', './RecordAudioCtrl', './mapCtrl', './HistoryCtrl'],
    function(AudioListenerCtrl, CreateAudioCtrl, RecordAudioCtrl, mapCtrl, HistoryCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'AudioListenerCtrl': ['$scope', 'AUDIO_RATING_INITIAL', 'AUDIO_LIKE_RATIO_MINIMAL', '$sce', AudioListenerCtrl],
        'CreateAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', CreateAudioCtrl],
        'RecordAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', 'geolocation', RecordAudioCtrl],
        'mapCtrl': ['$scope', 'VKApi', 'geolocation', 'AUDIO_RATING_INITIAL', mapCtrl],
        'HistoryCtrl': ['$scope', 'VKApi', HistoryCtrl]
    });
});
