
;
(function ($, scope) {

    function NextendElementSplitTextAnimationManager(id, parameters) {
        this.element = $('#' + id);

        this.parameters = parameters;

        this.element.parent()
            .on('click', $.proxy(this.show, this));

        this.element.siblings('.n2-form-element-clear')
            .on('click', $.proxy(this.clear, this));

        this.name = this.element.siblings('input');

        this.updateName(this.element.val());

        NextendElement.prototype.constructor.apply(this, arguments);
    };


    NextendElementSplitTextAnimationManager.prototype = Object.create(NextendElement.prototype);
    NextendElementSplitTextAnimationManager.prototype.constructor = NextendElementSplitTextAnimationManager;

    NextendElementSplitTextAnimationManager.prototype.show = function (e) {
        e.preventDefault();

        if (this.parameters.font) {
            nextend.splittextanimationManager.setConnectedFont(this.parameters.font);
        }
        if (this.parameters.style) {
            nextend.splittextanimationManager.setConnectedStyle(this.parameters.style);
        }
        nextend.splittextanimationManager.show(this.element.val(), $.proxy(this.save, this), {
            previewMode: '0',
            previewHTML: this.parameters.preview,
            group: this.parameters.group,
            transformOrigin: $('#' + this.parameters.transformOrigin)
        });
    };

    NextendElementSplitTextAnimationManager.prototype.clear = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.val('');
    };

    NextendElementSplitTextAnimationManager.prototype.save = function (e, value) {
        this.val(value);
    };

    NextendElementSplitTextAnimationManager.prototype.val = function (value) {
        this.element.val(value);
        this.updateName(value);
        this.triggerOutsideChange();
    };

    NextendElementSplitTextAnimationManager.prototype.insideChange = function (value) {
        this.element.val(value);

        this.updateName(value);

        this.triggerInsideChange();
    };

    NextendElementSplitTextAnimationManager.prototype.updateName = function (value) {
        $.when(nextend.splittextanimationManager.getVisual(value))
            .done($.proxy(function (style) {
                this.name.val(style.name);
            }, this));
    };

    scope.NextendElementSplitTextAnimationManager = NextendElementSplitTextAnimationManager;

})(n2, window);
