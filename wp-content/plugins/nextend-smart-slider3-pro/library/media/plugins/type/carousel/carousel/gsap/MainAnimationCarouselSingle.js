(function ($, scope, undefined) {

    function NextendSmartSliderMainAnimationCarouselSingle(slider, parameters) {

        parameters = $.extend({
            duration: 1500,
            delay: 0,
            ease: 'easeInOutQuint',
            carousel: slider.parameters.carousel
        }, parameters);

        NextendSmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments);

        this.pipeline = this.slider.sliderElement.find('.n2-ss-slider-pipeline');
        this.border2 = this.pipeline.parent();

        this.slides = $.makeArray(this.slider.slides);
        this._currentSlideIndex = this.translateGlobalToLocalIndex(this.slider.currentSlideIndex);
        if (this.parameters.carousel) {
            this.changeTo = this.carouselChangeTo;
            this.translateGlobalToLocalIndex = this.carouselTranslateGlobalToLocalIndex;

            slider.sliderElement.one('SliderResize', $.proxy(function () {
                this.prepareCarousel(this.slider.currentSlideIndex);
            }, this));
        }
    };

    NextendSmartSliderMainAnimationCarouselSingle.prototype = Object.create(NextendSmartSliderMainAnimationAbstract.prototype);
    NextendSmartSliderMainAnimationCarouselSingle.prototype.constructor = NextendSmartSliderMainAnimationCarouselSingle;

    NextendSmartSliderMainAnimationCarouselSingle.prototype.carouselChangeTo = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed, isSystem) {
        this._currentSlideIndex = this.translateGlobalToLocalIndex(nextSlideIndex);
        NextendSmartSliderMainAnimationAbstract.prototype.changeTo.apply(this, arguments);
    };

    NextendSmartSliderMainAnimationCarouselSingle.prototype.translateGlobalToLocalIndex = function (i) {
        return i;
    };

    NextendSmartSliderMainAnimationCarouselSingle.prototype.carouselTranslateGlobalToLocalIndex = function (i) {
        var slide = this.slider.slides[i];
        for (var j = 0; j < this.slides.length; j++) {
            if (this.slides[j] == slide) {
                return j;
            }
        }
        return -1;
    };

    NextendSmartSliderMainAnimationCarouselSingle.prototype.prepareCarousel = function (slideIndex) {
        slideIndex = this.translateGlobalToLocalIndex(slideIndex);

        var slideInGroup = this.slider.responsive.slideInGroup;

        if (this.slides.length > slideInGroup + 1) {
            while (this.slides.length - slideIndex - 1 < slideInGroup) {
                var removed = this.slides.splice(0, 1);
                this.slides.push(removed[0]);
                slideIndex--;
            }
        }
        this.pipeline.append(this.slides);
        this._currentSlideIndex = this.translateGlobalToLocalIndex(this.slider.currentSlideIndex);
        this.calibrate();
    };

    NextendSmartSliderMainAnimationCarouselSingle.prototype.calibrate = function () {
        var slideW = $(this.slides[0]).width() + this.slider.responsive.sideMargin * 2;

        NextendTween.set(this.pipeline.get(0), {
            x: -this._currentSlideIndex * slideW
        });
    };

    NextendSmartSliderMainAnimationCarouselSingle.prototype._initAnimation = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed) {
        if (this.parameters.carousel) {
            currentSlideIndex = this.translateGlobalToLocalIndex(currentSlideIndex);
            currentSlide = $(this.slides[currentSlideIndex]);

            nextSlideIndex = this.translateGlobalToLocalIndex(nextSlideIndex);
            nextSlide = $(this.slides[nextSlideIndex]);
        }

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var slides = this.slides;

        var slideW = $(slides[0]).width() + this.slider.responsive.sideMargin * 2;

        this.timeline.to(this.pipeline.get(0), this.parameters.duration, {
            x: -nextSlideIndex * slideW,
            ease: this.parameters.ease
        }, this.parameters.delay);
    };

    scope.NextendSmartSliderMainAnimationCarouselSingle = NextendSmartSliderMainAnimationCarouselSingle;

})(n2, window);