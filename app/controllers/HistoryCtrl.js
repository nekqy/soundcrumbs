define([], function () {
	function HistoryCtrl($scope, VKApi)
  {
    $scope.goToBack = function()
    {
      rb1.move('right');
    };
	}
	return HistoryCtrl;
});
