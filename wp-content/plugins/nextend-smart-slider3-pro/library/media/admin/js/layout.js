
(function (smartSlider, $, scope) {

    function NextendLayoutManager() {
        NextendVisualManagerEditableSets.prototype.constructor.apply(this, arguments);
    };

    NextendLayoutManager.prototype = Object.create(NextendVisualManagerEditableSets.prototype);
    NextendLayoutManager.prototype.constructor = NextendLayoutManager;

    NextendLayoutManager.prototype.loadDefaults = function () {
        NextendVisualManagerEditableSets.prototype.loadDefaults.apply(this, arguments);
        this.type = 'layout';
        this.labels = {
            visual: 'layout',
            visuals: 'layouts'
        };

        this.fontClassName = '';
    };

    NextendLayoutManager.prototype.initController = function () {
        return new NextendLayoutEditorController();
    };

    NextendLayoutManager.prototype.createVisual = function (visual, set) {
        return new NextendSmartSliderLayout(visual, set, this);
    };

    scope.NextendLayoutManager = NextendLayoutManager;


    function NextendSmartSliderLayout() {
        NextendVisualWithSetRow.prototype.constructor.apply(this, arguments);
    };

    NextendSmartSliderLayout.prototype = Object.create(NextendVisualWithSetRow.prototype);
    NextendSmartSliderLayout.prototype.constructor = NextendSmartSliderLayout;

    NextendSmartSliderLayout.prototype.activate = function (e) {
        if (typeof e !== 'undefined') {
            e.preventDefault();
        }
        var callback = $.proxy(function (slideDataOverwrite, layerOverwrite) {
            smartSlider.slide.loadLayout(this.value, slideDataOverwrite, layerOverwrite);
        }, this);

        new NextendModal({
            zero: {
                size: [
                    500,
                    140
                ],
                title: n2_('Load layout'),
                back: false,
                close: true,
                content: '',
                controls: ['<a href="#" class="n2-button n2-button-big n2-button-grey n2-uc n2-h4">' + n2_('Load whole slide') + '</a>', '<a href="#" class="n2-button n2-button-big n2-button-green n2-uc n2-h4">' + n2_('Load only layers') + '</a>'],
                fn: {
                    show: function () {
                        this.controls.find('.n2-button-green')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                callback(false, false);
                                this.hide(e);
                            }, this));

                        this.controls.find('.n2-button-grey')
                            .on('click', $.proxy(function (e) {
                                e.preventDefault();
                                callback(true, true);
                                this.hide(e);
                            }, this));

                    }
                }
            }
        }, true);
    };

    scope.NextendSmartSliderLayout = NextendSmartSliderLayout;

})(nextend.smartSlider, n2, window);

