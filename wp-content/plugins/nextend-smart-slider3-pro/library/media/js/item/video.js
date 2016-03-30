
(function ($, scope, undefined) {
    function VideoItem(slider, id, parameters) {

        this.slider = slider;
        this.playerId = id;
        this.playerElement = $("#" + this.playerId);
        this.videoPlayer = this.playerElement.get(0);

        this.parameters = $.extend({
            autoplay: 0,
            loop: 0,
            center: 0
        }, parameters);

        this.slideIndex = slider.findSlideIndexByElement(this.videoPlayer);

        if (this.videoPlayer.videoWidth > 0) {
            this.initVideoPlayer();
        } else {
            this.videoPlayer.addEventListener('loadedmetadata', $.proxy(this.initVideoPlayer, this));
        }
    };

    VideoItem.prototype.initVideoPlayer = function () {
        if (this.parameters.center == 1) {
            this.onResize();

            this.slider.sliderElement.on('SliderResize', $.proxy(this.onResize, this))
        }

        var layer = this.playerElement.parent();
        //restart autoplay when video ended
        this.playerElement
            .on('playing', $.proxy(function () {
                this.slider.sliderElement.trigger('mediaStarted', this.playerId);
                layer.triggerHandler('n2play');
            }, this))
            .on('ended', $.proxy(function () {
                if (this.parameters.loop == 1) {
                    this.videoPlayer.currentTime = 0;
                    this.videoPlayer.play();
                } else {
                    this.slider.sliderElement.trigger('mediaEnded', this.playerId);
                    layer.triggerHandler('n2stop');
                }
            }, this));

        this.playerElement.on('pause', function () {
            layer.triggerHandler('n2pause');
        });


        if (this.parameters.autoplay == 1) {
            this.initAutoplay();
        }

        //pause video when slide changed
        this.slider.sliderElement.on("mainAnimationStart", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
            if (currentSlideIndex != this.slideIndex) {
                this.pause();
            }
        }, this));
    };

    VideoItem.prototype.onResize = function () {
        var parent = this.playerElement.parent(),
            width = parent.width(),
            height = parent.height(),
            aspectRatio = this.videoPlayer.videoWidth / this.videoPlayer.videoHeight,
            css = {
                width: width,
                height: height,
                marginLeft: 0,
                marginTop: 0
            };
        if (width / height > aspectRatio) {
            css.height = width * aspectRatio;
            css.marginTop = (height - css.height) / 2;
        } else {
            css.width = height * aspectRatio;
            css.marginLeft = (width - css.width) / 2;
        }
        this.playerElement.css(css);
    };

    VideoItem.prototype.initAutoplay = function () {

        //change slide
        this.slider.sliderElement.on("mainAnimationComplete", $.proxy(function (e, mainAnimation, previousSlideIndex, currentSlideIndex, isSystem) {
            if (currentSlideIndex == this.slideIndex) {
                this.play();
            }
        }, this));

        if (this.slider.currentSlideIndex == this.slideIndex) {
            this.play();
        }
    };

    VideoItem.prototype.play = function () {
        if (this.isStopped()) {
            this.slider.sliderElement.trigger('mediaStarted', this.playerId);
            this.videoPlayer.play();
        }
    };

    VideoItem.prototype.pause = function () {
        if (!this.isStopped()) {
            this.videoPlayer.pause();
        }
    };

    VideoItem.prototype.isStopped = function () {
        return this.videoPlayer.paused;
    };

    scope.NextendSmartSliderVideoItem = VideoItem;

})(n2, window);
