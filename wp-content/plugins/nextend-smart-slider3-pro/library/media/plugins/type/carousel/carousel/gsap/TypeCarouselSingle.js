(function ($, scope, undefined) {

    function NextendSmartSliderCarouselSingle(elementID, parameters) {

        this.type = 'carousel-single';
        this.responsiveClass = 'NextendSmartSliderResponsiveCarouselSingle';

        parameters = $.extend({
            carousel: 1,
            maxPaneWidth: 980
        }, parameters);

        NextendSmartSliderAbstract.prototype.constructor.call(this, elementID, parameters);
    };


    NextendSmartSliderCarouselSingle.prototype = Object.create(NextendSmartSliderAbstract.prototype);
    NextendSmartSliderCarouselSingle.prototype.constructor = NextendSmartSliderCarouselSingle;


    NextendSmartSliderCarouselSingle.prototype.initCarousel = function () {
        if (!this.parameters.carousel) {
            NextendSmartSliderAbstract.prototype.initCarousel.call(this);
        } else {
            this._changeTo = function (nextSlideIndex, reversed, isSystem, customAnimation) {
                this.mainAnimation.prepareCarousel(nextSlideIndex);
            }
        }
    };

    NextendSmartSliderCarouselSingle.prototype.initMainAnimation = function () {
        this.mainAnimation = new NextendSmartSliderMainAnimationCarouselSingle(this, this.parameters.mainanimation);
    };
    scope.NextendSmartSliderCarouselSingle = NextendSmartSliderCarouselSingle;

})(n2, window);