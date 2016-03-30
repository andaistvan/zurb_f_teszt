(function ($, scope, undefined) {
    "use strict";
    function NextendSmartSliderWidgetBarVertical(id, bars, parameters) {

        this.slider = window[id];
        
        this.slider.started($.proxy(this.start, this, id, bars, parameters));
    };

    NextendSmartSliderWidgetBarVertical.prototype.start = function (id, bars, parameters) {

        if (this.slider.sliderElement.data('bar')) {
            return false;
        }
        this.slider.sliderElement.data('bar', this);

        this.offset = 0;
        this.tween = null;

        this.originalBars = this.bars = bars;
        this.bar = this.slider.sliderElement.find('.nextend-bar');
        this.bar2 = this.bar.find('> div');
        this.innerBar = this.bar2.find('> div');

        this.slider.sliderElement.on('slideCountChanged', $.proxy(this.onSlideCountChanged, this));

        if (parameters.animate) {
            this.slider.sliderElement.on('mainAnimationStart', $.proxy(this.onSliderSwitchToAnimateStart, this));
        } else {
            this.slider.sliderElement.on('sliderSwitchTo', $.proxy(this.onSliderSwitchTo, this));
        }

        this.slider.sliderElement
            .on('SliderResize', $.proxy(this.onResize, this));

        this.size = this.bar.width();

        if (parameters.overlay == 0) {
            var side = false;
            switch (parameters.area) {
                case 5:
                    side = 'Left';
                    break;
                case 8:
                    side = 'Right';
                    break;
            }
            if (side) {
                this.offset = parseFloat(this.bar.data('offset'));
                this.slider.responsive.addMargin(side, this);
            }
        }
    };

    NextendSmartSliderWidgetBarVertical.prototype.onSliderSwitchTo = function (e, targetSlideIndex) {
        this.innerBar.html(this.bars[targetSlideIndex]);
    };

    NextendSmartSliderWidgetBarVertical.prototype.onSliderSwitchToAnimateStart = function () {
        var deferred = $.Deferred();
        this.slider.sliderElement.on('mainAnimationComplete.n2Bar', $.proxy(this.onSliderSwitchToAnimateEnd, this, deferred));
        if (this.tween) {
            this.tween.pause();
        }
        NextendTween.to(this.innerBar, 0.3, {
            opacity: 0,
            onComplete: function () {
                deferred.resolve();
            }
        });
    };

    NextendSmartSliderWidgetBarVertical.prototype.onSliderSwitchToAnimateEnd = function (deferred, e, animation, previousSlideIndex, targetSlideIndex) {
        this.slider.sliderElement.off('.n2Bar');
        deferred.done($.proxy(function () {
            var innerBar = this.innerBar.clone();
            this.innerBar.remove();
            this.innerBar = innerBar.css('opacity', 0)
                .html(this.bars[targetSlideIndex])
                .appendTo(this.bar2);

            this.tween = NextendTween.to(this.innerBar, 0.3, {
                opacity: 1
            });
        }, this));
    };

    NextendSmartSliderWidgetBarVertical.prototype.onResize = function (e, ratios) {
        this.bar.width(parseInt(this.size * ratios.w));
    };

    NextendSmartSliderWidgetBarVertical.prototype.isVisible = function () {
        return this.bar.is(':visible');
    };

    NextendSmartSliderWidgetBarVertical.prototype.getSize = function () {
        return this.size + this.offset;
    };

    NextendSmartSliderWidgetBarVertical.prototype.onSlideCountChanged = function (e, newCount, slidesInGroup) {
        this.bars = [];
        for (var i = 0; i < this.originalBars.length; i++) {
            if (i % slidesInGroup == 0) {
                this.bars.push(this.originalBars[i]);
            }
        }
    };

    scope.NextendSmartSliderWidgetBarVertical = NextendSmartSliderWidgetBarVertical;
})(n2, window);