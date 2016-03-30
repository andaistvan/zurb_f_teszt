(function ($, scope, undefined) {

    /**
     * NOT_INITIALIZED -> INITIALIZED -> READY_TO_START -> PLAYING -> ENDED
     *                          <-----------------------------/
     */
    var SlideStatus = {
            NOT_INITIALIZED: -1,
            INITIALIZED: 0,
            READY_TO_START: 1,
            PLAYING: 2,
            ENDED: 3
        },
        TimelineMode = {
            event: 0,
            linear: 1
        },
        LayerStatus = {
            NOT_INITIALIZED: -1,
            INITIALIZED: 1,
            PLAY_IN_DISABLED: 2,
            PLAY_IN_STARTED: 3,
            PLAY_IN_PAUSED: 4,
            PLAY_IN_ENDED: 5,
            PLAY_LOOP_STARTED: 6,
            PLAY_LOOP_PAUSED: 7,
            PLAY_LOOP_ENDED: 8,
            PLAY_OUT_STARTED: 9,
            PLAY_OUT_PAUSED: 10,
            PLAY_OUT_ENDED: 11
        },
        In = {
            NOT_INITIALIZED: -1,
            NO: 0,
            INITIALIZED: 1
        },
        Loop = {
            NOT_INITIALIZED: -1,
            NO: 0,
            INITIALIZED: 1
        },
        Out = {
            NOT_INITIALIZED: -1,
            NO: 0,
            INITIALIZED: 1
        },
        zero = {
            opacity: 1,
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            skewX: 0
        },
        responsiveProperties = ['left', 'top', 'width', 'height'];


    if (/(MSIE\ [0-7]\.\d+)/.test(navigator.userAgent)) {
        function getPos($element) {
            return $element.position();
        }
    } else {
        function getPos($element) {
            return {
                left: $element.prop('offsetLeft'),
                top: $element.prop('offsetTop')
            }
        }
    }

    function Slide(slider, $slideElement, isFirstSlide, isStaticSlide) {
        if (typeof isStaticSlide === 'undefined') {
            isStaticSlide = false;
        }
        this.isStaticSlide = isStaticSlide;
        this.status = SlideStatus.NOT_INITIALIZED;
        this.slider = slider;
        this.slider.isFirstSlide = true;

        this.$slideElement = $slideElement;

        $slideElement.data('slide', this);

        if (!slider.parameters.admin) {
            this.minimumSlideDuration = $slideElement.data('slide-duration');
            if (!$.isNumeric(this.minimumSlideDuration)) {
                this.minimumSlideDuration = 0;
            }
        } else {
            this.minimumSlideDuration = 0;
        }

        this.findLayers();

        if (!this.slider.parameters.admin || !$slideElement.is(this.slider.adminGetCurrentSlideElement())) {
            this.initResponsiveMode();
        }

        this.status = SlideStatus.INITIALIZED;

        this.playOnce = (!this.slider.isAdmin && this.slider.parameters.layerMode.playOnce);
        slider.sliderElement.one('SliderResize', $.proxy(function () {
            this.refresh();
            if (!this.slider.isAdmin) {
                slider.sliderElement.on('SliderResize', $.proxy(this.resize, this));
            }

            this.$slideElement.one('mainAnimationStartIn', $.proxy(function () {
                this.isFirstSlide = false;
            }, this.slider));

            if (!isStaticSlide) {
                this.$slideElement
                    .on('mainAnimationStartIn', $.proxy(this.setStart, this))
                    .on('mainAnimationStartInCancel', $.proxy(this.reset, this));
            }

            if (isFirstSlide && !this.slider.isAdmin) {
                //mainAnimationStartIn event not triggered in play on load, so we need to reset the layers manually
                this.slider.visible($.proxy(function () {
                    if (this.slider.parameters.layerMode.playFirstLayer) {
                        n2c.log('Play first slide');
                        this.setStart();
                        this.playIn();
                    } else {

                        this.setZeroAll();
                        this.status = SlideStatus.INITIALIZED;
                    }
                }, this));
            }
        }, this));

        var $deviceIMGs = this.$slideElement.find('[data-device="1"]');
        slider.sliderElement.on('SliderDeviceOrientation', $.proxy(function (e, modes) {
            for (var i = 0; i < $deviceIMGs.length; i++) {
                var $el = $deviceIMGs.eq(i);
                $el.attr('src', $el.data(modes.device));
            }
        }, this));
    
    };

    Slide.prototype.isActive = function () {
        return this.$slideElement.hasClass('n2-ss-slide-active');
    };

    Slide.prototype.findLayers = function () {
        this.$layers = this.$slideElement.find('.n2-ss-layer')
            .each($.proxy(function (i, el) {
                var $el = $(el);
                for (var j = 0; j < responsiveProperties.length; j++) {
                    var property = responsiveProperties[j];
                    $el.data('desktop' + property, parseFloat(el.style[property]));
                }
                var parent = this.getLayerProperty($el, 'parentid');
                if (typeof parent !== 'undefined' && parent) {
                    parent = $('#' + parent);
                    if (parent.length > 0) {
                        $el.data('parent', parent);
                    }
                } else {
                    $el.data('parent', false);
                }
            }, this));
        this.$parallax = this.$layers.filter('[data-parallax]');
    };

    Slide.prototype.getLayerResponsiveProperty = function (layer, mode, property) {
        var value = layer.data(mode + property);
        if (typeof value != 'undefined') {
            return value;
        }
        if (mode != 'desktopportrait') {
            return layer.data('desktopportrait' + property);
        }
        return 0;
    };

    Slide.prototype.getLayerProperty = function (layer, property) {
        return layer.data(property);
    };

    Slide.prototype.initResponsiveMode = function () {
        this.slider.sliderElement.on('SliderDeviceOrientation', $.proxy(function (e, modes) {
            var mode = modes.device + modes.orientation.toLowerCase();
            this.currentMode = mode;
            this.$layers.each($.proxy(function (i, el) {
                var layer = $(el),
                    show = layer.data(mode),
                    parent = layer.data('parent');
                if ((typeof show == 'undefined' || parseInt(show))) {
                    if (this.getLayerProperty(layer, 'adaptivefont')) {
                        layer.css('font-size', (16 * this.getLayerResponsiveProperty(layer, this.currentMode, 'fontsize') / 100) + 'px');
                    } else {
                        layer.css('font-size', this.getLayerResponsiveProperty(layer, this.currentMode, 'fontsize') + '%');
                    }
                    layer.data('shows', 1);
                    layer.css('display', 'block');
                } else {
                    layer.data('shows', 0);
                    layer.css('display', 'none');
                }
            }, this));
        }, this))
            .on('SliderResize', $.proxy(function (e, ratios, responsive) {

                var dimensions = responsive.responsiveDimensions;

                this.$layers.each($.proxy(function (i, el) {
                    this.repositionLayer($(el), ratios, dimensions);
                }, this));
            }, this));
    };
    Slide.prototype.resize = function (e, ratios, responsive, timeline) {
        if (typeof timeline !== 'undefined') return;
        if (this.slider.slides.index(this.$slideElement) == this.slider.currentSlideIndex) {
            this.layers.refresh(ratios);
            this.status = SlideStatus.INITIALIZED;
            if (this.slider.parameters.layerMode.playFirstLayer || !this.slider.isFirstSlide) {
                this.setStart();
                this.playIn();
            } else {
                this.setZeroAll();
                this.status = SlideStatus.INITIALIZED;
            }
        }
    };

    /**
     * Recreates the timeline for the current slide. Mostly used on the backend when the user hits the play button.
     */
    Slide.prototype.refresh = function () {
        var mode = TimelineMode.event;
        if (this.slider.parameters.admin) {
            mode = TimelineMode.linear;
        }
        this.layers = new SlideLayers(this, this.$layers, mode, this.slider.responsive.lastRatios);
    };


    Slide.prototype.isDimensionPropertyAccepted = function (value) {
        if ((value + '').match(/[0-9]+%/) || value == 'auto') {
            return true;
        }
        return false;
    };

    Slide.prototype.repositionLayer = function (layer, ratios, dimensions) {
        var ratioPositionH = ratios.slideW,
            ratioSizeH = ratioPositionH,
            ratioPositionV = ratios.slideH,
            ratioSizeV = ratioPositionV;

        if (!parseInt(this.getLayerProperty(layer, 'responsivesize'))) {
            ratioSizeH = ratioSizeV = 1;
        }

        var width = this.getLayerResponsiveProperty(layer, this.currentMode, 'width');
        layer.css('width', this.isDimensionPropertyAccepted(width) ? width : (width * ratioSizeH) + 'px');
        var height = this.getLayerResponsiveProperty(layer, this.currentMode, 'height');
        layer.css('height', this.isDimensionPropertyAccepted(height) ? height : (height * ratioSizeV) + 'px');

        if (!parseInt(this.getLayerProperty(layer, 'responsiveposition'))) {
            ratioPositionH = ratioPositionV = 1;
        }


        var left = this.getLayerResponsiveProperty(layer, this.currentMode, 'left') * ratioPositionH,
            top = this.getLayerResponsiveProperty(layer, this.currentMode, 'top') * ratioPositionV,
            align = this.getLayerResponsiveProperty(layer, this.currentMode, 'align'),
            valign = this.getLayerResponsiveProperty(layer, this.currentMode, 'valign');


        var positionCSS = {
                left: 'auto',
                top: 'auto',
                right: 'auto',
                bottom: 'auto'
            },
            parent = this.getLayerProperty(layer, 'parent');

        if (parent && parent.data('shows')) {
            var position = getPos(parent),
                p = {left: 0, top: 0};

            switch (this.getLayerResponsiveProperty(layer, this.currentMode, 'parentalign')) {
                case 'right':
                    p.left = position.left + parent.width();
                    break;
                case 'center':
                    p.left = position.left + parent.width() / 2;
                    break;
                default:
                    p.left = position.left;
            }

            switch (align) {
                case 'right':
                    positionCSS.right = (layer.parent().width() - p.left - left) + 'px';
                    break;
                case 'center':
                    positionCSS.left = (p.left + left - layer.width() / 2) + 'px';
                    break;
                default:
                    positionCSS.left = (p.left + left) + 'px';
                    break;
            }


            switch (this.getLayerResponsiveProperty(layer, this.currentMode, 'parentvalign')) {
                case 'bottom':
                    p.top = position.top + parent.height();
                    break;
                case 'middle':
                    p.top = position.top + parent.height() / 2;
                    break;
                default:
                    p.top = position.top;
            }

            switch (valign) {
                case 'bottom':
                    positionCSS.bottom = (layer.parent().height() - p.top - top) + 'px';
                    break;
                case 'middle':
                    positionCSS.top = (p.top + top - layer.height() / 2) + 'px';
                    break;
                default:
                    positionCSS.top = (p.top + top) + 'px';
                    break;
            }


        } else {
            switch (align) {
                case 'right':
                    positionCSS.right = -left + 'px';
                    break;
                case 'center':
                    positionCSS.left = ((this.isStaticSlide ? layer.parent().width() : dimensions.slide.width) / 2 + left - layer.width() / 2) + 'px';
                    break;
                default:
                    positionCSS.left = left + 'px';
                    break;
            }

            switch (valign) {
                case 'bottom':
                    positionCSS.bottom = -top + 'px';
                    break;
                case 'middle':
                    positionCSS.top = ((this.isStaticSlide ? layer.parent().height() : dimensions.slide.height) / 2 + top - layer.height() / 2) + 'px';
                    break;
                default:
                    positionCSS.top = top + 'px';
                    break;
            }
        }
        layer.css(positionCSS);
    };

    Slide.prototype.setZero = function () {
        this.$slideElement.trigger('layerSetZero', this);
    };

    Slide.prototype.setZeroAll = function () {
        this.$slideElement.trigger('layerSetZeroAll', this);
    };

    Slide.prototype.setStart = function () {
        if (this.status == SlideStatus.INITIALIZED) {
            this.$slideElement.trigger('layerAnimationSetStart');
            this.status = SlideStatus.READY_TO_START;
        }
    };

    Slide.prototype.playIn = function () {
        if (this.status == SlideStatus.READY_TO_START) {
            this.status = SlideStatus.PLAYING;
            this.$slideElement.trigger('layerAnimationPlayIn');
        }
    };

    Slide.prototype.playOut = function () {
        if (this.status == SlideStatus.PLAYING) {
            var deferreds = [];
            this.$slideElement.triggerHandler('beforeMainSwitch', [deferreds]);

            $.when.apply($, deferreds)
                .done($.proxy(function () {
                    this.onOutAnimationsPlayed();
                }, this));
        } else {
            this.onOutAnimationsPlayed();
        }
    };

    Slide.prototype.onOutAnimationsPlayed = function () {
        if (!this.playOnce) {
            this.status = SlideStatus.INITIALIZED;
        } else {
            this.status = SlideStatus.ENDED;
        }
        this.$slideElement.trigger('layerAnimationCompleteOut');
    };

    Slide.prototype.pause = function () {
        this.$slideElement.triggerHandler('layerPause');
    };

    Slide.prototype.reset = function () {
        this.$slideElement.triggerHandler('layerReset');
        this.status = SlideStatus.INITIALIZED;
    };

    Slide.prototype.getTimeline = function () {
        return this.layers.getTimeline();
    };

    scope.NextendSmartSliderSlide = Slide;

    function SlideLayers(slide, $layers, mode, ratios) {
        this.layerAnimations = [];
        this.slide = slide;
        slide.$slideElement.off(".n2-ss-animations");
        for (var i = 0; i < $layers.length; i++) {
            var $layer = $layers.eq(i);
            this.layerAnimations.push(new SlideLayerAnimations(slide, this, $layer, $layer.find('.n2-ss-layer-mask, .n2-ss-layer-parallax').addBack().last(), mode, ratios));
        }
    };

    SlideLayers.prototype.refresh = function (ratios) {
        for (var i = 0; i < this.layerAnimations.length; i++) {
            this.layerAnimations[i].refresh(ratios);
        }
    };

    SlideLayers.prototype.getTimeline = function () {
        var timeline = new NextendTimeline({
            paused: 1
        });
        for (var i = 0; i < this.layerAnimations.length; i++) {
            var animation = this.layerAnimations[i];
            timeline.add(animation.linearTimeline, 0);
            animation.linearTimeline.paused(false);

        }
        return timeline;
    };
    scope.NextendSmartSliderSlideLayers = SlideLayers;
    function SlideLayerAnimations(slide, layers, $layer, $animatableElement, timelineMode, ratios) {
        this.status = LayerStatus.NOT_INITIALIZED;
        this.inStatus = In.NOT_INITIALIZED;
        this.loopStatus = Loop.NOT_INITIALIZED;
        this.outStatus = Out.NOT_INITIALIZED;
        this.currentZero = zero;
        this.repeatable = 0;
        this.transformOriginIn = '50% 50% 0';
        this.transformOriginOut = '50% 50% 0';
        this.startDelay = 0;

        this.skipLoop = 0;

        this.slide = slide;
        this.layers = layers;
        this.$layer = $layer;
        this.$animatableElement = $animatableElement;
        this.timelineMode = timelineMode;

        $layer.data('LayerAnimation', this);

        var animations,
            adminAnimations = $layer.data('adminLayerAnimations');
        if (adminAnimations) {
            animations = adminAnimations.getData();
        } else {
            var rawAnimations = $layer.data('animations');
            if (rawAnimations) {
                animations = $.parseJSON(Base64.decode(rawAnimations));
            }
        }
        if (animations) {
            this.animations = $.extend({
                repeatable: 0,
                in: [],
                specialZeroIn: 0,
                transformOriginIn: '50|*|50|*|0',
                inPlayEvent: '',
                loop: [],
                repeatCount: 0,
                repeatStartDelay: 0,
                transformOriginLoop: '50|*|50|*|0',
                loopPlayEvent: '',
                loopPauseEvent: '',
                loopStopEvent: '',
                out: [],
                transformOriginOut: '50|*|50|*|0',
                outPlayEvent: '',
                instantOut: 1
            }, animations);

            this.repeatable = this.animations.repeatable ? 1 : 0;


            this.transformOriginIn = this.animations.transformOriginIn.split('|*|').join('% ') + 'px';
            this.transformOriginOut = this.animations.transformOriginOut.split('|*|').join('% ') + 'px';
            slide.$slideElement.on({
                "layerSetZero.n2-ss-animations": $.proxy(this.setZero, this),
                "layerSetZeroAll.n2-ss-animations": $.proxy(this.setZeroAll, this),
                "layerAnimationSetStart.n2-ss-animations": $.proxy(this.start, this),
                "layerPause.n2-ss-animations": $.proxy(this.pause, this),
                "layerReset.n2-ss-animations": $.proxy(this.reset, this),
                "beforeMainSwitch.n2-ss-animations": $.proxy(this.beforeMainSwitch, this)
            });

            if (this.repeatable) {
                if (this.animations.inPlayEvent == '') {
                    this.animations.inPlayEvent = 'layerAnimationPlayIn,OutComplete';
                    if (this.animations.loopPlayEvent == '') {
                        this.animations.loopPlayEvent = 'InComplete';
                    }
                    if (this.animations.outPlayEvent == '') {
                        this.animations.outPlayEvent = 'LoopComplete';
                    }
                }
            }

            if (this.animations.instantOut) {
                this.animations.outPlayEvent = 'LoopComplete';
            }

            if (this.animations.inPlayEvent == '') {
                this.animations.inPlayEvent = 'layerAnimationPlayIn';
            }

            if (this.animations.loopPlayEvent == '') {
                this.animations.loopPlayEvent = 'InComplete';
            }

            if (this.timelineMode == TimelineMode.event) {
                this.eventDrivenMode(ratios);
            } else {
                this.linearMode(ratios);
            }
        }
        this.status = LayerStatus.INITIALIZED;
    };

    SlideLayerAnimations.prototype.eventDrivenMode = function (ratios) {
        this.subscribeEvent('mainAnimationStartIn', $.proxy(this.resume, this));

        this.inTimeline = new NextendTimeline({
            paused: 1,
            onComplete: $.proxy(this.inComplete, this)
        });

        if (this.animations.in && this.animations.in.length) {
            this.buildTimelineIn(this.inTimeline, this.animations.in, ratios, 0);
        }
        this.$layer.triggerHandler('layerExtendTimelineIn', [this.inTimeline, 0]);

        if (this.inTimeline.totalDuration()) {
            this.subscribeEvent(this.animations.inPlayEvent, $.proxy(this.playIn, this));
            this.inStatus = In.INITIALIZED;
        } else {
            this.subscribeEvent(this.animations.inPlayEvent, $.proxy(this.playIn, this));
            this.inStatus = In.NO;
            this.inTimeline = null;
        }


        if (!this.animations.loop || this.animations.loop.length == 0) {
            this.loopStatus = Loop.NO;
            this.subscribeEvent('InComplete', $.proxy(this.loopComplete, this));
        } else {
            this.loop = new SlideLayerAnimationLoop(this, this.$layer, this.$animatableElement, this.animations, ratios, this.timelineMode);
            this.subscribeEvent(this.animations.loopPlayEvent, $.proxy(this.playLoop, this));
            this.loopStatus = Loop.INITIALIZED;
        }

        this.outTimeline = new NextendTimeline({
            paused: 1,
            onComplete: $.proxy(this.outComplete, this)
        });

        if (this.animations.out && this.animations.out.length) {
            this.buildTimelineOut(this.outTimeline, this.animations.out, ratios, 0);
        }
        this.$layer.triggerHandler('layerExtendTimelineOut', [this.outTimeline, 0]);

        if (this.outTimeline.totalDuration()) {
            this.subscribeEvent(this.animations.outPlayEvent, $.proxy(this.playOut, this));
            this.outStatus = Out.INITIALIZED;
        } else {
            this.subscribeEvent('LoopComplete', $.proxy(this.outComplete, this));
            this.outStatus = Out.NO;
            this.outTimeline = null;
        }
    };

    SlideLayerAnimations.prototype.linearMode = function (ratios) {
        this.linearTimeline = new NextendTimeline({
            paused: 1
        });
        var startPosition = 0;

        if (!this.animations.in || this.animations.in.length == 0) {
            this.inStatus = In.NO;
        } else {
            this.linearTimeline.set(this.$animatableElement, {
                transformOrigin: this.transformOriginIn
            });
            this.buildTimelineIn(this.linearTimeline, this.animations.in, ratios, startPosition);
            this.inStatus = In.INITIALIZED;
        }
        this.$layer.triggerHandler('layerExtendTimelineIn', [this.linearTimeline, startPosition]);


        if (!this.animations.loop || this.animations.loop.length == 0) {
            this.loopStatus = Loop.NO;
        } else {
            new SlideLayerAnimationLoop(this, this.$layer, this.$animatableElement, this.animations, ratios, this.timelineMode);
        }

        startPosition = this.linearTimeline.totalDuration();

        this.$layer.triggerHandler('layerExtendTimelineOut', [this.linearTimeline, startPosition]);
        if (!this.animations.out || this.animations.out.length == 0) {
            this.outStatus = Out.NO;
        } else {
            this.linearTimeline.set(this.$animatableElement, {
                transformOrigin: this.transformOriginOut
            });
            this.buildTimelineOut(this.linearTimeline, this.animations.out, ratios, startPosition);
            this.outStatus = Out.INITIALIZED;
        }
    };

    SlideLayerAnimations.prototype.refresh = function (ratios) {
        this.reset();
        this.setZero();

        this.inTimeline = new NextendTimeline({
            paused: 1,
            onComplete: $.proxy(this.inComplete, this)
        });
        if (this.animations.in && this.animations.in.length) {
            this.buildTimelineIn(this.inTimeline, this.animations.in, ratios, 0);
        }
        this.$layer.triggerHandler('layerExtendTimelineIn', [this.inTimeline, 0]);

        if (this.inTimeline.totalDuration()) {
            this.inStatus = In.INITIALIZED;
        } else {
            this.inTimeline = null;
        }

        if (!this.animations.loop || this.animations.loop.length == 0) {
            this.loopStatus = Loop.NO;
        } else {
            this.loop.refresh(ratios);
            this.loopStatus = Loop.INITIALIZED;
        }

        this.outTimeline = new NextendTimeline({
            paused: 1,
            onComplete: $.proxy(this.outComplete, this)
        });

        if (this.animations.out && this.animations.out.length) {
            this.buildTimelineOut(this.outTimeline, this.animations.out, ratios, 0);
        }
        this.$layer.triggerHandler('layerExtendTimelineOut', [this.outTimeline, 0]);

        if (this.outTimeline.totalDuration()) {
            this.outStatus = Out.INITIALIZED;
        } else {
            this.outStatus = Out.NO;
            this.outTimeline = null;
        }
    };

    SlideLayerAnimations.prototype.setZero = function () {
        NextendTween.set(this.$animatableElement, $.extend({}, zero));
    };

    SlideLayerAnimations.prototype.setZeroAll = function () {
        if (this.inStatus == In.INITIALIZED) {
            this.inTimeline.progress(1);
        }
        this.setZero();
    };

    SlideLayerAnimations.prototype.subscribeEvent = function (eventName, callback) {
        var events = eventName.split(',');
        for (var i = 0; i < events.length; i++) {
            if (events[i].length) {
                var event = events[i].split('.');
                switch (event[0]) {
                    case 'InComplete':
                    case 'LoopComplete':
                    case 'OutComplete':
                    case 'LoopRoundComplete':
                    case 'LayerClick':
                    case 'LayerMouseEnter':
                    case 'LayerMouseLeave':
                        if (events[i].match(/^Layer/)) {
                            events[i] = events[i].replace(/^Layer/, '').toLowerCase();
                        }
                        this.$layer.on(events[i], callback);
                        break;
                    case 'mainAnimationStartIn':
                    case 'layerAnimationPlayIn':
                    case 'SlideMouseEnter':
                    case 'SlideMouseLeave':
                    case 'SlideClick':
                        if (events[i].match(/^Slide/)) {
                            events[i] = events[i].replace(/^Slide/, '').toLowerCase();
                        }
                        this.slide.$slideElement.on(events[i], callback);
                        break;
                    case 'SliderMouseEnter':
                    case 'SliderMouseLeave':
                    case 'SliderClick':
                        if (events[i].match(/^Slider/)) {
                            events[i] = events[i].replace(/^Slider/, '').toLowerCase();
                        }

                        this.layers.slide.slider.sliderElement.on(events[i], $.proxy(function () {
                            if (this.slide.isActive()) {
                                callback();
                            }
                        }, this));
                        break;
                    default:
                        var killed = false;
                        this.slide.$slideElement.on(events[i], function () {
                            setTimeout(function () {
                                if (!killed) {
                                    callback();
                                }
                                killed = false;
                            }, 50);
                        });
                        this.slide.$slideElement.on('cancel-' + events[i], function () {
                            killed = true;
                            setTimeout(function () {
                                killed = false;
                            }, 70);
                        });
                }
            }
        }
    };

    SlideLayerAnimations.prototype.loopEvents = function (enabled) {
        if (enabled) {
            if (this.animations.loopPauseEvent != '') {
                this.subscribeEvent(this.animations.loopPauseEvent + '.n2-ss-loop', $.proxy(function () {
                    if (this.loop) {
                        this.loop.pause();
                    }
                }, this));
            }
            if (this.animations.loopStopEvent != '') {
                this.subscribeEvent(this.animations.loopStopEvent + '.n2-ss-loop', $.proxy(function () {
                    if (this.loop) {
                        this.loop.end();
                    }
                }, this));
            }
        } else {
            this.$layer.off('.n2-ss-loop');
        }
    };

    SlideLayerAnimations.prototype.start = function () {
        NextendTween.set(this.$animatableElement, {
            transformOrigin: this.transformOriginIn
        });
        if (this.outStatus != Out.NO) {
            if (this.inStatus == In.NO) {
                this.outTimeline.progress(0.9999);
            }
            this.outTimeline.pause(0);
        }
        if (this.inStatus != In.NO) {
            this.inTimeline.progress(0.9999).pause(0);
        }
        this.status = LayerStatus.INITIALIZED;

    };

    SlideLayerAnimations.prototype.playIn = function () {
        if (this.status == LayerStatus.INITIALIZED) {
            this.status = LayerStatus.PLAY_IN_STARTED;
            if (this.inStatus != In.NO) {
                if (this.inTimeline.progress() == 1) {
                    this.inTimeline.play(this.startDelay);
                } else {
                    this.inTimeline.play();
                }
            } else {
                this.inComplete();
            }
        } else if (this.status == LayerStatus.PLAY_IN_STARTED) {
            if (this.skipLoop) {
                this.skipLoop = 0;
                this.$layer.off('InComplete.n2-instant-out');
            }
        } else if (this.status == LayerStatus.PLAY_OUT_STARTED) {
            this.$layer.one('OutComplete.n2-instant-in', $.proxy(function () {
                this.playIn();
            }, this));
            this.outTimeline.totalDuration(.3);
        }
    };

    SlideLayerAnimations.prototype.inComplete = function () {
        this.inPlayed = 1;
        this.status = LayerStatus.PLAY_IN_ENDED;
        this.$layer.trigger('InComplete');
    };

    SlideLayerAnimations.prototype.playLoop = function () {
        if (this.status == LayerStatus.PLAY_IN_ENDED && !this.skipLoop) {
            this.status = LayerStatus.PLAY_LOOP_STARTED;
            if (this.loopStatus != Loop.NO) {
                this.$layer.on('_LoopComplete', $.proxy(this.loopComplete, this));
                this.loop.playIn();
            } else {
                this.loopComplete();
            }
        } else if (this.status == LayerStatus.PLAY_LOOP_STARTED) {
            this.loop.playIn();
        }
    };

    SlideLayerAnimations.prototype.loopComplete = function () {
        this.status = LayerStatus.PLAY_LOOP_ENDED;
        this.loopPlayed = 1;
        this.$layer.trigger('LoopComplete');
    };

    SlideLayerAnimations.prototype.playOut = function () {
        if (this.status == LayerStatus.PLAY_IN_STARTED) {
            if (!this.skipLoop) {
                this.skipLoop = 1;
                this.$layer.one('InComplete.n2-instant-out', $.proxy(function () {
                    this.skipLoop = 0;
                    this.loopComplete();
                    this._playOut();
                }, this));
            }
        } else if (this.status == LayerStatus.PLAY_IN_ENDED) {
            this.loopComplete();
            this._playOut();
        } else if (this.status == LayerStatus.PLAY_LOOP_STARTED) {
            this.$layer.one('LoopComplete', $.proxy(this._playOut, this));
            this.loop.end();
        } else if (this.status == LayerStatus.PLAY_LOOP_ENDED) {
            this._playOut();
        } else if (this.status == LayerStatus.PLAY_OUT_STARTED) {
            this.$layer.off('OutComplete.n2-instant-in');
        }
    };

    SlideLayerAnimations.prototype._playOut = function () {
        if (this.status == LayerStatus.PLAY_LOOP_ENDED) {
            this.status = LayerStatus.PLAY_OUT_STARTED;
            if (this.outStatus != Out.NO) {

                NextendTween.set(this.$animatableElement, {
                    transformOrigin: this.transformOriginOut
                });

                if (this.outTimeline.progress() == 1) {
                    this.outTimeline.timeScale(1);
                    this.outTimeline.play(0);
                } else {
                    this.outTimeline.play();
                }
            } else {
                this.outComplete();
            }
        }
    };

    SlideLayerAnimations.prototype.outComplete = function () {
        if (this.repeatable && (this.inStatus != In.NO || this.loopStatus != Loop.NO || this.outStatus != In.NO)) {
            this.status = LayerStatus.INITIALIZED;
            NextendTween.set(this.$animatableElement, {
                transformOrigin: this.transformOriginIn
            });
            if (this.loopStatus != Loop.NO) {
                this.loop.replay();
            }
        } else {
            this.status = LayerStatus.PLAY_OUT_ENDED;
        }

        this.$layer.triggerHandler('_OutComplete');
        this.$layer.trigger('OutComplete');
    };

    SlideLayerAnimations.prototype.beforeMainSwitch = function (e, deferreds) {
        if (this.status == LayerStatus.INITIALIZED) {
            this.status = LayerStatus.PLAY_IN_DISABLED;
        }
        deferreds.push(this.end());
    };

    SlideLayerAnimations.prototype.end = function () {
        if (this.status > LayerStatus.PLAY_IN_DISABLED && this.status < LayerStatus.PLAY_OUT_ENDED) {
            var deferred = $.Deferred();
            this.$layer.one('_OutComplete', $.proxy(function () {
                this.status = LayerStatus.PLAY_IN_DISABLED;
                deferred.resolve();
            }, this));
            this.playOut();
            return deferred;
        }
        return true;
    };

    SlideLayerAnimations.prototype.reset = function () {
        switch (this.status) {
            case LayerStatus.PLAY_OUT_STARTED:
                this.outTimeline.pause(0);
                break;
            case LayerStatus.PLAY_LOOP_STARTED:
                this.loop.reset();
                break;
            case LayerStatus.PLAY_IN_STARTED:
                this.inTimeline.pause(0);
                break;
        }
        this.status = LayerStatus.INITIALIZED;
    };

    SlideLayerAnimations.prototype.pause = function () {
        this.paused = true;
        switch (this.status) {
            case LayerStatus.INITIALIZED:
                this.status = LayerStatus.PLAY_IN_DISABLED;
                break;
            case LayerStatus.PLAY_IN_STARTED:
                this.status = LayerStatus.PLAY_IN_PAUSED;
                this.inTimeline.pause();
                break;
            case LayerStatus.PLAY_LOOP_STARTED:
                this.status = LayerStatus.PLAY_LOOP_PAUSED;
                this.loop.pause();
                break;
            case LayerStatus.PLAY_OUT_STARTED:
                this.status = LayerStatus.PLAY_OUT_PAUSED;
                this.outTimeline.pause();
                break;
        }
    };

    SlideLayerAnimations.prototype.resume = function () {
        if (this.status == LayerStatus.PLAY_IN_DISABLED) {
            this.status = LayerStatus.INITIALIZED;
        } else if (this.status == LayerStatus.PLAY_IN_PAUSED) {
            this.status = LayerStatus.PLAY_IN_STARTED;
            this.inTimeline.play();
        } else if (this.status == LayerStatus.PLAY_LOOP_PAUSED) {
            this.status = LayerStatus.PLAY_LOOP_STARTED;
            this.loop.play();
        } else if (this.status == LayerStatus.PLAY_OUT_PAUSED) {
            this.status = LayerStatus.PLAY_OUT_STARTED;
            this.outTimeline.play();
        }
    };

    SlideLayerAnimations.prototype.setCurrentZero = function () {
        var currentZero = $.extend({}, this.currentZero);
        delete currentZero.delay;
        delete currentZero.duration;
        NextendTween.set(this.$animatableElement, currentZero);
    };

    SlideLayerAnimations.prototype.buildTimelineIn = function (timeline, animations, ratios, startTime) {
        animations = $.extend(true, [], animations);
        if (this.animations.specialZeroIn && animations.length > 0) {
            this.currentZero = animations.pop();
            delete this.currentZero.name;
            delete this.currentZero.duration;
            delete this.currentZero.delay;
            delete this.currentZero.ease;
            this.currentZero.x = this.currentZero.x * ratios.slideW;
            this.currentZero.y = this.currentZero.y * ratios.slideH;
            this.currentZero.rotationX = -this.currentZero.rotationX;
            this.currentZero.rotationY = -this.currentZero.rotationY;
            this.currentZero.rotationZ = -this.currentZero.rotationZ;
            this.setCurrentZero();
        }
        if (animations.length > 0) {
            var chain = this._buildAnimationChainIn(animations, ratios, this.currentZero);
            if (chain.length > 0) {
                var i = 0;
                this.startDelay = chain[i].to.delay;
                timeline.fromTo(this.$animatableElement, chain[i].duration, chain[i].from, chain[i].to, 0, startTime);
                startTime += chain[i].duration + chain[i].to.delay;
                i++;

                for (; i < chain.length; i++) {
                    timeline.to(this.$animatableElement, chain[i].duration, chain[i].to, startTime);
                    startTime += chain[i].duration + chain[i].to.delay;
                }
            }
        }
    };

    SlideLayerAnimations.prototype._buildAnimationChainIn = function (animations, ratios, currentZero) {
        var preparedAnimations = [
            {
                from: currentZero
            }
        ];
        for (var i = animations.length - 1; i >= 0; i--) {
            var animation = $.extend(true, {}, animations[i]),
                delay = animation.delay,
                duration = animation.duration,
                ease = animation.ease;
            delete animation.delay;
            delete animation.duration;
            delete animation.ease;
            delete animation.name;

            var previousAnimation = preparedAnimations[0].from;
            animation.x = -animation.x * ratios.slideW;
            animation.y = -animation.y * ratios.slideH;
            animation.z = -animation.z;
            animation.rotationX = -animation.rotationX;
            animation.rotationY = -animation.rotationY;
            animation.rotationZ = -animation.rotationZ;

            preparedAnimations.unshift({
                duration: duration,
                from: animation,
                to: $.extend({}, previousAnimation, {
                    ease: ease,
                    delay: delay
                })
            });
        }
        preparedAnimations.pop();

        return preparedAnimations;
    };

    SlideLayerAnimations.prototype.buildTimelineOut = function (timeline, animations, ratios, startTime) {
        animations = $.extend(true, [], animations);
        var outChain = this._buildAnimationChainOut(animations, ratios);

        var i = 0;
        if (outChain.length > 0) {
            if (startTime != 0) {
                timeline.to(this.$animatableElement, outChain[i].duration, outChain[i].to, startTime);
            } else {
                timeline.fromTo(this.$animatableElement, outChain[i].duration, outChain[i].from, outChain[i].to, startTime);
            }
            startTime += outChain[i].duration + outChain[i].to.delay;

            for (i++; i < outChain.length; i++) {
                timeline.to(this.$animatableElement, outChain[i].duration, outChain[i].to, startTime);
                startTime += outChain[i].duration + outChain[i].to.delay;
            }
        }

    };

    SlideLayerAnimations.prototype._buildAnimationChainOut = function (animations, ratios) {
        var preparedAnimations = [
            {
                to: this.currentZero
            }
        ];
        for (var i = 0; i < animations.length; i++) {
            var animation = $.extend(true, {}, animations[i]),
                duration = animation.duration;
            delete animation.duration;
            delete animation.name;

            var previousAnimation = $.extend({}, preparedAnimations[preparedAnimations.length - 1].to);
            delete previousAnimation.delay;
            delete previousAnimation.ease;
            animation.x = animation.x * ratios.slideW;
            animation.y = animation.y * ratios.slideH;

            preparedAnimations.push({
                duration: duration,
                from: previousAnimation,
                to: animation
            });
        }
        preparedAnimations.shift();
        return preparedAnimations;
    };

    scope.NextendSmartSliderSlideLayerAnimations = SlideLayerAnimations;

    var LoopStatus = {
        NOT_INITIALIZED: -1,
        INITIALIZED: 1,
        PLAY_IN_STARTED: 2,
        PLAY_IN_PAUSED: 3,
        PLAY_IN_ENDED: 4,
        PLAY_LOOP_STARTED: 5,
        PLAY_LOOP_PAUSED: 6,
        PLAY_LOOP_ENDED: 7,
        PLAY_OUT_STARTED: 8,
        PLAY_OUT_PAUSED: 9,
        PLAY_OUT_ENDED: 10
    };


    function SlideLayerAnimationLoop(layers, $layer, $animatableElement, animations, ratios, timelineMode) {
        this.status = LoopStatus.NOT_INITIALIZED;
        this.single = false;
        this.transformOrigin = '50% 50% 0';
        this._counter = 0;
        this.inAnimation = null;
        this.timeline = null;
        this.outAnimation = null;


        this.layers = layers;
        this.$layer = $layer;
        this.$animatableElement = $animatableElement;
        this.animations = animations;
        this.timelineMode = timelineMode;

        this.transformOrigin = animations.transformOriginLoop.split('|*|').join('% ') + 'px';

        this.repeatCount = animations.repeatCount;
        if (this.repeatCount == 0 && layers.slide.slider.isAdmin) {
            this.repeatCount = 1;
        }

        this.repeatStartDelay = Math.max(0, animations.repeatStartDelay);

        this.refresh(ratios);
    };

    SlideLayerAnimationLoop.prototype.refresh = function (ratios) {

        this.timeline = new NextendTimeline({
            paused: true
        });
        this.buildTimelineLoop($.extend(true, [], this.animations.loop), ratios);
        this.status = LoopStatus.INITIALIZED;
    };

    SlideLayerAnimationLoop.prototype.playIn = function () {
        if (this.status == LoopStatus.INITIALIZED || this.status == LoopStatus.PLAY_OUT_ENDED) {

            NextendTween.set(this.$animatableElement, {
                transformOrigin: this.transformOrigin
            });

            if (!this.single) {
                this.status = LoopStatus.PLAY_IN_STARTED;
                var animation = $.extend({}, this.zero.from);
                animation.delay = this.repeatStartDelay;
                animation.onComplete = $.proxy(function () {
                    this.status = LoopStatus.PLAY_IN_ENDED;
                    this.playLoop();
                }, this);
                this.inAnimation = NextendTween.to(this.$animatableElement, this.zero.duration / 2, animation);
            } else {
                this.status = LoopStatus.PLAY_IN_ENDED;
                this.timeline.delay(this.repeatStartDelay);
                this.playLoop();
            }
        } else {
            this.play();
        }
    };

    SlideLayerAnimationLoop.prototype.playLoop = function () {
        if (this.status == LoopStatus.PLAY_IN_ENDED) {
            this.status = LoopStatus.PLAY_LOOP_STARTED;
            this._counter = 0;
            this.layers.loopEvents(1);

            this.timeline.eventCallback('onComplete', $.proxy(function () {
                this._counter++;
                if (!this.repeatTimeline()) {
                    this.status = LoopStatus.PLAY_LOOP_ENDED;
                    this.playOut();
                }
            }, this));
            this.timeline.restart(true);
        }
    };

    SlideLayerAnimationLoop.prototype.playOut = function () {
        if (this.status == LoopStatus.PLAY_LOOP_ENDED) {
            if (!this.single) {
                this.status = LoopStatus.PLAY_OUT_STARTED;
                var animation = $.extend({}, this.layers.currentZero);
                animation.onComplete = $.proxy(function () {
                    this.status = LoopStatus.PLAY_OUT_ENDED;
                    this.$layer.triggerHandler('_LoopComplete');
                }, this);
                this.outAnimation = NextendTween.to(this.$animatableElement, this.zero.duration / 2, animation);
            } else {
                this.status = LoopStatus.PLAY_OUT_ENDED;
                this.$layer.triggerHandler('_LoopComplete');
            }
        }
    };

    SlideLayerAnimationLoop.prototype.repeatTimeline = function () {
        if (this.repeatCount == 0 || this._counter < this.repeatCount) {
            this.timeline.restart();
            this.$layer.triggerHandler('LoopRoundComplete');
            return true;
        }
        return false;
    };

    SlideLayerAnimationLoop.prototype.pause = function () {
        if (this.status == LoopStatus.PLAY_IN_STARTED) {
            this.status = LoopStatus.PLAY_IN_PAUSED;
            this.inAnimation.pause();
        } else if (this.status == LoopStatus.PLAY_LOOP_STARTED) {
            this.status = LoopStatus.PLAY_LOOP_PAUSED;
            this.timeline.pause();
        } else if (this.status == LoopStatus.PLAY_OUT_STARTED) {
            this.status = LoopStatus.PLAY_OUT_PAUSED;
            this.outAnimation.pause();
        }
    };

    SlideLayerAnimationLoop.prototype.play = function () {
        if (this.status == LoopStatus.PLAY_IN_PAUSED) {
            this.status = LoopStatus.PLAY_IN_STARTED;
            this.inAnimation.play();
        } else if (this.status == LoopStatus.PLAY_LOOP_PAUSED) {
            this.status = LoopStatus.PLAY_LOOP_STARTED;
            this.timeline.play();
        } else if (this.status == LoopStatus.PLAY_OUT_PAUSED) {
            this.status = LoopStatus.PLAY_OUT_STARTED;
            this.outAnimation.play();
        }
    };

    SlideLayerAnimationLoop.prototype.reset = function () {
        if (this.outAnimation) {
            this.outAnimation.pause(0);
        }
        this.timeline.pause(0);
        if (this.inAnimation) {
            this.inAnimation.pause(0);
        }
        this.status = LoopStatus.INITIALIZED;
    };

    SlideLayerAnimationLoop.prototype.end = function () {

        var deferred = $.Deferred();

        if (this.status == LoopStatus.PLAY_OUT_ENDED) {
            this.status = LoopStatus.INITIALIZED;
            deferred.resolve();
            return deferred;
        }

        this.$layer.one('_LoopComplete', $.proxy(function () {
            this.status = LoopStatus.INITIALIZED;
            deferred.resolve();
        }, this));

        this.timeline.eventCallback('onComplete', $.proxy(function () {
            this._counter++;
            if (this.repeatCount == 0 || !this.repeatTimeline()) {
                this.status = LoopStatus.PLAY_LOOP_ENDED;
                this.playOut();
            }
        }, this));

        switch (this.status) {
            case LoopStatus.PLAY_OUT_PAUSED:
                this.outAnimation.play();
                break;

            case LoopStatus.PLAY_IN_PAUSED:
                this.inAnimation.play();
                break;

            case LoopStatus.PLAY_LOOP_PAUSED:
                this.timeline.play();
                break;
        }
        return deferred;
    };

    SlideLayerAnimationLoop.prototype.buildTimelineLoop = function (animations, ratios) {
        var chain = this._buildAnimationChainLoop(animations, ratios);
        this.zero = $.extend(true, {}, chain[0]);

        if (this.timelineMode == TimelineMode.linear) {

            this.timeline.delay(this.repeatStartDelay);
            this.timeline.set(this.$animatableElement, {
                transformOrigin: this.transformOrigin
            });

            if (!this.single) {
                var animation = $.extend({}, this.zero.from);
                this.timeline.to(this.$animatableElement, this.zero.duration / 2, animation);
            }
            var count = this.repeatCount;
            if (count < 1) {
                count = 1;
            }
            for (var j = 0; j < count; j++) {
                for (var i = 0; i < chain.length; i++) {
                    this.timeline.fromTo(this.$animatableElement, chain[i].duration, $.extend({immediateRender: false}, chain[i].from), $.extend({}, chain[i].to));
                }
            }

            if (!this.single) {
                this.timeline.to(this.$animatableElement, this.zero.duration / 2, $.extend({}, this.layers.currentZero));
            }

            this.layers.linearTimeline.add(this.timeline);
            this.timeline.paused(false);

        } else {
            for (var i = 0; i < chain.length; i++) {
                this.timeline.to(this.$animatableElement, chain[i].duration, chain[i].to);
            }
        }
    };

    SlideLayerAnimationLoop.prototype._buildAnimationChainLoop = function (animations, ratios) {
        if (animations.length == 1) {
            this.single = true;
            var singleAnimation = $.extend(true, {}, animations[0]),
                animation = $.extend({}, this.layers.currentZero);
            animation.duration = singleAnimation.duration;
            animation.ease = singleAnimation.ease;
            if ((Math.abs(singleAnimation.rotationX) == 360 || Math.abs(singleAnimation.rotationY) == 360 || Math.abs(singleAnimation.rotationZ) == 360) && singleAnimation.opacity == 1 && singleAnimation.x == 0 && singleAnimation.y == 0 && singleAnimation.z == 0 && singleAnimation.scaleX == 1 && singleAnimation.scaleY == 1 && singleAnimation.scaleZ == 1 && singleAnimation.skewX == 0) {
                if (singleAnimation.rotationX == 360) {
                    singleAnimation.rotationX = '+=360';
                } else if (singleAnimation.rotationX == -360) {
                    singleAnimation.rotationX = '-=360';
                }
                if (singleAnimation.rotationY == 360) {
                    singleAnimation.rotationY = '+=360';
                } else if (singleAnimation.rotationY == -360) {
                    singleAnimation.rotationY = '-=360';
                }
                if (singleAnimation.rotationZ == 360) {
                    singleAnimation.rotationZ = '+=360';
                } else if (singleAnimation.rotationZ == -360) {
                    singleAnimation.rotationZ = '-=360';
                }
            } else {
                animations.push(animation);
            }
        }

        var i = 0;
        delete animations[i].name;
        animations[i].x = animations[i].x * ratios.slideW;
        animations[i].y = animations[i].y * ratios.slideH;

        var preparedAnimations = [
            {
                duration: animations[i].duration,
                from: $.extend({}, this.layers.currentZero),
                to: animations[i]
            }
        ];
        i++;
        for (; i < animations.length; i++) {
            var animation = animations[i],
                duration = animation.duration;
            delete animation.duration;
            delete animation.name;

            var previousAnimation = $.extend({}, preparedAnimations[preparedAnimations.length - 1].to);
            delete previousAnimation.delay;
            delete previousAnimation.ease;

            animation.x = animation.x * ratios.slideW;
            animation.y = animation.y * ratios.slideH;

            preparedAnimations.push({
                duration: duration,
                from: previousAnimation,
                to: animation
            });
        }

        if (!this.single) {
            preparedAnimations.push({
                duration: preparedAnimations[0].duration,
                from: $.extend({}, preparedAnimations[preparedAnimations.length - 1].to),
                to: $.extend({}, preparedAnimations[0].to)
            });
            preparedAnimations.shift();
            delete preparedAnimations[0].from.duration;
        }

        return preparedAnimations;
    };

    SlideLayerAnimationLoop.prototype.replay = function () {
        this.status = LoopStatus.INITIALIZED;
        this._counter = 0;
    };

    scope.NextendSmartSliderSlideLayerAnimationLoop = SlideLayerAnimationLoop;


})(n2, window);