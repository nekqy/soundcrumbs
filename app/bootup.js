define(['./vendor/smartResizer'], function(SmartResizer) {
    window.log = function(text) {
        var log = $('.log');
        log.html(log.html() + '<p>' + text + '</p>');
    };

    setTimeout(function() {

    var historyScreen = new rb.Screen("");
    var mapScreen = new rb.Screen("" +
        "<div ng-controller='mapCtrl'>" +
        "<div id='map'></div>" +
        "<div class='recordButton'>" +
        "<button class='recordButton-button' ng-click='goToRecord()'>+</button>" +
        "</div>" +
        "</div>", undefined, true);
    historyScreen.addChild(mapScreen);

    rb.start({rb1: mapScreen}, function() {
        rb.Instances.rb1.getControlManager().disableAll();
        window.rb1 = rb.Instances.rb1;

        var smartResizer = new SmartResizer(rb1._mainDiv);
        rb1.addPlugin(smartResizer);
    });

    $.get('partials/mapRecord.html', function(data) {
        var recordScreen = new rb.Screen('<div ng-controller="RecordAudioCtrl">' + data + '</div>', undefined, true);
        mapScreen.addChild(recordScreen);
    });
    $.get('partials/audioListener.html', function(data) {
        var audioListenerScreen = new rb.Screen('<div ng-controller="AudioListenerCtrl">' + data + '</div>', undefined, true);
        historyScreen.addChild(audioListenerScreen);
    });
    }, 5000);

    app.run();

});