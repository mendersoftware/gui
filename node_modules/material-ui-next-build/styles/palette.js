'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dark = exports.light = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = createPalette;

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _indigo = require('../colors/indigo');

var _indigo2 = _interopRequireDefault(_indigo);

var _pink = require('../colors/pink');

var _pink2 = _interopRequireDefault(_pink);

var _grey = require('../colors/grey');

var _grey2 = _interopRequireDefault(_grey);

var _red = require('../colors/red');

var _red2 = _interopRequireDefault(_red);

var _common = require('../colors/common');

var _common2 = _interopRequireDefault(_common);

var _colorManipulator = require('./colorManipulator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var light = exports.light = {
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.54)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
    icon: 'rgba(0, 0, 0, 0.38)',
    divider: 'rgba(0, 0, 0, 0.12)',
    lightDivider: 'rgba(0, 0, 0, 0.075)'
  },
  input: {
    bottomLine: 'rgba(0, 0, 0, 0.42)',
    helperText: 'rgba(0, 0, 0, 0.54)',
    labelText: 'rgba(0, 0, 0, 0.54)',
    inputText: 'rgba(0, 0, 0, 0.87)',
    disabled: 'rgba(0, 0, 0, 0.42)'
  },
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    disabled: 'rgba(0, 0, 0, 0.26)'
  },
  background: {
    default: _grey2.default[50],
    paper: _common2.default.white,
    appBar: _grey2.default[100],
    contentFrame: _grey2.default[200]
  }
}; //  weak

var dark = exports.dark = {
  text: {
    primary: 'rgba(255, 255, 255, 1)',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
    hint: 'rgba(255, 255, 255, 0.5)',
    icon: 'rgba(255, 255, 255, 0.5)',
    divider: 'rgba(255, 255, 255, 0.12)',
    lightDivider: 'rgba(255, 255, 255, 0.075)'
  },
  input: {
    bottomLine: 'rgba(255, 255, 255, 0.7)',
    helperText: 'rgba(255, 255, 255, 0.7)',
    labelText: 'rgba(255, 255, 255, 0.7)',
    inputText: 'rgba(255, 255, 255, 1)',
    disabled: 'rgba(255, 255, 255, 0.5)'
  },
  action: {
    active: 'rgba(255, 255, 255, 1)',
    disabled: 'rgba(255, 255, 255, 0.3)'
  },
  background: {
    default: '#303030',
    paper: _grey2.default[800],
    appBar: _grey2.default[900],
    contentFrame: _grey2.default[900],
    status: _common2.default.black
  }
};

function getContrastText(color) {
  if ((0, _colorManipulator.getContrastRatio)(color, _common2.default.black) < 7) {
    return dark.text.primary;
  }
  return light.text.primary;
}

function createPalette() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$primary = options.primary,
      primary = _options$primary === undefined ? _indigo2.default : _options$primary,
      _options$accent = options.accent,
      accent = _options$accent === undefined ? _pink2.default : _options$accent,
      _options$error = options.error,
      error = _options$error === undefined ? _red2.default : _options$error,
      _options$type = options.type,
      type = _options$type === undefined ? 'light' : _options$type;


  if (process.env.NODE_ENV !== 'production') {
    var difference = function difference(base, compare) {
      if (!compare) {
        compare = {};
      }

      return (0, _keys2.default)(base).filter(function (hue) {
        return !compare[hue];
      });
    };

    var paletteColorError = function paletteColorError(name, base, compare) {
      var missing = difference(base, compare);

      if (missing.length === 0) {
        return;
      }

      process.env.NODE_ENV !== "production" ? (0, _warning2.default)(false, ['Material-UI: ' + name + ' color is missing the following hues: ' + missing.join(','), 'See the default colors, indigo, or pink, as exported from material-ui/colors.'].join('\n')) : void 0;
    };

    paletteColorError('primary', _indigo2.default, primary);
    paletteColorError('accent', _pink2.default, accent);
    paletteColorError('error', _red2.default, error);
  }

  var shades = { dark: dark, light: light };

  process.env.NODE_ENV !== "production" ? (0, _warning2.default)(shades[type], 'Material-UI: the palette type `' + type + '` is not supported.') : void 0;

  return {
    common: _common2.default,
    type: type,
    shades: shades,
    text: shades[type].text,
    input: shades[type].input,
    action: shades[type].action,
    background: shades[type].background,
    primary: primary,
    accent: accent,
    error: error,
    grey: _grey2.default,
    getContrastText: getContrastText
  };
}