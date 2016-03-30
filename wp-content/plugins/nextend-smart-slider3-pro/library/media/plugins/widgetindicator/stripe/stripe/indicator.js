(function ($, scope, undefined) {
    "use strict";
    function NextendSmartSliderWidgetIndicatorStripe(id, parameters) {
        this.offset = 0;
        this.slider = window[id];

        this.slider.started($.proxy(this.start, this, id, parameters));
    };

    NextendSmartSliderWidgetIndicatorStripe.prototype.start = function (id, parameters) {

        if (this.slider.sliderElement.data('indicator')) {
            return false;
        }
        this.slider.sliderElement.data('indicator', this);

        this.track = this.slider.sliderElement.find('.nextend-indicator-stripe');

        // Autoplay not enabled, so just destroy the widget
        if (this.slider.controls.autoplay._disabled) {
            this.destroy();
        } else {

            this.slider.controls.autoplay.enableProgress();

            this.bar = this.track.find('div');
            this.slider.sliderElement.on('autoplayDisabled', $.proxy(this.destroy, this))
                .on('autoplay', $.proxy(this.onProgress, this));

            if (parameters.overlay == 0) {
                var side = false;
                switch (parameters.area) {
                    case 1:
                        side = 'Top';
                        break;
                    case 12:
                        side = 'Bottom';
                        break;
                }
                if (side) {
                    this.offset = parseFloat(this.track.data('offset'));
                    this.slider.responsive.addStaticMargin(side, this);
                }
            }
        }
    };

    NextendSmartSliderWidgetIndicatorStripe.prototype.onProgress = function (e, progress) {
        this.bar.width((progress * 100) + '%');
    };

    NextendSmartSliderWidgetIndicatorStripe.prototype.destroy = function () {
        this.track.remove();
    };

    NextendSmartSliderWidgetIndicatorStripe.prototype.isVisible = function () {
        return this.bar.is(':visible');
    };

    NextendSmartSliderWidgetIndicatorStripe.prototype.getSize = function () {
        return this.track.height() + this.offset;
    };
    scope.NextendSmartSliderWidgetIndicatorStripe = NextendSmartSliderWidgetIndicatorStripe;
})(n2, window);