
(function ($, scope) {

    function NextendPostBackgroundAnimationEditorController() {
        NextendVisualEditorController.prototype.constructor.call(this, false);

        this.bgAnimationElement = $('.n2-postbg-animation-slider')
            .on('click', $.proxy(this.clickFocusPoint, this));
        this.bgImage = this.bgAnimationElement.find('.n2-postbg-animation-slide');

        if (!nModernizr.csstransforms3d) {
            nextend.notificationCenter.error('Background animations are not available in your browser. It works if the <i>3D transform</i> feature available. ')
        }

        this.transformOriginField = $('#n2-post-backgroundtransformorigin')
            .on('nextendChange', $.proxy(this.changeFocus, this));
    };

    NextendPostBackgroundAnimationEditorController.prototype = Object.create(NextendVisualEditorController.prototype);
    NextendPostBackgroundAnimationEditorController.prototype.constructor = NextendPostBackgroundAnimationEditorController;

    NextendPostBackgroundAnimationEditorController.prototype.loadDefaults = function () {
        NextendVisualEditorController.prototype.loadDefaults.call(this);
        this.type = 'postbackgroundanimation';
        this.tween = null;
        this.animationProperties = false;
        this.transformOrigin = '50||50';
    };


    NextendPostBackgroundAnimationEditorController.prototype.clickFocusPoint = function (e) {
        var offset = this.bgAnimationElement.offset();
        var x = Math.round((e.pageX - offset.left) / this.bgAnimationElement.width() * 100);
        var y = Math.round((e.pageY - offset.top) / this.bgAnimationElement.height() * 100);

        this.transformOriginField.data('field').insideChange(x + '|*|' + y);
    };

    NextendPostBackgroundAnimationEditorController.prototype.changeFocus = function () {
        this.transformOrigin = this.transformOriginField.val();
        if (this.animationProperties) {
            this.setAnimationProperties(this.animationProperties);
        }
    };

    NextendPostBackgroundAnimationEditorController.prototype.setImage = function () {
        if (!nextend || !nextend.smartSlider || !nextend.smartSlider.frontend) {
            return;
        }
        var frontendSlider = nextend.smartSlider.frontend;
        if (typeof frontendSlider != 'undefined') {
            var backgrounds = frontendSlider.backgroundImages.getBackgroundImages();

            this.bgImage.html('');

            backgrounds[frontendSlider.currentSlideIndex].image
                .clone()
                .appendTo(this.bgImage);

            var maxW = this.bgAnimationElement.parent().width() - 40,
                width = frontendSlider.dimensions.width,
                height = frontendSlider.dimensions.height;
            if (width > maxW) {
                height = height * maxW / width;
                width = maxW;
            }

            this.bgAnimationElement.css({
                width: width,
                height: height
            });
        }
    };

    NextendPostBackgroundAnimationEditorController.prototype.get = function () {
        return null;
    };

    NextendPostBackgroundAnimationEditorController.prototype.load = function (visual, tabs, mode, preview) {
        this.lightbox.addClass('n2-editor-loaded');
    };

    NextendPostBackgroundAnimationEditorController.prototype.setTabs = function (labels) {

    };

    NextendPostBackgroundAnimationEditorController.prototype.start = function (data) {
        this.setImage();
        this.transformOriginField.data('field').insideChange(data[0] + '|*|' + data[1]);
    };

    NextendPostBackgroundAnimationEditorController.prototype.pause = function () {
        if (this.tween) {
            this.tween.pause();
        }
    };

    NextendPostBackgroundAnimationEditorController.prototype.next = function () {
        var properties = $.extend(true, {}, this.animationProperties);

        if (typeof properties.from.transformOrigin == 'undefined') {
            NextendTween.set(this.bgImage, {
                transformOrigin: this.transformOrigin.split('|*|').join('% ') + '%'
            });
        }

        properties.to.delay = 0.5;
        properties.to.onComplete = $.proxy(this.next, this);

        this.tween = NextendTween.fromTo(this.bgImage, properties.duration, properties.from, properties.to);
    };

    NextendPostBackgroundAnimationEditorController.prototype.setAnimationProperties = function (animationProperties) {
        this.animationProperties = animationProperties;
        this.pause();
        NextendTween.set(this.bgImage, {
            scale: 1,
            x: 0,
            y: 0,
            rotationZ: 0.0001,
            transformOrigin: '50% 50%'
        });
        this.next();
    };

    scope.NextendPostBackgroundAnimationEditorController = NextendPostBackgroundAnimationEditorController;
})(n2, window);
