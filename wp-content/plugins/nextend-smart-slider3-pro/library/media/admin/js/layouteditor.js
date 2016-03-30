
(function ($, scope) {

    function NextendLayoutEditorController() {
        NextendVisualEditorController.prototype.constructor.call(this, false);
    };

    NextendLayoutEditorController.prototype = Object.create(NextendVisualEditorController.prototype);
    NextendLayoutEditorController.prototype.constructor = NextendLayoutEditorController;

    NextendLayoutEditorController.prototype.loadDefaults = function () {
        NextendVisualEditorController.prototype.loadDefaults.call(this);
        this.type = 'layout';
        this.preview = null;
    };

    NextendLayoutEditorController.prototype.get = function () {
        return window.nextend.smartSlider.slide.getLayout();
    };

    scope.NextendLayoutEditorController = NextendLayoutEditorController;

})(n2, window);

