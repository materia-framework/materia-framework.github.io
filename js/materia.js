if (typeof (jQuery) === 'undefined') {
    var jQuery;

    if (typeof (require) === 'function') {
        jQuery = $ = require('jquery');

    } else {
        jQuery = $;
    }
};

(function (factory) {
    if (typeof exports === "object") {
        factory(require("jquery"));
    } else if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    $.extend({
        bez: function (encodedFuncName, coOrdArray) {
            if ($.isArray(encodedFuncName)) {
                coOrdArray = encodedFuncName;
                encodedFuncName = 'bez_' + coOrdArray.join('_').replace(/\./g, 'p');
            }
            if (typeof $.easing[encodedFuncName] !== "function") {
                var polyBez = function (p1, p2) {
                    var A = [null, null],
                        B = [null, null],
                        C = [null, null],
                        bezCoOrd = function (t, ax) {
                            C[ax] = 3 * p1[ax], B[ax] = 3 * (p2[ax] - p1[ax]) - C[ax], A[ax] = 1 - C[ax] - B[ax];
                            return t * (C[ax] + t * (B[ax] + t * A[ax]));
                        },
                        xDeriv = function (t) {
                            return C[0] + t * (2 * B[0] + 3 * A[0] * t);
                        },
                        xForT = function (t) {
                            var x = t,
                                i = 0,
                                z;
                            while (++i < 14) {
                                z = bezCoOrd(x, 0) - t;
                                if (Math.abs(z) < 1e-3) break;
                                x -= z / xDeriv(x);
                            }
                            return x;
                        };
                    return function (t) {
                        return bezCoOrd(xForT(t), 1);
                    }
                };
                $.easing[encodedFuncName] = function (x, t, b, c, d) {
                    return c * polyBez([coOrdArray[0], coOrdArray[1]], [coOrdArray[2], coOrdArray[3]])(t / d) + b;
                }
            }
            return encodedFuncName;
        }
    });
}));

(function ($) {

    /* Constants & defaults. */
    var DATA_COLOR = 'data-ab-color';
    var DATA_PARENT = 'data-ab-parent';
    var DATA_CSS_BG = 'data-ab-css-background';
    var EVENT_CF = 'ab-color-found';

    var DEFAULTS = {
        selector: '[data-adaptive-background]',
        parent: null,
        exclude: ['rgb(0,0,0)', 'rgb(255,255,255)'],
        normalizeTextColor: false,
        normalizedTextColors: {
            light: "#fff",
            dark: "#000"
        },
        lumaClasses: {
            light: "ab-light",
            dark: "ab-dark"
        },
        transparent: null
    };

    // Include RGBaster - https://github.com/briangonzalez/rgbaster.js
    /* jshint ignore:start */
    ! function (n, t) {
        "use strict";
        var e = function (n, t) {
                var e = document.createElement("canvas");
                return e.setAttribute("width", n), e.setAttribute("height", t), e.getContext("2d")
            },
            r = function (n, t) {
                var r = new Image,
                    i = n.src || n;
                "data:" !== i.substring(0, 5) && (r.crossOrigin = "Anonymous"), r.onload = function () {
                    var n = e(r.width, r.height);
                    n.drawImage(r, 0, 0);
                    var i = n.getImageData(0, 0, r.width, r.height);
                    t && t(i.data)
                }, r.src = i
            },
            i = function (n) {
                return ["rgb(", n, ")"].join("")
            },
            a = function (n) {
                var t = [];
                for (var e in n) t.push(o(e, n[e]));
                return t.sort(function (n, t) {
                    return t.count - n.count
                }), t
            },
            u = function (n, t) {
                if (n.length > t) return n.slice(0, t);
                for (var e = n.length - 1; t - 1 > e; e++) n.push(o("0,0,0", 0));
                return n
            },
            o = function (n, t) {
                return {
                    name: i(n),
                    count: t
                }
            },
            c = 10,
            s = {};
        s.colors = function (n, e) {
            e = e || {};
            var o = e.exclude || [],
                s = e.paletteSize || c;
            r(n, function (n) {
                for (var r = {}, c = "", f = [], d = 0; d < n.length; d += 4) f[0] = n[d], f[1] = n[d + 1], f[2] = n[d + 2], c = f.join(","), -1 === f.indexOf(t) && 0 !== n[d + 3] && -1 === o.indexOf(i(c)) && (r[c] = c in r ? r[c] + 1 : 1);
                if (e.success) {
                    var g = u(a(r), s + 1);
                    e.success({
                        dominant: g[0].name,
                        secondary: g[1].name,
                        palette: g.map(function (n) {
                            return n.name
                        }).slice(1)
                    })
                }
            })
        }, n.RGBaster = n.RGBaster || s
    }(window);
    /* jshint ignore:end */


    /*
      Our main function declaration.
    */
    $.adaptiveBackground = {
        run: function (options) {
            var opts = $.extend({}, DEFAULTS, options);

            /* Loop over each element, waiting for it to load
               then finding its color, and triggering the
               color found event when color has been found.
            */
            $(opts.selector).each(function (index, el) {
                var $this = $(this);

                /*  Small helper functions which applies
                    colors, attrs, triggers events, etc.
                */
                var handleColors = function () {
                    if ($this[0].tagName == 'PICTURE') {
                        var images = $this[0].children;
                        for (var image in images) {
                            if (images[image].tagName == 'IMG') {
                                var img = images[image];
                                break;
                            }
                        };
                        if (img.currentSrc) {
                            img = img.currentSrc;
                        };
                    } else {
                        var img = useCSSBackground() ? getCSSBackground() : $this[0];
                    }

                    RGBaster.colors(img, {
                        paletteSize: 20,
                        exclude: opts.exclude,
                        success: function (colors) {
                            $this.attr(DATA_COLOR, colors.dominant);
                            $this.trigger(EVENT_CF, {
                                color: colors.dominant,
                                palette: colors.palette
                            });
                        }
                    });

                };

                var useCSSBackground = function () {
                    var attr = $this.attr(DATA_CSS_BG);
                    return (typeof attr !== typeof undefined && attr !== false);
                };

                var getCSSBackground = function () {
                    var str = $this.css('background-image');
                    var regex = /\(([^)]+)\)/;
                    var match = regex.exec(str)[1].replace(/"/g, '')
                    return match;
                };

                /* Subscribe to our color-found event. */
                $this.on(EVENT_CF, function (ev, data) {

                    // Try to find the parent.
                    var $parent;
                    if (opts.parent && $this.parents(opts.parent).length) {
                        $parent = $this.parents(opts.parent);
                    } else if ($this.attr(DATA_PARENT) && $this.parents($this.attr(DATA_PARENT)).length) {
                        $parent = $this.parents($this.attr(DATA_PARENT));
                    } else if (useCSSBackground()) {
                        $parent = $this;
                    } else if (opts.parent) {
                        $parent = $this.parents(opts.parent);
                    } else {
                        $parent = $this.parent();
                    }
                    if ($.isNumeric(opts.transparent) && opts.transparent != null && opts.transparent >= 0.01 && opts.transparent <= 0.99) {
                        var dominantColor = data.color;
                        var rgbToRgba = dominantColor.replace("rgb", "rgba");
                        var transparentColor = rgbToRgba.replace(")", ", " + opts.transparent + ")");
                        $parent.css({
                            backgroundColor: transparentColor
                        });
                    } else {
                        $parent.css({
                            backgroundColor: data.color
                        });
                    }

                    // Helper function to calculate yiq - http://en.wikipedia.org/wiki/YIQ
                    var getYIQ = function (color) {
                        var rgb = color.match(/\d+/g);
                        return ((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000;
                    };

                    var getNormalizedTextColor = function (color) {
                        return getYIQ(color) >= 128 ? opts.normalizedTextColors.dark : opts.normalizedTextColors.light;
                    };

                    var getLumaClass = function (color) {
                        return getYIQ(color) <= 128 ? opts.lumaClasses.dark : opts.lumaClasses.light;
                    };

                    // Normalize the text color based on luminance.
                    if (opts.normalizeTextColor)
                        $parent.css({
                            color: getNormalizedTextColor(data.color)
                        });

                    // Add a class based on luminance.
                    $parent.addClass(getLumaClass(data.color))
                        .attr('data-ab-yaq', getYIQ(data.color));

                    opts.success && opts.success($this, data);
                });

                /* Handle the colors. */
                handleColors();

            });
        }
    };

})(jQuery);

$.fn.disable = function () {
    var input = $(this),
        container = input.closest(".mtr-input-container");

    container.addClass("mtr-disabled");
    input.attr('disabled', 'disabled');
}

$.fn.enable = function () {
    var input = $(this),
        container = input.closest(".mtr-input-container");

    container.removeClass("mtr-disabled");
    input.removeAttr('disabled');
}

$.extend($.expr[':'], {
    'off-top': function (el) {
        return $(el).offset().top < $(window).height();
    },
    'off-right': function (el) {
        return $(el).offset().left + $(el).outerWidth() > $(window).width();
    },
    'off-bottom': function (el) {
        return $(el).offset().top + $(el).outerHeight() > $(window).height();
    },
    'off-left': function (el) {
        return $(el).offset().left < $(window).width();
    },
    'off-screen': function (el) {
        return $(el).is(':off-top, :off-right, :off-bottom, :off-left');
    }
});

document.write('<style type="text/css">body{visibility:hidden}</style>');

/*Materia(options)  {
	var options = {
		rippleElements: ".ripple, .mtr-button:not(.no-ripple), .mtr-list-item:not(.no-ripple), .mtr-tab:not(.no-ripple), .mtr-menu-item:not(.no-ripple)"
	}
	return options;
}

new Materia({
	rippleElements: "hello"
});*/

//console.log(Materia.rippleElements);
/*
(function() {
	
	this.Materia = function() {
		
		var defaults = {
			rippleElements: ".ripple, .mtr-button:not(.no-ripple), .mtr-list-item:not(.no-ripple), .mtr-tab:not(.no-ripple), .mtr-menu-item:not(.no-ripple)"
		}
		
		if (arguments[0] && typeof arguments[0] === "object") {
		  this.options = extendDefaults(defaults, arguments[0]);
		}
	}
	
	function extendDefaults(source, properties) {
		var property;
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}
		return source;
	}	
	
}());

var mtrInit = new Materia({});

console.log( Materia( {rippleElements} ) );
*/
(function () {

    window.Materia = {};

    Materia.randomID = (function () {
        var string = "",
            charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < 16; i++) {
            var random = Math.floor(Math.random() * charSet.length);
            string += charSet.substring(random, random + 1);
        }

        return string;
    });

}());

function cssToMs(inputString) {
    var inputString,
        time,
        output;

    time = parseFloat(inputString);

    if (inputString === undefined || inputString === null) {
        inputString = "0ms";
        time = 0;
    }

    if (inputString.indexOf("ms") >= 0) { // css milisecond
        time = time;
    } else { // css second
        time *= 1000;
    }

    return time;

}

//console.log( Materia.randomID() );

function mtrCompile(string) {
    var string = $(string);

    string.find("div.not").addBack().addClass("hey");

    string = $(string);

    return string;

}

(function ($) {

	var $log = console.log.bind(console);

    /*Modernizr's Code*/
    function detectTransitionPrefix() {
        var t;
        var el = document.createElement('dummyfakeelementtofindprefix');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        }

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }

    function detectAnimationPrefix() {
        var t,
            el = document.createElement("dummyfakeelementtofindprefix");

        var animations = {
            "animation": "animationend",
            "OAnimation": "oAnimationEnd",
            "MozAnimation": "animationend",
            "WebkitAnimation": "webkitAnimationEnd"
        }

        for (t in animations) {
            if (el.style[t] !== undefined) {
                return animations[t];
            }
        }
    }

    $.fn.progressCircular = function () {
        var target = $(this),
            inner =
            "<svg viewBox='0 0 28 28'>" +
            "<path/>" +
            "</svg>";

        target.addClass("mtr-progress-circular");

        target.html(inner);
    }

    function progressCircular() {
        var $div = $("<div></div>");

        $div.progressCircular();

        return $div;
    }

    $(document).ready(function () {

        var transitionPrefix = detectTransitionPrefix(),
            animationPrefix = detectAnimationPrefix();

        function mtrInit() {
            //$(".mtr-button:not(.no-ripple)").addClass("ripple");
            $(".mtr-menu").detach().appendTo("body");
            $(".mtr-dialog").addClass("hide");
        }

        mtrInit();
        checkLockSideNav();
        //helperTextInit();
        //$.adaptiveBackground.run();
        //tabInit();

        Materia.rippleElements = ".ripple, .mtr-button:not(.no-ripple), .mtr-list-item:not(.no-ripple), .mtr-tab:not(.no-ripple), .mtr-menu-item:not(.no-ripple), .mtr-sortable-cell:not(.no-ripple)";
		
        $(document).on("mousedown", Materia.rippleElements, function (ripple) {

            var target = $(this);

            // create .ink element if it doesn't exist
            /*if (target.find(".ripple-container").length == 0) {
                target.prepend("<div class='ripple-container'></div>");
            }*/
            var $ripple = $("<div class='ripple-container'/>")
            target.prepend($ripple);

            var ripple = $ripple;

            // in case of quick double clicks stop the previous animation
            ripple.removeClass("animate");

            // set size of .ink
            if (!ripple.height() && !ripple.width()) {
                // use surface's width or height whichever is larger for
                // the diameter to make a circle which can cover the entire element
                var d = Math.max(target.outerWidth(), target.outerHeight());
                ripple.css({
                    height: d,
                    width: d
                });
            }

            // get click coordinates
            // Logic:
            // click coordinates relative to page minus
            // surface's position relative to page minus
            // half of self height/width to make it controllable from the center
            var x = event.pageX - target.offset().left - (ripple.width() / 2);
            var y = event.pageY - target.offset().top - (ripple.height() / 2);

            var rippleColor = target.data("ripple-color");

            //set the position and add class .animate
            ripple.css({
                top: y + 'px',
                left: x + 'px',
                background: rippleColor
            }).addClass("expand-ripple");

            var animationDuration = cssToMs(ripple.css("animationDuration"));

            /*ripple.one(animationPrefix, function (event) {
            ripple.remove();
        });*/

            setTimeout(function () {
                ripple.remove();
            }, animationDuration);

        });

        $.fn.openNav = function () {
            var sideNav = $(this);
            sideNav.removeClass("hide");

            $(".mtr-sidenav.is-opened").removeClass("is-opened"); //close all other active sidenav

            sideNav.css("zIndex");
            sideNav.addClass("is-opened");

            if ($(".mtr-scrim.sidenav-scrim.active").length == 0) {
                var $scrim = $("<div class='mtr-scrim sidenav-scrim'></div>");

                $("body").prepend($scrim);
                var zSpace = sideNav.css("zIndex");
                $scrim.css({
                    zIndex: zSpace - 1
                });

                $scrim.addClass("active");

                $scrim.click(function () {
                    $(".mtr-sidenav.is-opened").closeNav();
                });
            } else {}

            return this;
        };

        $.fn.closeNav = function () {
            var sideNav = $(this);

            sideNav.removeClass("is-opened");

            sideNav.one(transitionPrefix, function () {
                sideNav.addClass("hide");
            });

            var $scrim = $("body").find(".mtr-scrim.sidenav-scrim");

            $scrim.removeClass("active");

            $scrim.on(transitionPrefix, function () {
                $scrim.remove();
            });

            return this;

        }

        $(document).on("click", ".open-nav", function () {
            var sideNav = $(this).data("sidenav");
            if ($(sideNav).hasClass('locked-open') === false) {
                $(sideNav).openNav();
            }
        });

        $(document).on("click", ".close-nav", function () {
            var sideNav = $(this).data("sidenav");
            $(sideNav).closeNav();
        });

        function checkLockSideNav() {
            $(".mtr-sidenav.per-to-tmp[data-permanent-on]").each(function () {
                var sideNav = $(this),
                    lockOn = parseFloat(sideNav.data("permanent-on"));

                if ($(window).width() >= lockOn) {
                    sideNav.removeClass("hide");
                    sideNav.css("zIndex");
                    sideNav.addClass("locked-open");
                    sideNav.removeClass("is-opened");

                    var $scrim = $("body").find(".mtr-scrim.sidenav-scrim");

                    if ($(".mtr-sidenav.is-opened").length === 0) {
                        $scrim.remove();
                    }

                    $(window).one("resize", function () {
                        if ($(window).width() < lockOn) {
                            sideNav.addClass("hide");
                        }
                    });
                } else {
                    sideNav.removeClass("locked-open");

                }

            });
        }

        // Dialog
        $.fn.openDialog = function () {
            var dialog = $(this);
            dialog.removeClass("hide");

            $(".mtr-dialog.mtr-active").closeDialog();

            dialogCard.css("zIndex");
            dialogCard.addClass("mtr-active");

            dialog.find(".cancel-action").click(function (e) {
                dialog.closeDialog();
            });

            dialog.find(".ok-action").click(function (e) {
                dialog.closeDialog();
            });

            if ($(".mtr-scrim.dialog-scrim.active").length == 0) {
                var $scrim = $("<div class='mtr-scrim dialog-scrim'></div>");

                $("body").prepend($scrim);
                var zSpace = dialog.css("zIndex");
                $scrim.css({
                    zIndex: zSpace - 1
                });

                $scrim.addClass("active");

                if (dialog.attr("close-by-outside") === "false") {

                } else {
                    $scrim.click(function (e) {
                        dialog.closeDialog();
                    });
                }

            } else {}

            return this;
        };

        $.fn.closeDialog = function () {
            var dialog = $(this);

            dialog.removeClass("mtr-active");

            if (dialog.hasClass("mtr-prompt") === true) {
                var val = dialog.find("input").val();

                dialog.find("input").val("");

                dialog.find("input").change();
            }

            dialog.one(transitionPrefix, function () {
                dialog.addClass("hide");
            });

            var $scrim = $("body").find(".mtr-scrim.dialog-scrim");

            if ($(".mtr-dialog.mtr-active").length == 0) {

                $scrim.removeClass("active");

                $scrim.one(transitionPrefix, function () {
                    $scrim.remove();
                });
            }

            return this;
        }

        $(document).on("click", ".open-dialog", function () {
            var dialog = $(this).data("dialog");
            $(dialog).openDialog();
        });

        $(document).on("click", ".close-dialog", function () {
            var dialog = $(this).data("dialog");
            $(dialog).closeDialog();
        });

        //Menu

        $(document).on("click", ".open-menu", function () {
            var menu = $(this).data("menu");
            $(menu).openMenu($(this));
        });

        $(document).on("click", ".close-menu", function () {
            var menu = $(this).data("menu");
            $(menu).closeMenu();
        });

        $.fn.openMenu = function (target) {
            var menu = $(this),
                menuIndex = menu.css("zIndex"),
                menuWidth = menu.outerWidth(),
                menuHeight = menu.outerHeight(),

                target,
                targetWidth = target.outerWidth(),
                targetHeight = target.outerHeight(),

                targetPosX = target.offset().left,
                targetPosY = target.offset().top;

            menu.css({
                left: 0,
                top: 0
            });

            menu.css({
                left: targetPosX,
                top: targetPosY,
            });

            var oX = "left ",
                oY = "top";

            if (menu.is(':off-right')) {
                oX = "right ";

                menu.css({
                    left: targetPosX - menuWidth + targetWidth,
                    transformOrigin: oX + oY
                });
            } else {
                oX = "left ";
            }

            //console.log(menuHeight);

            if (menu.is(':off-bottom')) {

                oY = "bottom";

                menu.css({
                    top: targetPosY - menuHeight + targetHeight,
                    transformOrigin: oX + oY
                });
            } else {
                oY = "top";
            }

            /*if( menu.is(':off-top') ) {

            	oY = "top";
		
            	menu.css({
            		top : targetPosY,
            		transformOrigin: oX + oY
            	});
            	
            	console.log("hey");
            } else {}*/


            /*if( menu.is(':off-bottom') && menu.is(':off-top') ) {
            	menu.addClass("mtr-menu-full-height");
            } else {
            	menu.removeClass("mtr-menu-full-height");
            }*/

            menu.addClass("mtr-active");

            var menuItem = menu.find(".mtr-menu-item");

            menuItem.click(function () {
                menu.closeMenu();
            });

            if ($(".mtr-scrim.menu-scrim").length == 0) {

                var $scrim = $("<div class='mtr-scrim menu-scrim'></div>");

                $scrim.css({
                    zIndex: menuIndex - 1
                });

                $("body").prepend($scrim);

                $scrim.click(function () {
                    $(".mtr-menu.mtr-active").closeMenu();
                });

            }

            return this;

            //console.log(targetPosX, targetPosY);
        };

        $.fn.closeMenu = function () {
            var menu = $(this);

            menu.removeClass("mtr-active");

            menu.one(transitionPrefix, function () {

            });

            var $scrim = $("body").find(".mtr-scrim.menu-scrim");
            $scrim.remove();

            return this;
        }

        $.fn.tooltip = function () {
            var target = $(this).parent(),
                tooltip = $(this),
                margin = 10;

            tooltip.detach().appendTo("body");

            target.hover(function () {

                var targetPosX = target.offset().left,
                    targetPosY = target.offset().top,

                    targetWidth = target.outerWidth(),
                    targetHeight = target.outerHeight(),

                    tooltipWidth = tooltip.outerWidth();
                tooltipHeight = tooltip.outerHeight();

                var offset = tooltip.data("direction");

                switch (offset) {
                    default: tooltip.css({
                        top: targetPosY + targetHeight + margin,
                        left: targetPosX - (tooltipWidth / 2) + (targetWidth / 2),
                        transitionOrigin: "center top"
                    });
					tooltip.addClass("from-bottom");
                    break;

                    case "bottom":
                        tooltip.css({
								top: targetPosY + targetHeight + margin,
								left: targetPosX - (tooltipWidth / 2) + (targetWidth / 2),
								transitionOrigin: "center top"
						});
							
						tooltip.addClass("from-bottom");
                        break;

                    case "top":
                        tooltip.css({
                            top: targetPosY - targetHeight + ( tooltipHeight / 2 ) - margin,
                            left: targetPosX - (tooltipWidth / 2) + (targetWidth / 2),
                            transitionOrigin: "center bottom"
                        });
						tooltip.addClass("from-top");
                        break;

                    /*case "left":
                        tooltip.css({
                            top: targetPosY - (tooltipHeight / 2) + (targetHeight / 2),
                            left: targetPosX - targetWidth / 2 - (tooltipWidth / 2) - margin * 2,
                            transitionOrigin: "right center"
                        });
						tooltip.addClass("from-left");
                        break;

                    case "right":
                            tooltip.css({
                            top: targetPosY - (tooltipHeight / 2) + (targetHeight / 2),
                            left: targetPosX + targetWidth + margin * 2,
                            transitionOrigin: "left center"
                        });
						tooltip.addClass("from-right");
                        break;
					*/
                }

                tooltip.addClass("mtr-active");
            }, function () {
                tooltip.removeClass("mtr-active");
            });
        }

        $(".mtr-tooltip").each(function () {
            $(this).tooltip();
        });

        $(".mtr-waterfall-toolbar").each(function () {
            var toolbar = $(this),
                content = toolbar.data("waterfall");

            $(content).scroll(function () {
                var contentScroll = $(content).scrollTop();
                if (contentScroll > 0) {
                    toolbar.addClass("lifted");
                } else {
                    toolbar.removeClass("lifted");
                }
            });
        });

        $(document).on("click", ".mtr-chip .mtr-delete-chip", function () {
            var btn = $(this),
                chip = btn.closest(".mtr-chip");

            chip.remove();
        });

        $(document).on("propertychange change click keydown input paste", ".mtr-input-container .mtr-input", function () {
            var input = $(this),
                container = input.closest(".mtr-input-container"),
                noFloatLabel = container.find("label.no-float");

            if (input.is("textarea")) {
                growText(input);
            }

            if (input.val() !== "") {
                container.addClass("mtr-has-value");
                noFloatLabel.hide();
            } else {
                container.removeClass("mtr-has-value");
                noFloatLabel.show();
            }
        });
		
		$.fn.inputCounter = function () {
            var input = $(this),
				inputMaxLength = input.attr("maxLength"),
				intputValChars = input.val().length,
                container = input.closest(".mtr-input-container"),
				counter = container.find(".mtr-input-counter"),
                counterHTML = $("<div class='mtr-input-counter'>0/0</div>");

			if ( counter.length === 0 ) {
				counterHTML.appendTo(container);
				counter = container.find(".mtr-input-counter");
			}
			
			counter.html(intputValChars + '/' + inputMaxLength);
		}

		$(".mtr-input-container .mtr-input[mtr-has-counter]").each(function () {
			$(this).inputCounter();
		});
		
		$.fn.inputReveal = function () {
            var input = $(this),
                container = input.closest(".mtr-input-container"),
				revealIconHTML = $("<i class='mdi mtr-input-reveal-btn'>visibility_off</i>"),
				revealIcon = container.find(".mtr-input-reveal-btn");

			if ( input.prop("type") !== "password" ) {
				console.error("inputReveal should be only applied on password input.");
			}				
				
			container.addClass("mtr-revealable");		
			
			if (revealIcon.length === 0) {
				container.append(revealIconHTML);
				revealIcon = container.find(".mtr-input-reveal-btn");
			}
			
			revealIcon.mousedown(function () {
				revealIcon.html("visibility");
				input.prop("type", 'text');
			})
			.mouseup(function () {
				revealIcon.html("visibility_off");
				input.prop("type", 'password');
			});

		}		

		$(".mtr-input-container .mtr-input[mtr-revealable][type='password']").each(function () {
			$(this).inputReveal();
		});
		
        $(document).on("propertychange change click keydown input paste", ".mtr-input-container .mtr-input[mtr-has-counter]", function () {
			$(this).inputCounter();
        });

        $(document).on("focus", ".mtr-input-container .mtr-input", function () {
                var input = $(this),
                    container = input.closest(".mtr-input-container");

                container.addClass("mtr-focus");
                //console.log("Yay");
            })
            .on("blur", ".mtr-input-container .mtr-input", function () {
                var input = $(this),
                    container = input.closest(".mtr-input-container");

                container.removeClass("mtr-focus");
            });

        /*function helperTextInit() {
            var helperText = "<label class='mtr-helper-text'></label>";
            $(".mtr-input-container").append(helperText);
        }*/

        function growText(el) {
            var el;

            el.css({
                height: 'auto'
            });

            el.css({
                height: el.prop("scrollHeight") + 'px'
            });
        }

		//Dialogs
		
		$.extend({
			dialog: function (options) {
				
				var defaults = {
					type: 'alert',
					title: '',
					content: '',
					cancelButton: true,
					cancelText: 'Cancel',
					confirmText: 'Ok',
					label: 'Label',
					closeByOutside: true,
					scrollable: false,
					onClose: function (action) {}
				};
				
				var settings = $.extend( {}, defaults, options );

				return $(this).each(function() {
					
					var performedAction;
					
					var type = settings.type.trim(),
						title = settings.title.trim(),
						content = settings.content.trim(),
						closebyScrim = settings.closeByOutside,
						cancelText = settings.cancelText.trim(),
						okText = settings.confirmText.trim(),
						label = settings.label.trim();

					var dialogHTML =
					'<div class="mtr-dialog-wrapper">' +
						'<div class="mtr-dialog">' +
					
                            '<div class="mtr-dialog-header">' +
                                '<p class="mtr-dialog-title">' + title + '</p>' +
                            '</div>' +
							
                            '<div class="mtr-dialog-content">' +
								'<div>' + content + '</div>' +
                            '</div>' +
							
                            '<div class="mtr-dialog-actions">' +
                            '</div>' +
							
                        '</div>' + 
					'</div>';
						
					var dialog = $(dialogHTML),
						dialogCard = dialog.children().first(),
						dialogBody = dialog.find(".mtr-dialog-content"),
					    dialogActions = dialog.find(".mtr-dialog-actions");
						
					if (settings.scrollable === true) {
						dialogCard.addClass("mtr-dialog-scrollable");
					}	

					var cancelAction = 
						$("<button class='mtr-button cancel-action mtr-primary'>"+ cancelText +"</button>"),
						okAction = 
						$("<button class='mtr-button ok-action mtr-primary'>"+ okText +"</button>");

					var inputHTML = 
					'<div class="mtr-input-container full-width">' +
                        '<input type="text" class="mtr-input">' +
                        '<label>'+ label +'</label>' +

                        '<div class="mtr-input-border"></div>' +
                    '</div>',
						inputContainer = $(inputHTML),
						inputBox = inputContainer.find("input");						
						
					switch (type) {
						case 'alert':
							mtrDoAlert();
							break;
							
						case 'confirm':
							mtrDoConfirm();
							break;
							
						case 'prompt':
							mtrDoPrompt();
							break;
					}
							
					function mtrDoAlert() {
					}
					
					function mtrDoConfirm() {
						dialogActions.prepend(okAction);

						if (settings.cancelButton === true) {
							dialogActions.prepend(cancelAction);
						}
					}
					
					function mtrDoPrompt() {
						
						dialogActions.prepend(okAction);
						
						if (settings.cancelButton === true) {
							dialogActions.prepend(cancelAction);
						}

						dialogBody.append(inputContainer);
						
						inputBox.change().focus();
						
					}

					$("body").prepend(dialog);
					
					dialogCard.removeClass("hide");

					dialog.css("zIndex");
					dialogCard.addClass("mtr-active");	
					
					if ($(".mtr-scrim.dialog-scrim.active").length == 0) {
						
						var $scrim = $("<div class='mtr-scrim dialog-scrim'></div>");
						
						$("body").prepend($scrim);

						var zSpace = dialog.css("zIndex");
						
						$scrim.css({
							zIndex: zSpace - 1
						});
						
						$scrim.addClass("active");

					}			
					
					$scrim.click(function () {		
						if ( closebyScrim === true) {
							performedAction = 0;
							closeDialog();
						}
					});
					
					$(cancelAction).click(function () {
						performedAction = 2;
						closeDialog();
					});
					
					$(okAction).click(function () {
						if (type === "prompt") {
							var inputVal = inputBox.val();

							performedAction = inputVal;
						} else {
							performedAction = 1;
						}
						
						closeDialog();
					});
					
					function closeDialog() {
						
						dialogCard.removeClass("mtr-active");
							
						dialogCard.one(transitionPrefix, function () {
							dialogCard.addClass("hide");
							dialog.remove();
						});					
							
						$scrim.removeClass("active");
						$scrim.one(transitionPrefix, function () {
							$scrim.remove();
						});
						
						settings.onClose(performedAction);

					}
					
				});
			}
		});			
		
        $(document).on("click", ".mtr-tabs .mtr-tab", function () {
            var tab = $(this),
                tabWidth = tab.outerWidth(),
                tabPos = tab.position().left,
                tabContainer = tab.closest(".mtr-tabs"),
                tabsScrollLeft = tabContainer.scrollLeft(),
                tabIndicator = tabContainer.find(".mtr-tab-indicator"),
                otherTab = tabContainer.find(".mtr-tab").not(tab);

            var tabContent = tab.data("tab"),
                tabContentIndex = $(tabContent).index();
            tabContentWrap = $(tabContent).closest(".mtr-tab-contents");

            tab.addClass("mtr-active");
            otherTab.removeClass("mtr-active");

            tabIndicator.css({
                width: tabWidth + 'px',
                left: tabPos + tabsScrollLeft + 'px'
            });

            var amountToMove = -100 * tabContentIndex + '%';

            $(tabContentWrap).css({
                transform: "translate3d(" + amountToMove + ",0,0)",
            });
        });
        //$(".mtr-tabs .mtr-tab:first-of-type").click();

        $(".mtr-tabs").each(function () {

            var tabs = $(this);
            defaultTab = tabs.find(".mtr-tab[mtr-active-default]");

            if (defaultTab.length === 1) {
                defaultTab.click();
            } else {
                tabs.find(".mtr-tab:first-of-type").click();
            }

        });

        function tabIndicatorUpdate() {
            $(".mtr-tabs").each(function () {
                var tabContainer = $(this),
                    tabsScrollLeft = tabContainer.scrollLeft(),
                    tabIndicator = tabContainer.find(".mtr-tab-indicator"),
                    tab = tabContainer.find(".mtr-tab.mtr-active"),
                    tabWidth = tab.outerWidth(),
                    tabPos = tab.position().left;

                tabIndicator.css({
                    width: tabWidth + 'px',
                    left: tabPos + tabsScrollLeft + 'px'
                });
            });
        }

        $(document).on("click", ".mtr-bottomnav .mtr-bottomnav-item", function (event) {
            var item = $(this),
                container = item.closest(".mtr-bottomnav"),
                otherItem = container.find(".mtr-bottomnav-item").not(item),
                color = item.data("item-color");

            var itemContent = $(item.data("bottomnav")),
                contentWrap = itemContent.closest(".mtr-bottomnav-content-wrapper"),
                curContent = contentWrap.find(".mtr-bottomnav-content.mtr-active");

            if (item.hasClass("mtr-active") === true) {
                var time = itemContent.scrollTop();

                if (time < 260) {
                    time = 260;
                }

                if (time > 840) {
                    time = 840;
                }

                itemContent.animate({
                    scrollTop: 0
                }, time, $.bez([0.4, 0, 0.2, 1]));

            } else {
                item.addClass("mtr-active");
                itemContent.scrollTop(0);
            }

            curContent.removeClass("mtr-active");
            itemContent.addClass("mtr-active");

            container.css({
                backgroundColor: color
            });

            otherItem.removeClass("mtr-active");

        });

        $(".mtr-bottomnav").each(function () {

            var bottomNav = $(this);
            defaultNav = bottomNav.find(".mtr-bottomnav-item[mtr-active-default]");

            if (defaultNav.length === 1) {
                defaultNav.click();
            } else {
                bottomNav.find(".mtr-bottomnav-item:first-of-type").click();
            }

        });

        $(".mtr-expandable:not(.mtr-expanded) .mtr-expand-content").hide();

        $(".mtr-expandable.mtr-expanded .expand-icon").css({
            transform: 'rotate(180deg)'
        });

        $(document).on("click", ".mtr-expandable .expand-trigger", function () {
            var trigger = $(this),
                expandWrap = trigger.closest(".mtr-expandable"),
                icon = expandWrap.find(".expand-icon"),
				expandContent = expandWrap.find(".mtr-expand-content"),
                expandContentH = expandContent.height(),
                time = expandContentH;

            if (time < 360) {
                time = 360;
            } else if (time >= 840) {
                time = 840;
            }

            if (expandWrap.hasClass("mtr-expanded") === false) {

                expandWrap.addClass("mtr-expanded");

                expandContent.height(0).show();

                var curHeight = expandContent.height();

                expandContent.css('height', 'auto');

                var autoHeight = expandContent.height();

                expandContent
                    .height(curHeight)
                    .animate({
                        height: autoHeight
                    }, time, $.bez([0.4, 0, 0.2, 1]));

                icon.css({
                    transform: 'rotate(180deg)'
                });

            } else {

                expandWrap.removeClass("mtr-expanded");

                expandContent.animate({
                        height: 0
                    }, time, $.bez([0.4, 0, 0.2, 1]),
                    function () {
                        expandContent.hide();

                        expandContent.css({
                            height: 'auto'
                        });
                    });

                icon.css({
                    transform: 'rotate(0deg)'
                });
            }
        });

        $(document).on("click", ".mtr-speed-dial .mtr-speed-dial-trigger", function () {
            var trigger = $(this),
                speedDial = trigger.closest('.mtr-speed-dial');

            if (speedDial.hasClass("mtr-flinged") === false) {
                speedDial.addClass("mtr-flinged");

                speedDial.find(".mtr-speed-dial-actions .mtr-speed-dial-action").each(function (index) {
                    $(this).delay(index * 40).queue(function (next) {
                        $(this).addClass("mtr-active");
                        next();
                    });

                    $(this).click(function () {
                        speedDial.removeClass("mtr-flinged");
                        speedDial.find(".mtr-speed-dial-actions .mtr-speed-dial-action").each(function () {
                            $(this).removeClass("mtr-active");
                        });
                    });
                });

            } else {
                speedDial.removeClass("mtr-flinged");
                speedDial.find(".mtr-speed-dial-actions .mtr-speed-dial-action").each(function () {
                    $(this).removeClass("mtr-active");
                });
            }


        });

        /* Usage 
        	$("any-div").progressCircular(); // convert a div to circular progress;
        	progressCircular().prependTo("any-container");
        */

        $.fn.dataSelectable = function () {
            var dataTable = $(this),
                selectAll = dataTable.find("[mtr-select-all]"),
                selectCurrent = dataTable.find("[mtr-selectable-content] .mtr-checkbox input").not(selectAll);

			function checkAll() {
				if (selectAll.prop("checked") === true) {
                    selectCurrent.prop("checked", true);
                } else {
                    selectCurrent.prop("checked", false);
                }
			}	
					
            selectAll.click(function () {
                checkAll();
            });
			
			function checkSelect() {
                if (selectCurrent.filter(':checked').length === selectCurrent.length) {
                    selectAll.prop("checked", true);
                } else {
                    selectAll.prop("checked", false);
                }
			}
			
			checkSelect();

            selectCurrent.click(function (event) {
				checkSelect();
				event.stopPropagation();
            });
			
			var rows = dataTable.find("[mtr-selectable-content] tr");
			
			rows.click(function () {
				var checkBox = $(this).find(".mtr-checkbox input");
				checkBox.click();
			});
        }

        $(".mtr-data-table[mtr-selectable]").each(function () {
            $(this).dataSelectable();
        });
		
		$(document).on("click", ".mtr-data-table .mtr-sortable-cell", function () {
			var cell = $(this),
				table = cell.closest(".mtr-data-table"),
				otherSortable = table.find(".mtr-sortable-cell").not(cell);
			
			if ( cell.hasClass("mtr-active") === true ) {
				if ( cell.hasClass("z-a") === true ) {
					cell.removeClass("z-a");

				} else {
					cell.addClass("z-a");
				}
			} else {
				cell.addClass("mtr-active")
			}

			otherSortable.removeClass("mtr-active");

        });

		$.extend({
			toast: function (options) {
				var defaults = {
					toastContent: "",
					duration: 2400,
					direction: "left",
					action: false,
					actionText: "",
					actionClass: "mtr-accent",
					onCanceled: function() {},
					onAction: function() {},
				};
				
				var settings = $.extend( {}, defaults, options );
				
				return $(this).each(function() {
					
					var toast,
						toastContent,
						content,
						action,
						actionText,
						actionClass,
						duration,
						direction;
						
					toast = $("<div class='mtr-toast'><div class='mtr-toast-content'></div></div>");
					
					toastContent = toast.find(".mtr-toast-content");
					
					content = settings.toastContent.trim();
					
					content = $("<span>" + content + "</span>");
					
					direction = settings.direction.trim();
					
					duration = settings.duration;
					
					actionText = settings.actionText.trim();
					
					actionClass = settings.actionClass.trim();
					
					toastContent.prepend(content);
					
					if ( settings.action === true ) {
						
						action = $("<button class='no-ripple mtr-button mtr-toast-action " + actionClass + "'></button>");
						actionText = $("<span>" + actionText + "</span>");
						
						action.prepend(actionText).appendTo(toast);
						
						action.off("click").click(function() {					
							toast.removeClass("mtr-active");
							
							toast.one(transitionPrefix, function () {
								toast.remove();
							});
							
							clearTimeout(timeOut);
							$(".mtr-toast-move-center,.mtr-toast-move-left").removeClass("mtr-toast-do-animation");
							settings.onAction.call(this);
							
						});
						
						//console.log(action);
					}
					
					switch (direction) {
						default:
							toast.addClass("mtr-left");
							break;
						case "center":
							toast.addClass("mtr-center");
							$(".mtr-toast-move-center").addClass("mtr-toast-do-animation");
							break;
							
						case "left":
							toast.addClass("mtr-left");
							break;	
					}

					toast.bind("customToastDismissedByOtherEvent", function(){
						settings.onCanceled.call(this);
						clearTimeout(timeOut);
					});
					
					toast.prependTo("body");
					
					toast.css("zIndex");
					
					var otherToast =  $(".mtr-toast.mtr-active").not(toast);
					
					if (otherToast.length > 0) {
						otherToast.trigger("customToastDismissedByOtherEvent");
						otherToast.removeClass("mtr-active");
						
						otherToast.one(transitionPrefix, function () {
							otherToast.remove();
							
							$(".mtr-toast-move-center,.mtr-toast-move-left").removeClass("mtr-toast-do-animation");
							
							toast.addClass("mtr-active");
							
							$(".mtr-toast-move-center,.mtr-toast-move-left").addClass("mtr-toast-do-animation");
							
						});
						
					} else {
						toast.addClass("mtr-active");
						$(".mtr-toast-move-center,.mtr-toast-move-left").addClass("mtr-toast-do-animation");
					}
					
					function removeCurToast() {
						removeToast(toast);
						
						$(".mtr-toast-move-center,.mtr-toast-move-left").removeClass("mtr-toast-do-animation");
						settings.onCanceled.call(this);
					}
					
					var timeOut = setTimeout(function () {
						removeCurToast();
					}, duration);
					
					if (toast.hasClass("mtr-active") === true) {
						timeOut;
					}
				});
			}
		});
		
		function removeToast(toast) {
			var toast;
			toast.removeClass("mtr-active");
								
			toast.one(transitionPrefix, function () {
				toast.remove();
			});
		};
		
		/*$.toast({
			toastContent: "Your draft has been discarded.",
			direction: "center",
			duration: 2400,
			action: true,
			actionText: "Undo",
			actionClass: "mtr-accent",
			
			onAction: function() {
				console.log("action clicked");
			},
			
			onCanceled: function() {
				console.log("canceled");
			}
			
		});*/

        $(window).resize(function () {
            checkLockSideNav();
            tabIndicatorUpdate();
            growText($(".mtr-input-container textarea.mtr-input"));
			$(".mtr-menu.mtr-active").closeMenu();
        });

        $('body').css('visibility', 'visible');

    });

}(jQuery));