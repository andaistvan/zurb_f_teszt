
(function (smartSlider, $, scope, undefined) {

    function TimelineLayer(layer) {
        layer.timelineLayer = this;
        this.layer = layer;
        this.sidebar = $('<div class="n2-ss-timeline-layer n2-h4"><span>' + layer.property.name + '</span></div>')
            .on({
                mouseenter: $.proxy(function () {
                    this.layer.layerRow.trigger('mouseenter');
                }, this),
                mouseleave: $.proxy(function () {
                    this.layer.layerRow.trigger('mouseleave');
                }, this),
                mousedown: $.proxy(function (e) {
                    if (e.ctrlKey || e.metaKey) {
                        var activeLayer = smartSlider.layerManager.getSelectedLayer();
                        if (activeLayer && activeLayer != this.layer) {
                            this.layer.animation.loadData(activeLayer.animation.getData());
                            return;
                        }
                    }
                    this.layer.activate();
                    this.layer.switchToAnimation();

                }, this)
            });

        this.buttonContainer = $('<div class="n2-ss-timeline-layer-buttons"/>').appendTo(this.sidebar);

        $('<div class="n2-button n2-button-small n2-button-grey"><i class="n2-i n2-it n2-i-delete"></i></div>').on('click', $.proxy(function (e) {
            this.layer.animation.clearAll();
        }, this))
            .appendTo(this.buttonContainer);


        this.content = $('<div class="n2-ss-timeline-content-layers"></div>')
            .on({
                mouseenter: $.proxy(function () {
                    this.layer.layerRow.trigger('mouseenter');
                }, this),
                mouseleave: $.proxy(function () {
                    this.layer.layerRow.trigger('mouseleave');
                }, this),
                click: $.proxy(function (e) {
                    this.layer.activate();
                    this.layer.switchToAnimation();
                }, this)
            });

        this.layer.layer.on({
            'n2-ss-activate': $.proxy(function () {
                this.sidebar.addClass('n2-active');

                var scroll = this.sidebar.parent(),
                    scrollTop = scroll.scrollTop(),
                    top = this.sidebar.get(0).offsetTop;
                if (top < scrollTop || top > scrollTop + scroll.height() - this.sidebar.height()) {
                    scroll.scrollTop(top);
                }
            }, this),
            'n2-ss-deactivate': $.proxy(function () {
                this.sidebar.removeClass('n2-active');
            }, this)
        });

        this.in = $('<div></div>').appendTo(this.content);

        this.loop = $('<div></div>').appendTo(this.content);

        this.out = $('<div></div>').appendTo(this.content);

        layer.$
            .on('layerRenamed', $.proxy(this.renamed, this))
            .on('layerDeleted', $.proxy(this.deleted, this))
            .on('layerIndexed', $.proxy(this.indexed, this))
            .on('layerAnimationAdded', $.proxy(this.animationAdded, this))
            .on('layerAnimationSpecialZeroInChanged', $.proxy(this.specialZeroInChanged, this));

        this.initExtraAnimation();

        layer.layer.triggerHandler('timelineLoadedForLayer');

        this.indexed();

        layer.timelineLayerManager = this;

    };

    TimelineLayer.prototype.initExtraAnimation = function () {
        var layer = this.layer;

        this.extraAnimationBar = null;

        layer.layer.on('layerExtraAnimationAdded', $.proxy(function (e, delay, name, changeCallback, editCallback) {
            if (this.extraAnimationBar) {
                this.extraAnimationBar.css('left', smartSlider.durationToOffsetX(delay));
            } else {
                this.extraAnimationBar = $('<div class="n2-ss-layer-extra-animation n2-ss-layer-extra-animation-' + name + '"><span class="n2-ss-animation-duration n2-h5">' + name + '</span></div>')
                    .css('left', smartSlider.durationToOffsetX(delay))
                    .appendTo(this.content)
                    .draggable({
                        scroll: true,
                        axis: "x",
                        drag: function (event, ui) {
                            ui.position.left = Math.max(0, smartSlider.normalizeOffsetX(ui.position.left))
                        },
                        stop: function (event, ui) {
                            layer.activate();
                            changeCallback(smartSlider.offsetXToDuration(ui.position.left));
                        }
                    })
                    .on('click', function () {
                        layer.activate();
                        editCallback();
                    });
            }
        }, this))
            .on('layerExtraAnimationRemoved', $.proxy(function () {
                if (this.extraAnimationBar) {
                    this.extraAnimationBar.remove();
                    this.extraAnimationBar = null;
                }
            }, this));
    };

    TimelineLayer.prototype.renamed = function (e, newName) {
        this.sidebar.find('> span').html(newName);
    };

    TimelineLayer.prototype.indexed = function () {
        smartSlider.timelineManager.appendRow(this.sidebar, this.content);
    };

    TimelineLayer.prototype.deleted = function () {
        this.sidebar.remove();
        this.content.remove();
        this.layer.$
            .off('layerRenamed layerDeleted layerIndexed layerAnimationAdded layerAnimationSpecialZeroInChanged');
    };

    TimelineLayer.prototype.animationAdded = function (e, direction, animation) {
        var layerAnimation;
        if (direction == 'loop') {
            if (!this.loopDummy) {
                this.loopDummy = new NextendSmartSliderTimelineAnimationLoopDummy(this, '', 'loop', this.layer.animation.data);
            }
            layerAnimation = this.loopDummy;
            this.loopDummy.add(new NextendSmartSliderTimelineAnimationLoop(this, animation, this.loopDummy));

        } else {
            layerAnimation = new NextendSmartSliderTimelineAnimation(this, animation, direction, this.layer.animation.data)
        }
        this[direction].append(layerAnimation.getBar());

        if (direction == 'in') {
            this.specialZeroInChanged();
        }

        this.fixTimelineTotalDuration();

        this.buttonContainer.css('display', 'block');
    };

    TimelineLayer.prototype.animationDeleted = function (direction) {
        if (!this.layer.animation.inRows.length && !this.layer.animation.loopRows.length && !this.layer.animation.outRows.length) {
            this.buttonContainer.css('display', 'none');
        }
    };

    TimelineLayer.prototype.fixTimelineTotalDuration = function () {
        smartSlider.timelineManager.refreshDuration();

    };

    TimelineLayer.prototype.getTotalDuration = function () {
        var lastBar = this.content.find('.n2-ss-layer-animation:visible:last');
        if (lastBar.length == 0) return 0;
        var left = parseInt(lastBar.position().left) + parseInt(lastBar.css('marginLeft')) - 20;
        return smartSlider.offsetXToDuration(left + lastBar.outerWidth());
    };

    TimelineLayer.prototype.specialZeroInChanged = function () {
        if (this.isLayerSpecialZeroIn()) {
            this['in'].find('.n2-ss-layer-animation-in').css('display', '')
                .last().css('display', 'none');
        } else {
            this['in'].find('.n2-ss-layer-animation-in').css('display', '');
            this.fixTimelineTotalDuration();
        }
    };

    TimelineLayer.prototype.isLayerSpecialZeroIn = function () {
        return this.layer.animation.data.specialZeroIn;
    };

    scope.NextendSmartSliderTimelineLayer = TimelineLayer;

})(nextend.smartSlider, n2, window);
