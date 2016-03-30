
(function ($, scope, undefined) {

    function ItemParserIFrame() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserIFrame.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserIFrame.prototype.constructor = ItemParserIFrame;

    ItemParserIFrame.prototype.added = function () {
        this.needFill = ['url'];

        nextend.smartSlider.generator.registerField($('#item_iframeurl'));
    };

    ItemParserIFrame.prototype.getName = function (data) {
        return data.url;
    };

    ItemParserIFrame.prototype.parseAll = function (data) {
        var size = data.size.split('|*|');
        data.width = size[0];
        data.height = size[1];
        delete data.size;

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);
    };

    scope.NextendSmartSliderItemParser_iframe = ItemParserIFrame;
})(n2, window);
