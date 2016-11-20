define([], function() {
    "use strict";

    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    function debounce(func, threshold, execAsap) {
        var timeout;

        return function debounced () {
            var obj = this, args = arguments;
            function delayed () {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            }

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100);
        };
    }
    window.debounce = debounce;

    // smartresize
    $.fn['smartresize'] = function(fn){
        return fn ? this.on('resize', debounce(fn)) : this.trigger('smartresize');
    };

    function SmartResizer(mainDiv) {
        if (mainDiv instanceof $) {
            this.mainDiv = mainDiv;
        } else {
            throw new Error('SmartResizer module - init - wrong mainDiv arg: ' + mainDiv);
        }

        this.width = mainDiv.width();
        this.height = mainDiv.height();

        var self = this;

        this._smartResizeHandler = function() {
            var
                rbCenter = self.mainDiv.find('.rb__center'),
                newWidth = $(window).width(),
                newHeight = $(window).height();

            self.mainDiv.css({'width': newWidth, 'height': newHeight});
            rbCenter.css({'margin-left': newWidth, 'margin-top': newHeight});

            if (typeof mapboxInst !== 'undefined') {
                $('.mapboxgl-canvas').css({'width': newWidth, 'height': newHeight});
                mapboxInst.resize();
            }
        };

        this._smartResizeHandler();
        $(window).smartresize(this._smartResizeHandler);
    }
    rb.IPlugin.inherite(SmartResizer);

    SmartResizer.prototype.configure = function() {

    };
    SmartResizer.prototype.destroy = function() {
        $(window).off('resize');
    };

    return SmartResizer;
});
