define(['bower_components/firebase/firebase'], function() {
   function FirebaseCtrl($scope, $firebaseArray) {

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
      $scope.crumbs = $firebaseArray(ref);
      $scope.createCrumb = function (properties) {
         firebase.database().ref('SoundCrumbs' + '/' + chance.guid()).set(properties);
      };
      $scope.crumb = {
         uid: '',
         date: '',
         sound: '',
         coord_x: '',
         coord_y: '',
         rating: ''
      };
      $scope.createRandomCrumb = function() {
         $scope.createCrumb({
            uid: chance.fbid(),
            date: chance.date({ string: true, american: false }),
            sound: chance.url({ domain: 'vk.com/music', extensions: ['mp3'] }),
            coord_x: chance.floating({min: -100, max: 100, fixed: 2}) ,
            coord_y: chance.floating({min: -100, max: 100, fixed: 2}) ,
            rating: chance.integer({ min: -20, max: 20 })
         });
      };
      $scope.clearAllData = function() {
         if (confirm('Внимание! Операция необратима! Вы действительно желаете очистить все данные?')) {
            firebase.database().ref('SoundCrumbs').remove();
         }
      };
      $scope.crumbsFilter = {
         start: {
            x: 39,
            y: 34
         },
         end: {
            x: 40,
            y: 35
         }
      };
      $scope.applyCrumbsFilter = function(crumbsFilter) {
         $scope.crumbs = $firebaseArray(ref.orderByChild('coord_x').startAt(crumbsFilter.start.x).endAt(crumbsFilter.end.x));
      };
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