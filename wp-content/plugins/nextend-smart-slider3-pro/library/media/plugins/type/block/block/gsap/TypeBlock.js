(function ($, scope, undefined) {

    function NextendSmartSliderBlock(elementID, parameters) {

        this.type = 'block';
        this.responsiveClass = 'NextendSmartSliderResponsiveBlock';

        NextendSmartSliderAbstract.prototype.constructor.call(this, elementID, parameters);
    };

    NextendSmartSliderBlock.prototype = Object.create(NextendSmartSliderAbstract.prototype);
    NextendSmartSliderBlock.prototype.constructor = NextendSmartSliderBlock;

    NextendSmartSliderBlock.prototype.initMainAnimation = function () {
        this.mainAnimation = new NextendSmartSliderMainAnimationBlock(this, {});
    };

    scope.NextendSmartSliderBlock = NextendSmartSliderBlock;

})(n2, window);