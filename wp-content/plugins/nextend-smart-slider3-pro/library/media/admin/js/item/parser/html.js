
(function ($, scope, undefined) {

    function ItemParserHTML() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserHTML.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserHTML.prototype.constructor = ItemParserHTML;

    ItemParserHTML.prototype.added = function () {
        this.needFill = ['html'];
        nextend.smartSlider.generator.registerField($('#item_htmlhtml'));
    };

    scope.NextendSmartSliderItemParser_html = ItemParserHTML;
})(n2, window);
