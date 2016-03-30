
(function (smartSlider, $, scope, undefined) {

    function AdminTimelineManager(layerEditor) {

        this.layerEditor = layerEditor;
        this.element = $('#n2-ss-timeline-table');

        this.element.on({
            enterPreviewMode: $.proxy(this.onEnterPreview, this),
            exitPreviewMode: $.proxy(this.onExitPreview, this)
        });

        this.scrollable = this.element.find('.n2-ss-timeline-content-scrollable');

        this.contentContainer = $('<div class="n2-ss-timeline-content-layers-container"></div>')
            .appendTo(this.scrollable);

        this.initTimeFrame();

        this.initCurrentTimeIndicator();

        this.makeScrollable();

        this.sidebar = this.element.find('.n2-ss-timeline-sidebar-layers');

        smartSlider.timelineManager = this;

        this.layerEditor.$.on('layerCreated', $.proxy(this.layerCreated, this));

        this.control = new AdminTimelineControl(this);

        this.initHeight();

        this.addContextMenu();
    };

    AdminTimelineManager.prototype.initHeight = function () {

        var lastHeight = $.jStorage.get('smartsliderTimelineHeight', 200),
            pane1 = $('.n2-ss-timeline-sidebar-layers'),
            pane2 = $('.n2-ss-timeline-content-layers-container')
                .height(lastHeight);

        pane1.on('scroll', function () {
            pane2.scrollTop(pane1.scrollTop());
        });

        $('.n2-ss-timeline-sidebar-layers-container')
            .height(lastHeight)
            .resizable({
                minHeight: 200,
                alsoResize: pane2,
                handles: 's',
                create: function (ui) {
                    $(ui.target).find('.ui-resizable-s').append('<i class="n2-i n2-it n2-i-drag"></i>');
                },
                stop: function (event, ui) {
                    $.jStorage.set('smartsliderTimelineHeight', ui.size.height);
                }
            });
    }

    AdminTimelineManager.prototype.initTimeFrame = function () {

        this.timeMarker = this.element.find('.n2-ss-timeline-content-timeframe')
            .on('mousedown', $.proxy(function (e) {

                var duration = smartSlider.offsetXToDuration((e.pageX - $(e.currentTarget).offset().left - 20));
                if (!this.disablePreviewModeWidthCTI(duration)) {
                    this.setCTI(duration);
                }
                this.slideCTI.trigger(e);
                $(document).one('mouseup', $.proxy(function (e) {
                    this.control.unHold();
                    this.slideCTI.trigger(e);
                }, this))
            }, this));

        this._extendTimeFrame(0);
    };

    AdminTimelineManager.prototype.refreshDuration = NextendDeBounce(function () {
        this._extendTimeFrame(this.getMinimumSlideDuration());
    }, 200);

    AdminTimelineManager.prototype._extendTimeFrame = function (duration) {
        duration = Math.floor(duration) + 1;
        var timeMarkers = this.timeMarker.find('.n2-time-marker'),
            i = timeMarkers.length;

        if (duration < 10) {
            duration = 10;
        }

        if (i > duration) {
            timeMarkers.slice(duration).remove();
            i = duration;
        }

        for (; i <= duration; i++) {
            $('<div class="n2-time-marker n2-h5">' + i + 's' + '</div>')
                .appendTo(this.timeMarker);
        }

        this.scrollable.css('width', i * smartSlider.oneSecWidth + 20);

        $(window).trigger('resize');
    };

    AdminTimelineManager.prototype.getMinimumSlideDuration = function () {
        var layers = this.layerEditor.layerList,
            maxDuration = 0;

        for (var i = 0; i < layers.length; i++) {
            maxDuration = Math.max(maxDuration, layers[i].timelineLayerManager.getTotalDuration());
        }
        return maxDuration;
    };

    AdminTimelineManager.prototype.initCurrentTimeIndicator = function () {
        this.slideCTI = $('<div class="n2-ss-timeline-cti"></div>')
            .append('<div class="n2-ss-timeline-cti-dot"></div>')
            .appendTo(this.scrollable)
            .draggable({
                axis: 'x',
                cursor: "ew-resize",
                start: $.proxy(function (event, ui) {
                    this.control.enterPreviewMode();
                    this.control.pause();
                    this.slideDurationPx = this.control.timeline.totalDuration() * smartSlider.oneSecWidth;
                }, this),
                drag: $.proxy(function (event, ui) {
                    ui.position.left = Math.max(ui.position.left, -0.05 * smartSlider.oneSecWidth);
                    ui.position.left = Math.min(ui.position.left, this.slideDurationPx);
                    this.setCTI(smartSlider.offsetXToDuration(ui.position.left));
                }, this),
                stop: $.proxy(function (event, ui) {
                    this.control.unHold();
                    this.disablePreviewModeWidthCTI(smartSlider.offsetXToDuration(ui.position.left));
                    delete this.slideDurationPx;
                }, this)
            });
    };

    AdminTimelineManager.prototype.disablePreviewModeWidthCTI = function (duration) {
        if (duration == null || duration < 0) {
            return this.control.exitPreviewMode();
        }
        return false;
    };

    AdminTimelineManager.prototype.setCTI = function (duration) {
        this.control.setPosition(Math.max(0, duration));
        this.control.hold();
    };

    AdminTimelineManager.prototype.onEnterPreview = function () {
    };

    AdminTimelineManager.prototype.onExitPreview = function () {
        this.slideCTI.css(nextend.rtl.left, -10);
    };

    AdminTimelineManager.prototype.makeScrollable = function () {
        var el = $(".n2-ss-timeline-content");
        this.tinyscrollbar = el
            .tinyscrollbar({
                axis: "x",
                wheel: false,
                wheelLock: false
            })
            .data('plugin_tinyscrollbar');
        if (typeof el.get(0).move === 'function') {
            el.get(0).move = null;
        }
    };

    AdminTimelineManager.prototype.layerCreated = function (e, layer) {
        new NextendSmartSliderTimelineLayer(layer);
    };

    AdminTimelineManager.prototype.appendRow = function (sidebar, content) {
        this.sidebar.append(sidebar);
        this.contentContainer.append(content);
    };

    AdminTimelineManager.prototype.addContextMenu = function () {
        var that = this;


        $.contextMenu({
            selector: '.n2-ss-timeline-layer',
            build: function ($triggerElement, e) {

                var items = {},
                    activeLayer = that.layerEditor.getSelectedLayer();

                if (!activeLayer) {
                    return false;
                }

                var timelineLayer = activeLayer.timelineLayer;
                items['Animations'] = {html: '<span>Animations</span>', type: 'html'};
                items['sep0'] = "---------";

                items['copy'] = {name: "Copy", icon: "copy"};


                var copied = $.jStorage.get('layerAnimationCopied');

                if (copied !== null) {
                    items['paste'] = {
                        name: "Paste",
                        icon: "paste",
                        callback: function () {
                            activeLayer.animation.loadData(JSON.parse(copied));
                        }
                    }
                }
                items['sep1'] = "---------";

                if (timelineLayer['in'].find('.n2-ss-layer-animation').length == 0) {
                    items['inAdd'] = {
                        name: "Add IN animation",
                        icon: "in",
                        callback: function () {
                            activeLayer.animation.edit('in', 0);
                        }
                    }
                } else {
                    items['inDelete'] = {
                        name: "Remove IN animations",
                        icon: "delete",
                        callback: function () {
                            activeLayer.animation.clear('in');
                        }
                    }
                }

                if (timelineLayer['loop'].find('.n2-ss-layer-animation').length == 0) {
                    items['loopAdd'] = {
                        name: "Add LOOP animation",
                        icon: "loop",
                        callback: function () {
                            activeLayer.animation.edit('loop', 0);
                        }
                    }
                } else {
                    items['loopDelete'] = {
                        name: "Remove LOOP animations",
                        icon: "delete",
                        callback: function () {
                            activeLayer.animation.clear('loop');
                        }
                    }
                }
                if (timelineLayer['out'].find('.n2-ss-layer-animation').length == 0) {
                    items['outAdd'] = {
                        name: "Add OUT animation",
                        icon: "out",
                        callback: function () {
                            activeLayer.animation.edit('out', 0);
                        }
                    }
                } else {
                    items['outDelete'] = {
                        name: "Remove OUT animations",
                        icon: "delete",
                        callback: function () {
                            activeLayer.animation.clear('out');
                        }
                    }
                }

                return {
                    animation: {duration: 0, show: 'show', hide: 'hide'},
                    zIndex: 1000000,
                    callback: function (key, options) {
                        $.jStorage.set('layerAnimationCopied', JSON.stringify(activeLayer.animation.getData()));
                    },
                    items: items
                };
            }
        });
        return;

        $.contextMenu({
            selector: '.n2-ss-timeline-layer',
            build: function ($triggerElement, e) {

                var items = {},
                    activeLayer = that.layerEditor.getSelectedLayer();

                if (!activeLayer) {
                    return false;
                }

                //timelineLayer
                items['delete'] = {name: "Delete animation", icon: "delete"};
                items['duplicate'] = {name: "Duplicate layer", icon: "duplicate"};
                items['copy'] = {name: "Copy layer", icon: "copy"};


                var copied = that.getCopied();
                if (copied.length == 1) {
                    items['paste'] = {
                        name: "Paste layer",
                        icon: "paste",
                        callback: $.proxy(that.paste, this, 0, copied)
                    }
                } else if (copied.length > 1) {
                    var pasteItems = {};
                    for (var i = 0; i < copied.length; i++) {
                        pasteItems['paste' + i] = {
                            name: copied[i].name,
                            callback: $.proxy(that.paste, this, i, copied)
                        }
                    }
                    items['paste'] = {
                        name: "Paste layer",
                        icon: "paste",
                        items: pasteItems
                    }
                }

                if ($.isEmptyObject(items)) {
                    return false;
                }

                return {
                    animation: {duration: 0, show: 'show', hide: 'hide'},
                    zIndex: 1000000,
                    callback: function (key, options) {
                        that[key]();
                    },
                    items: items
                };
            }
        });
    };

    scope.NextendSmartSliderAdminTimelineManager = AdminTimelineManager;

    /**
     * DISABLED <-> PAUSED <-> HOLD_PAUSED
     * DISABLED <-> PLAYING <-> HOLD_PLAYING
     * PAUSED <-> PLAYING
     */
    var TimelineStatus = {
        DISABLED: 0,
        PAUSED: 1,
        HOLD_PAUSED: 2,
        PLAYING: 3,
        HOLD_PLAYING: 4
    };

    function AdminTimelineControl(timelineManager) {
        this.status = 0;
        smartSlider.timelineControl = this;
        this.timelineManager = timelineManager;

        this.frontendSlideLayers = timelineManager.layerEditor.frontendSlideLayers;

        var $controls = $('.n2-ss-timeline-control');

        $controls.find('.n2-stop')
            .on('click', $.proxy(this.onStopButton, this));

        this.$playButton = $controls.find('.n2-play')
            .on('click', $.proxy(this.onPlayButton, this));

        $(window).on('keydown', $.proxy(function (e) {
            if (e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
                if (e.keyCode == 0 || e.keyCode == 32) {
                    this.onPlayButton(e);
                } else if (e.keyCode == 27) {
                    this.onStopButton(e);
                }
            }
        }, this));

        $('.n2-ss-timeline-content-layers-container, .n2-ss-timeline-duration-marker')
            .on('mousedown', $.proxy(this.exitPreviewMode, this, false));

        $('.n2-ss-timeline-sidebar-top').on('click', $.proxy(this.exitPreviewMode, this, false));
    };

    AdminTimelineControl.prototype.isActivated = function () {
        if (this.status == TimelineStatus.DISABLED) {
            return false;
        }
        return true;
    };

    AdminTimelineControl.prototype.onStopButton = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.status != TimelineStatus.DISABLED) {
            this.exitPreviewMode();
        }
    };

    AdminTimelineControl.prototype.onPlayButton = function (e) {
        e.preventDefault();
        e.stopPropagation();
        switch (this.status) {
            case TimelineStatus.DISABLED:
                this.enterPreviewMode();
            case TimelineStatus.PAUSED:
                this.play();
                break;
            case TimelineStatus.PLAYING:
                this.pause();
                break;
        }
    };
    AdminTimelineControl.prototype.enterPreviewMode = function () {
        if (this.status == TimelineStatus.DISABLED) {

            $('body').on('mousedown.n2-ss-preview', $.proxy(function (e) {
                if (!$.contains(document.getElementById('n2-ss-timeline'), e.target)) {
                    this.exitPreviewMode();
                }
            }, this));

            smartSlider.$currentSlideElement.find('.n2-ss-layer')
                .nextenddraggable("option", "disabled", true);

            $('body').addClass('n2-ss-preview-mode');


            this.frontendSlideLayers.findLayers();

            this.frontendSlideLayers.refresh();

            this.timeline = this.frontendSlideLayers.getTimeline('layerAnimationPlayIn');
            this.timeline.eventCallback('onComplete', $.proxy(function () {
                if (this.timeline.totalDuration() > 0) {
                    this.timeline.restart();
                }
            }, this));

            // Animate the current time indicator
            var totalDuration = this.timeline.totalDuration();
            var fromObj = {};
            fromObj[nextend.rtl.left] = 0;
            var toObj = {
                ease: 'linear'
            };
            toObj[nextend.rtl.left] = smartSlider.durationToOffsetX(totalDuration);
            this.timeline.fromTo(this.timelineManager.slideCTI, totalDuration, fromObj, toObj, 0);

            this.timeline.pause(0);

            this.$playButton.addClass('n2-button-blue');

            this.timelineManager.element.triggerHandler('enterPreviewMode');

            this.status = TimelineStatus.PAUSED;
        }
    };

    AdminTimelineControl.prototype.exitPreviewMode = function (e) {
        if (this.status != TimelineStatus.DISABLED) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            $('body').off('.n2-ss-preview');

            if (this.status == TimelineStatus.PLAYING) {
                this.pause();
            }

            this.timeline.clear();
            this.frontendSlideLayers.setZero();

            smartSlider.$currentSlideElement.find('.n2-ss-layer')
                .nextenddraggable("option", "disabled", false);
            $('body').removeClass('n2-ss-preview-mode');

            this.$playButton.removeClass('n2-button-blue');

            this.timelineManager.element.triggerHandler('exitPreviewMode');

            this.status = TimelineStatus.DISABLED;
            return true;
        }
        return false;
    };

    AdminTimelineControl.prototype.play = function () {
        if (this.status == TimelineStatus.PAUSED) {
            this.status = TimelineStatus.PLAYING;
            this.$playButton.addClass('n2-active');
            this.timeline.play();
            return true;
        }
        return false;
    };

    AdminTimelineControl.prototype.pause = function () {
        if (this.status == TimelineStatus.PLAYING) {
            this.status = TimelineStatus.PAUSED;
            this.$playButton.removeClass('n2-active');
            this.timeline.pause();
            return true;
        }
        return false;
    };

    AdminTimelineControl.prototype.hold = function () {
        if (this.status == TimelineStatus.PAUSED) {
            this.status = TimelineStatus.HOLD_PAUSED;
        } else if (this.status == TimelineStatus.PLAYING) {
            this.status = TimelineStatus.HOLD_PLAYING;
            this.timeline.pause();
        }
    };

    AdminTimelineControl.prototype.unHold = function () {
        if (this.status == TimelineStatus.HOLD_PAUSED) {
            this.status = TimelineStatus.PAUSED;
        } else if (this.status == TimelineStatus.HOLD_PLAYING) {
            this.status = TimelineStatus.PLAYING;
            this.timeline.play();
        }
    };

    AdminTimelineControl.prototype.setPosition = function (position) {
        this.enterPreviewMode();
        this.timeline.seek(position);
    };

    scope.NextendSmartSliderAdminTimelineControl = AdminTimelineControl;

})
(nextend.smartSlider, n2, window);
