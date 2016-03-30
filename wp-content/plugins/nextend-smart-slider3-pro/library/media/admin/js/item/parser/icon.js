
(function ($, scope, undefined) {

    function ItemParserIcon() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserIcon.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserIcon.prototype.constructor = ItemParserIcon;

    ItemParserIcon.prototype.added = function () {
        this.addedStyle('box', 'style');
    }

    ItemParserIcon.prototype.parseAll = function (data) {
        var size = data.size.split('|*|');
        data.width = size[0];
        data.height = size[1];
        delete data.size;

        data.opacity = N2Color.hex2alpha(data.color);
        data.color = data.color.substr(0, 6);
        var icon = data['icon']
            .replace(/data\-style/g, 'style')
            .replace(/\{style\}/g, 'fill:#' + data.color + ';fill-opacity:' + data.opacity);
        data.image = Base64.encode(icon);

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);
    };

    scope.NextendSmartSliderItemParser_icon = ItemParserIcon;
})(n2, window);
