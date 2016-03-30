(function ($, scope, undefined) {
    function NextendSmartSliderResponsiveAccordion() {
        NextendSmartSliderResponsive.prototype.constructor.apply(this, arguments);
    };

    NextendSmartSliderResponsiveAccordion.prototype = Object.create(NextendSmartSliderResponsive.prototype);
    NextendSmartSliderResponsiveAccordion.prototype.constructor = NextendSmartSliderResponsiveAccordion;

    NextendSmartSliderResponsiveAccordion.prototype.addResponsiveElements = function () {

        this.contents = this.slider.contents;

        this._sliderVertical = this._sliderHorizontal = this.addResponsiveElement(this.sliderElement, ['width', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'], 'w', 'slider');
        this.addResponsiveElement(this.sliderElement, ['fontSize'], 'fontRatio', 'slider');
        this.addResponsiveElement(this.sliderElement, ['height'], 'h', 'slider');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-1'), ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']);
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-1'), ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'], 'h');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-2'), ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']);
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-2'), ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'], 'h');

        //this.addResponsiveElement(this.sliderElement.find('.nextend-slide-bg'), ['width']);
        //this.addResponsiveElement(this.sliderElement.find('.nextend-slide-bg'), ['height'], 'h');

        switch (this.slider.parameters.orientation) {
            case 'vertical':
                this.vertical();
                break;
            default:
                this.horizontal();
        }

        this.addResponsiveElement(this.sliderElement.find('.n2-ss-canvas'), ['width'], 'w');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-canvas'), ['height'], 'h');

        this.addResponsiveElement(this.sliderElement.find('.n2-ss-layers-container'), ['width'], 'slideW', 'slide');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-layers-container'), ['height'], 'slideH', 'slide')
            .setCentered();

        var backgroundImages = this.slider.backgroundImages.getBackgroundImages();
        for (var i = 0; i < backgroundImages.length; i++) {
            this.addResponsiveElementBackgroundImageAsSingle(backgroundImages[i].image, backgroundImages[i], []);
        }
    };

    NextendSmartSliderResponsiveAccordion.prototype.resizeResponsiveElements = function (ratios) {
        NextendSmartSliderResponsive.prototype.resizeResponsiveElements.apply(this, arguments);

        var responsiveElement = this.contents.get(this.slider.currentSlideIndex).responsive;
        responsiveElement.resize(this.responsiveDimensions, ratios[responsiveElement.group]);
    };

    NextendSmartSliderResponsiveAccordion.prototype.horizontal = function () {

        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title'), ['width', 'marginLeft']);
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title'), ['height'], 'h');
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title-inner'), ['width']);
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title-inner'), ['height'], 'h');
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title-rotate-90'), ['marginTop', 'marginBottom', 'lineHeight']);
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title-rotate-90'), ['width', 'height'], 'h');

        this.addResponsiveElement(this.contents, ['marginRight']);
        this.addResponsiveElement(this.contents, ['height'], 'h');

        /**
         * The slide content's height is different when they are in active and non active state.
         * This can mix up the responsive calculations, so we have to use the following method to properly resize only the active slide content.
         * Just create an empty NextendSmartSliderResponsiveElement instance for each content elements, set the height of the active content to each other content.
         * and later in resizeResponsiveElements, resize only the currently active content.
         */
        var contentWidth = parseInt(this.contents.eq(this.slider.currentSlideIndex).css('width'));

        for (var i = 0; i < this.contents.length; i++) {
            this.contents[i].responsive = new NextendSmartSliderResponsiveElement(this, 'w', this.contents.eq(i), {});
            this.contents[i].responsive.data.width = contentWidth - 2;
        }
    };

    NextendSmartSliderResponsiveAccordion.prototype.vertical = function () {

        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title'), ['width', 'marginTop']);
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title'), ['height'], 'h');
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title-inner'), ['width']);
        this.addResponsiveElement(this.sliderElement.find('.n2-accordion-title-inner'), ['height', 'lineHeight'], 'h');

        this.addResponsiveElement(this.contents, ['width']);
        this.addResponsiveElement(this.contents, ['marginBottom'], 'h');

        /**
         * The slide content's height is different when they are in active and non active state.
         * This can mix up the responsive calculations, so we have to use the following method to properly resize only the active slide content.
         * Just create an empty NextendSmartSliderResponsiveElement instance for each content elements, set the height of the active content to each other content.
         * and later in resizeResponsiveElements, resize only the currently active content.
         */

        var contentHeight = parseInt(this.contents.eq(this.slider.currentSlideIndex).css('height'));

        for (var i = 0; i < this.contents.length; i++) {
            this.contents[i].responsive = new NextendSmartSliderResponsiveElement(this, 'h', this.contents.eq(i), {});
            this.contents[i].responsive.data.height = contentHeight;
        }
    };

    NextendSmartSliderResponsiveAccordion.prototype.getCanvas = function () {
        return this.contents[this.slider.currentSlideIndex].responsive;
    };

    scope.NextendSmartSliderResponsiveAccordion = NextendSmartSliderResponsiveAccordion;

})(n2, window);