
(function ($, scope) {
    "use strict";
    function NextendElementFacebookAlbums(id, url) {
        this.element = $('#' + id);
        this.select = this.element.parent().find('select');
        this.relatedField = $('#generatorfacebook-id').on('nextendChange', $.proxy(this.refreshList, this));
        this.url = url;
    };

    NextendElementFacebookAlbums.prototype.refreshList = function (e) {

        NextendAjaxHelper.ajax({
            url: this.url,
            data: {
                method: 'getAlbums',
                facebookID: this.relatedField.val()
            }
        }).done($.proxy(function (response) {
            this.select.find('option').remove();
            for (var id in response.data) {
                this.select.append('<option value="' + id + '">' + response.data[id] + '</option>');
            }
            this.select.val(this.select.find("option:first").val()).trigger('change');
        }, this));
    };
    scope.NextendElementFacebookAlbums = NextendElementFacebookAlbums;
})
(n2, window);
