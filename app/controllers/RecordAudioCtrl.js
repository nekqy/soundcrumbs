define(['recorder'], function(Recorder) {
    function CreateAudioCtrl($scope, VKApi, $http, $sce, geolocation) {
        var self = this;
        self.$scope = $scope;
        self.VKApi = VKApi;

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        var audio_context;
        var recorder;
        function startUserMedia(stream) {
            var input = audio_context.createMediaStreamSource(stream);
            __log('Media stream created.');
            // Uncomment if you want the audio to feedback directly
            //input.connect(audio_context.destination);
            //__log('Input connected to audio context destination.');

            recorder = new Recorder(input);
            __log('Recorder initialised.');
        }

        function __log(e, data) {
            log.innerHTML += "\n" + e + " " + (data || '');
        }

        function getValueForSave(blob) {
            $scope.info = 'audio save started';
            return new Promise(function(resolve, reject) {
                // надо иметь актуальный sid
                $scope.info = 'getting session';
                VKApi.getSession().then(session => {
                    $scope.info = 'getting upload server';
                    VKApi.getUploadServer().then(response => {
                        $scope.info = 'getting location';
                        geolocation.getLocation().then(function(geoData){
                            $scope.info = 'posting audio';

                            var fd = new FormData();
                            fd.append('file', blob);
                            fd.append('sid', session.sid);
                            fd.append('uploadUrl', response['upload_url']);
                            $.ajax({
                                type: 'POST',
                                url: window.location.origin + '/upload',
                                data: fd,
                                processData: false,
                                contentType: false
                            }).done(function(res) {
                                res = JSON.parse(res);
                                VKApi.audioSave(res).then(vkData => {
                                    resolve({
                                        geoData: geoData,
                                        vkData: vkData
                                    });
                                });
                            }).fail(function(err) {
                                reject(err);
                            });
                        }, function(err) {
                            reject(err);
                        });
                    }, function(err) {
                        $scope.info = JSON.stringify(err);
                    });
                }, function(err) {
                    $scope.info = JSON.stringify(err);
                });
            });
        }

        // Initialize firebase module
        try {
            firebase.initializeApp({
                apiKey: "AIzaSyBKj6ihhb0upcL8cdclGN7PUeCNzCRom5I",
                authDomain: "soundcrumbs-168a9.firebaseapp.com",
                databaseURL: "https://soundcrumbs-168a9.firebaseio.com",
                storageBucket: "soundcrumbs-168a9.appspot.com",
                messagingSenderId: "443143749176"
            });
        } catch(e) {
        }

        $scope.startRecording = function() {
            var button = $('.startButton')[0];
            recorder && recorder.record();
            button.disabled = true;
            button.nextElementSibling.disabled = false;
            __log('Recording...');
        };
        $scope.stopRecording = function() {
            var button = $('.stopButton')[0];
            recorder && recorder.stop();
            button.disabled = true;
            button.previousElementSibling.disabled = false;
            __log('Stopped recording.');

            // create WAV download link using audio data blob
            createDownloadLink();

            recorder.clear();
        };
        function createDownloadLink() {
            recorder && recorder.exportWAV(function(blob) {
                var url = URL.createObjectURL(blob);
                var li = document.createElement('li');
                var au = document.createElement('audio');
                var hf = document.createElement('a');
                au.controls = true;
                au.src = url;
                hf.href = url;
                hf.download = new Date().toISOString() + '.wav';
                hf.innerHTML = hf.download;
                li.appendChild(au);
                li.appendChild(hf);
                $('#recordingslist').append($(li));

                getValueForSave(blob).then(function(res) {
                    firebase.database().ref('SoundCrumbs' + '/' + chance.guid()).set({
                        uid: res.vkData.owner_id,
                        date: res.geoData.timestamp,
                        sound: res.vkData.url,
                        coord_x: res.geoData.coords.latitude,
                        coord_y: res.geoData.coords.longitude,
                        rating: 0
                    });
                    $scope.info = JSON.stringify(res);
                    $scope.$apply();
                }, function(err) {
                    $scope.info = JSON.stringify(err);
                    $scope.$apply();
                });
            });
        }

        try {
            // webkit shim
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
            window.URL = window.URL || window.webkitURL;

            audio_context = new AudioContext;
            __log('Audio context set up.');
            __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
        } catch (e) {
            alert('No web audio support in this browser!');
        }

        navigator.mediaDevices.getUserMedia({audio: true}).then(startUserMedia, function(e) {
            navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
                __log('No live audio input: ' + e);
            });
        });
    }

    return CreateAudioCtrl;
});
