
(function ($, scope, undefined) {

    function ItemParserCaption() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserCaption.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserCaption.prototype.constructor = ItemParserCaption;

    ItemParserCaption.prototype.added = function () {
        this.needFill = ['content', 'description', 'url', 'image'];

        this.addedFont('paragraph', 'fonttitle');
        this.addedFont('paragraph', 'font');

        nextend.smartSlider.generator.registerField($('#item_captionimage'));
        nextend.smartSlider.generator.registerField($('#item_captioncontent'));
        nextend.smartSlider.generator.registerField($('#linkitem_captionlink_0'));
    };

    ItemParserCaption.prototype.getName = function (data) {
        return data.image.split('/').pop();
    };

    ItemParserCaption.prototype.parseAll = function (data, item) {

        data.uid = $.fn.uid();

        var link = data.link.split('|*|');
        data.url = link[0];
        data.target = link[1];
        delete data.link;

        data.colora = N2Color.hex2rgbaCSS(data.color);
        data.colorhex = data.color.substr(0, 6);

        var animation = data.animation.split('|*|');
        data.mode = animation[0];
        data.direction = animation[1];
        data.scale = parseInt(animation[2]);

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        data.image = nextend.imageHelper.fixed(data.image);

        if (item && item.values.image == '$system$/images/placeholder/image.png' && data.image != item.values.image) {
            this.resizeLayerToImage(item, data.image);
        }
    };

    ItemParserCaption.prototype.fitLayer = function (item) {
        this.resizeLayerToImage(item, nextend.imageHelper.fixed(item.values.image));
        return true;
    };

    scope.NextendSmartSliderItemParser_caption = ItemParserCaption;
})(n2, window);
