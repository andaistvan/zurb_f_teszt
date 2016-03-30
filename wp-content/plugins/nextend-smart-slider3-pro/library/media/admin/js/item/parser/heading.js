(function ($, scope, undefined) {

    function ItemParserHeading() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserHeading.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserHeading.prototype.constructor = ItemParserHeading;

    ItemParserHeading.prototype.getDefault = function () {
        return {
            link: '#|*|_self',
            font: '',
            style: ''
        }
    };

    ItemParserHeading.prototype.added = function () {
        this.needFill = ['heading', 'url'];

        this.addedFont('hover', 'font');
        this.addedStyle('heading', 'style');

        nextend.smartSlider.generator.registerField($('#item_headingheading'));
        nextend.smartSlider.generator.registerField($('#linkitem_headinglink_0'));

    };

    ItemParserHeading.prototype.getName = function (data) {
        return data.heading;
    };

    ItemParserHeading.prototype.parseAll = function (data) {

        data.uid = $.fn.uid();

        var link = data.link.split('|*|');
        data.url = link[0];
        data.target = link[1];
        delete data.link;


        if (data.fullwidth | 0) {
            data.display = 'block;';
        } else {
            data.display = 'inline-block;';
        }

        data.extrastyle = data.nowrap | 0 ? 'white-space: nowrap;' : '';

        data.heading = $('<div>' + data.heading + '</div>').text().replace(/\n/g, '<br />');
        if (typeof data['split-text-animation-in'] === 'undefined') {
            data['split-text-animation-in'] = '';
            data['split-text-delay-in'] = 0;
            data['split-text-animation-out'] = '';
            data['split-text-delay-out'] = 0;
            data['split-text-transform-origin'] = '50|*|50|*|0';
            data['split-text-backface-visibility'] = 1;
        }
        data.splitTextIn = data['split-text-animation-in'];
        data.splitTextDelayIn = data['split-text-delay-in'] / 1000;
        data.splitTextOut = data['split-text-animation-out'];
        data.splitTextDelayOut = data['split-text-delay-out'] / 1000;
        data.splitTextTransformOrigin = data['split-text-transform-origin'].split('|*|').join('% ') + '%';
        data.splitTextBackfaceVisibility = parseInt(data['split-text-backface-visibility']) ? 'visible' : 'hidden';
    

        NextendSmartSliderItemParser.prototype.parseAll.apply(this, arguments);

        if (data['url'] == '#') {
            data['afontclass'] = '';
        } else {
            data['afontclass'] = data['fontclass'];
            data['fontclass'] = '';
        }
    };

    ItemParserHeading.prototype.render = function (node, data) {
        if (data['url'] == '#') {
            var a = node.find('a');
            a.parent().html(a.html());
        }
        return node;
    }

    scope.NextendSmartSliderItemParser_heading = ItemParserHeading;
})(n2, window);