(function ($, scope, undefined) {
    function NextendSmartSliderWidgetArrowImageBar(id, images) {
        this.slider = window[id];

        this.slider.started($.proxy(this.start, this, id, images));
    };

    NextendSmartSliderWidgetArrowImageBar.prototype.start = function (id, images) {
        if (this.slider.sliderElement.data('arrow')) {
            return false;
        }

        this.previous = $('#' + id + '-arrow-previous').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider.previous();
        }, this));

        var previousImage = this.previous.find('.nextend-arrow-image');


        this.next = $('#' + id + '-arrow-next').on('click', $.proxy(function (e) {
            e.stopPropagation();
            this.slider.next();
        }, this));

        var nextImage = this.next.find('.nextend-arrow-image');

        var length = images.length;

        this.slider.sliderElement.data('arrow', this)
            .on('sliderSwitchTo', function (e, index) {
                if (index == 0) {
                    previousImage.css('backgroundImage', 'url(' + images[length - 1] + ')');
                } else {
                    previousImage.css('backgroundImage', 'url(' + images[index - 1] + ')');
                }

                if (index == length - 1) {
                    nextImage.css('backgroundImage', 'url(' + images[0] + ')');
                } else {
                    nextImage.css('backgroundImage', 'url(' + images[index + 1] + ')');
                }
            });
    };


    scope.NextendSmartSliderWidgetArrowImageBar = NextendSmartSliderWidgetArrowImageBar;
})(n2, window);