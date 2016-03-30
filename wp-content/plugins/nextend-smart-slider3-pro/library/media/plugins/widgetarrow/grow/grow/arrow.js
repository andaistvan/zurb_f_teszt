(function ($, scope, undefined) {
    function NextendSmartSliderWidgetArrowGrow(id, titles, delay) {
        this.size = 48;
        this.sidePadding = 25;
        this.delay = delay;

        this.slider = window[id];

        this.slider.started($.proxy(this.start, this, id, titles, delay));
    };

    NextendSmartSliderWidgetArrowGrow.prototype.start = function (id, titles, delay) {
        if (this.slider.sliderElement.data('arrow')) {
            return false;
        }

        this.previous = $('#' + id + '-arrow-previous').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider.previous();
        }, this));

        var previousTitle = this.previous.find('.nextend-arrow-title');

        this.previous.on({
            mouseenter: $.proxy(this.mouseEnter, this, this.previous, previousTitle),
            mouseleave: $.proxy(this.mouseLeave, this, this.previous, previousTitle)
        });


        this.next = $('#' + id + '-arrow-next').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider.next();
        }, this));
        var nextTitle = this.next.find('.nextend-arrow-title');

        this.next.on({
            mouseenter: $.proxy(this.mouseEnter, this, this.next, nextTitle),
            mouseleave: $.proxy(this.mouseLeave, this, this.next, nextTitle)
        });

        var length = titles.length;

        this.slider.sliderElement.data('arrow', this)
            .on('sliderSwitchTo', $.proxy(function (e, index) {
                if (index == 0) {
                    previousTitle.html(titles[length - 1]);
                } else {
                    previousTitle.html(titles[index - 1]);
                }
                if (this.previous.width() != this.size) {
                    this.previous.width(this.size + this.sidePadding + previousTitle.width())
                }

                if (index == length - 1) {
                    nextTitle.html(titles[0]);
                } else {
                    nextTitle.html(titles[index + 1]);
                }
                if (this.next.width() != this.size) {
                    this.next.width(this.size + this.sidePadding + nextTitle.width())
                }
            }, this));
    };

    NextendSmartSliderWidgetArrowGrow.prototype.mouseEnter = function (arrow, title, e) {
        var tween = arrow.data('ssTween');
        if (tween) {
            tween.pause();
        }
        arrow.data('ssTween', NextendTween.to(arrow, 0.4, {
            width: this.size + this.sidePadding + title.width(),
            delay: this.delay
        }));
    };

    NextendSmartSliderWidgetArrowGrow.prototype.mouseLeave = function (arrow, title, e) {
        var tween = arrow.data('ssTween');
        if (tween) {
            tween.pause();
        }
        arrow.data('ssTween', NextendTween.to(arrow, 0.4, {
            width: this.size
        }));
    };

    scope.NextendSmartSliderWidgetArrowGrow = NextendSmartSliderWidgetArrowGrow;
})(n2, window);