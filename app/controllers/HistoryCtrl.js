define([], function () {
	function HistoryCtrl($scope, VKApi) {
		try {
			firebase.initializeApp({
	         apiKey: "AIzaSyBKj6ihhb0upcL8cdclGN7PUeCNzCRom5I",
	         authDomain: "soundcrumbs-168a9.firebaseapp.com",
	         databaseURL: "https://soundcrumbs-168a9.firebaseio.com",
	         storageBucket: "soundcrumbs-168a9.appspot.com",
	         messagingSenderId: "443143749176"
	      });

		} catch(e) {}

		var refHistory = firebase.database().ref('History');
		var refRecords = firebase.database().ref('SoundCrumbs');

		$scope.historyList = [];

		VKApi.getSession().then(function(session) {
			refHistory.orderByChild('uid').equalTo(session.mid).on('value', function(snapHist) {
				$scope.historyList = [];

				snapHist.forEach(function (dataHist) {
					var audio = {};
					var track = dataHist.val();

					audio.dateStr = new Date(track.date).toLocaleDateString();
					audio.date = new Date(track.date);

					refRecords.orderByChild('sound').equalTo(track.sound).on('value', function(snapRecord) {
						snapRecord.forEach(function (dataRecord) {
							var trackData = dataRecord.val();

							audio.description = trackData.description;
							audio.rating = Object.keys(trackData.liked || {}).length - Object.keys(trackData.disliked || {}).length;

							audio.shareUrl = getShareUrl(trackData);
						});
					});

					$scope.historyList.push(audio);
				});
			});
		});

		function getShareUrl(data) {
			var title; 
			if (data.description)
				title = "Прийди туда и послушай " + data.description + " в SoundCrumbs";
			else
				title = "Прийди туда и послушай запись в SoundCrumbs";
			title = encodeURIComponent(title);

			var image = encodeURIComponent('http://static-maps.yandex.ru/1.x/?lang=en-US&ll=' + data.coord_x +
						',' + data.coord_y + '&z=13&l=map&size=600,300&pt='+ data.coord_x +
						',' + data.coord_y +',pmgrm');
			var link = encodeURIComponent('http://www.openstreetmap.org/?mlat=' + data.coord_y + '&mlon=' + data.coord_x + 
					   '&zoom=18#map=18/' + data.coord_y + '/' + data.coord_x);

			return "https://vk.com/share.php?url=" + link + "&title=" + title + "&description=" + title +
				   "&image=" + image + "&noparse=false";
		}

	    $scope.goToBack = function()
	    {
	      rb1.move('right');
	    };

	}

	return HistoryCtrl;
});
