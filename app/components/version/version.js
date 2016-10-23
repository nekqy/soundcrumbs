'use strict';

angular.module('SoundCrumbs.version', [
  'SoundCrumbs.version.interpolate-filter',
  'SoundCrumbs.version.version-directive'
])

.value('version', '0.1');
