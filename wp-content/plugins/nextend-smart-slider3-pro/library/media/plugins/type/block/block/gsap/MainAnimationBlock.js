(function ($, scope, undefined) {


    function NextendSmartSliderMainAnimationBlock(slider, parameters) {

        this.postBackgroundAnimation = false;

        NextendSmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments);

        if (!slider.isAdmin && this.slider.parameters.postBackgroundAnimations != false) {
            this.postBackgroundAnimation = new NextendSmartSliderPostBackgroundAnimation(slider, this);
        }
    };

    NextendSmartSliderMainAnimationBlock.prototype = Object.create(NextendSmartSliderMainAnimationAbstract.prototype);
    NextendSmartSliderMainAnimationBlock.prototype.constructor = NextendSmartSliderMainAnimationBlock;


    NextendSmartSliderMainAnimationBlock.prototype.changeTo = function (currentSlideIndex, currentSlide, nextSlideIndex, nextSlide, reversed, isSystem) {
        if (this.postBackgroundAnimation) {
            this.postBackgroundAnimation.start(currentSlideIndex, nextSlideIndex);
        }

        NextendSmartSliderMainAnimationAbstract.prototype.changeTo.apply(this, arguments);
    };

    NextendSmartSliderMainAnimationBlock.prototype.hasBackgroundAnimation = function () {
        return false;
    };

    scope.NextendSmartSliderMainAnimationBlock = NextendSmartSliderMainAnimationBlock;

})(n2, window);