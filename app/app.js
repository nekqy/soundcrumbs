define([
    './bootup',
    './bower_components/angular/angular',
    './bower_components/angularfire/dist/angularfire',
    '../node_modules/ng-media-events/src/ng-media-events',
    './services/main.es6',
    './controllers/main.es6', 
    './bower_components/angularjs-geolocation/src/geolocation'
], function(bootup) {
    'use strict';

    bootup.then(function() {

        // Declare app level module which depends on views, and components
        var app = window.app = angular.module('soundcrumbs', [
            'firebase',
            'SoundCrumbs.service',
            'SoundCrumbs.controllers',
            'geolocation',
            'ngMedia'
        ]);

        app.constant('fields', ['uid', 'first_name', 'last_name', 'nickname', 'sex',
            'birthdate', 'city', 'country', 'timezone', 'photo', 'photo_medium',
            'photo_big', 'domain', 'has_mobile', 'rate', 'contacts', 'education', 'online', 'counters']);

        app.constant('AUDIO_RATING_MINIMAL', 0);

        app.constant('AUDIO_RATING_INITIAL', 10);

        app.config(['VKApiProvider', function(VKApiProvider) {
            VKApiProvider.setSettings({
                apiId: 5491230,
                apiVersion: '5.59'
            });
        }]);

        angular.bootstrap(document, ['soundcrumbs']);
    });
});
