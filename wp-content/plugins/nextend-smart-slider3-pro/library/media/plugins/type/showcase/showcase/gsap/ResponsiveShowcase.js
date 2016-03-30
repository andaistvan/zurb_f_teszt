(function ($, scope, undefined) {
    function NextendSmartSliderResponsiveShowcase() {
        NextendSmartSliderResponsive.prototype.constructor.apply(this, arguments);
    };

    NextendSmartSliderResponsiveShowcase.prototype = Object.create(NextendSmartSliderResponsive.prototype);
    NextendSmartSliderResponsiveShowcase.prototype.constructor = NextendSmartSliderResponsiveShowcase;


    NextendSmartSliderResponsiveShowcase.prototype.addResponsiveElements = function () {

        this._sliderHorizontal = this.addResponsiveElement(this.sliderElement, ['width', 'marginRight', 'marginLeft'], 'w', 'slider');
        this._sliderVertical = this.addResponsiveElement(this.sliderElement, ['height', 'marginTop', 'marginBottom'], 'h', 'slider');
        this.addResponsiveElement(this.sliderElement, ['fontSize'], 'fontRatio', 'slider');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-1'), ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], 'w');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-1'), ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'], 'h');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slide'), ['width'], 'slideW');
        this.helperElements.canvas = this.addResponsiveElement(this.sliderElement.find('.n2-ss-slide'), ['height'], 'slideH');

        this.addResponsiveElement(this.sliderElement.find('.n2-ss-layers-container'), ['width'], 'slideW', 'slide');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-layers-container'), ['height'], 'slideH', 'slide')
            .setCentered();

        var backgroundImages = this.slider.backgroundImages.getBackgroundImages();
        for (var i = 0; i < backgroundImages.length; i++) {
            this.addResponsiveElementBackgroundImageAsSingle(backgroundImages[i].image, backgroundImages[i], []);
        }
    };

    NextendSmartSliderResponsiveShowcase.prototype.getCanvas = function () {
        return this.helperElements.canvas;
    };

    scope.NextendSmartSliderResponsiveShowcase = NextendSmartSliderResponsiveShowcase;

})(n2, window);