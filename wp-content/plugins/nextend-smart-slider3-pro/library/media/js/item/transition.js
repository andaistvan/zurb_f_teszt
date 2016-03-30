
(function ($, scope, undefined) {

    function TransitionItem(slider, node, animation) {
        this.slider = slider;

        if (n2const.isIE) {
            animation = 'Fade';
        }
        this.animation = animation;

        this.node = $('#' + node)
            .on('mouseenter', $.proxy(this['in' + animation], this))
            .on('mouseleave', $.proxy(this['out' + animation], this));
        this.images = this.node.find('img');
        this.inner = this.node.find('.n2-ss-item-transition-inner');

        this['init' + animation]();
    };

    TransitionItem.prototype.initFade = function () {
        this.images.eq(1).css('opacity', 0);
    };

    TransitionItem.prototype.inFade = function () {
        NextendTween.to(this.images.eq(1), 0.5, {
            opacity: 1
        });
    };

    TransitionItem.prototype.outFade = function () {
        NextendTween.to(this.images.eq(1), 0.5, {
            opacity: 0
        });
    };

    TransitionItem.prototype.initVerticalFlip = function () {
        NextendTween.set(this.node, {
            perspective: 1000
        });
        NextendTween.set(this.inner, {
            transformStyle: 'preserve-3d'
        });
        NextendTween.set(this.images.eq(0), {
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
        });
        NextendTween.set(this.images.eq(1), {
            rotationX: -180,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
        });
    };

    TransitionItem.prototype.inVerticalFlip = function () {
        NextendTween.to(this.inner, 0.5, {
            rotationX: -180
        });
    };

    TransitionItem.prototype.outVerticalFlip = function () {
        NextendTween.to(this.inner, 0.5, {
            rotationX: 0
        });
    };

    TransitionItem.prototype.initHorizontalFlip = function () {
        NextendTween.set(this.inner.parent(), {
            perspective: 1000
        });
        NextendTween.set(this.inner, {
            transformStyle: 'preserve-3d'
        });
        NextendTween.set(this.images.eq(0), {
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
        });
        NextendTween.set(this.images.eq(1), {
            rotationY: -180,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
        });
    };

    TransitionItem.prototype.inHorizontalFlip = function () {
        NextendTween.to(this.inner, 0.5, {
            rotationY: -180
        });
    };

    TransitionItem.prototype.outHorizontalFlip = function () {
        NextendTween.to(this.inner, 0.5, {
            rotationY: 0
        });
    };

    scope.NextendSmartSliderTransitionItem = TransitionItem;

})(n2, window);
