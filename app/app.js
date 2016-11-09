define([
    './bootup',
    './bower_components/angular/angular', 
    './bower_components/angular-route/angular-route',
    './bower_components/angularfire/dist/angularfire',
    './services/main.es6',
    './controllers/main.es6', 
    './bower_components/angularjs-geolocation/src/geolocation'
], function(bootup) {
    'use strict';

    bootup.then(function() {

        // Declare app level module which depends on views, and components
        var app = window.app = angular.module('soundcrumbs', [
            'ngRoute',
            'firebase',
            'SoundCrumbs.service',
            'SoundCrumbs.controllers',
            'geolocation'
        ]);

        app.constant('fields', ['uid', 'first_name', 'last_name', 'nickname', 'sex',
            'birthdate', 'city', 'country', 'timezone', 'photo', 'photo_medium',
            'photo_big', 'domain', 'has_mobile', 'rate', 'contacts', 'education', 'online', 'counters']);

        app.
        config(['VKApiProvider', function(VKApiProvider) {
            VKApiProvider.setSettings({
                apiId: 5491230,
                apiVersion: '5.59'
            });
        }]).
        config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.otherwise({redirectTo: '/map'});
        }]).
        config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.when('/firebase', {
                templateUrl: 'partials/firebase.html',
                controller: 'FirebaseCtrl'
            });

        }]).
        config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.when('/me', {
                templateUrl: 'partials/me.html',
                controller: 'MainCtrl'
            });

        }]).
        config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.when('/audioList', {
                templateUrl: 'partials/audioList.html',
                controller: 'AudioListCtrl'
            });

        }]).
        config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.when('/createAudio', {
                templateUrl: 'partials/createAudio.html',
                controller: 'CreateAudioCtrl'
            });

        }]).
        config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.when('/recordAudio', {
                templateUrl: 'partials/recordAudio.html',
                controller: 'RecordAudioCtrl'
            });

        }]).
        config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.when('/map', {
                templateUrl: 'partials/map.html',
                controller: 'mapCtrl'
            });

        }]);

        angular.bootstrap(document, ['soundcrumbs']);
    });
});
