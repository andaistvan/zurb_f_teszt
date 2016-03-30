(function ($, scope, undefined) {
    function NextendSmartSliderResponsiveCarouselSingle(slider, parameters) {
        this.slideInGroup = 1;
        this.sideMargin = 0;
        this.maximumPaneWidthRatio = 0;


        parameters = $.extend({
            minimumSlideGap: 10
        }, parameters);

        slider.sliderElement.on('SliderResize', $.proxy(this.onSliderResize, this));

        NextendSmartSliderResponsive.prototype.constructor.apply(this, arguments);
    };

    NextendSmartSliderResponsiveCarouselSingle.prototype = Object.create(NextendSmartSliderResponsive.prototype);
    NextendSmartSliderResponsiveCarouselSingle.prototype.constructor = NextendSmartSliderResponsiveCarouselSingle;

    NextendSmartSliderResponsiveCarouselSingle.prototype.storeDefaults = function () {
        NextendSmartSliderResponsive.prototype.storeDefaults.apply(this, arguments);

        if (this.slider.parameters.maxPaneWidth > 0) {
            this.maximumPaneWidthRatio = this.slider.parameters.maxPaneWidth / this.responsiveDimensions.startWidth;
        }
    };


    NextendSmartSliderResponsiveCarouselSingle.prototype.addResponsiveElements = function () {

        this._sliderHorizontal = this.addResponsiveElement(this.sliderElement, ['width', 'marginRight', 'marginLeft'], 'w', 'slider');
        this._sliderVertical = this.addResponsiveElement(this.sliderElement, ['height', 'marginTop', 'marginBottom'], 'h', 'slider');
        this.addResponsiveElement(this.sliderElement, ['fontSize'], 'fontRatio', 'slider');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-1'), ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], 'w');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-1'), ['height', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'], 'h');

        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-pane-single'), ['width'], 'paneW', 'pane');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slider-pane-single'), ['height'], 'h', 'pane').setCentered();

        this.addResponsiveElement(this.sliderElement.find('.n2-ss-slide'), ['width'], 'slideW');
        this.helperElements.canvas = this.addResponsiveElement(this.sliderElement.find('.n2-ss-slide'), ['height'], 'slideH');

        this.addResponsiveElement(this.sliderElement.find('.n2-ss-layers-container'), ['width'], 'slideW', 'slide');
        this.addResponsiveElement(this.sliderElement.find('.n2-ss-layers-container'), ['height'], 'slideH', 'slide')
            .setCentered();

        var backgroundImages = this.slider.backgroundImages.getBackgroundImages();
        for (var i = 0; i < backgroundImages.length; i++) {
            this.addResponsiveElementBackgroundImageAsSingle(backgroundImages[i].image, backgroundImages[i], []);
        }

        this.maximumPaneWidthRatio = 10000;
    };

    NextendSmartSliderResponsiveCarouselSingle.prototype.getCanvas = function () {
        return this.helperElements.canvas;
    };

    NextendSmartSliderResponsiveCarouselSingle.prototype._buildRatios = function (ratios, dynamicHeight, nextSlideIndex) {

        if (this.maximumPaneWidthRatio > 0 && ratios.w > this.maximumPaneWidthRatio) {
            ratios.paneW = this.maximumPaneWidthRatio;
        } else {
            ratios.paneW = ratios.w;
        }

        var sliderWidth = this.responsiveDimensions.startWidth * ratios.paneW;

        if (sliderWidth < this.responsiveDimensions.startSlideWidth) {
            var scaleDownRatio = sliderWidth / this.responsiveDimensions.startSlideWidth;
            ratios.h = scaleDownRatio;
            ratios.slideW = scaleDownRatio;
            ratios.slideH = scaleDownRatio;
        } else {
            ratios.h = 1;
            ratios.slideW = 1;
            ratios.slideH = 1;
        }

        var deviceModeOrientation = this.getDeviceModeOrientation();

        if (this.parameters.minimumHeightRatio > 0) {
            ratios.h = Math.max(ratios.h, this.parameters.minimumHeightRatio);
        }

        if (this.parameters.maximumHeightRatio[deviceModeOrientation] > 0) {
            ratios.h = Math.min(ratios.h, this.parameters.maximumHeightRatio[deviceModeOrientation]);
        }


        var wH = $(window).height() - 100;
        if (ratios.h * this.responsiveDimensions.startHeight > wH) {
            ratios.slideW = ratios.slideH = ratios.h = wH / this.responsiveDimensions.startHeight;
        }

        this.slideInGroup = Math.max(1, Math.floor(sliderWidth / (this.responsiveDimensions.startSlideWidth * ratios.slideW + this.parameters.minimumSlideGap)));

        this.sliderElement.triggerHandler('responsiveBuildRatios', [ratios]);
    };


    NextendSmartSliderResponsiveCarouselSingle.prototype.onSliderResize = function () {

        var sideMargin = Math.floor((this.responsiveDimensions.pane.width - this.responsiveDimensions.slide.width * this.slideInGroup) / this.slideInGroup / 2);

        this.slider.realSlides.css({
            marginLeft: sideMargin,
            marginRight: sideMargin,
            marginTop: parseInt((this.responsiveDimensions.pane.height - this.responsiveDimensions.slide.height) / 2)
        });

        this.sideMargin = sideMargin;


        this.slider.mainAnimation.calibrate();
    };


    scope.NextendSmartSliderResponsiveCarouselSingle = NextendSmartSliderResponsiveCarouselSingle;

})(n2, window);