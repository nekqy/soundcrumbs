define([], function () {
	function HistoryCtrl($scope, VKApi) {
		var refHistory = firebase.database().ref('History');
		var refRecords = firebase.database().ref('SoundCrumbs');

		$scope.historyList = [];

		VKApi.getSession().then(function(session) {
			refHistory.orderByChild('uid').equalTo(session.mid).orderByChild('date').on('value', function(snapHist) {
				snapHist.forEach(function (dataHist) {
					var audio = {};
					var track = dataHist.val();

					audio.dateStr = new Date(track.date).toLocaleDateString();

					refRecords.orderByChild('sound').equalTo(track.sound).on('value', function(snapRecord) {
						snapRecord.forEach(function (dataRecord) {
							var trackData = dataRecord.val();

							audio.description = trackData.description;
							audio.rating = trackData.rating;
						});
					});

					$scope.historyList.push(audio);
				});
			});
		});
	}

	return HistoryCtrl;
});