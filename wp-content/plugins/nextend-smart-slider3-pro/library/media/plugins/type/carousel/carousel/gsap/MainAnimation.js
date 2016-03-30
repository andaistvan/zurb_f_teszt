(function ($, scope, undefined) {


    function NextendSmartSliderMainAnimationCarousel(slider, parameters) {

        parameters = $.extend({
            delay: 0,
            type: 'horizontal'
        }, parameters);
        parameters.delay /= 1000;

        NextendSmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments);

        this.setActiveSlide(this.slider.slides.eq(this.slider.currentSlideIndex));

        this.animations = [];

        switch (this.parameters.type) {
            case 'fade':
                this.animations.push(this._mainAnimationFade);
                break;
            case 'vertical':
                this.animations.push(this._mainAnimationVertical);
                break;
            case 'no':
                this.animations.push(this._mainAnimationNo);
                break;
            case 'fade':
                this.animations.push(this._mainAnimationFade);
                break;
            case 'fade':
                this.animations.push(this._mainAnimationFade);
                break;
            default:
                this.animations.push(this._mainAnimationHorizontal);
        }
    };

    NextendSmartSliderMainAnimationCarousel.prototype = Object.create(NextendSmartSliderMainAnimationAbstract.prototype);
    NextendSmartSliderMainAnimationCarousel.prototype.constructor = NextendSmartSliderMainAnimationCarousel;


    /**
     * Used to hide non active slides
     * @param slide
     */
    NextendSmartSliderMainAnimationCarousel.prototype.setActiveSlide = function (slide) {
        var notActiveSlides = this.slider.slides.not(slide);
        for (var i = 0; i < notActiveSlides.length; i++) {
            this._hideSlide(notActiveSlides.eq(i));
        }
    };

    /**
     * Hides the slide, but not the usual way. Simply positions them outside of the slider area.
     * If we use the visibility or display property to hide we would end up corrupted YouTube api.
     * If opacity 0 might also work, but that might need additional resource from the browser
     * @param slide
     * @private
     */
    NextendSmartSliderMainAnimationCarousel.prototype._hideSlide = function (slide) {
        NextendTween.set(slide.get(0), {
            left: '-100000px'
        });
    };

    NextendSmartSliderMainAnimationCarousel.prototype._showSlide = function (slide) {
        NextendTween.set(slide.get(0), {
            left: 0
        });
    };

    NextendSmartSliderMainAnimationCarousel.prototype._getAnimation = function () {
        return $.proxy(this.animations[Math.floor(Math.random() * this.animations.length)], this);
    };

    NextendSmartSliderMainAnimationCarousel.prototype._initAnimation = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed) {
        var animation = this._getAnimation();

        animation(currentSlide, nextSlide, reversed, currentSlideIndex, nextSlideIndex);
    };

    NextendSmartSliderMainAnimationCarousel.prototype.onChangeToComplete = function (previousSlideIndex, currentSlideIndex, isSystem) {

        this._hideSlide(this.slider.slides.eq(previousSlideIndex));

        NextendSmartSliderMainAnimationAbstract.prototype.onChangeToComplete.apply(this, arguments);
    };

    NextendSmartSliderMainAnimationCarousel.prototype._mainAnimationNo = function (currentSlide, nextSlide, reversed, currentSlideIndex, nextSlideIndex) {

        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);

        nextSlide.css('opacity', 0);

        this.slider.setActiveSlide(nextSlide);

        this.timeline.set(currentSlide, {
            opacity: 0
        }, 0);

        this.timeline.set(nextSlide, {
            opacity: 1
        }, 0);

        this.sliderElement.on('mainAnimationComplete.n2-simple-no', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-no');
            this.slider.slides.eq(currentSlideIndex)
                .css('opacity', '');
            this.slider.slides.eq(nextSlideIndex)
                .css('opacity', '');
        }, this));
    };

    NextendSmartSliderMainAnimationCarousel.prototype._mainAnimationFade = function (currentSlide, nextSlide, reversed, currentSlideIndex, nextSlideIndex) {
        currentSlide.css('zIndex', 5);
        this._showSlide(nextSlide);

        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        this.timeline.to(currentSlide.get(0), this.parameters.duration, {
            opacity: 0,
            ease: this.getEase()
        }, 0);

        nextSlide.css('opacity', 1);

        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            this.slider.slides.eq(currentSlideIndex)
                .css('zIndex', '')
                .css('opacity', '');
            this.slider.slides.eq(nextSlideIndex)
                .css('opacity', '');
        }, this));
    };

    NextendSmartSliderMainAnimationCarousel.prototype._mainAnimationHorizontal = function (currentSlide, nextSlide, reversed, currentSlideIndex, nextSlideIndex) {
        this.__mainAnimationDirection(currentSlide, nextSlide, 'horizontal', reversed, currentSlideIndex, nextSlideIndex);
    };

    NextendSmartSliderMainAnimationCarousel.prototype._mainAnimationVertical = function (currentSlide, nextSlide, reversed, currentSlideIndex, nextSlideIndex) {
        this._showSlide(nextSlide);
        this.__mainAnimationDirection(currentSlide, nextSlide, 'vertical', reversed, currentSlideIndex, nextSlideIndex);
    };

    NextendSmartSliderMainAnimationCarousel.prototype.__mainAnimationDirection = function (currentSlide, nextSlide, direction, reversed, currentSlideIndex, nextSlideIndex) {
        var property = '',
            propertyValue = 0;

        if (direction == 'horizontal') {
            property = 'left';
            propertyValue = currentSlide.width();
        } else if (direction == 'vertical') {
            property = 'top';
            propertyValue = currentSlide.height();
        }


        if (reversed) {
            propertyValue *= -1;
        }

        nextSlide.css(property, propertyValue);


        nextSlide.css('zIndex', 5);

        currentSlide.css('zIndex', 4);


        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);

        var inProperties = {
            ease: this.getEase()
        };
        inProperties[property] = 0;

        this.timeline.to(nextSlide.get(0), this.parameters.duration, inProperties, 0);

        var outProperties = {
            ease: this.getEase()
        };
        outProperties[property] = -propertyValue;
        this.timeline.to(currentSlide.get(0), this.parameters.duration, outProperties, 0);


        this.sliderElement.on('mainAnimationComplete.n2-simple-fade', $.proxy(function (e, animation, currentSlideIndex, nextSlideIndex) {
            this.sliderElement.off('mainAnimationComplete.n2-simple-fade');
            this.slider.slides.eq(nextSlideIndex)
                .css('zIndex', '')
                .css(property, '');
            this.slider.slides.eq(currentSlideIndex)
                .css('zIndex', '');
        }, this));
    };

    scope.NextendSmartSliderMainAnimationCarousel = NextendSmartSliderMainAnimationCarousel;

})(n2, window);