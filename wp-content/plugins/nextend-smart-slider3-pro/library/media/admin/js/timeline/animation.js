
(function (smartSlider, $, scope, undefined) {


    function TimelineAnimation(timelineLayerManager, animation, direction, data) {

        this.loadDefaults();

        this.timelineLayerManager = timelineLayerManager;

        this.animation = animation;

        this.direction = direction;

        this.delay = $('<span class="n2-ss-animation-delay n2-h5"></span>');
        this.setDelay(animation.data.delay);

        this.duration = $('<span class="n2-ss-animation-duration n2-h5"></span>');
        this.setDuration(animation.data.duration);

        this.bar = $('<div class="n2-ss-layer-animation n2-ss-layer-animation-' + animation.group + '"></div>')
            .css(nextend.rtl.marginLeft, smartSlider.durationToOffsetX(animation.data.delay))
            .css({
                width: smartSlider.durationToOffsetX(animation.data.duration)
            })
            .data('animation', this)
            .append(this.delay)
            .append(this.duration)
            .draggable({
                scroll: true,
                axis: "x",
                start: function (event, ui) {
                    ui.originalPosition[nextend.rtl.marginLeft] = parseInt(ui.helper.css(nextend.rtl.marginLeft));
                },
                drag: $.proxy(function (event, ui) {
                    var left = ui.position.left + ui.originalPosition[nextend.rtl.marginLeft],
                        margin = Math.max(0, nextend.rtl.isRtl ? left *= -1 : left),
                        roundedMargin = smartSlider.normalizeOffsetX(margin);

                    ui.position.left = 0;
                    ui.helper.css(nextend.rtl.marginLeft, roundedMargin);
                    ui.position[nextend.rtl.marginLeft] = roundedMargin;

                    this.setDelay(smartSlider.offsetXToDuration(roundedMargin));
                }, this),
                stop: $.proxy(this.onBarDragStop, this)
            });

        if (this.resizable) {
            this.bar.resizable({
                handles: "e, w",
                start: function (event, ui) {
                    ui.originalPosition[nextend.rtl.marginLeft] = parseInt(ui.helper.css(nextend.rtl.marginLeft));
                },
                resize: $.proxy(function (event, ui) {

                    var margin = Math.max(0, ui.position.left + ui.originalPosition[nextend.rtl.marginLeft]);

                    var roundedMargin = smartSlider.normalizeOffsetX(margin),
                        offset = margin - roundedMargin;

                    ui.size.width = smartSlider.normalizeOffsetX(ui.size.width + offset);

                    this.setDuration(smartSlider.offsetXToDuration(ui.size.width));

                    ui.position.left = 0;
                    ui.helper.css(nextend.rtl.marginLeft, roundedMargin);
                    ui.position[nextend.rtl.marginLeft] = roundedMargin;

                    this.setDelay(smartSlider.offsetXToDuration(roundedMargin));
                }, this),
                stop: $.proxy(this.onBarResizeStop, this)
            });
        }

        this.bar.on('click', $.proxy(this.click, this));

        animation.$
            .on('animationChanged', $.proxy(this.animationChanged, this))
            .on('animationMoved', $.proxy(this.animationMoved, this))
            .on('animationDeleted', $.proxy(this.animationDeleted, this));

    };

    TimelineAnimation.prototype.loadDefaults = function () {
        this.resizable = true;
    }

    TimelineAnimation.prototype.getBar = function () {
        return this.bar;
    };

    TimelineAnimation.prototype.click = function () {
        this.animation.edit();
    };

    TimelineAnimation.prototype.onBarResizeStop = function (event, ui) {

        this.animation.animations._startHistory();

        var delay = smartSlider.offsetXToDuration(ui.position[nextend.rtl.marginLeft]),
            duration = smartSlider.offsetXToDuration(ui.size.width);

        this.animation.setDelay(delay);
        this.animation.setDuration(duration);

        this.setDelay(delay);
        this.setDuration(duration);

        this.fixTimelineTotalDuration();

        this.animation.animations._endHistory();
    };

    TimelineAnimation.prototype.onBarDragStop = function (event, ui) {

        this.animation.animations._startHistory();

        var delay = smartSlider.offsetXToDuration(ui.position[nextend.rtl.marginLeft]);
        this.animation.setDelay(delay);

        this.setDelay(delay);

        this.fixTimelineTotalDuration();

        this.animation.animations._endHistory();
    };

    TimelineAnimation.prototype.animationChanged = function () {
        this.bar.css(nextend.rtl.marginLeft, smartSlider.durationToOffsetX(this.animation.data.delay))
            .css({
                width: smartSlider.durationToOffsetX(this.animation.data.duration)
            });

        this.setDelay(this.animation.data.delay);
        this.setDuration(this.animation.data.duration);

        this.fixTimelineTotalDuration();
    };

    TimelineAnimation.prototype.setDelay = function (delay) {
        if (delay < 0.15) {
            this.delay.css('display', 'none');
        } else {
            this.delay
                .css('display', 'inline')
                .html(Math.round(delay * smartSlider.oneSecMs));
        }
    };

    TimelineAnimation.prototype.setDuration = function (duration) {
        this.duration.html(Math.round(duration * smartSlider.oneSecMs));
    };

    TimelineAnimation.prototype.animationMoved = function (e, originalGroup, startIndex, targetGroup, targetIndex) {

        if (this.direction != targetGroup) {
            console.error('Unable to change the animation group');
        }

        var targetParent = this.timelineLayerManager[this.direction];

        this.bar.detach()
            .removeClass('n2-ss-layer-animation-' + originalGroup)
            .addClass('n2-ss-layer-animation-' + targetGroup);

        if (targetGroup == 'out' && this.direction == 'in') {
            // fix for play out after bars
            targetIndex += targetParent.find('.n2-ss-layer-animation-in').length;
        }

        if (targetIndex == 0) {
            this.bar.prependTo(targetParent);
        } else {
            this.bar.insertAfter(targetParent.children().eq(targetIndex - 1));
        }

        if (this.direction == 'in') {
            this.timelineLayerManager.specialZeroInChanged();
        }

        this.fixTimelineTotalDuration();
    };

    TimelineAnimation.prototype.animationDeleted = function () {
        this.bar.remove();
        this.animation.$.off('animationChanged animationMoved animationDeleted');
        this.timelineLayerManager.animationDeleted(this.direction);
    };

    TimelineAnimation.prototype.fixTimelineTotalDuration = function () {
        this.timelineLayerManager.fixTimelineTotalDuration(this.direction);
    };

    scope.NextendSmartSliderTimelineAnimation = TimelineAnimation;

    function TimelineAnimationLoopDummy(timelineLayerManager) {
        this.loops = [];
        var animation = {
            group: 'loop',
            data: {
                duration: 0,
                delay: 0
            },
            $: $(''),
            setDelay: $.proxy(function (delay) {
                this.timelineLayerManager.layer.animation.data.repeatStartDelay = delay;
            }, this),
            setDuration: function () {
            }
        }
        TimelineAnimation.prototype.constructor.call(this, timelineLayerManager, animation, 'loop', 'data');
    };

    TimelineAnimationLoopDummy.prototype = Object.create(TimelineAnimation.prototype);
    TimelineAnimationLoopDummy.prototype.constructor = TimelineAnimationLoopDummy;

    TimelineAnimationLoopDummy.prototype.loadDefaults = function () {
        TimelineAnimation.prototype.loadDefaults.call(this);
        this.resizable = false;
    };

    TimelineAnimationLoopDummy.prototype.click = function () {
        this.loops[0].animation.edit();
    },

        TimelineAnimationLoopDummy.prototype.add = function (loop) {
            this.loops.push(loop);
            this.bar.appendTo(this.timelineLayerManager[this.direction]);
            this.refresh();
        },

        TimelineAnimationLoopDummy.prototype.remove = function (loop) {
            var index = $.inArray(loop, this.loops);
            this.loops.splice(index, 1);

            this.refresh();
            this.timelineLayerManager.animationDeleted(this.direction);
        },

        TimelineAnimationLoopDummy.prototype.refresh = function () {
            if (this.loops.length == 0) {
                this.bar.detach();
                return;
            }
            var inOutDuration = 0,
                duration = 0,
                length = this.loops.length;
            if (length == 1) {
                var singleAnimation = this.loops[0].animation.data;
                if ((singleAnimation.rotationX == 360 || singleAnimation.rotationY == 360 || singleAnimation.rotationZ == 360) && singleAnimation.opacity == 1 && singleAnimation.x == 0 && singleAnimation.y == 0 && singleAnimation.z == 0 && singleAnimation.scaleX == 1 && singleAnimation.scaleY == 1 && singleAnimation.scaleZ == 1 && singleAnimation.skewX == 0) {
                    duration = (singleAnimation.duration + singleAnimation.delay);
                } else {
                    duration = (singleAnimation.duration + singleAnimation.delay) * 2;
                }
            } else {
                // In and Out Loop
                inOutDuration = this.loops[this.loops.length - 1].animation.data.duration;
                for (var i = 0; i < length; i++) {
                    var d = this.loops[i].animation.data;
                    duration += d.duration + d.delay;
                }
            }
            var globalLayerData = this.timelineLayerManager.layer.animation.data;
            if (globalLayerData.repeatCount != 0) {
                duration *= globalLayerData.repeatCount;
            }
            this.animation.data.duration = duration + inOutDuration;

            this.animation.data.delay = globalLayerData.repeatStartDelay;
            this.animationChanged();
        },

        TimelineAnimationLoopDummy.prototype.animationMoved = function (startIndex, targetIndex) {
            var element = this.loops[startIndex];
            this.loops.splice(startIndex, 1);
            this.loops.splice(targetIndex, 0, element);
            this.refresh();
        },

        TimelineAnimationLoopDummy.prototype.setDuration = function (duration) {
            var value;
            if (this.timelineLayerManager.layer.animation.data.repeatCount == 0) {
                value = 'LOOP';
            } else {
                value = Math.round(duration * smartSlider.oneSecMs);
            }
            this.duration.html(value);
        };

    scope.NextendSmartSliderTimelineAnimationLoopDummy = TimelineAnimationLoopDummy;

    function TimelineAnimationLoop(timelineLayerManager, animation, loopDummy) {
        this.timelineLayerManager = timelineLayerManager;
        this.animation = animation;
        this.loopDummy = loopDummy;

        animation.$
            .on('animationChanged', $.proxy(this.loopDummy.refresh, this.loopDummy))
            .on('animationMoved', $.proxy(this.animationMoved, this))
            .on('animationDeleted', $.proxy(this.loopDummy.remove, this.loopDummy, this));
    };

    TimelineAnimationLoop.prototype.animationMoved = function (e, originalGroup, startIndex, targetGroup, targetIndex) {
        this.loopDummy.animationMoved(startIndex, targetIndex);
    };

    scope.NextendSmartSliderTimelineAnimationLoop = TimelineAnimationLoop;

})(nextend.smartSlider, n2, window);
