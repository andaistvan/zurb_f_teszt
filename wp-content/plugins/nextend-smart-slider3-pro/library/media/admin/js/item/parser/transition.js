
(function ($, scope, undefined) {

    function ItemParserTransition() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserTransition.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserTransition.prototype.constructor = ItemParserTransition;

    ItemParserTransition.prototype.added = function () {
        this.needFill = ['image', 'image2'];

        nextend.smartSlider.generator.registerField($('#item_transitionimage'));
        nextend.smartSlider.generator.registerField($('#item_transitionimage2'));
        nextend.smartSlider.generator.registerField($('#item_transitionalt'));
        nextend.smartSlider.generator.registerField($('#linkitem_transitionlink_0'));
    };

    ItemParserTransition.prototype.getName = function (data) {
        return data.image.split('/').pop();
    };

    ItemParserTransition.prototype.parseAll = function (data, item) {

        data.uid = $.fn.uid();
        
        var link = data.link.split('|*|');
        data.url = link[0];
        data.target = link[1];
        delete data.link;

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        var originalImage = data.image;
        data.image = nextend.imageHelper.fixed(data.image);
        data.image2 = nextend.imageHelper.fixed(data.image2);

        if (item && item.values.image == '$system$/images/placeholder/imagefront.png' && originalImage != item.values.image) {
            this.resizeLayerToImage(item, data.image);
        }

    };

    ItemParserTransition.prototype.fitLayer = function (item) {
        this.resizeLayerToImage(item, nextend.imageHelper.fixed(item.values.image));
        return true;
    };

    scope.NextendSmartSliderItemParser_transition = ItemParserTransition;
})(n2, window);
