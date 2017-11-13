/*
 *
 * ColorConverter .js
 * Version:     0.1.2
 * License: MIT / BSD
 * By: Simon Waldherr
 *
 */

var colorconv = {
  RGB2HSL : function (RGB) {
    "use strict";
    var r = Math.max(Math.min(parseInt(RGB[0], 10) / 255, 1), 0),
      g = Math.max(Math.min(parseInt(RGB[1], 10) / 255, 1), 0),
      b = Math.max(Math.min(parseInt(RGB[2], 10) / 255, 1), 0),
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      l = (max + min) / 2,
      d,
      h,
      s;

    if (max !== min) {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h = h / 6;
    } else {
      h = s = 0;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  },
  HSL2RGB : function (HSL) {
    "use strict";
    var h = Math.max(Math.min(parseInt(HSL[0], 10), 360), 0) / 360,
      s = Math.max(Math.min(parseInt(HSL[1], 10), 100), 0) / 100,
      l = Math.max(Math.min(parseInt(HSL[2], 10), 100), 0) / 100,
      v,
      min,
      sv,
      six,
      fract,
      vsfract,
      r,
      g,
      b;

    if (l <= 0.5) {
      v = l * (1 + s);
    } else {
      v = l + s - l * s;
    }
    if (v === 0) {
      return [0, 0, 0];
    }
    min = 2 * l - v;
    sv = (v - min) / v;
    h = 6 * h;
    six = Math.floor(h);
    fract = h - six;
    vsfract = v * sv * fract;
    switch (six) {
    case 1:
      r = v - vsfract;
      g = v;
      b = min;
      break;
    case 2:
      r = min;
      g = v;
      b = min + vsfract;
      break;
    case 3:
      r = min;
      g = v - vsfract;
      b = v;
      break;
    case 4:
      r = min + vsfract;
      g = min;
      b = v;
      break;
    case 5:
      r = v;
      g = min;
      b = v - vsfract;
      break;
    default:
      r = v;
      g = min + vsfract;
      b = min;
      break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  },
  RGB2CMYK : function (RGB) {
    "use strict";
    var red = Math.max(Math.min(parseInt(RGB[0], 10), 255), 0),
      green = Math.max(Math.min(parseInt(RGB[1], 10), 255), 0),
      blue = Math.max(Math.min(parseInt(RGB[2], 10), 255), 0),
      cyan = 1 - red,
      magenta = 1 - green,
      yellow = 1 - blue,
      black = 1;

    if (red || green || blue) {
      black = Math.min(cyan, Math.min(magenta, yellow));
      cyan = (cyan - black) / (1 - black);
      magenta = (magenta - black) / (1 - black);
      yellow = (yellow - black) / (1 - black);
    } else {
      black = 1;
    }
    return [Math.round(cyan * 255), Math.round(magenta * 255), Math.round(yellow * 255), Math.round(black + 254)];
  },
  CMYK2RGB : function (CMYK) {
    "use strict";
    var cyan = Math.max(Math.min(parseInt(CMYK[0], 10) / 255, 1), 0),
      magenta = Math.max(Math.min(parseInt(CMYK[1], 10) / 255, 1), 0),
      yellow = Math.max(Math.min(parseInt(CMYK[2], 10) / 255, 1), 0),
      black = Math.max(Math.min(parseInt(CMYK[3], 10) / 255, 1), 0),
      red = (1 - cyan * (1 - black) - black),
      green = (1 - magenta * (1 - black) - black),
      blue = (1 - yellow * (1 - black) - black);

    return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
  },
  HEX2RGB : function (hex) {
    "use strict";
    if (hex.charAt(0) === '#') {
      hex = hex.substr(1);
    }
    if ((hex.length < 2) || (hex.length > 6)) {
      return false;
    }
    var values = hex.split(''),
      r,
      g,
      b;

    if (hex.length === 2) {
      r = parseInt(values[0].toString() + values[1].toString(), 16);
      g = r;
      b = r;
    } else if (hex.length === 3) {
      r = parseInt(values[0].toString() + values[0].toString(), 16);
      g = parseInt(values[1].toString() + values[1].toString(), 16);
      b = parseInt(values[2].toString() + values[2].toString(), 16);
    } else if (hex.length === 6) {
      r = parseInt(values[0].toString() + values[1].toString(), 16);
      g = parseInt(values[2].toString() + values[3].toString(), 16);
      b = parseInt(values[4].toString() + values[5].toString(), 16);
    } else {
      return false;
    }
    return [r, g, b];
  },
  RGB2HEX : function (RGB) {
    "use strict";
    var hexr = Math.max(Math.min(parseInt(RGB[0], 10), 255), 0),
      hexg = Math.max(Math.min(parseInt(RGB[1], 10), 255), 0),
      hexb = Math.max(Math.min(parseInt(RGB[2], 10), 255), 0);

    hexr = hexr > 15 ? hexr.toString(16) : '0' + hexr.toString(16);
    hexg = hexg > 15 ? hexg.toString(16) : '0' + hexg.toString(16);
    hexb = hexb > 15 ? hexb.toString(16) : '0' + hexb.toString(16);
    return hexr + hexg + hexb;
  },
  RGB2YUV : function (RGB) {
    "use strict";
    var r = parseInt(RGB[0], 10),
      g = parseInt(RGB[1], 10),
      b = parseInt(RGB[2], 10),
      y,
      u,
      v;

    y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    u = Math.round((((b - y) * 0.493) + 111) / 222 * 255);
    v = Math.round((((r - y) * 0.877) + 155) / 312 * 255);
    return [y, u, v];
  },
  YUV2RGB : function (YUV) {
    "use strict";
    var y = parseInt(YUV[0], 10),
      u = parseInt(YUV[1], 10) / 255 * 222 - 111,
      v = parseInt(YUV[2], 10) / 255 * 312 - 155,
      r,
      g,
      b;

    r = Math.round(y + v / 0.877);
    g = Math.round(y - 0.39466 * u - 0.5806 * v);
    b = Math.round(y + u / 0.493);
    return [r, g, b];
  },
  RGB2HSV : function (RGB) {
    "use strict";
    var r = parseInt(RGB[0], 10) / 255,
      g = parseInt(RGB[1], 10) / 255,
      b = parseInt(RGB[2], 10) / 255,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      v = max,
      h,
      s;

    if (max === 0) {
      s = 0;
    } else {
      s = d / max;
    }
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      }
      h = h / 6;
    }
    return [h, s, v];
  },
  HSV2RGB : function (HSV) {
    "use strict";
    var r, g, b,
      h = HSV[0],
      s = HSV[1],
      v = HSV[2],
      i = Math.floor(h * 6),
      f = h * 6 - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s);
    switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    }
    return [r * 255, g * 255, b * 255];
  },
  HSL2HEX : function (HSL) {
    "use strict";
    return colorconv.RGB2HEX(colorconv.HSL2RGB(HSL));
  },
  HEX2HSL : function (hex) {
    "use strict";
    return colorconv.RGB2HSL(colorconv.HEX2RGB(hex));
  },
  complexity2int : function (string) {
    "use strict";
    var valunicode, keys = string.split(""),
      numbers = 1,
      uletter = 1,
      lletter = 1,
      special = 1,
      complex = 0,
      i;

    for (i = 0; i < keys.length; i += 1) {
      valunicode = keys[i].charCodeAt(0);
      if ((valunicode > 0x40) && (valunicode < 0x5B)) {
        //Großbuchstaben A-Z
        uletter += 1;
      } else if ((valunicode > 0x60) && (valunicode < 0x7B)) {
        //Kleinbuchstaben a-z
        lletter += 1;
      } else if ((valunicode > 0x2F) && (valunicode < 0x3A)) {
        //Zahlen 0-9
        numbers += 1;
      } else if ((valunicode > 0x20) && (valunicode < 0x7F)) {
        //Sonderzeichen
        special += 1;
      }
    }
    complex = ((uletter * lletter * numbers * special) + Math.round(uletter * 1.8 + lletter * 1.5 + numbers + special * 2)) - 6;
    return complex;
  },
  int2RGB : function (intval) {
    "use strict";
    if ((typeof intval !== 'number') && (intval !== false) && (intval !== true)) {
      intval = parseInt(intval, 10);
    }
    if (typeof intval === 'number') {
      if ((intval < 115) && (intval > 1)) {
        return [255, 153 + intval, 153 - intval];
      }
      if ((intval > 115) && (intval < 230)) {
        return [255 - intval, 243, 63];
      }
      if ((intval > 230) || (intval === true)) {
        return [145, 243, 63];
      }
    }
    if (intval === 'none') {
      return [204, 204, 204];
    }
    if (intval === true) {
      return [204, 204, 204];
    }
    return false;
  },
  complexity2RGB : function (string) {
    "use strict";
    return colorconv.int2RGB(colorconv.complexity2int(string));
  },
  mixRGB : function (RGB1, RGB2) {
    "use strict";
    var r,
      g,
      b;

    r = parseInt((RGB1[0] + RGB2[0]) / 2, 10);
    g = parseInt((RGB1[1] + RGB2[1]) / 2, 10);
    b = parseInt((RGB1[2] + RGB2[2]) / 2, 10);
    return [r, g, b];
  },
  parse : function (input) {
    "use strict";
    var geregext,
      pattern = /((rgb|hsl|#|yuv)(\(([%, ]*([\d]+)[%, ]+([\d]+)[%, ]+([\d]+)[%, ]*)+\)|([a-f0-9]+)))/gmi;

    geregext = pattern.exec(input);
    if (geregext !== null) {
      switch (geregext[2]) {
      case '#':
        return colorconv.HEX2RGB(geregext[3]);
      case 'rgb':
        return [parseInt(geregext[5].trim(), 10), parseInt(geregext[6].trim(), 10), parseInt(geregext[7].trim(), 10)];
      case 'hsl':
        return colorconv.HSL2RGB([parseInt(geregext[5].trim(), 10), parseInt(geregext[6].trim(), 10), parseInt(geregext[7].trim(), 10)]);
      case 'yuv':
        return colorconv.YUV2RGB([parseInt(geregext[5].trim(), 10), parseInt(geregext[6].trim(), 10), parseInt(geregext[7].trim(), 10)]);
      default:
        return false;
      }
    }
    return false;
  }
};

(function (root, factory) {
  "use strict";
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.returnExports = factory();
  }
}(this, function () {
  'use strict';
  return colorconv;
}));

if (typeof (jQuery) === 'undefined') {
    var jQuery;

    if (typeof (require) === 'function') {
        jQuery = $ = require('jquery');

    } else {
        jQuery = $;
    }
};

(function ($) {
	
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
	
	var transitionPrefix = detectTransitionPrefix();
	
	$(document).ready(function () {
	
		$('#color-wheel').wheelColorPicker({
			sliders: "wv",
			layout: "block"
		});
		
		$('#color-wheel').on("slidermove", function () {
			setHex();
			$("#color-input").change();
		});
		
		$('#color-wheel').on("sliderup", function() {
			setHex();
			$("#color-input").change().blur();
		});
		
		function setHex() {
			var hex = "#" + $('#color-wheel').wheelColorPicker('value');
			$("#color-input").val(hex);
		}

		$('#color-input').on("propertychange change input paste", function () {
			var colorInputVal = $(this).val();
			
			$('#color-wheel').wheelColorPicker('value', colorInputVal);

			buildPalette(colorInputVal);
		});
		
		function buildPalette(baseColor) {
			var baseColor = baseColor.replace("#",""),
				baseShade = colorconv.HEX2HSL(baseColor);
				
			var c50 = baseShade.slice(0),
				c100 = baseShade.slice(0),
				c200 = baseShade.slice(0),
				c300 = baseShade.slice(0),
				c400 = baseShade.slice(0),
				c600 = baseShade.slice(0),
				c700 = baseShade.slice(0),
				c800 = baseShade.slice(0),
				c900 = baseShade.slice(0);

			if ( isNaN(baseShade[0]) === false ) {
				
				c500 = "#" + baseColor.toUpperCase();

				switch (true) {
					
					default:
						c50 = makeShade(c50, -16, -34);
						
						c100 = makeShade(c100, -12, -24);
						
						c200 = makeShade(c200, -8, -18);
						
						c300 = makeShade(c300, -6, -14);
						
						c400 = makeShade(c400, -3, -7);
						
						c600 = makeShade(c600, 2, 6);

						c700 = makeShade(c700, 4, 12);

						c800 = makeShade(c800, 4, 16);
						
						c900 = makeShade(c900, 4, 24);
						break;
						
					case ( baseShade[0] === baseShade[1] ): //Achromatic color
				
						c50 = makeShade(c50, 0, -32);
						
						c100 = makeShade(c100, 0, -25);
						
						c200 = makeShade(c200, 0, -20);
						
						c300 = makeShade(c300, 0, -15);
						
						c400 = makeShade(c400, 0, -10);
						
						c600 = makeShade(c600, 0, 15);

						c700 = makeShade(c700, 0, 20);

						c800 = makeShade(c800, 0, 35);
						
						c900 = makeShade(c900, 0, 45);
						break;
						
					case ( baseShade[0] <= 64 && baseShade[0] >= 16 ): //Yellowy and orangey
						c50 = makeShade(c50, 0, -32);
						
						c100 = makeShade(c100, 0, -25);
						
						c200 = makeShade(c200, 0, -20);
						
						c300 = makeShade(c300, 0, -15);
						
						c400 = makeShade(c400, 0, -10);
						
						c600 = makeShade(c600, -6, 2);

						c700 = makeShade(c700, -10, 2);

						c800 = makeShade(c800, -16, 2);
						
						c900 = makeShade(c900, -24, 2);
						break;
						
					case ( baseShade[0] > 64 && baseShade[0] <= 132 && baseShade[2] >= 48 ): //Greeny and dark
						c50 = makeShade(c50, 0, -32);
						
						c100 = makeShade(c100, 0, -25);
						
						c200 = makeShade(c200, 0, -20);
						
						c300 = makeShade(c300, 0, -15);
						
						c400 = makeShade(c400, 0, -10);
						
						c600 = makeShade(c600, 2, 8);

						c700 = makeShade(c700, 4, 13);

						c800 = makeShade(c800, 4, 19);
						
						c900 = makeShade(c900, 4, 28);
						
						console.log("greeny!");
						break;	
				}

				var array = [c50, c100, c200, c300, c400, c500, c600, c700, c800, c900];

				renderPalette(array);			
				
			}
			
		}
		
		function makeShade(color,hue,lightness) {
			var color, hue, lightness;
			color[0] += hue;
			color[2] -= lightness;
			color = "#" + colorconv.HSL2HEX(color).toUpperCase();
	
			return color;
		}
		
		function renderPalette(array) {
			
			var array;
			
			$("[data-shade='50']").css({
				backgroundColor: array[0]
			});

			insertHex("[data-shade='50']", ".hex", array[0]);
			
			$("[data-shade='100']").css({
				backgroundColor: array[1]
			});
			
			insertHex("[data-shade='100']", ".hex", array[1]);
			
			$("[data-shade='200']").css({
				backgroundColor: array[2]
			});
			
			insertHex("[data-shade='200']", ".hex", array[2]);
			
			$("[data-shade='300']").css({
				backgroundColor: array[3]
			});
			
			insertHex("[data-shade='300']", ".hex", array[3]);
			
			$("[data-shade='400']").css({
				backgroundColor: array[4]
			});
			
			insertHex("[data-shade='400']", ".hex", array[4]);
			
			$("[data-shade='500']").css({
				backgroundColor: array[5]
			});
			
			insertHex("[data-shade='500']", ".hex", array[5]);
			
			$("[data-shade='600']").css({
				backgroundColor: array[6]
			});
			
			insertHex("[data-shade='600']", ".hex", array[6]);
			
			$("[data-shade='700']").css({
				backgroundColor: array[7]
			});
			
			insertHex("[data-shade='700']", ".hex", array[7]);
			
			$("[data-shade='800']").css({
				backgroundColor: array[8]
			});
			
			insertHex("[data-shade='800']", ".hex", array[8]);
			
			$("[data-shade='900']").css({
				backgroundColor: array[9]
			});
			
			insertHex("[data-shade='900']", ".hex", array[9]);
			
			$("[data-shade]").each(function () {
				$(this).checkContrast("dark-text");
			});

		}
		
		function insertHex(shade, hex, string) {
			var shade, hex;
			$(shade).find(hex).html(string);
		}

		$.fn.checkContrast = function(darkClass) {
			var darkClass,
				target = $(this),
				background = target.prop('style').backgroundColor;	
				
			background = background.replace(/[^\d,]/g, '').split(',');
			var red = background[0],
				green = background[1],
				blue = background[2];
				
			var formula = ((red * 299) + (green * 587) + (blue * 114)) / 1000, //W3C's Algorithm
				formula2 = Math.sqrt(red * red * 0.241 + green * green * 0.691 + blue * blue * 0.068); //brightness  =  squareRoot(0.241 x R^2 + 0.691 x G^2 + 0.068 x B^2)
			
			if ( formula > 130 && formula2 > 130) {
				target.addClass(darkClass);
			} else {
				target.removeClass(darkClass);
			}
			
			return $(this);
		}		
		
		$('#color-wheel').wheelColorPicker('value', "#007CFF");

		$('#color-wheel').trigger("sliderup");
		
	});
	
}(jQuery)); 
