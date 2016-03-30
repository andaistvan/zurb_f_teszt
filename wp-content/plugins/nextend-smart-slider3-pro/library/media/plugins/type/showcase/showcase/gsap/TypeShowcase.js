(function ($, scope, undefined) {

    function NextendSmartSliderShowcase(elementID, parameters) {

        this.type = 'showcase';
        this.responsiveClass = 'NextendSmartSliderResponsiveShowcase';

        parameters = $.extend({
            carousel: 1,
            carouselSideSlides: 1
        }, parameters);

        NextendSmartSliderAbstract.prototype.constructor.call(this, elementID, parameters);
    };


    NextendSmartSliderShowcase.prototype = Object.create(NextendSmartSliderAbstract.prototype);
    NextendSmartSliderShowcase.prototype.constructor = NextendSmartSliderShowcase;


    NextendSmartSliderShowcase.prototype.initCarousel = function () {
        if (!this.parameters.carousel) {
            NextendSmartSliderAbstract.prototype.initCarousel.call(this);
        } else {
            this._changeTo = function (nextSlideIndex, reversed, isSystem, customAnimation) {
                this.mainAnimation.prepareCarousel(nextSlideIndex);
            }
        }
    };

    NextendSmartSliderShowcase.prototype.initMainAnimation = function () {
        this.mainAnimation = new NextendSmartSliderMainAnimationShowcase(this, this.parameters.showcase);
    };
    scope.NextendSmartSliderShowcase = NextendSmartSliderShowcase;

})(n2, window);