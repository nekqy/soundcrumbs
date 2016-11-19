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
						});
					});

					$scope.historyList.push(audio);
				});
			});
		});

	    $scope.goToBack = function()
	    {
	      rb1.move('right');
	    };

	}

	return HistoryCtrl;
});
