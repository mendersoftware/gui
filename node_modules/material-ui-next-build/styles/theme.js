'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _shadows = require('./shadows');

var _shadows2 = _interopRequireDefault(_shadows);

var _transitions = require('./transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _typography = require('./typography');

var _typography2 = _interopRequireDefault(_typography);

var _breakpoints = require('./breakpoints');

var _breakpoints2 = _interopRequireDefault(_breakpoints);

var _palette = require('./palette');

var _palette2 = _interopRequireDefault(_palette);

var _zIndex = require('./zIndex');

var _zIndex2 = _interopRequireDefault(_zIndex);

var _mixins = require('./mixins');

var _mixins2 = _interopRequireDefault(_mixins);

var _spacing = require('./spacing');

var _spacing2 = _interopRequireDefault(_spacing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createMuiTheme() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$palette = options.palette,
      palette = _options$palette === undefined ? (0, _palette2.default)() : _options$palette,
      _options$breakpoints = options.breakpoints,
      breakpoints = _options$breakpoints === undefined ? (0, _breakpoints2.default)() : _options$breakpoints,
      _options$mixins = options.mixins,
      mixins = _options$mixins === undefined ? (0, _mixins2.default)(breakpoints, _spacing2.default) : _options$mixins,
      _options$typography = options.typography,
      typography = _options$typography === undefined ? (0, _typography2.default)(palette) : _options$typography,
      more = (0, _objectWithoutProperties3.default)(options, ['palette', 'breakpoints', 'mixins', 'typography']);


  return (0, _extends3.default)({
    direction: 'ltr',
    palette: palette,
    typography: typography,
    shadows: _shadows2.default,
    transitions: _transitions2.default,
    mixins: mixins,
    spacing: _spacing2.default,
    breakpoints: breakpoints,
    zIndex: _zIndex2.default
  }, more);
}

exports.default = createMuiTheme;