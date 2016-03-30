(function ($, scope, undefined) {


    function NextendSmartSliderMainAnimationAccordion() {
        NextendSmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments);
    };

    NextendSmartSliderMainAnimationAccordion.prototype = Object.create(NextendSmartSliderMainAnimationAbstract.prototype);
    NextendSmartSliderMainAnimationAccordion.prototype.constructor = NextendSmartSliderMainAnimationAccordion;

    NextendSmartSliderMainAnimationAccordion.prototype._initAnimation = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed) {
        switch (this.slider.parameters.orientation) {
            case 'vertical':
                this.vertical(currentSlideIndex, nextSlideIndex);
                break;
            default:
                this.horizontal(currentSlideIndex, nextSlideIndex);
        }
        this.slider.unsetActiveSlide(currentSlide);
        this.slider.setActiveSlide(nextSlide);
    };

    NextendSmartSliderMainAnimationAccordion.prototype.vertical = function (currentSlideIndex, nextSlideIndex) {
        var currentContent = this.slider.contents.eq(currentSlideIndex),
            slideH = currentContent.height(),
            nextContent = this.slider.contents.eq(nextSlideIndex);

        this.timeline.fromTo(currentContent.get(0), this.parameters.duration, {
            height: slideH
        }, {
            height: 0,
            ease: this.getEase()
        }, 0);

        nextContent.css('height', 0);
        this.timeline.fromTo(nextContent.get(0), this.parameters.duration, {
            height: 0
        }, {
            height: slideH,
            ease: this.getEase()
        }, 0);
    };

    NextendSmartSliderMainAnimationAccordion.prototype.horizontal = function (currentSlideIndex, nextSlideIndex) {
        var currentContent = this.slider.contents.eq(currentSlideIndex),
            slideW = currentContent.width(),
            nextContent = this.slider.contents.eq(nextSlideIndex);

        this.timeline.fromTo(currentContent.get(0), this.parameters.duration, {
            width: slideW
        }, {
            width: 0,
            ease: this.getEase()
        }, 0);

        nextContent.css('width', 0);
        this.timeline.fromTo(nextContent.get(0), this.parameters.duration, {
            width: 0
        }, {
            width: slideW,
            ease: this.getEase()
        }, 0);
    };
    scope.NextendSmartSliderMainAnimationAccordion = NextendSmartSliderMainAnimationAccordion;

})(n2, window);