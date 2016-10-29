define(['recorder'], function(Recorder) {
    function CreateAudioCtrl($scope, VKApi, $http, $sce) {
        var self = this;
        self.$scope = $scope;
        self.VKApi = VKApi;

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        VKApi.getSession().then(session => {
            $scope.sid = session.sid;
        });

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


                var fd = new FormData();
                fd.append('file', blob);
                fd.append('sid', $scope.sid);
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:3000/upload',
                    data: fd,
                    processData: false,
                    contentType: false
                }).done(function(data) {
                    console.log(data);
                });


                au.controls = true;
                au.src = url;
                hf.href = url;
                hf.download = new Date().toISOString() + '.wav';
                hf.innerHTML = hf.download;
                li.appendChild(au);
                li.appendChild(hf);
                $('#recordingslist').append($(li));
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

        navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
            __log('No live audio input: ' + e);
        });

    }

    return CreateAudioCtrl;
});
