define(['bower_components/firebase/firebase'], function() {
   function FirebaseCtrl($scope) {

      try {
         // Initialize firebase module
         firebase.initializeApp({
            apiKey: "AIzaSyBKj6ihhb0upcL8cdclGN7PUeCNzCRom5I",
            authDomain: "soundcrumbs-168a9.firebaseapp.com",
            databaseURL: "https://soundcrumbs-168a9.firebaseio.com",
            storageBucket: "soundcrumbs-168a9.appspot.com",
            messagingSenderId: "443143749176"
         });
      } catch(e) {
      }

      var
         ref = firebase.database().ref('SoundCrumbs');

      function applySnapshot(snapshot) {
         var
            x = parseFloat($scope.crumbsFilter.x),
            y = parseFloat($scope.crumbsFilter.y),
            radius = Math.pow(parseFloat($scope.crumbsFilter.radius), 2),
            val, px, py;
         $scope.crumbs = [];
         snapshot.forEach(function(point) {
            val = point.val();
            px = val['coord_x'];
            py = val['coord_y'];
            if (Math.pow(px - x, 2) + Math.pow(py - y, 2) <= radius) {
               $scope.crumbs.push(val);
            }
         });
      }

      $scope.createCrumb = function (properties) {
         firebase.database().ref('SoundCrumbs' + '/' + chance.guid()).set(properties);
      };

      $scope.crumb = { uid: '', date: '', sound: '', coord_x: '', coord_y: '', rating: '' };

      $scope.createRandomCrumb = function() {
         $scope.createCrumb({
            uid: chance.fbid(),
            date: chance.date({ string: true, american: false }),
            sound: chance.url({ domain: 'vk.com/music', extensions: ['mp3'] }),
            coord_x: chance.floating({min: 0, max: 100, fixed: 5}) ,
            coord_y: chance.floating({min: 0, max: 100, fixed: 5}) ,
            rating: chance.integer({ min: -10, max: 10 })
         });
      };

      $scope.clearAllData = function() {
         if (confirm('Внимание! Операция необратима! Вы действительно желаете очистить все данные?')) {
            ref.remove();
         }
      };

      $scope.crumbsFilter = {
         x: 57.5,
         y: 39.5,
         radius: 30
      };
      $scope.applyCrumbsFilter = function(crumbsFilter) {
         var
            startX = parseFloat(crumbsFilter.x) - parseFloat(crumbsFilter.radius),
            endX = parseFloat(crumbsFilter.x) + parseFloat(crumbsFilter.radius);
         ref.orderByChild('coord_x').startAt(startX).endAt(endX).on('value', function(snapshot) {
            applySnapshot(snapshot);
         });
      };
      //$scope.applyCrumbsFilter($scope.crumbsFilter);
      $scope.filterFormVisible = false;
      $scope.toggleFilterForm = function() {
         $scope.filterFormVisible = !$scope.filterFormVisible;
      };

      $scope.createCrumbFormVisible = false;
      $scope.toggleCreateCrumbForm = function() {
         $scope.createCrumbFormVisible = !$scope.createCrumbFormVisible;
      }
   }

   return FirebaseCtrl;
});