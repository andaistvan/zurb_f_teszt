(function ($, scope, undefined) {

    var isRetina = (function () {
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2));
    })();

    function NextendSmartSliderBackgroundImages(slider) {
        this.device = null;

        this.load = $.Deferred();

        this.slider = slider;
        this.slides = this.slider.realSlides;

        this.lazyLoad = slider.parameters.lazyLoad;
        this.lazyLoadNeighbor = slider.parameters.lazyLoadNeighbor;

        this.deviceDeferred = $.Deferred();

        /**
         * @type {NextendSmartSliderBackgroundImage[]}
         */
        this.backgroundImages = [];
        for (var i = 0; i < this.slides.length; i++) {
            var image = this.slides.eq(i).find('.n2-ss-slide-background');
            if (image.length > 0) {
                this.backgroundImages[i] = new NextendSmartSliderBackgroundImage(i, image, this);
            } else {
                this.backgroundImages[i] = false;
            }
            this.slides.eq(i).data('slideBackground', this.backgroundImages[i]);
        }

        this.slider.sliderElement.one('SliderDevice', $.proxy(this.onSlideDeviceChangedFirst, this));
        this.videos = new NextendSmartSliderBackgroundVideos(slider);
    

    };

    NextendSmartSliderBackgroundImages.prototype.whenWithProgress = function (arrayOfPromises) {
        var cntr = 0, defer = $.Deferred();
        for (var i = 0; i < arrayOfPromises.length; i++) {
            arrayOfPromises[i].done(function () {
                defer.notify(++cntr, arrayOfPromises.length);
            });
        }
        // It is kind of an anti-pattern to use our own deferred and
        // then just resolve it when the promise is resolved
        // But, we can only call .notify() on a defer so if we want to use that,
        // we are forced to make our own deferred
        $.when.apply($, arrayOfPromises).done(function () {
            defer.resolveWith(null, arguments);
        });
        return defer.promise();
    };

    NextendSmartSliderBackgroundImages.prototype.getBackgroundImages = function () {
        return this.backgroundImages;
    };

    NextendSmartSliderBackgroundImages.prototype.onSlideDeviceChangedFirst = function (e, device) {
        this.onSlideDeviceChanged(e, device);
        this.deviceDeferred.resolve();
        this.slider.sliderElement.on('SliderDevice', $.proxy(this.onSlideDeviceChanged, this));

        if (this.lazyLoad == 1) {
            this.preLoad = this.preLoadLazyNeighbor;

            this.load = $.when(this.preLoad(this.slider.currentSlideIndex));
        } else if (this.lazyLoad == 2) { // delayed
            $(window).load($.proxy(this.preLoadAll, this));

            this.load = $.when(this.preLoad(this.slider.currentSlideIndex));
        } else {
            this.load = this.whenWithProgress(this.preLoadAll());
        }
    };

    NextendSmartSliderBackgroundImages.prototype.onSlideDeviceChanged = function (e, device) {
        this.device = device;
        for (var i = 0; i < this.backgroundImages.length; i++) {
            if (this.backgroundImages[i]) {
                this.backgroundImages[i].onSlideDeviceChanged(device);
            }
        }
    };

    NextendSmartSliderBackgroundImages.prototype.changed = function (i) {
        if (this.lazyLoad == 1 || this.lazyLoad == 2) {
            if (i == this.slider.currentSlideIndex) {
                this.preLoad(i);
            }
        } else {
            this.preLoad(i);
        }
    };

    NextendSmartSliderBackgroundImages.prototype.preLoadCurrent = function () {
        this.preLoad(this.slider.currentSlideIndex);
    };

    NextendSmartSliderBackgroundImages.prototype.preLoadAll = function () {
        var deferreds = [];
        for (var i = 0; i < this.backgroundImages.length; i++) {
            deferreds.push(this._preLoad(i));
        }
        return deferreds;
    };

    NextendSmartSliderBackgroundImages.prototype.preLoad = function (i) {
        return this._preLoad(i);
    };

    NextendSmartSliderBackgroundImages.prototype.preLoadLazyNeighbor = function (i) {

        var lazyLoadNeighbor = this.lazyLoadNeighbor,
            deferreds = [this._preLoad(i)];

        if (lazyLoadNeighbor) {
            var j = 0,
                k = i;
            while (j < lazyLoadNeighbor) {
                k--;
                if (k < 0) {
                    k = this.backgroundImages.length - 1;
                }
                deferreds.push(this._preLoad(k));
                j++;
            }
            j = 0;
            k = i;
            while (j < lazyLoadNeighbor) {
                k++;
                if (k >= this.backgroundImages.length) {
                    k = 0;
                }
                deferreds.push(this._preLoad(k));
                j++;
            }
        }

        var timeout = setTimeout($.proxy(function () {
            this.slider.load.showSpinner('backgroundImage' + i);
            timeout = null;
        }, this), 50);

        var renderedDeferred = $.Deferred(),
            loadedDeferred = $.when.apply($, deferreds).done($.proxy(function () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                } else {
                    this.slider.load.removeSpinner('backgroundImage' + i);
                }
                setTimeout(function () {
                    renderedDeferred.resolve();
                }, 100);
            }, this));

        return renderedDeferred;
    };

    NextendSmartSliderBackgroundImages.prototype._preLoad = function (i) {
        if (this.backgroundImages[i]) {
            return this.backgroundImages[i].preLoad();
        } else {
            return true
        }
    };

    NextendSmartSliderBackgroundImages.prototype.hack = function () {
        for (var i = 0; i < this.backgroundImages.length; i++) {
            if (this.backgroundImages[i]) {
                this.backgroundImages[i].hack();
            }
        }
    };

    scope.NextendSmartSliderBackgroundImages = NextendSmartSliderBackgroundImages;

    function NextendSmartSliderBackgroundImage(i, element, manager) {
        this.responsiveElement = false;
        this.loadStarted = false;

        this.i = i;
        this.element = element;
        this.manager = manager;
        this.loadDeferred = $.Deferred();

        var image = element.find('.n2-ss-slide-background-image');
        this.image = image;
        if (image.hasClass('n2-ss-slide-simple')) {
            this.mode = 'simple';
            this.currentSrc = image.attr('src');
        } else if (image.hasClass('n2-ss-slide-fill')) {
            this.mode = 'fill';
            this.currentSrc = image.attr('src');
        } else if (image.hasClass('n2-ss-slide-fit')) {
            this.mode = 'fit';
            this.currentSrc = image.attr('src');
        } else if (image.hasClass('n2-ss-slide-stretch')) {
            this.mode = 'stretch';
            this.currentSrc = image.attr('src');
        } else if (image.hasClass('n2-ss-slide-center')) {
            this.mode = 'center';
            var matches = image.css('backgroundImage').match(/url\(["]*([^)"]+)["]*\)/i);
            if (matches.length > 0) {
                this.currentSrc = matches[1];
            }
        } else if (image.hasClass('n2-ss-slide-tile')) {
            this.mode = 'tile';
            var matches = image.css('backgroundImage').match(/url\(["]*([^)"]+)["]*\)/i);
            if (matches.length > 0) {
                this.currentSrc = matches[1];
            }
        } else {
            this.mode = 'fill';
            this.currentSrc = '';
        }

        this.hash = element.data('hash');

        this.desktopSrc = element.data('desktop');
        this.tabletSrc = element.data('tablet');
        this.mobileSrc = element.data('mobile');

        if (isRetina) {
            var retina = element.data('desktop-retina');
            if (retina) {
                this.desktopSrc = retina;
            }
            retina = element.data('tablet-retina');
            if (retina) {
                this.tabletSrc = retina;
            }
            retina = element.data('mobile-retina');
            if (retina) {
                this.mobileSrc = retina;
            }
        }
        var opacity = element.data('opacity');
        if (opacity >= 0 && opacity < 1) {
            this.opacity = opacity;
        }

        if (manager.slider.isAdmin) {
            this._change = this.change;
            this.change = this.changeAdmin;
        }

        this.listenImageManager();

    };

    NextendSmartSliderBackgroundImage.prototype.fixNatural = function (DOMelement) {
        var img = new Image();
        img.src = DOMelement.src;
        DOMelement.naturalWidth = img.width;
        DOMelement.naturalHeight = img.height;
    };

    NextendSmartSliderBackgroundImage.prototype.preLoad = function () {
        if (this.loadDeferred.state() == 'pending') {
            this.loadStarted = true;
            this.manager.deviceDeferred.done($.proxy(function () {
                this.onSlideDeviceChanged(this.manager.device);
                this.element.imagesLoaded($.proxy(function () {
                    this.isLoaded = true;
                    var imageNode = this.image[0];
                    if (imageNode.tagName == 'IMG' && typeof imageNode.naturalWidth === 'undefined') {
                        this.fixNatural(imageNode);
                    }
                    this.loadDeferred.resolve(this.element);
                }, this));
            }, this));
        }
        return this.loadDeferred;
    };

    NextendSmartSliderBackgroundImage.prototype.afterLoaded = function () {
        return $.when(this.loadDeferred, this.manager.slider.responsive.ready);
    };

    NextendSmartSliderBackgroundImage.prototype.onSlideDeviceChanged = function (device) {
        var newSrc = this.desktopSrc;
        if (device.device == 'mobile') {
            if (this.mobileSrc) {
                newSrc = this.mobileSrc;
            } else if (this.tabletSrc) {
                newSrc = this.tabletSrc;
            }
        } else if (device.device == 'tablet') {
            if (this.tabletSrc) {
                newSrc = this.tabletSrc;
            }
        }
        this.change(newSrc, '', this.mode);
    };

    /**
     * @param {NextendSmartSliderResponsiveElementBackgroundImage} responsiveElement
     */
    NextendSmartSliderBackgroundImage.prototype.addResponsiveElement = function (responsiveElement) {
        this.responsiveElement = responsiveElement;
    };

    NextendSmartSliderBackgroundImage.prototype.listenImageManager = function () {
        if (this.hash != '') {
            $(window).on(this.hash, $.proxy(this.onImageManagerChanged, this));
        }
    };

    NextendSmartSliderBackgroundImage.prototype.notListenImageManager = function () {
        if (this.hash != '') {
            $(window).off(this.hash, null, $.proxy(this.onImageManagerChanged, this));
        }
    };

    NextendSmartSliderBackgroundImage.prototype.onImageManagerChanged = function (e, imageData) {
        this.tabletSrc = imageData.tablet.image;
        this.mobileSrc = imageData.mobile.image;
        if (this.manager.device.device == 'tablet' || this.manager.device.device == 'mobile') {
            this.onSlideDeviceChanged(this.manager.device);
        }
    };

    NextendSmartSliderBackgroundImage.prototype.changeDesktop = function (src, alt, newMode) {
        this.notListenImageManager();
        this.desktopSrc = src;
        this.hash = md5(src);

        if (newMode == 'default') {
            newMode = nextend.smartSlider.slideBackgroundMode;
        }

        this.change(src, alt, newMode);

        if (src != '') {
            var img = new Image();
            img.addEventListener("load", $.proxy(function () {
                $.when(nextend.imageManager.getVisual(src))
                    .done($.proxy(function (visual) {
                        this.onImageManagerChanged(null, visual.value);
                        this.listenImageManager();
                    }, this));
            }, this), false);
            img.src = nextend.imageHelper.fixed(src);
        } else {
            this.tabletSrc = '';
            this.mobileSrc = '';
        }
    };

    NextendSmartSliderBackgroundImage.prototype.changeAdmin = function (src, alt, newMode) {
        if (this.manager.slider.parameters.dynamicHeight) {
            newMode = 'simple';
        }
        this._change(nextend.imageHelper.fixed(src), alt, newMode);
    };

    NextendSmartSliderBackgroundImage.prototype.change = function (src, alt, newMode) {
        if (this.currentSrc != src || this.mode != newMode) {
            if (this.loadStarted) {
                n2c.log('Slide background changed: ', src);
                var node = null;
                switch (newMode) {
                    case 'simple':
                        node = $('<img src="' + src + '" class="n2-ss-slide-background-image n2-ss-slide-simple" />');
                        break;
                    case 'fill':
                        node = $('<img src="' + src + '" class="n2-ss-slide-background-image n2-ss-slide-fill" />');
                        this.responsiveElement.setCentered();
                        break;
                    case 'fit':
                        node = $('<img src="' + src + '" class="n2-ss-slide-background-image n2-ss-slide-fit" />');
                        this.responsiveElement.setCentered();
                        break;
                    case 'stretch':
                        node = $('<img src="' + src + '" class="n2-ss-slide-background-image n2-ss-slide-stretch" />');
                        this.responsiveElement.unsetCentered();
                        break;
                    case 'center':
                        node = $('<div style="background-image: url(\'' + src + '\');" class="n2-ss-slide-background-image n2-ss-slide-center"></div>');
                        this.responsiveElement.unsetCentered();
                        break;
                    case 'tile':
                        node = $('<div style="background-image: url(\'' + src + '\');" class="n2-ss-slide-background-image n2-ss-slide-tile"></div>');
                        this.responsiveElement.unsetCentered();
                        break;
                }
                if (src == '') {
                    node.css('display', 'none');
                }
                node.css('opacity', this.opacity);
                this.image
                    .replaceWith(node)
                    .remove();
                this.responsiveElement.element = this.image = node;
                this.currentSrc = src;
                this.mode = newMode;

                if (this.loadDeferred.state() == 'pending') {
                    this.loadDeferred.resolve();
                }
                this.loadDeferred = $.Deferred();
                this.manager.changed(this.i);

                switch (newMode) {
                    case 'fill':
                    case 'fit':
                        this.afterLoaded().done($.proxy(function () {
                            this.responsiveElement.afterLoaded();
                            this.responsiveElement.refreshRatio();
                            this.responsiveElement._refreshResize();
                        }, this));
                        break;
                    case 'stretch':
                    case 'center':
                    case 'tile':
                    case 'simple':
                        this.responsiveElement._refreshResize();
                        break;
                }
            }
        }
    };

    NextendSmartSliderBackgroundImage.prototype.setOpacity = function (opacity) {
        this.opacity = opacity;
        this.image.css('opacity', opacity);
    };

    NextendSmartSliderBackgroundImage.prototype.hack = function () {
        NextendTween.set(this.element, {
            rotation: 0.0001
        });
    };

    scope.NextendSmartSliderBackgroundImage = NextendSmartSliderBackgroundImage;
    var isMobile = /Mobi/.test(navigator.userAgent);

    function NextendSmartSliderBackgroundVideos(slider) {
        this.notResized = [];
        this.slider = slider;

        this.videos = [];
        var hasVideoBackground = false,
            slides = this.slider.realSlides;
        for (var i = 0; i < slides.length + 1; i++) {
            this.notResized[i] = true;
            var video = slides.eq(i).find('.n2-ss-slide-background-video');
            if (isMobile) {
                video.remove();
                this.videos[i] = false;
            } else if (video.length > 0) {
                this.videos[i] = video;
                if (this.videos[i][0].videoWidth > 0) {
                    this.videoPlayerReady(i);
                } else {
                    this.videos[i][0].addEventListener('error', $.proxy(this.videoPlayerError, this, i), true);
                    this.videos[i][0].addEventListener('canplay', $.proxy(this.videoPlayerReady, this, i));
                }
                hasVideoBackground = true;
            } else {
                this.videos[i] = false;
            }
        }

        if (hasVideoBackground) {
            this.slider.sliderElement.on("mainAnimationStart", $.proxy(this.pauseCurrentSlide, this));
            this.slider.sliderElement.on("mainAnimationComplete", $.proxy(this.playCurrentSlide, this));

            this.play(this.slider.currentSlideIndex);
        }
    };

    NextendSmartSliderBackgroundVideos.prototype.pauseCurrentSlide = function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
        this.pause(previousSlideIndex);
    };

    NextendSmartSliderBackgroundVideos.prototype.playCurrentSlide = function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
        this.play(currentSlideIndex);
    };

    NextendSmartSliderBackgroundVideos.prototype.pause = function (i) {
        if (this.videos[i]) {
            this.videos[i][0].pause();
        }
    };

    NextendSmartSliderBackgroundVideos.prototype.play = function (i) {
        if (this.videos[i]) {
            if (this.videos[i][0].videoWidth > 0) {
                this.videos[i][0].play();
            } else {
                this.videos[i][0].addEventListener('canplay', $.proxy(function (i) {
                    this.videos[i][0].play();
                }, this, i));
            }
        }
    };

    NextendSmartSliderBackgroundVideos.prototype.videoPlayerError = function (i) {
        this.videos[i].remove();
        this.videos[i] = false;
    };

    NextendSmartSliderBackgroundVideos.prototype.videoPlayerReady = function (i) {
        var video = this.videos[i];
        video.data('ratio', video[0].videoWidth / video[0].videoHeight);
        video.addClass('n2-active');
        this.slider.sliderElement.on('BeforeVisible', $.proxy(this.resize, this, i));

        this.slider.ready($.proxy(function () {
            this.slider.sliderElement.on('SliderResize', $.proxy(this.resize, this, i));
            if (this.notResized[i]) {
                this.resize(i);
            }
        }, this));
    };

    NextendSmartSliderBackgroundVideos.prototype.resize = function (i) {
        if (this.notResized[i]) {
            var background = this.videos[i].data('background');
            if (background && background != '') {
                $('<div style="position:absolute;left:0;top:0;width:100%;height:100%;' + background + ';"/>').insertAfter(this.videos[i]);
            }
            this.notResized[i] = false;
        }
        var video = this.videos[i];
        this.resizeVideo(i);
        switch (video.data('mode')) {
            case 'fill':
            case 'fit':
            case 'center':
                this.centerVideo(i);
                break;
        }
    };

    NextendSmartSliderBackgroundVideos.prototype.resizeVideo = function (i) {

        var video = this.videos[i],
            mode = video.data('mode'),
            ratio = video.data('ratio'),
            slideOuter = this.slider.dimensions.slideouter || this.slider.dimensions.slide,
            slideOuterRatio = slideOuter.width / slideOuter.height;

        if (mode == 'fill') {
            if (slideOuterRatio > ratio) {
                video.css({
                    width: '100%',
                    height: 'auto'
                });
            } else {
                video.css({
                    width: 'auto',
                    height: '100%'
                });
            }
        } else if (mode == 'fit') {
            if (slideOuterRatio < ratio) {
                video.css({
                    width: '100%',
                    height: 'auto'
                });
            } else {
                video.css({
                    width: 'auto',
                    height: '100%'
                });
            }
        }
    };

    NextendSmartSliderBackgroundVideos.prototype.centerVideo = function (i) {
        var video = this.videos[i],
            parent = video.parent();
        video.css({
            marginLeft: parseInt((parent.width() - video.width()) / 2),
            marginTop: parseInt((parent.height() - video.height()) / 2)
        });
    };

    scope.NextendSmartSliderBackgroundVideos = NextendSmartSliderBackgroundVideos;


})(n2, window);