(function ($, scope, undefined) {

    function NextendSmartSliderAccordion(elementID, parameters) {

        this.type = 'accordion';
        this.responsiveClass = 'NextendSmartSliderResponsiveAccordion';

        parameters = $.extend({
            orientation: 'horizontal',
            carousel: 1,
            mainanimation: {}
        }, parameters);

        NextendSmartSliderAbstract.prototype.constructor.call(this, elementID, parameters);
    };


    NextendSmartSliderAccordion.prototype = Object.create(NextendSmartSliderAbstract.prototype);
    NextendSmartSliderAccordion.prototype.constructor = NextendSmartSliderAccordion;


    NextendSmartSliderAccordion.prototype.findSlides = function () {
        NextendSmartSliderAbstract.prototype.findSlides.call(this);

        this.titles = this.sliderElement.find('.n2-accordion-title');
        if (!this.parameters.admin) {
            for (var i = 0; i < this.titles.length; i++) {
                this.titles.eq(i).on('click', $.proxy(this.changeTo, this, [i, false, false]));
            }
        }
        this.contents = this.sliderElement.find('.n2-accordion-slide');
    };

    NextendSmartSliderAccordion.prototype.initMainAnimation = function () {
        this.mainAnimation = new NextendSmartSliderMainAnimationAccordion(this, this.parameters.mainanimation);
    };

    scope.NextendSmartSliderAccordion = NextendSmartSliderAccordion;

})(n2, window);