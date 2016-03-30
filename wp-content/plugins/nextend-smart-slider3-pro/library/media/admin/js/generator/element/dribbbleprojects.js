
(function ($, scope) {
    "use strict";
    function NextendElementDribbbleProjects(id, url) {
        this.element = $('#' + id);
        this.select = this.element.parent().find('select');
        this.relatedField = $('#generatordribbble-user-id').on('nextendChange', $.proxy(this.refreshList, this));
        this.url = url;
    };

    NextendElementDribbbleProjects.prototype.refreshList = function (e) {

        NextendAjaxHelper.ajax({
            url: this.url,
            data: {
                method: 'getProjects',
                userID: this.relatedField.val()
            }
        }).done($.proxy(function (response) {
            if(response.data.length!=0) {
                this.select.find('option').remove();
                for (var id in response.data) {
                    this.select.append('<option value="' + id + '">' + response.data[id] + '</option>');
                }
                this.select.val(this.select.find("option:first").val()).trigger('change');
            }
        }, this));
    };
    scope.NextendElementDribbbleProjects = NextendElementDribbbleProjects;
})
(n2, window);
