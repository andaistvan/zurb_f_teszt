
(function ($, scope) {

    function NextendSmartSliderLicense(hasKey, maybeActive, ajaxUrl) {
        nextend.smartSlider.license = this;
        this.addLicenseModal = false;
        this.hasKey = hasKey;
        this.maybeActive = maybeActive;
        this.ajaxUrl = ajaxUrl;

        this.boxAddLicense = $('.n2-box-add-license');
        this.boxDeAuthorize = $('.n2-box-license-activated');

        window.addLicense = $.proxy(this.addLicense, this);
        window.checkLicense = $.proxy(this.checkLicense, this);
    }

    NextendSmartSliderLicense.prototype.checkLicense = function (cacheAccepted, verbose) {
        return NextendAjaxHelper.ajax({
            type: "POST",
            url: NextendAjaxHelper.makeAjaxUrl(this.ajaxUrl, {
                nextendaction: 'check',
                cacheAccepted: cacheAccepted + 0,
                verbose: verbose + 0
            }),
            dataType: 'json'
        });
    };

    NextendSmartSliderLicense.prototype.addLicense = function () {
        this._deferred = $.Deferred();
        if (!this.addLicenseModal) {
            var that = this,
                resolved = false;
            this.addLicenseModal = new NextendModal({
                zero: {
                    size: [
                        500, 230
                    ],
                    title: n2_('Add license'),
                    back: false,
                    close: true,
                    content: '<form class="n2-form"></form>',
                    controls: [
                        '<a href="#" class="n2-button n2-button-big n2-button-green n2-uc n2-h4">' + n2_('Authorize') + '</a>'
                    ],
                    fn: {
                        show: function () {
                            resolved = false;

                            var button = this.controls.find('.n2-button-green'),
                                form = this.content.find('.n2-form').on('submit', function (e) {
                                    e.preventDefault();
                                    button.trigger('click');
                                });

                            form.append(this.createInput(n2_('License key') + ' - <a style="font-size:11px;" href="http://secure.nextendweb.com/" target="_blank">' + n2_('Forgot your license key?') + '</a>', 'license-key', 'width: 440px;'));


                            var key = $('#license-key').val('').focus();

                            button.on('click', $.proxy(function (e) {

                                NextendAjaxHelper.ajax({
                                    type: "POST",
                                    url: NextendAjaxHelper.makeAjaxUrl(that.ajaxUrl, {
                                        nextendaction: 'add'
                                    }),
                                    data: {
                                        licenseKey: key.val().replace(/\s/g, "")
                                    },
                                    dataType: 'json'
                                }).done($.proxy(function (response) {
                                    if (response.data.valid) {
                                        that.boxAddLicense.addClass('n2-ss-license-has-active-key');
                                        that.boxDeAuthorize.removeClass('n2-ss-license-no-active-key').find('code').html('License code valid');
                                        that.hasKey = true;
                                        that.maybeActive = true;
                                        resolved = true;
                                        this.hide(e);
                                        that._deferred.resolve();
                                        nextend.notificationCenter.notice('Smart Slider 3 activated!');
                                    }
                                }, this));

                            }, this));
                        },
                        hide: function () {
                            if (!resolved && that._deferred.state() == 'pending') {
                                that._deferred.reject();
                            }
                        }
                    }
                }
            });
        }
        this.addLicenseModal.show();
        return this._deferred;
    }

    NextendSmartSliderLicense.prototype.isActiveAsync = function () {
        var deferred = $.Deferred(),
            _addLicense = $.proxy(function () {
                this.addLicense().done(function () {
                    deferred.resolve();
                }).fail(function () {
                    deferred.reject();
                });
            }, this);
        if (this.hasKey) {
            if (this.maybeActive) {
                deferred.resolve();
            } else {
                this.checkLicense(true, false).done(function () {
                    deferred.resolve();
                }).fail(function () {
                    _addLicense();
                });
            }
        } else {
            _addLicense();
        }
        deferred.fail($.proxy(function () {
            this.maybeActive = false;
        }, this));
        return deferred;
    }
    scope.NextendSmartSliderLicense = NextendSmartSliderLicense;
})(n2, window);
