'use strict';

// Declare app level module which depends on views, and components
angular.module('SoundCrumbs', [
  'ngRoute',
  'SoundCrumbs.view1',
  'SoundCrumbs.view2',
  'SoundCrumbs.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
