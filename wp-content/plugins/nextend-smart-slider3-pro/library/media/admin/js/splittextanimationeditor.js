
(function ($, scope) {

    function NextendSplitTextAnimationEditorController() {

        this.timeline = new NextendTimeline();

        NextendVisualEditorControllerWithEditor.prototype.constructor.apply(this, arguments);

        this.preview = $('#n2-splittextanimation-editor-preview');

        this.initBackgroundColor();
    };

    NextendSplitTextAnimationEditorController.prototype = Object.create(NextendVisualEditorControllerWithEditor.prototype);
    NextendSplitTextAnimationEditorController.prototype.constructor = NextendSplitTextAnimationEditorController;

    NextendSplitTextAnimationEditorController.prototype.loadDefaults = function () {
        NextendVisualEditorControllerWithEditor.prototype.loadDefaults.call(this);
        this.type = 'splittextanimation';
        this.group = 'in';
        this.preview = null;
        this.playing = false;
        this.transformOrigin = '0|*|0|*|0';
        this.mySplitText = null;
        this.repeatTimeout = null;
    };


    NextendSplitTextAnimationEditorController.prototype.initRenderer = function () {
        return new NextendVisualRenderer(this);
    };

    NextendSplitTextAnimationEditorController.prototype.initEditor = function () {
        return new NextendSplitTextAnimationEditor();
    };

    NextendSplitTextAnimationEditorController.prototype._load = function (visual, tabs, parameters) {

        this.group = parameters.group;
        NextendVisualEditorControllerWithEditor.prototype._load.call(this, $.extend(true, {}, this.getEmptyVisual(), visual), tabs, parameters);

        this.render(parameters.previewHTML);
    };

    NextendSplitTextAnimationEditorController.prototype.propertyChanged = function (e, property, value) {
        NextendVisualEditorControllerWithEditor.prototype.propertyChanged.call(this, e, property, value);

        this.refreshTimeline();
    };

    NextendSplitTextAnimationEditorController.prototype.get = function (type) {
        if (type == 'saveAsNew') {
            return {
                transformOrigin: this.transformOrigin,
                animation: this.currentVisual
            };
        }
        return this.currentVisual;
    };

    NextendSplitTextAnimationEditorController.prototype.getEmptyVisual = function () {
        return {
            mode: 'chars',
            sort: 'normal',
            duration: 0.4,
            stagger: 0.05,
            ease: 'easeOutCubic',
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0
        };
    };

    NextendSplitTextAnimationEditorController.prototype.initBackgroundColor = function () {

        new NextendElementText("n2-splittextanimation-editor-background-color");
        new NextendElementColor("n2-splittextanimation-editor-background-color", 0);

        var box = this.lightbox.find('.n2-editor-preview-box');
        $('#n2-splittextanimation-editor-background-color').on('nextendChange', function () {
            box.css('background', '#' + $(this).val());
        });
    };

    NextendSplitTextAnimationEditorController.prototype.render = function (html) {
        var fontClassName = nextend.splittextanimationManager.fontClassName,
            styleClassName = nextend.splittextanimationManager.styleClassName;

        html = html.replace(/\{([^]*?)\}/g, function (match, script) {
            return eval(script);
        });

        this.preview.html(html);

        if (this.visible) {
            this.refreshTimeline();
        }
    };

    NextendSplitTextAnimationEditorController.prototype.refreshTimeline = function () {
        this.killPreview();

        var animation = $.extend({}, this.currentVisual),
            modeString = animation.mode;
        if (modeString == 'chars') {
            modeString += ',words';
        }
        this.mySplitText = new NextendSplitText(this.preview.find('span'), {type: modeString})
        var splits = [];
        switch (animation.mode) {
            case 'words':
                splits = this.mySplitText.words;
                break;
            case 'lines':
                splits = this.mySplitText.lines;
                break;
            default:
                splits = this.mySplitText.chars;
        }
        delete animation.mode;

        this.timeline = new NextendTimeline({
            repeat: -1
        });

        var duration = animation.duration,
            stagger = animation.stagger;
        delete animation.duration;
        delete animation.stagger;

        NextendTween.set(splits, {
            transformOrigin: this.transformOrigin.split('|*|').join('% ') + 'px'
        });

        var splits2 = null;
        switch (animation.sort) {
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
                if (animation.sort == 'center') {
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
                if (animation.sort == 'centerShifted') {
                    splits.reverse();
                }
                break;
        }
        delete animation.sort;

        if (this.group == 'out') {
            var from = this.getEmptyVisual();
            delete from.mode;
            delete from.sort;
            delete from.duration;
            delete from.easing;
            delete from.stagger;
            this.timeline.staggerFromTo(splits, duration, from, animation, -stagger, 0.3);
            if (splits2 && splits2.length) {
                this.timeline.staggerFromTo(splits2, duration, from, animation, -stagger, 0.3);
            }
        } else {
            this.timeline.staggerFrom(splits, duration, animation, stagger, 0.3);
            if (splits2 && splits2.length) {
                this.timeline.staggerFrom(splits2, duration, animation, stagger, 0.3);
            }
        }

        this.timeline.eventCallback("onComplete", $.proxy(function () {
            this.repeatTimeout = setTimeout($.proxy(function () {
                this.timeline.play(0, false);
            }, this), 500);
        }, this));

        this.timeline.play();
    };

    NextendSplitTextAnimationEditorController.prototype.killPreview = function () {

        if (this.repeatTimeout) {
            clearTimeout(this.repeatTimeout);
        }
        this.timeline.pause();
        if (this.mySplitText) {
            this.mySplitText.revert();
        }
    };

    NextendSplitTextAnimationEditorController.prototype.show = function () {
        this.loadTransformOrigin(nextend.splittextanimationManager.transformOriginElement.val());
        NextendVisualEditorControllerWithEditor.prototype.show.call(this);
        this.refreshTimeline();
    };

    NextendSplitTextAnimationEditorController.prototype.close = function () {
        this.killPreview();
        NextendVisualEditorControllerWithEditor.prototype.close.call(this);
    };

    NextendSplitTextAnimationEditorController.prototype.loadTransformOrigin = function (transformOrigin) {
        this.editor.fields.transformOrigin.element.data('field').insideChange(transformOrigin);
        this.refreshTransformOrigin(transformOrigin, false);
    };

    NextendSplitTextAnimationEditorController.prototype.refreshTransformOrigin = function (transformOrigin, needRender) {

        this.transformOrigin = transformOrigin;

        NextendTween.set(this.preview.parent().get(0), {
            perspective: '1000px'
        });

        if (needRender) {
            this.refreshTimeline();
        }
        /*
         NextendTween.set(this.preview.get(0), {
         transformOrigin: transformOrigin.split('|*|').join('% ') + 'px'
         });
         */
    };

    NextendSplitTextAnimationEditorController.prototype.setFontSize = function (fontSize) {
        this.preview.css('fontSize', fontSize);
        this.preview.css('margin', '100px 30px');
    };

    scope.NextendSplitTextAnimationEditorController = NextendSplitTextAnimationEditorController;


    function NextendSplitTextAnimationEditor() {

        NextendVisualEditor.prototype.constructor.apply(this, arguments);

        this.fields = {
            mode: {
                element: $('#n2-splittextanimation-editormode'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeMode, this)
                }
            },
            sort: {
                element: $('#n2-splittextanimation-editorsort'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeSort, this)
                }
            },
            duration: {
                element: $('#n2-splittextanimation-editorduration'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeDuration, this)
                }
            },
            stagger: {
                element: $('#n2-splittextanimation-editorstagger'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeStagger, this)
                }
            },
            easing: {
                element: $('#n2-splittextanimation-editoreasing'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeEasing, this)
                }
            },
            opacity: {
                element: $('#n2-splittextanimation-editoropacity'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeOpacity, this)
                }
            },
            offset: {
                element: $('#n2-splittextanimation-editoroffset'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeOffset, this)
                }
            },
            rotate: {
                element: $('#n2-splittextanimation-editorrotate'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeRotate, this)
                }
            },
            scale: {
                element: $('#n2-splittextanimation-editorscale'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeScale, this)
                }
            },
            transformOrigin: {
                element: $('#n2-splittextanimation-editortransformorigin'),
                events: {
                    'outsideChange.n2-editor': $.proxy(this.changeTransformOrigin, this)
                }
            }
        }
    };

    NextendSplitTextAnimationEditor.prototype = Object.create(NextendVisualEditor.prototype);
    NextendSplitTextAnimationEditor.prototype.constructor = NextendSplitTextAnimationEditor;

    NextendSplitTextAnimationEditor.prototype.load = function (values) {
        this._off();
        this.fields.mode.element.data('field').insideChange(values.mode);
        if (!values.sort) {
            values.sort = 'normal';
        }
        this.fields.sort.element.data('field').insideChange(values.sort);
        this.fields.duration.element.data('field').insideChange(values.duration * 1000);
        this.fields.stagger.element.data('field').insideChange(values.stagger * 1000);
        this.fields.easing.element.data('field').insideChange(values.ease);
        this.fields.opacity.element.data('field').insideChange(values.opacity * 100);

        this.fields.offset.element.data('field').insideChange(values.x + '|*|' + values.y);
        this.fields.rotate.element.data('field').insideChange(values.rotationX + '|*|' + values.rotationY + '|*|' + values.rotationZ);
        this.fields.scale.element.data('field').insideChange(values.scale * 100);
        this.fields.transformOrigin.element.data('field').insideChange(nextend.splittextanimationManager.controller.transformOrigin);

        this._on();
    };

    NextendSplitTextAnimationEditor.prototype.changeMode = function () {
        this.trigger('mode', this.fields.mode.element.val());
    };

    NextendSplitTextAnimationEditor.prototype.changeSort = function () {
        this.trigger('sort', this.fields.sort.element.val());
    };

    NextendSplitTextAnimationEditor.prototype.changeDuration = function () {
        this.trigger('duration', this.fields.duration.element.val() / 1000);
    };

    NextendSplitTextAnimationEditor.prototype.changeStagger = function () {
        this.trigger('stagger', this.fields.stagger.element.val() / 1000);
    };

    NextendSplitTextAnimationEditor.prototype.changeEasing = function () {
        this.trigger('ease', this.fields.easing.element.val());
    };

    NextendSplitTextAnimationEditor.prototype.changeOpacity = function () {
        this.trigger('opacity', this.fields.opacity.element.val() / 100);
    };

    NextendSplitTextAnimationEditor.prototype.changeOffset = function () {
        var offset = this.fields.offset.element.val().split('|*|');
        this.trigger('x', offset[0]);
        this.trigger('y', offset[1]);
    };

    NextendSplitTextAnimationEditor.prototype.changeRotate = function () {
        var rotate = this.fields.rotate.element.val().split('|*|');
        this.trigger('rotationX', rotate[0]);
        this.trigger('rotationY', rotate[1]);
        this.trigger('rotationZ', rotate[2]);
    };

    NextendSplitTextAnimationEditor.prototype.changeScale = function () {
        this.trigger('scale', this.fields.scale.element.val() / 100);
    };

    NextendSplitTextAnimationEditor.prototype.changeTransformOrigin = function () {
        nextend.splittextanimationManager.controller.refreshTransformOrigin(this.fields.transformOrigin.element.val(), true);
    };
    scope.NextendSplitTextAnimationEditor = NextendSplitTextAnimationEditor;

})(n2, window);
