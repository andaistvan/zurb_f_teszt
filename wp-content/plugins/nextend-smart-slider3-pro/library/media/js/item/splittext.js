
(function ($, scope, undefined) {

    var zero = {
        opacity: 1,
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        scale: 1
    };

    function HeadingItemSplitText(slider, id, transformOrigin, backfaceVisibility, splittextin, delayIn, splittextout, delayOut) {
        if (!splittextin && !splittextout) {
            return;
        }
        this.id = id;
        this.node = $("#" + id);
        this.slider = slider;

        var a = this.node.find('a');
        if (a.length) {
            this.node = a;
        }

        var mode = {
            chars: 0,
            words: 0,
            lines: 0
        };
        if (splittextin) {
            this.splitTextIn = this.optimize(splittextin.data, delayIn);
            mode[this.splitTextIn.mode] = 1;
        } else {
            this.splitTextIn = false;
        }

        if (splittextout) {
            this.splitTextOut = this.optimize(splittextout.data, delayOut);
            mode[this.splitTextOut.mode] = 1;
        } else {
            this.splitTextOut = false;
        }

        var modes = [];
        for (var k in mode) {
            if (mode[k]) {
                modes.push(k);
            }
        }
        if (mode.chars && !mode.words) {
            modes.push('words');
        }
        this.splitText = new NextendSplitText(this.node, {type: modes.join(',')});


        this.initSlide();

        this.layer = this.node.closest('.n2-ss-layer')
            .on('layerExtendTimelineIn.' + id, $.proxy(this.extendTimelineIn, this))
            .on('layerExtendTimelineOut.' + id, $.proxy(this.extendTimelineOut, this));

        if (mode == 'words,chars') {
            mode = 'chars'
        }


        for (var k in mode) {
            if (mode[k]) {
                NextendTween.set(this.splitText[k], {
                    perspective: 1000,
                    transformOrigin: transformOrigin,
                    backfaceVisibility: backfaceVisibility
                });
            }
        }

    };

    HeadingItemSplitText.prototype.initSlide = function () {
        this.slide = this.slider.slides.eq(this.slider.findSlideIndexByElement(this.node));
    };

    HeadingItemSplitText.prototype.extendTimelineIn = function (e, timeline, position) {
        if (this.splitTextIn) {
            var animation = this.splitTextIn;
            this._animate(timeline, 'staggerFromTo', animation.mode, animation.sort, animation.duration, $.extend(true, {}, animation.from), $.extend(true, {ease: animation.ease}, zero), animation.stagger, position + animation.delay);
        }
    };

    HeadingItemSplitText.prototype.extendTimelineOut = function (e, timeline, position) {
        if (this.splitTextOut) {
            var animation = this.splitTextOut;
            this._animate(timeline, 'staggerFromTo', animation.mode, animation.sort, animation.duration, $.extend(true, {}, zero), $.extend(true, {ease: animation.ease}, animation.from), -animation.stagger, position + animation.delay);
        }
    };

    HeadingItemSplitText.prototype._animate = function (timeline, staggerMethod, mode, sort, duration, from, to, stagger, position) {
        var splits = $.extend([], this.splitText[mode]),
            splits2 = null;

        switch (sort) {
            case 'reversed':
                splits.reverse();
                break;
            case 'random':
                var rand = function (a, b, c, d) {
                    c = a.length;
                    while (c)b = Math.random() * c-- | 0, d = a[c], a[c] = a[b], a[b] = d;
                };
                rand(splits);
                break;
            case 'side':
            case 'center':
                var splitsN = [];
                splits2 = [];
                while (splits.length > 1) {
                    splitsN.push(splits.shift());
                    splits2.push(splits.pop());
                }
                if (splits.length == 1) {
                    splitsN.push(splits.shift());
                }
                splits = splitsN;
                if (sort == 'center') {
                    splits.reverse();
                    splits2.reverse();
                }
                break;
            case 'sideShifted':
            case 'centerShifted':
                var splitsN = [];
                while (splits.length > 1) {
                    splitsN.push(splits.shift());
                    splitsN.push(splits.pop());
                }
                if (splits.length == 1) {
                    splitsN.push(splits.shift());
                }
                splits = splitsN;
                if (sort == 'centerShifted') {
                    splits.reverse();
                }
                break;
        }

        timeline[staggerMethod](splits, duration, from, to, stagger, position);
        if (splits2 && splits2.length) {
            timeline[staggerMethod](splits2, duration, from, to, stagger, position);
        }
    };

    HeadingItemSplitText.prototype.optimize = function (animationData, delay) {
        var animation = {
            mode: animationData.mode,
            sort: animationData.sort,
            duration: animationData.duration,
            stagger: animationData.stagger,
            delay: delay,
            from: {},
            ease: animationData.ease
        }
        if (animationData.opacity != 1) {
            animation.from.opacity = animationData.opacity;
        }
        if (animationData.scale != 1) {
            animation.from.scale = animationData.scale;
        }
        if (animationData.x != 0) {
            animation.from.x = animationData.x;
        }
        if (animationData.y != 0) {
            animation.from.y = animationData.y;
        }
        if (animationData.rotationX != 0) {
            animation.from.rotationX = animationData.rotationX;
        }
        if (animationData.rotationY != 0) {
            animation.from.rotationY = animationData.rotationY;
        }
        if (animationData.rotationZ != 0) {
            animation.from.rotationZ = animationData.rotationZ;
        }
        return animation;
    };

    scope.NextendSmartSliderHeadingItemSplitText = HeadingItemSplitText;
})
(n2, window);
