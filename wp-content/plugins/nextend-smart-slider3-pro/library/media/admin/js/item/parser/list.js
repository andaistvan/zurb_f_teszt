
(function ($, scope, undefined) {

    function ItemParserList() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserList.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserList.prototype.constructor = ItemParserList;

    ItemParserList.prototype.added = function () {
        this.needFill = ['content'];

        this.addedFont('paragraph', 'font');
        this.addedStyle('heading', 'liststyle');
        this.addedStyle('heading', 'itemstyle');

        nextend.smartSlider.generator.registerField($('#item_listcontent'));
    };

    ItemParserList.prototype.getName = function (data) {
        return data.content;
    };

    ItemParserList.prototype.parseAll = function (data) {
        var lis = data.content.split("\n");
        for (var i = 0; i < lis.length; i++) {
            lis[i] = '<li>' + lis[i] + '</li>';
        }
        data.lis = lis.join('');

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);
    };

    ItemParserList.prototype.render = function (node, data) {
        node.find('li').addClass(data.itemstyleclass);
        return node;
    };

    scope.NextendSmartSliderItemParser_list = ItemParserList;
})(n2, window);
