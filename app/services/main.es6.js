define(['./VkApiProvider.es6'], function(VkApiProvider) {
    angular.module('SoundCrumbs.service', [])
       .factory('VK', ['$window', function($window) { return angular.isDefined($window.VK) ? $window.VK : null }])
       .provider('VKApi', VkApiProvider);
});
