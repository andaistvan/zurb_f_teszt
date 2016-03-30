(function ($, scope, undefined) {

    function NextendSmartSliderCarousel(elementID, parameters) {

        this.type = 'carousel';
        this.responsiveClass = 'NextendSmartSliderResponsiveCarousel';

        parameters = $.extend({
            maxPaneWidth: 3000
        }, parameters);

        NextendSmartSliderAbstract.prototype.constructor.call(this, elementID, parameters);
    };


    NextendSmartSliderCarousel.prototype = Object.create(NextendSmartSliderAbstract.prototype);
    NextendSmartSliderCarousel.prototype.constructor = NextendSmartSliderCarousel;

    NextendSmartSliderCarousel.prototype.__postInit = function (id, sliderElement, parameters) {

        this.hasStatic = sliderElement.find('.n2-ss-static-slide').length;

        NextendSmartSliderAbstract.prototype.__postInit.apply(this, arguments);
    };

    NextendSmartSliderCarousel.prototype.initMainAnimation = function () {
        this.mainAnimation = new NextendSmartSliderMainAnimationCarousel(this, this.parameters.mainanimation);


        this.sliderElement.one('SliderResize', $.proxy(function () {
            if (!this.isAdmin) {
                if (this.parameters.layerMode.playFirstLayer) {
                    //mainAnimationStartIn event not triggered in play on load, so we need to reset the layers manually
                    this.callOnSlide(this.slides.eq(this.currentSlideIndex), 'setStart');
                    this.ready($.proxy(function () {
                        n2c.log('Play first slide');
                        this.callOnSlide(this.slides.eq(this.currentSlideIndex), 'playIn');
                    }, this));
                }
            }
        }, this));

        this.sliderElement.on('mainAnimationStartIn', $.proxy(function (e, animation, previousSlideIndex, currentSlideIndex) {
            this.callOnSlide(this.slides.eq(currentSlideIndex), 'setStart');
        }, this));
    };

    NextendSmartSliderCarousel.prototype.findSlides = function () {

        this.realSlides = this.sliderElement.find('.n2-ss-slide');


        this.slidesInGroup = 1;
        this.slides = this.sliderElement.find('.n2-ss-slide-group');

        this.currentSlide = this.realSlides.filter('.n2-ss-slide-active');
    };

    NextendSmartSliderCarousel.prototype.calibrateGroup = function (slidesInGroup) {
        if (this.slidesInGroup != slidesInGroup) {

            var oldActiveSlides = this.slides.eq(this.currentSlideIndex).find('.n2-ss-slide');

            var parent = this.slides.parent(),
                groups = $();
            this.realSlides.each($.proxy(function (i, el) {
                if (i % slidesInGroup == 0) {
                    groups = groups.add($('<div class="n2-ss-slide-group"></div>').appendTo(parent));
                }
                groups.eq(Math.floor(i / slidesInGroup)).append(el);
            }));
            this.slides.remove();
            this.slides = groups;
            this.slidesInGroup = slidesInGroup;

            this.currentSlideIndex = 0;

            if (this.isAdmin) {
                this.currentSlideIndex = this.currentSlide.parent().index() - this.hasStatic;
            } else if (this.readyDeferred.state() == 'resolved') {
                var activeSlides = this.slides.eq(this.currentSlideIndex).find('.n2-ss-slide');
                oldActiveSlides.not(activeSlides).each(function (i, el) {
                    $(el).data('slide').reset();
                });
                activeSlides.not(oldActiveSlides).each(function (i, el) {
                    $(el).data('slide').setStart();
                    $(el).data('slide').playIn();
                });
            } else {
                this.currentSlideIndex = this.currentSlide.parent().index() - this.hasStatic;
            }
            this.mainAnimation.setActiveSlide(this.slides.eq(this.currentSlideIndex));
            this.setActiveSlide(this.slides.eq(this.currentSlideIndex));

            this.ready($.proxy(function () {
                this.sliderElement.trigger('slideCountChanged', [this.slides.length, this.slidesInGroup]);
                this.sliderElement.trigger('sliderSwitchTo', [this.currentSlideIndex, this.getRealIndex(this.currentSlideIndex)]);
            }, this));
        }
    };

    NextendSmartSliderCarousel.prototype.initSlides = function () {
        if (this.layerMode) {
            for (var i = 0; i < this.realSlides.length; i++) {
                new NextendSmartSliderSlide(this, this.realSlides.eq(i), 0);
            }

            var staticSlide = this.findStaticSlide();
            if (staticSlide.length) {
                new NextendSmartSliderSlide(this, staticSlide, true, true);
            }
        }
    };

    NextendSmartSliderCarousel.prototype.callOnSlide = function (slide, functionName) {
        slide.find('.n2-ss-slide').each(function (i, el) {
            $(el).data('slide')[functionName]();
        });
    };

    NextendSmartSliderCarousel.prototype.getRealIndex = function (index) {
        return index * this.slidesInGroup;
    };

    NextendSmartSliderCarousel.prototype.directionalChangeToReal = function (nextSlideIndex) {
        this.directionalChangeTo(Math.floor(nextSlideIndex / this.slidesInGroup));
    };

    NextendSmartSliderCarousel.prototype.adminGetCurrentSlideElement = function () {
        if (this.parameters.isStaticEdited) {
            return this.findStaticSlide();
        }
        return this.realSlides.filter('.n2-ss-slide-active');
    };

    scope.NextendSmartSliderCarousel = NextendSmartSliderCarousel;

})(n2, window);