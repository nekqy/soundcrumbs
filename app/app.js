define(['./bower_components/angular/angular', './bower_components/angular-route/angular-route', './services/main.es6', './controllers/main.es6'], function() {
    'use strict';

    // Declare app level module which depends on views, and components
    var app = angular.module('SoundCrumbs', [
        'ngRoute',
        'SoundCrumbs.service',
        'SoundCrumbs.controllers'
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

        $routeProvider.otherwise({redirectTo: '/me'});
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

    }]);
});
