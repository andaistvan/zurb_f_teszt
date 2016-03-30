
(function ($, scope, undefined) {
    function HeadingItemSplitTextAdmin(slider, id, transformOrigin, backfaceVisibility, splittextin, delayIn, splittextout, delayOut) {
        if (splittextin != '') {
            try {
                splittextin = JSON.parse(Base64.decode(splittextin));
            } catch (e) {
                splittextin = false;
            }
        } else {
            splittextin = false;
        }
        if (splittextout != '') {
            try {
                splittextout = JSON.parse(Base64.decode(splittextout));
            } catch (e) {
                splittextout = false;
            }
        } else {
            splittextout = false;
        }

        if (!splittextin) {
            $("#" + id).closest('.n2-ss-layer').triggerHandler('layerExtraAnimationRemoved');
        }

        if (!splittextin && !splittextout) {
            return;
        }
        NextendSmartSliderHeadingItemSplitText.prototype.constructor.call(this, slider, id, transformOrigin, backfaceVisibility, splittextin, delayIn, splittextout, delayOut);
        this.slide.on('layerSetZero.' + id, $.proxy(this.setZero, this));

        this.layer.on('itemRender.' + id, $.proxy(function () {
            this.layer.off('.' + id);
        }, this))

        if (splittextin) {
            this.layer.on('timelineLoadedForLayer.' + id, $.proxy(function () {
                this.layer.triggerHandler('layerExtraAnimationAdded', [delayIn, 'ST', $.proxy(this.changeIn, this), $.proxy(this.editIn, this)]);
            }, this));
            this.layer.triggerHandler('layerExtraAnimationAdded', [delayIn, 'ST', $.proxy(this.changeIn, this), $.proxy(this.editIn, this)]);
        }
    };

    HeadingItemSplitTextAdmin.prototype = Object.create(NextendSmartSliderHeadingItemSplitText.prototype);
    HeadingItemSplitTextAdmin.prototype.constructor = HeadingItemSplitTextAdmin;

    HeadingItemSplitTextAdmin.prototype.changeIn = function (value) {
        $('#item_headingsplit-text-delay-in').val(value * 1000).trigger('change');
    };

    HeadingItemSplitTextAdmin.prototype.editIn = function (value) {
        $('#item_headingsplit-text-animation-in').parent().find('.n2-form-element-button').trigger('click');
    };

    HeadingItemSplitTextAdmin.prototype.initSlide = function () {
        this.slide = this.node.closest('.n2-ss-static-slide, .n2-ss-slide');
    };

    HeadingItemSplitTextAdmin.prototype.off = function () {
        this.slide.off('.' + this.id);
    };

    HeadingItemSplitTextAdmin.prototype.setZero = function (e, layers) {
        var modes = this.splitText.vars.type.split(',');
        for (var i = 0; i < modes.length; i++) {
            NextendTween.set(this.splitText[modes[i]], {
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            });
        }
    };

    HeadingItemSplitTextAdmin.prototype.extendTimelines = function (e, layers) {
        if (!n2.contains(document, this.node[0])) {
            // item deleted
            this.off();
        } else {
            NextendSmartSliderHeadingItemSplitText.prototype.extendTimelines.call(this, e, layers);
        }
    };

    scope.NextendSmartSliderHeadingItemSplitTextAdmin = HeadingItemSplitTextAdmin;
})(n2, window);
