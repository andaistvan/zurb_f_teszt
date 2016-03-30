
(function ($, scope, undefined) {

    function ItemParserArea() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserArea.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserArea.prototype.constructor = ItemParserArea;

    ItemParserArea.prototype.parseAll = function (data) {

        if (data.width == '') {
            data.width = '100%';
        } else {
            data.width += 'px';
        }

        if (data.height == '') {
            data.height = '100%';
        } else {
            data.height += 'px';
        }

        data.colora = N2Color.hex2rgbaCSS(data.color);

        data.borderWidth = data.borderWidth + 'px';
        data.borderColora = N2Color.hex2rgbaCSS(data.borderColor);
        data.borderRadius = data.borderRadius + 'px';
    };

    ItemParserArea.prototype.fitLayer = function (item) {
        return true;
    };

    scope.NextendSmartSliderItemParser_area = ItemParserArea;
})(n2, window);
