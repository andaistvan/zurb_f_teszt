
(function ($, scope, undefined) {

    var matchesSelector = (function (ElementPrototype) {
        var fn = ElementPrototype.matches ||
            ElementPrototype.webkitMatchesSelector ||
            ElementPrototype.mozMatchesSelector ||
            ElementPrototype.msMatchesSelector;

        return function (element, selector) {
            return fn.call(element, selector);
        };

    })(Element.prototype);

    function Parallax(slider, parameters) {
        this.ticking = false;
        this.active = false;
        this.mouseOrigin = false;
        this.slide = null;
        this._scrollCallback = false;
        this.parameters = $.extend({
            mode: 'scroll', // mouse||scroll||mouse-scroll
            origin: 'slider', // slider||enter
            is3D: false,
            animate: true,
            scrollmove: 'both'
        }, parameters);

        this.x = this.y = 0;

        this.levels = {
            1: .01,
            2: .02,
            3: .05,
            4: .1,
            5: .2,
            6: .3,
            7: .4,
            8: .5,
            9: .6,
            10: .7
        };

        if (this.parameters.is3D) {
            this.rotationX = this.rotationY = 0;
            this.levelsDeg = {
                1: 2,
                2: 6,
                3: 10,
                4: 15,
                5: 20,
                6: 25,
                7: 30,
                8: 35,
                9: 40,
                10: 45
            };
        }

        if (this.parameters.animate) {
            this.render = this.animateRender;
        }

        this.window = $(window);
        this.slider = slider;
        this.sliderElement = slider.sliderElement;
    };

    Parallax.prototype.resize = function () {
        var offset = this.sliderElement.offset(),
            sliderSize = this.slider.responsive.responsiveDimensions;


        this.w2 = sliderSize.width / 2;
        this.h2 = sliderSize.height / 2;
        this.sliderOrigin = {
            x: offset.left + this.w2,
            y: offset.top + this.h2
        };


        if (this.parameters.origin == 'slider') {
            this.mouseOrigin = this.sliderOrigin;
        }

    };

    Parallax.prototype.enable = function () {
        this.active = true;
        this.resize();
        this.sliderElement.on({
            'SliderResize.n2-ss-parallax': $.proxy(this.resize, this)
        });

        var x = -1,
            y = -1;
        this.mouseX = false;
        this.mouseY = false;
        this.scrollY = false;

        switch (this.parameters.horizontal) {
            case 'mouse':
                this.mouseX = true;
                break;
            case 'mouse-invert':
                this.mouseX = true;
                x = 1;
                break;
        }

        switch (this.parameters.vertical) {
            case 'mouse':
                this.mouseY = true;
                break;
            case 'mouse-invert':
                this.mouseY = true;
                y = 1;
                break;
            case 'scroll':
                this.scrollY = true;
                y = 1;
                break;
            case 'scroll-invert':
                this.scrollY = true;
                y = -1;
                break;
        }

        if (this.mouseX || this.mouseY) {
            this.sliderElement.on({
                'mouseenter.n2-ss-parallax': $.proxy(this.mouseEnter, this),
                'mousemove.n2-ss-parallax': $.proxy(this.mouseMove, this, x, y),
                'mouseleave.n2-ss-parallax': $.proxy(this.mouseLeave, this, x, y)
            });
            if (matchesSelector(this.sliderElement[0], ':hover')) {
                this.mouseEnter(false);
            }

        }

        if (this.scrollY) {
            var min = -1,
                max = 1;
            switch (this.parameters.scrollmove) {
                case 'bottom':
                    if (y > 0) {
                        max = 0;
                    } else {
                        min = 0;
                    }
                    break;
                case 'top':
                    if (y > 0) {
                        min = 0;
                    } else {
                        max = 0;
                    }
                    break;
            }
            this._scrollCallback = $.proxy(this.scroll, this, y, min, max);
            this.window.on({
                'scroll.n2-ss-parallax': this._scrollCallback,
                'resize.n2-ss-parallax': this._scrollCallback
            });
        }
    };

    Parallax.prototype.disable = function () {
        this.sliderElement.off('.n2-ss-parallax');
        this.window.off('scroll.n2-ss-parallax', this._scrollCallback);
        this.window.off('resize.n2-ss-parallax', this._scrollCallback);
        this.active = false;
    };

    Parallax.prototype.start = function (slide) {
        if (this.slide !== null) {
            this.end();
        }
        if (slide.$parallax.length) {
            this.slide = slide;
            if (!this.active) {
                this.enable();
            }
            if (this._scrollCallback) {
                this._scrollCallback();
            }
        } else if (this.active) {
            this.disable();
        }
    };

    Parallax.prototype.end = function () {
        switch (this.parameters.mode) {
            case 'mouse-scroll':
                this.mouseLeave(true, false);
                break;
            case 'scroll':
                break;
            default:
                this.mouseLeave(true, true);
        }
        this.slide = null;
    };

    Parallax.prototype.mouseEnter = function (e) {
        if (!this.ticking) {
            NextendTween.ticker.addEventListener("tick", this.tick, this);
            this.ticking = true;
            if (e && this.parameters.origin == 'enter') {
                this.mouseOrigin = {
                    x: e.pageX,
                    y: e.pageY
                };
            }
        }
    };

    Parallax.prototype.mouseMove = function (x, y, e) {
        if (this.mouseOrigin === false) {
            this.mouseOrigin = this.sliderOrigin;
        }
        if (this.mouseX) {
            this.x = x * (e.pageX - this.mouseOrigin.x);
            if (this.parameters.is3D) {
                this.rotationY = -this.x / this.w2;
            }
        }
        if (this.mouseY) {
            this.y = y * (e.pageY - this.mouseOrigin.y);
            if (this.parameters.is3D) {
                this.rotationX = this.y / this.h2;
            }
        }
    };

    Parallax.prototype.mouseLeave = function () {
        if (this.ticking) {
            NextendTween.ticker.removeEventListener("tick", this.tick, this);
            this.ticking = false;
        }
        var props = {};
        if (this.mouseX) {
            props.x = 0;
        }
        if (this.mouseY) {
            props.y = 0;
        }
        if (this.parameters.is3D) {
            props.rotationX = props.rotationY = 0;
        }
        NextendTween.to(this.slide.$parallax, 2, props);
        this.mouseOrigin = this.sliderOrigin;
    };

    Parallax.prototype.scroll = function (y, min, max) {
        var wh = this.window.height(),
            top = this.window.scrollTop();

        if (top < this.sliderOrigin.y + this.h2 && top + wh > this.sliderOrigin.y - this.h2) {
            this.y = Math.max(min, Math.min(max, -1 + 2 * (this.sliderOrigin.y - (top - this.h2)) / (wh + this.h2 * 2)));

            if (this.sliderOrigin.y < wh) {
                this.y = Math.min(0, this.y);
            }

            this.y *= -y * this.h2 * 4;

            if (this.parameters.is3D) {
                this.rotationX = this.y / this.h2;
            }

            this.draw(false, true);
        }
    };

    Parallax.prototype.draw = function (x, y) {
        if (this.slide) {
            var $layers = this.slide.$parallax;
            for (var i = 0; i < $layers.length; i++) {
                var depth = $layers.eq(i).data('parallax'),
                    modifier = this.levels[depth],
                    props = {};
                if (this.parameters.is3D) {
                    var modified3D = this.levelsDeg[depth];
                    props.rotationX = this.rotationX * modified3D;
                    props.rotationY = this.rotationY * modified3D;
                }
                props.x = this.x * modifier;
                props.y = this.y * modifier;
                this.render($layers[i], props);
            }
        }
    };

    Parallax.prototype.render = function (layer, props) {
        NextendTween.set(layer, props);
    };

    Parallax.prototype.animateRender = function (layer, props) {
        NextendTween.to(layer, 0.6, props);
    };

    Parallax.prototype.tick = function () {
        this.draw(this.mouseX, this.mouseY);
    };

    scope.NextendSmartSliderLayerParallax = Parallax;
})(n2, window);
