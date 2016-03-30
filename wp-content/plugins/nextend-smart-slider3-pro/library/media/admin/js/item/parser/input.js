
(function ($, scope, undefined) {

    function ItemParserInput() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserInput.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserInput.prototype.constructor = ItemParserInput;

    ItemParserInput.prototype.getDefault = function () {
        return {
            font: '',
            style: ''
        }
    };

    ItemParserInput.prototype.added = function () {
        this.needFill = ['placeholder'];

        this.addedStyle('heading', 'style');

        this.addedFont('paragraph', 'inputfont');
        this.addedStyle('heading', 'inputstyle');
        this.addedFont('hover', 'buttonfont');
        this.addedStyle('heading', 'buttonstyle');

        nextend.smartSlider.generator.registerField($('#item_inputplaceholder'));

    };

    ItemParserInput.prototype.getName = function (data) {
        return data.placeholder;
    };

    ItemParserInput.prototype.parseAll = function (data) {

        data.fullwidthStyle = parseInt(data.fullwidth) ? 'width:100%;' : '';

        if (data.fullwidth | 0) {
            data.display = 'block;';
        } else {
            data.display = 'inline-block;';
        }

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);
    };

    ItemParserInput.prototype.render = function (node, data) {
        if (data.buttonlabel == '') {
            node.find('td').eq(1).remove();
        }
        return node;
    };

    scope.NextendSmartSliderItemParser_input = ItemParserInput;
})(n2, window);
