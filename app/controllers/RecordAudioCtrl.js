define([], function() {
   function CreateAudioCtrl($scope, VKApi, $http, $sce, geolocation) {
       var self = this;
       self.$scope = $scope;
       self.VKApi = VKApi;

       $scope.trustSrc = function(src) {
           return $sce.trustAsResourceUrl(src);
       };

       var audio_context;
       var recorder;
       var audioId;
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
           var log = $('#log')[0];
           if (log) {
               log.innerHTML += "\n" + e + " " + (data || '');
           }
       }

       function getValueForSave(blob) {
           $scope.info = 'audio save started';
           return new Promise(function(resolve, reject) {
               // надо иметь актуальный sid
               $scope.info = 'getting session';
               VKApi.getSession().then(function(session) {
                   $scope.info = 'getting upload server';
                   VKApi.getUploadServer().then(function(response) {
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
                           VKApi.audioSave(res).then(function(vkData) {
                               resolve({
                                   geoData: window.geoData,
                                   vkData: vkData
                               });
                           }, function(err) {
                                alert("Не удалось сохранить запись.");
                                console.log(err);
                                reject(err);
                           });
                       }).fail(function(err) {
                           reject(err);
                       });
                   }, function(err) {
                       reject(err);
                   });
               }, function(err) {
                   reject(err);
               });
           });
       }

       $scope.formData = {};
       $scope.audioList = [];

       $scope.clearSearch = function() {
           $scope.audioList = [];
           $scope.formData.searchString = '';
           $scope.searchMode = false;
       };

       $scope.getAudio = function() {
           $scope.useSmallRecordButton = true;
           VKApi.getAudio({
               q: $scope.formData.searchString
           }).then(function(audioList) {
               $scope.audioList = audioList;
               $scope.searchMode = true;
           });
       };
       $scope.selectAudio = function(audio) {
           function guid() {
               function s4() {
                   return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
               }
               return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                   s4() + '-' + s4() + s4() + s4();
           }

           VKApi.getSession().then(function (session) {
               audioId = audio.aid;
               saveAudio({
                   geoData: window.geoData,
                   vkData: {
                       title: guid(),
                       owner_id: session.mid,
                       url: audio.url
                   }
               });
           }, logError);
       };

       $scope.isRecording = false;
       $scope.isNotRecording = true;
       $scope.isUploadingFile = false;
       $scope.isNotUploadingFile = true;
       $scope.cantUserMedia = false;

       $scope.startRecording = function() {
           //var button = $('.startButton')[0];
           recorder && recorder.record();
           //button.disabled = true;
           //button.nextElementSibling.disabled = false;
           __log('Recording...');

           audioId = null;
           $scope.isUploadingFile = false;
           $scope.isNotUploadingFile = true;
           $scope.isRecording = true;
           $scope.isNotRecording = false;
           $scope.log = 'Recording...';
       };
       $scope.stopRecording = function() {
           recorder && recorder.stop();
           //button.disabled = true;
           //button.previousElementSibling.disabled = false;
           __log('Stopped recording.');

           $scope.isRecording = false;
           $scope.isNotRecording = false;
           $scope.log = 'Saving...';

           var button = $('.stopButton');
           button.toggleClass('button-disabled', true);

           // create WAV download link using audio data blob
           createDownloadLink();

           recorder.clear();
       };
       $scope.goToBack = function() {
           $scope.isRecording = false;
           $scope.isNotRecording = true;
           $scope.log = '';

           $scope.isUploadingFile = false;
           $scope.isNotUploadingFile = true;

           $scope.formData = {};
           $scope.audioList = [];

           var button = $('.stopButton');
           button.toggleClass('button-disabled', false);

           $scope.clearSearch();

           rb1.move('left');
       };
       $scope.openUploadForm = function() {
           $scope.isUploadingFile = true;
           $scope.isNotUploadingFile = false;
       };
       $scope.closeUploadForm = function() {
           $scope.isUploadingFile = false;
           $scope.isNotUploadingFile = true;
       };

      $scope.submitClick = function() {
          var inp = document.getElementById("file");

          if ( inp.files[0] && (inp.files[0].type == "audio/mp3" || inp.files[0].type == "audio/wav") ) {

            getValueForSave(inp.files[0]).then(saveAudio, logError);
            $scope.log = "Uploading file";
          }
          else { alert( "Не верный формат файла" ) }
      }
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

               getValueForSave(blob).then(saveAudio, logError);
           });
       }
       function logError(err) {
           $scope.info = JSON.stringify(err);
           log(JSON.stringify(err));
           if ($scope.$$phase !== '$apply' && $scope.$$phase !== '$digest') {
               $scope.$apply();
           }
           if (!isDevelopment)
            $scope.goToBack();
       }

       function saveAudio(res) {
           var addingAudio = $scope.audioList.find(function(val) {
              return val.aid === audioId;
           });
           var defaultDescription = addingAudio ? addingAudio.artist + ' - ' + addingAudio.title : '';
           var description = prompt('Введите описание (необязательно)', defaultDescription);
           firebase.database().ref('SoundCrumbs' + '/' + res.vkData.title).set({
               uid: res.vkData.owner_id,
               date: res.geoData.timestamp,
               sound: res.vkData.url,
               description: description || '',
               coord_x: res.geoData.coords.longitude,
               coord_y: res.geoData.coords.latitude
           });
           $scope.info = JSON.stringify(res);

           if ($scope.$$phase !== '$apply' && $scope.$$phase !== '$digest') {
               $scope.$apply();
           }

           $scope.goToBack();
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
           log('No web audio support in this browser!');
       }

       if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
           navigator.mediaDevices.getUserMedia({audio: true}).then(startUserMedia, function(e) {
               navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
                   __log('No live audio input: ' + e);
                   log('No live audio input: ' + e);
               });
           });
       } else {
           if (navigator.getUserMedia) {
               navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
                   __log('No live audio input: ' + e);
                   log('No live audio input: ' + e);
               });
           } else {
               $scope.cantUserMedia = true;
           }
       }
   }

   return CreateAudioCtrl;
});
