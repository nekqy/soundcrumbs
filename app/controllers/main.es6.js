define(['./audioListenerCtrl', './CreateAudioCtrl', './RecordAudioCtrl', './mapCtrl'],
    function(AudioListenerCtrl, CreateAudioCtrl, RecordAudioCtrl, mapCtrl) {
    angular.module('SoundCrumbs.controllers', []).controller({
        'AudioListenerCtrl': ['$scope', 'AUDIO_RATING_MINIMAL', 'AUDIO_RATING_INITIAL', '$sce', AudioListenerCtrl],
        'CreateAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', CreateAudioCtrl],
        'RecordAudioCtrl': ['$scope', 'VKApi', '$http', '$sce', 'geolocation', RecordAudioCtrl],
        'mapCtrl': ['$scope', 'VKApi', 'geolocation', mapCtrl]
    });
});
