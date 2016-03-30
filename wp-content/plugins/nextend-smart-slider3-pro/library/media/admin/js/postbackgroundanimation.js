
(function (smartSlider, $, scope) {

    function NextendPostBackgroundAnimationManager() {
        this.type = 'postbackgroundanimation';
        NextendVisualManagerMultipleSelection.prototype.constructor.apply(this, arguments);
    };

    NextendPostBackgroundAnimationManager.prototype = Object.create(NextendVisualManagerMultipleSelection.prototype);
    NextendPostBackgroundAnimationManager.prototype.constructor = NextendPostBackgroundAnimationManager;

    NextendPostBackgroundAnimationManager.prototype.loadDefaults = function () {
        NextendVisualManagerMultipleSelection.prototype.loadDefaults.apply(this, arguments);
        this.type = 'postbackgroundanimation';
        this.labels = {
            visual: 'Ken Burns effect',
            visuals: 'Ken Burns effects'
        };
    };

    NextendPostBackgroundAnimationManager.prototype.initController = function () {
        return new NextendPostBackgroundAnimationEditorController();
    };

    NextendPostBackgroundAnimationManager.prototype.createVisual = function (visual, set) {
        return new NextendVisualWithSetRowMultipleSelection(visual, set, this);
    };

    NextendPostBackgroundAnimationManager.prototype.show = function (data, saveCallback) {
        var controllerParameters = [];
        if (data != '') {
            data = data.split('|*|');
            controllerParameters[0] = data[0];
            controllerParameters[1] = data[1];
            data = data[2];
        }
        NextendVisualManagerMultipleSelection.prototype.show.call(this, data, saveCallback, controllerParameters);
    };

    NextendPostBackgroundAnimationManager.prototype.getAsString = function () {
        return this.controller.transformOrigin + '|*|' + NextendVisualManagerMultipleSelection.prototype.getAsString.call(this);
    };

    scope.NextendPostBackgroundAnimationManager = NextendPostBackgroundAnimationManager;

})(nextend.smartSlider, n2, window);
