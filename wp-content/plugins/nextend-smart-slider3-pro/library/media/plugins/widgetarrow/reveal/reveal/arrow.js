(function ($, scope, undefined) {
    function NextendSmartSliderWidgetArrowReveal(id, animation, images, titles) {
        this.size = 32;
        this.animation = animation;

        this.slider = window[id];

        this.slider.started($.proxy(this.start, this, id, animation, images, titles));
    };

    NextendSmartSliderWidgetArrowReveal.prototype.start = function (id, animation, images, titles) {
        if (this.slider.sliderElement.data('arrow')) {
            return false;
        }

        this.previous = $('#' + id + '-arrow-previous').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider.previous();
        }, this));

        var previousImage = this.previous.find('.nextend-arrow-image'),
            previousTitle = this.previous.find('.nextend-arrow-title');

        this.previous.on({
            mouseenter: $.proxy(this.mouseEnter, this, this.previous, previousImage, previousTitle, 1),
            mouseleave: $.proxy(this.mouseLeave, this, this.previous, previousImage, previousTitle, 1)
        });

        this.next = $('#' + id + '-arrow-next').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider.next();
        }, this));
        var nextImage = this.next.find('.nextend-arrow-image'),
            nextTitle = this.next.find('.nextend-arrow-title');

        switch (animation) {
            case 'fade':
                this.previous.css('overflow', 'hidden');
                this.next.css('overflow', 'hidden');
                break;
            case 'turn':
                NextendTween.set(this.previous, {perspective: '1000px'});
                NextendTween.set(previousImage, {
                    rotationY: 90,
                    transformOrigin: '0 0'
                });
                NextendTween.set(this.next, {perspective: '1000px'});
                NextendTween.set(nextImage, {
                    rotationY: -90,
                    transformOrigin: '100% 0'
                });
                break;
        }

        this.next.on({
            mouseenter: $.proxy(this.mouseEnter, this, this.next, nextImage, nextTitle, -1),
            mouseleave: $.proxy(this.mouseLeave, this, this.next, nextImage, nextTitle, -1)
        });

        var length = images.length;

        this.slider.sliderElement.data('arrow', this)
            .on('sliderSwitchTo', $.proxy(function (e, index) {
                if (index == 0) {
                    previousImage.css('backgroundImage', 'url(' + images[length - 1] + ')');
                    previousTitle.html(titles[length - 1]);
                } else {
                    previousImage.css('backgroundImage', 'url(' + images[index - 1] + ')');
                    previousTitle.html(titles[index - 1]);
                }

                if (index == length - 1) {
                    nextImage.css('backgroundImage', 'url(' + images[0] + ')');
                    nextTitle.html(titles[0]);
                } else {
                    nextImage.css('backgroundImage', 'url(' + images[index + 1] + ')');
                    nextTitle.html(titles[index + 1]);
                }
            }, this));
    };

    NextendSmartSliderWidgetArrowReveal.prototype.mouseEnter = function (arrow, image, title, modifier, e) {
        var tween = arrow.data('ssTween');
        if (tween) {
            tween.pause();
        }

        switch (this.animation) {
            case 'turn':
                tween = NextendTween.to(image, 0.4, {
                    rotationY: 0,
                    opacity: 1
                });
                break;
            case 'fade':
                arrow.css('overflow', 'visible');
                tween = NextendTween.to(image, 0.4, {
                    opacity: 1
                });
                break;
            default:
                tween = new NextendTimeline();
                tween.to(arrow, 0.4, {
                    width: image.width()
                }, 0);
                tween.to(image, 0.4, {
                    opacity: 1
                }, 0);
                break;
        }
        arrow.data('ssTween', tween);
    };

    NextendSmartSliderWidgetArrowReveal.prototype.mouseLeave = function (arrow, image, title, modifier, e) {
        var tween = arrow.data('ssTween');
        if (tween) {
            tween.pause();
        }

        switch (this.animation) {
            case 'turn':
                tween = NextendTween.to(image, 0.4, {
                    rotationY: 90 * modifier,
                    opacity: 0
                });
                break;
            case 'fade':
                tween = NextendTween.to(image, 0.4, {
                    opacity: 0
                });
                tween.eventCallback('onComplete', function () {
                    arrow.css('overflow', 'hidden');
                });
                break;
            default:
                tween = new NextendTimeline();
                tween.to(arrow, 0.4, {
                    width: this.size
                }, 0);
                tween.to(image, 0.4, {
                    opacity: 0
                }, 0);
                break;
        }
        arrow.data('ssTween', tween);
    };
    scope.NextendSmartSliderWidgetArrowReveal = NextendSmartSliderWidgetArrowReveal;
})(n2, window);