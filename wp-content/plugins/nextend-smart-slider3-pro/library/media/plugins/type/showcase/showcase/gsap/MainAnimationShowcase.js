(function ($, scope, undefined) {
    var IE = false;


    function NextendSmartSliderMainAnimationShowcase(slider, parameters) {

        this._IE();

        parameters = $.extend({
            direction: 'horizontal',
            distance: 60,
            animate: {},
            duration: 1500,
            delay: 0,
            ease: 'easeInOutQuint',
            carousel: slider.parameters.carousel,
            carouselSideSlides: slider.parameters.carouselSideSlides
        }, parameters);

        NextendSmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments);

        this.pipeline = this.slider.sliderElement.find('.smart-slider-pipeline');
        this.border2 = this.pipeline.parent();

        this.showcase = {
            before: {
                ease: this.parameters.ease
            },
            active: {
                ease: this.parameters.ease
            },
            after: {
                ease: this.parameters.ease
            }
        };

        if (!slider.parameters.admin) {
            var animate = this.parameters.animate;
            for (var k in animate) {
                if (animate[k]) {
                    if (IE) {
                        // On IE browsers, we throw out 3D animations
                        if (k == 'z' || k == 'rotationY' || k == 'rotationX') continue;
                    }
                    this.showcase.before[k] = animate[k].before;
                    this.showcase.active[k] = animate[k].active;
                    this.showcase.after[k] = animate[k].after;
                }
            }
        }

        if (!IE) {

            this.calibrate = this.calibratePreserve3D;
            this._initAnimation = this._initAnimationPreserve3D;
        }

        this.slider.sliderElement.find('.smart-slider-overlay').each($.proxy(function (i, el) {
            $(el).on('click', $.proxy(function (i, e) {
                this.changeTo(i);
            }, this, i));
        }, this.slider));

        this.slides = $.makeArray(this.slider.slides);
        this._currentSlideIndex = this.translateGlobalToLocalIndex(this.slider.currentSlideIndex);
        if (IE) {
            for (var i = 0; i < this.slides.length; i++) {
                $(this.slides[i]).css({position: 'absolute', top: 0, left: 0});
            }
        }

        if (this.parameters.carousel) {
            this.changeTo = this.carouselChangeTo;
            this.translateGlobalToLocalIndex = this.carouselTranslateGlobalToLocalIndex;
            this.prepareCarousel(this.slider.currentSlideIndex);
        } else {
            this.calibrate();
        }

        this.slider.sliderElement.on('SliderResize', $.proxy(this.calibrate, this));
    };

    NextendSmartSliderMainAnimationShowcase.prototype = Object.create(NextendSmartSliderMainAnimationAbstract.prototype);
    NextendSmartSliderMainAnimationShowcase.prototype.constructor = NextendSmartSliderMainAnimationShowcase;

    NextendSmartSliderMainAnimationShowcase.prototype.carouselChangeTo = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed, isSystem) {
        this._currentSlideIndex = this.translateGlobalToLocalIndex(nextSlideIndex);
        NextendSmartSliderMainAnimationAbstract.prototype.changeTo.apply(this, arguments);
    };

    NextendSmartSliderMainAnimationShowcase.prototype.translateGlobalToLocalIndex = function (i) {
        return i;
    };

    NextendSmartSliderMainAnimationShowcase.prototype.carouselTranslateGlobalToLocalIndex = function (i) {
        var slide = this.slider.slides[i];
        for (var j = 0; j < this.slides.length; j++) {
            if (this.slides[j] == slide) {
                return j;
            }
        }
        return -1;
    };

    NextendSmartSliderMainAnimationShowcase.prototype.prepareCarousel = function (slideIndex) {
        slideIndex = this.translateGlobalToLocalIndex(slideIndex);

        if (this.slides.length - slideIndex <= this.parameters.carouselSideSlides && this._currentSlideIndex <= this.parameters.carouselSideSlides) {
            var count = this.slides.length - 1;
            for (var i = 0; i < this.slides.length - slideIndex; i++) {
                var removed = this.slides.splice(count, 1);
                this.slides.unshift(removed[0]);
            }
            slideIndex = 0;
        }
        if (slideIndex <= this.parameters.carouselSideSlides) {
            var count = this.slides.length - 1;
            for (var i = 0; i < this.parameters.carouselSideSlides - slideIndex; i++) {
                var removed = this.slides.splice(count, 1);
                this.slides.unshift(removed[0]);
            }
        } else if (slideIndex >= this.slides.length - 1 - this.parameters.carouselSideSlides) {
            for (var i = 0; i < this.parameters.carouselSideSlides - (this.slides.length - 1 - slideIndex); i++) {
                var removed = this.slides.splice(i, 1);
                this.slides.push(removed[0]);
            }
        }

        this.pipeline.append(this.slides);
        this._currentSlideIndex = this.translateGlobalToLocalIndex(this.slider.currentSlideIndex);
        this.calibrate();
    };

    NextendSmartSliderMainAnimationShowcase.prototype.calibrate = function () {
        var slides = this.slides,
            currentSlideIndex = this._currentSlideIndex,
            sliderW = this.border2.width(),
            sliderH = this.border2.height(),
            slideW = $(slides[0]).width(),
            slideH = $(slides[0]).height();

        if (this.parameters.direction == 'horizontal') {
            var centerH = sliderW / 2 - slideW / 2,
                deltaX = slideW + this.parameters.distance,
                margin = (sliderH - slideH) / 2;

            NextendTween.set(this.pipeline.get(0), {
                height: slideH,
                marginTop: margin,
                marginBottom: margin
            });

            for (var i = 0; i < currentSlideIndex; i++) {
                NextendTween.set(slides[i], this.adjustXY(this.showcase.before, centerH + (i - currentSlideIndex) * deltaX, 0));
            }
            NextendTween.set(slides[i], this.adjustXY(this.showcase.active, centerH, 0));
            i++;

            for (; i < slides.length; i++) {
                NextendTween.set(slides[i], this.adjustXY(this.showcase.after, centerH + (i - currentSlideIndex) * deltaX, 0));
            }

        } else if (this.parameters.direction == 'vertical') {
            var centerV = sliderH / 2 - slideH / 2,
                deltaY = slideH + this.parameters.distance,
                margin = (sliderW - slideW) / 2;

            NextendTween.set(this.pipeline.get(0), {
                width: slideW,
                marginLeft: margin,
                marginRight: margin
            });

            for (var i = 0; i < currentSlideIndex; i++) {
                NextendTween.set(slides[i], this.adjustXY(this.showcase.before, 0, centerV + (i - currentSlideIndex) * deltaY));
            }
            //do current
            NextendTween.set(slides[i], this.adjustXY(this.showcase.active, 0, centerV));
            i++;

            // do afters
            for (; i < slides.length; i++) {
                NextendTween.set(slides[i], this.adjustXY(this.showcase.after, 0, centerV + (i - currentSlideIndex) * deltaY));
            }
        }
    };

    NextendSmartSliderMainAnimationShowcase.prototype._initAnimation = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed) {
        if (this.parameters.carousel) {
            currentSlideIndex = this.translateGlobalToLocalIndex(currentSlideIndex);
            currentSlide = $(this.slides[currentSlideIndex]);

            nextSlideIndex = this.translateGlobalToLocalIndex(nextSlideIndex);
            nextSlide = $(this.slides[nextSlideIndex]);
        }

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var slides = this.slides,
            sliderW = this.border2.width(),
            sliderH = this.border2.height(),
            slideW = $(slides[0]).width(),
            slideH = $(slides[0]).height();

        if (this.parameters.direction == 'horizontal') {
            var centerH = sliderW / 2 - slideW / 2,
                deltaX = slideW + this.parameters.distance;

            // do before-s
            for (var i = 0; i < nextSlideIndex; i++) {
                var diff = i - nextSlideIndex;
                this.timeline.to(slides[i], this.parameters.duration, this.adjustXY(this.showcase.before, centerH + diff * deltaX, 0), this.parameters.delay);
            }
            //do current
            this.timeline.to(slides[i], this.parameters.duration, this.adjustXY(this.showcase.active, centerH, 0), 0);
            i++;

            // do afters
            for (; i < slides.length; i++) {
                var diff = i - nextSlideIndex;
                this.timeline.to(slides[i], this.parameters.duration, this.adjustXY(this.showcase.after, centerH + diff * deltaX, 0), this.parameters.delay);
            }

        } else if (this.parameters.direction == 'vertical') {
            var centerV = sliderH / 2 - slideH / 2,
                deltaY = slideH + this.parameters.distance;

            // do before-s
            for (var i = 0; i < nextSlideIndex; i++) {
                var diff = i - nextSlideIndex;
                this.timeline.to(slides[i], this.parameters.duration, this.adjustXY(this.showcase.before, 0, centerV + diff * deltaY), this.parameters.delay);
            }
            //do current
            this.timeline.to(slides[i], this.parameters.duration, this.adjustXY(this.showcase.active, 0, centerV), 0);
            i++;

            // do afters
            for (; i < slides.length; i++) {
                var diff = i - nextSlideIndex;
                this.timeline.to(slides[i], this.parameters.duration, this.adjustXY(this.showcase.after, 0, centerV + diff * deltaY), this.parameters.delay);
            }
        }
    };

    NextendSmartSliderMainAnimationShowcase.prototype.adjustXY = function (props, x, y) {
        var ps = n2.extend({ease: this.parameters.ease}, props);

        if (typeof ps.x === 'undefined') {
            ps.x = 0;
        }

        if (typeof ps.y === 'undefined') {
            ps.y = 0;
        }
        ps.x += x;
        ps.y += y;
        return ps;
    };

    NextendSmartSliderMainAnimationShowcase.prototype.calibratePreserve3D = function () {

        var slides = this.slides,
            currentSlideIndex = this._currentSlideIndex,
            sliderW = this.border2.width(),
            sliderH = this.border2.height(),
            slideW = $(slides[0]).width(),
            slideH = $(slides[0]).height();

        if (this.parameters.direction == 'horizontal') {
            var centerH = sliderW / 2 - slideW / 2,
                deltaX = slideW + this.parameters.distance,
                margin = (sliderH - slideH) / 2;

            NextendTween.set(this.pipeline.get(0), {
                x: centerH - currentSlideIndex * deltaX,
                height: slideH,
                marginTop: margin,
                marginBottom: margin
            });

        } else if (this.parameters.direction == 'vertical') {
            var centerV = sliderH / 2 - slideH / 2,
                deltaY = slideH + this.parameters.distance,
                margin = (sliderW - slideW) / 2;

            NextendTween.set(this.pipeline.get(0), {
                y: centerV - currentSlideIndex * deltaY,
                width: slideW,
                marginLeft: margin,
                marginRight: margin
            });
        }

        // do before-s
        for (var i = 0; i < currentSlideIndex; i++) {
            NextendTween.set(slides[i], this.showcase.before);
        }
        //do current
        NextendTween.set(slides[i], this.showcase.active);
        i++;

        // do afters
        for (; i < slides.length; i++) {
            NextendTween.set(slides[i], this.showcase.after);
        }
    };

    NextendSmartSliderMainAnimationShowcase.prototype._initAnimationPreserve3D = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed) {
        if (this.parameters.carousel) {
            currentSlideIndex = this.translateGlobalToLocalIndex(currentSlideIndex);
            currentSlide = $(this.slides[currentSlideIndex]);

            nextSlideIndex = this.translateGlobalToLocalIndex(nextSlideIndex);
            nextSlide = $(this.slides[nextSlideIndex]);
        }

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var slides = this.slides;

        if (this.parameters.direction == 'horizontal') {
            var sliderW = this.border2.width(),
                slideW = $(slides[0]).width(),
                centerH = sliderW / 2 - slideW / 2,
                deltaX = slideW + this.parameters.distance;

            this.timeline.to(this.pipeline.get(0), this.parameters.duration, {
                x: centerH - nextSlideIndex * deltaX,
                ease: this.parameters.ease
            }, this.parameters.delay);

        } else if (this.parameters.direction == 'vertical') {
            var sliderH = this.border2.height(),
                slideH = $(slides[0]).height(),
                centerV = sliderH / 2 - slideH / 2,
                deltaY = slideH + this.parameters.distance;

            this.timeline.to(this.pipeline.get(0), this.parameters.duration, {
                y: centerV - nextSlideIndex * deltaY,
                ease: this.parameters.ease
            }, this.parameters.delay);
        }

        // do before-s
        for (var i = 0; i < nextSlideIndex; i++) {
            this.timeline.to(slides[i], this.parameters.duration, this.showcase.before, this.parameters.delay);
        }
        //do current
        this.timeline.to(slides[i], this.parameters.duration, this.showcase.active, this.parameters.delay);
        i++;

        // do afters
        for (; i < slides.length; i++) {
            var diff = i - nextSlideIndex;
            this.timeline.to(slides[i], this.parameters.duration, this.showcase.after, this.parameters.delay);
        }
    };

    NextendSmartSliderMainAnimationShowcase.prototype._IE = function () {
        IE = (function () {
            if (document.documentMode) {
                return document.documentMode;
            } else {
                for (var i = 7; i > 0; i--) {
                    var div = document.createElement("div");

                    div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";

                    if (div.getElementsByTagName("span").length) {
                        return i;
                    }
                }
            }

            return undefined;
        })();
    };

    scope.NextendSmartSliderMainAnimationShowcase = NextendSmartSliderMainAnimationShowcase;

})(n2, window);