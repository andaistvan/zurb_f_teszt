
(function ($, scope) {
    "use strict";
    function NextendElementYoutubeToken(id, url, callbackUrl) {
        this.element = $('#' + id);
        this.button = $('#' + id + '_button').on('click', $.proxy(this.requestToken, this));
        this.url = url;

        $('#generatorcallback').html(callbackUrl);
    };

    NextendElementYoutubeToken.prototype.requestToken = function (e) {
        e.preventDefault();

        NextendAjaxHelper.ajax({
            url: this.url,
            data: $('#smartslider-form').serialize()
        }).done(function (response) {
            var popupWidth = 1000;
            var popupHeight = 600;
            var xPosition = (screen.width - popupWidth) / 2;
            var yPosition = (screen.height - popupHeight) / 2;

            window.open(response.data.authUrl, "YouTube authentication", "width=1000,height=600,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=" + xPosition + ",top=" + yPosition);

        });
    };

    scope.NextendElementYoutubeToken = NextendElementYoutubeToken;
})(n2, window);
