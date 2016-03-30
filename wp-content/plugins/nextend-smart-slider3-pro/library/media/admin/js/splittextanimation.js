
(function (smartSlider, $, scope) {


    function NextendSplitTextAnimationManager() {
        NextendVisualManagerSetsAndMore.prototype.constructor.apply(this, arguments);
        this.setFontSize(16);
    };

    NextendSplitTextAnimationManager.prototype = Object.create(NextendVisualManagerSetsAndMore.prototype);
    NextendSplitTextAnimationManager.prototype.constructor = NextendSplitTextAnimationManager;

    NextendSplitTextAnimationManager.prototype.loadDefaults = function () {
        NextendVisualManagerSetsAndMore.prototype.loadDefaults.apply(this, arguments);
        this.type = 'splittextanimation';
        this.labels = {
            visual: 'Split text animation',
            visuals: 'Split text animations'
        };

        this.styleClassName = '';
        this.fontClassName = '';
    };

    NextendSplitTextAnimationManager.prototype.initController = function () {
        return new NextendSplitTextAnimationEditorController();
    };

    NextendSplitTextAnimationManager.prototype.createVisual = function (visual, set) {
        return new NextendSplitTextAnimation(visual, set, this);
    };

    NextendSplitTextAnimationManager.prototype.setConnectedStyle = function (styleId) {
        this.styleClassName = $('#' + styleId).data('field').renderStyle();
    };

    NextendSplitTextAnimationManager.prototype.setConnectedFont = function (fontId) {
        this.fontClassName = $('#' + fontId).data('field').renderFont();
    };

    NextendSplitTextAnimationManager.prototype.setFontSize = function (fontSize) {
        this.controller.setFontSize(fontSize)
    };

    NextendSplitTextAnimationManager.prototype.setVisualAsStatic = function (e) {
        if (this.transformOriginElement !== null) {
            var field = this.transformOriginElement.data('field');
            field.insideChange(this.controller.transformOrigin);
            field.triggerOutsideChange();
        }

        e.preventDefault();
        switch (this.mode) {
            case 'static':
                this.setAndClose(this.getBase64(n2_('Static')));
                this.hide(e);
                break;
            default:
                NextendVisualManagerSetsAndMore.prototype.setVisualAsStatic.call(this, e);
        }
    };

    NextendSplitTextAnimationManager.prototype.getBase64 = function (name) {

        return Base64.encode(JSON.stringify({
            name: name,
            data: this.controller.get('set')
        }));
    };

    NextendSplitTextAnimationManager.prototype.show = function (data, saveCallback, showParameters) {
        this.transformOriginElement = showParameters.transformOrigin;
        NextendVisualManagerSetsAndMore.prototype.show.call(this, data, saveCallback, showParameters);

        if (data == '') {
            $.when(this.activeSet._loadVisuals())
                .done($.proxy(function () {
                    for (var k in this.activeSet.visuals) {
                        this.activeSet.visuals[k].activate();
                        break;
                    }
                }, this));
        }
    };
    scope.NextendSplitTextAnimationManager = NextendSplitTextAnimationManager;

    function NextendSplitTextAnimation() {
        NextendVisualWithSetRow.prototype.constructor.apply(this, arguments);
    };

    NextendSplitTextAnimation.prototype = Object.create(NextendVisualWithSetRow.prototype);
    NextendSplitTextAnimation.prototype.constructor = NextendSplitTextAnimation;

    NextendSplitTextAnimation.prototype.activate = function (e) {
        if (typeof e !== 'undefined') {
            e.preventDefault();
        }
        this.visualManager.changeActiveVisual(this);
        if (typeof this.value.transformOrigin !== 'undefined') {
            this.visualManager.controller.loadTransformOrigin(this.value.transformOrigin);
        }
        this.visualManager.controller.load(this.value.animation, false, this.visualManager.showParameters);
    };

    scope.NextendSplitTextAnimation = NextendSplitTextAnimation;

})(nextend.smartSlider, n2, window);
