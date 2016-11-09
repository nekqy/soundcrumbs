define(['./vendor/smartResizer'], function(SmartResizer) {
    window.log = function(text) {
        var log = $('.log');
        log.html(log.html() + '<p>' + text + '</p>');
    };
    window.isMapScreen = function() {
        if (!rb1) return false;
        return rb1._screenManager.getCurScreen() === mapScreen;
    };

    var historyScreen = new rb.Screen("");
    var mapScreen = new rb.Screen("" +
        "<div ng-controller='mapCtrl'>" +
        "<div id='map'></div>" +
        "<div class='recordButton'>" +
        "<button class='recordButton-button' ng-if='geoData' ng-click='goToRecord()'>+</button>" +
        "</div>" +
        "</div>", undefined, true);
    historyScreen.addChild(mapScreen);

    var load2 = new Promise(function(resolve) {
        $.get('partials/mapRecord.html', function(data) {
            var recordScreen = new rb.Screen('<div ng-controller="RecordAudioCtrl">' + data + '</div>', undefined, true);
            mapScreen.addChild(recordScreen);
            resolve(true);
        });
    });
    var load3 = new Promise(function(resolve) {
        $.get('partials/audioListener.html', function (data) {
            var audioListenerScreen = new rb.Screen('<div ng-controller="AudioListenerCtrl">' + data + '</div>', undefined, true);
            historyScreen.addChild(audioListenerScreen);
            resolve(true);
        });
    });

    return Promise.all([load2, load3]).then(function() {
        return new Promise(function(resolve) {
            rb.start({rb1: mapScreen}, function() {
                rb.Instances.rb1.getControlManager().disableAll();
                window.rb1 = rb.Instances.rb1;

                var smartResizer = new SmartResizer(rb1._mainDiv);
                rb1.addPlugin(smartResizer);

                resolve(true);
            });
        });
    });
});