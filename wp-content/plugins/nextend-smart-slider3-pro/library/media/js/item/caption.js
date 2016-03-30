
(function ($, scope, undefined) {

    function CaptionItem(slider, node, mode, direction, scale) {
        this.startCSS = null;
        this.slider = slider;
        this.mode = mode;
        this.direction = direction;
        this.scale = scale;
        this.node = $('#' + node)
            .on('mouseenter', $.proxy(this.in, this))
            .on('mouseleave', $.proxy(this.out, this));
        this.image = this.node.find('img');
        this.content = this.node.find('.n2-ss-item-caption-content');

        this['init' + mode]();
    };

    CaptionItem.prototype.initSimple = function () {
        var css = {
            height: 'auto'
        };
        switch (this.direction) {
            case 'left':
                css.bottom = 0;
                css.left = '-100%';
                this.startCSS = {
                    left: '-100%'
                };
                break;
            case 'right':
                css.bottom = 0;
                css.right = '-100%';
                this.startCSS = {
                    right: '-100%'
                };
                break;
            default:
                css.left = 0;
                this.resizeSimple();
                this.slider.sliderElement.on('SliderResize', $.proxy(this.resizeSimple, this));
                this._out = this._outSimple;
        }
        this.content.css(css);
    };

    CaptionItem.prototype.resizeSimple = function () {
        var o = {};
        o[this.direction] = -this.content.height();
        this.content.css(o);
    };

    CaptionItem.prototype._outSimple = function () {
        var o = {};
        o[this.direction] = -this.content.height();
        this.tweenContent(o);
    };

    CaptionItem.prototype.initFull = function () {
        var css = {};
        switch (this.direction) {
            case 'left':
                css.bottom = 0;
                css.left = '-100%';
                this.startCSS = {
                    left: '-100%'
                };
                break;
            case 'right':
                css.bottom = 0;
                css.right = '-100%';
                this.startCSS = {
                    right: '-100%'
                };
                break;
            case 'top':
                css.left = 0;
                css.top = '-100%';
                this.startCSS = {
                    top: '-100%'
                };
                break;
            case 'bottom':
                css.left = 0;
                css.bottom = '-100%';
                this.startCSS = {
                    bottom: '-100%'
                };
                break;
        }
        this.content.css(css);
    };

    CaptionItem.prototype.initFade = function () {
        this.content.css({
            opacity: 0,
            left: 0,
            top: 0
        });
        this._in = this._inFade;
        this._out = this._outFade;
    };

    CaptionItem.prototype._inFade = function () {
        this.tweenContent({
            opacity: 1
        });
    };
    CaptionItem.prototype._outFade = function () {
        this.tweenContent({
            opacity: 0
        });
    };

    CaptionItem.prototype.in = function () {
        this._in();
        if (this.scale) {
            this.tweenImage({
                scale: 1.2
            });
        }
    };

    CaptionItem.prototype._in = function () {
        var o = {};
        o[this.direction] = 0;
        this.tweenContent(o);
    };

    CaptionItem.prototype.out = function () {
        this._out();
        if (this.scale) {
            this.tweenImage({
                scale: 1
            });
        }
    };

    CaptionItem.prototype._out = function () {
        this.tweenContent(this.startCSS);
    };

    CaptionItem.prototype.tweenContent = function (o) {
        NextendTween.to(this.content, 0.5, o);
    };

    CaptionItem.prototype.tweenImage = function (o) {
        NextendTween.to(this.image, 0.5, o);
    };
    scope.NextendSmartSliderCaptionItem = CaptionItem;
})(n2, window);
