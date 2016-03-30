(function ($, scope, undefined) {
    function NextendSmartSliderWidgetFullScreenImage(id, desktopRatio, tabletRatio, mobileRatio) {

        this.slider = window[id];

        this.slider.started($.proxy(this.start, this, id, desktopRatio, tabletRatio, mobileRatio));
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.start = function (id, desktopRatio, tabletRatio, mobileRatio) {
        if (this.slider.sliderElement.data('fullscreen')) {
            return false;
        }
        this.slider.sliderElement.data('fullscreen', this);

        this.responsive = this.slider.responsive;

        this._type = this.responsive.parameters.type;
        this._forceFull = this.responsive.parameters.forceFull;
        this.forceFullpage = this._type == 'auto' || this._type == 'fullwidth';
        if (this.forceFullpage) {
            this._upscale = this.responsive.parameters.upscale;
            this._minimumHeightRatio = this.responsive.parameters.minimumHeightRatio;
            this._maximumHeightRatio = this.responsive.parameters.maximumHeightRatio;
        }

        this.isFullScreen = false;

        this.button = this.slider.sliderElement.find('.n2-full-screen-widget');
        this.fullParent = this.slider.sliderElement.closest('.n2-ss-align');

        this.browserSpecific = {};
        var elem = this.slider.sliderElement[0];
        if (elem.requestFullscreen) {
            this.browserSpecific.requestFullscreen = 'requestFullscreen';
            this.browserSpecific.event = 'fullscreenchange';
        } else if (elem.msRequestFullscreen) {
            this.browserSpecific.requestFullscreen = 'msRequestFullscreen';
            this.browserSpecific.event = 'MSFullscreenChange';
        } else if (elem.mozRequestFullScreen) {
            this.browserSpecific.requestFullscreen = 'mozRequestFullScreen';
            this.browserSpecific.event = 'mozfullscreenchange';
        } else if (elem.webkitRequestFullscreen) {
            this.browserSpecific.requestFullscreen = 'webkitRequestFullscreen';
            this.browserSpecific.event = 'webkitfullscreenchange';
        } else {
            this.destroy();
            return;
        }

        if (document.exitFullscreen) {
            this.browserSpecific.exitFullscreen = 'exitFullscreen';
        } else if (document.msExitFullscreen) {
            this.browserSpecific.exitFullscreen = 'msExitFullscreen';
        } else if (document.mozCancelFullScreen) {
            this.browserSpecific.exitFullscreen = 'mozCancelFullScreen';
        } else if (document.webkitExitFullscreen) {
            this.browserSpecific.exitFullscreen = 'webkitExitFullscreen';
        } else {
            this.destroy();
            return;
        }
        document.addEventListener(this.browserSpecific.event, $.proxy(this.fullScreenChange, this));

        this.deferred = $.Deferred();
        this.slider.sliderElement
            .on('SliderDevice', $.proxy(this.onDevice, this))
            .trigger('addWidget', this.deferred);

        this.button.on('click', $.proxy(this.switchState, this));

        this.desktopRatio = desktopRatio;
        this.tabletRatio = tabletRatio;
        this.mobileRatio = mobileRatio;

        this.button.imagesLoaded().always($.proxy(this.loaded, this));
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.loaded = function () {
        this.width = this.button.width();
        this.height = this.button.height();

        this.onDevice(null, {device: this.responsive.getDeviceMode()});

        this.deferred.resolve();
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.onDevice = function (e, device) {
        var ratio = 1;
        switch (device.device) {
            case 'tablet':
                ratio = this.tabletRatio;
                break;
            case 'mobile':
                ratio = this.mobileRatio;
                break;
            default:
                ratio = this.desktopRatio;
        }
        this.button.width(this.width * ratio);
        this.button.height(this.height * ratio);
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.switchState = function () {
        this.isFullScreen = !this.isFullScreen;
        if (this.isFullScreen) {
            this.fullScreen();
        } else {
            this.normalScreen();
        }
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.fullScreen = function () {

        if (this.forceFullpage) {
            this.responsive.parameters.type = 'fullpage';
            this.responsive.parameters.upscale = true;
            this.responsive.parameters.forceFull = false;
            this.responsive.containerElement.css('marginLeft', 0);
        }
        this.fullParent.css({
            width: '100%',
            height: '100%'
        })
        .addClass("n2-ss-in-fullscreen");
        this.fullParent.get(0)[this.browserSpecific.requestFullscreen]();
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.normalScreen = function () {
        document[this.browserSpecific.exitFullscreen]();
        this.fullParent.css({
            width: null,
            height: null
        })
        .removeClass("n2-ss-in-fullscreen");
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.destroy = function () {
        this.button.remove();
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.fullScreenChange = function () {
        if (this.isDocumentInFullScreenMode()) {
            this.button.addClass('n2-active');
        } else {
            this.button.removeClass('n2-active');
            if (this.forceFullpage) {
                this.responsive.parameters.type = this._type;
                this.responsive.parameters.upscale = this._upscale;
                this.responsive.parameters.forceFull = this._forceFull;
                this.responsive.parameters.minimumHeightRatio = this._minimumHeightRatio;
                this.responsive.parameters.maximumHeightRatio = this._maximumHeightRatio;
                $(window).trigger('resize');
            }
        }
    };

    NextendSmartSliderWidgetFullScreenImage.prototype.isDocumentInFullScreenMode = function () {
        // Note that the browser fullscreen (triggered by short keys) might
        // be considered different from content fullscreen when expecting a boolean
        return ((document.fullscreenElement && document.fullscreenElement !== null) ||    // alternative standard methods
        (document.msFullscreenElement && document.msFullscreenElement !== null) ||
        document.mozFullScreen || document.webkitIsFullScreen);                   // current working methods
    };

    scope.NextendSmartSliderWidgetFullScreenImage = NextendSmartSliderWidgetFullScreenImage;
})(n2, window);