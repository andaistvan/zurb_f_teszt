
(function ($, scope) {
    "use strict";
    function NextendElementFacebookToken(id, url) {
        this.element = $('#' + id);
        this.button = $('#' + id + '_button').on('click', $.proxy(this.requestToken, this));
        this.url = url;

        $('#generatorcallback').html(location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''));
    };

    NextendElementFacebookToken.prototype.requestToken = function (e) {
        e.preventDefault();

        NextendAjaxHelper.ajax({
            url: this.url,
            data: $('#smartslider-form').serialize()
        }).done(function (response) {
            var popupWidth = 580;
            var popupHeight = 400;
            var xPosition = (screen.width - popupWidth) / 2;
            var yPosition = (screen.height - popupHeight) / 2;

            window.open(response.data.authUrl, "Facebook authentication", "width=580,height=400,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=" + xPosition + ",top=" + yPosition);

        });
    };

    scope.NextendElementFacebookToken = NextendElementFacebookToken;
})(n2, window);
