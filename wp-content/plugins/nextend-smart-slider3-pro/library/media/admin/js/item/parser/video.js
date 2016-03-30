
(function ($, scope, undefined) {

    function ItemParserVideo() {
        NextendSmartSliderItemParser.apply(this, arguments);
    };

    ItemParserVideo.prototype = Object.create(NextendSmartSliderItemParser.prototype);
    ItemParserVideo.prototype.constructor = ItemParserVideo;

    ItemParserVideo.prototype.added = function () {
        this.needFill = ['video_mp4', 'video_webm', 'video_ogg'];

        nextend.smartSlider.generator.registerField($('#item_videovideo_mp4'));
        nextend.smartSlider.generator.registerField($('#item_videovideo_webm'));
        nextend.smartSlider.generator.registerField($('#item_videovideo_ogg'));
    };

    ItemParserVideo.prototype.getName = function (data) {
        return data.video_mp4;
    };

    ItemParserVideo.prototype.fitLayer = function (item) {
        return true;
    };

    scope.NextendSmartSliderItemParser_video = ItemParserVideo;
})(n2, window);
