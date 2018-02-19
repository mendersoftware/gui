'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

exports.default = createTypography;

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createTypography(palette) {
  var constants = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _constants$fontFamily = constants.fontFamily,
      fontFamily = _constants$fontFamily === undefined ? '"Roboto", "Helvetica", "Arial", sans-serif' : _constants$fontFamily,
      _constants$fontSize = constants.fontSize,
      fontSize = _constants$fontSize === undefined ? 14 : _constants$fontSize,
      _constants$fontWeight = constants.fontWeightLight,
      fontWeightLight = _constants$fontWeight === undefined ? 300 : _constants$fontWeight,
      _constants$fontWeight2 = constants.fontWeightRegular,
      fontWeightRegular = _constants$fontWeight2 === undefined ? 400 : _constants$fontWeight2,
      _constants$fontWeight3 = constants.fontWeightMedium,
      fontWeightMedium = _constants$fontWeight3 === undefined ? 500 : _constants$fontWeight3,
      other = (0, _objectWithoutProperties3.default)(constants, ['fontFamily', 'fontSize', 'fontWeightLight', 'fontWeightRegular', 'fontWeightMedium']);


  process.env.NODE_ENV !== "production" ? (0, _warning2.default)((0, _keys2.default)(other).length === 0, 'Material-UI: unrecognized argument(s) [' + (0, _keys2.default)(other).join(',') + ']') : void 0;

  return {
    fontFamily: fontFamily,
    fontSize: fontSize,
    fontWeightLight: fontWeightLight,
    fontWeightRegular: fontWeightRegular,
    fontWeightMedium: fontWeightMedium,
    display4: {
      fontSize: 112,
      fontWeight: fontWeightLight,
      fontFamily: fontFamily,
      letterSpacing: '-.04em',
      lineHeight: 1,
      color: palette.text.secondary
    },
    display3: {
      fontSize: 56,
      fontWeight: fontWeightRegular,
      fontFamily: fontFamily,
      letterSpacing: '-.02em',
      lineHeight: 1.35,
      color: palette.text.secondary
    },
    display2: {
      fontSize: 45,
      fontWeight: fontWeightRegular,
      fontFamily: fontFamily,
      lineHeight: '48px',
      color: palette.text.secondary
    },
    display1: {
      fontSize: 34,
      fontWeight: fontWeightRegular,
      fontFamily: fontFamily,
      lineHeight: '40px',
      color: palette.text.secondary
    },
    headline: {
      fontSize: 24,
      fontWeight: fontWeightRegular,
      fontFamily: fontFamily,
      lineHeight: '32px',
      color: palette.text.primary
    },
    title: {
      fontSize: 21,
      fontWeight: fontWeightMedium,
      fontFamily: fontFamily,
      lineHeight: 1,
      color: palette.text.primary
    },
    subheading: {
      fontSize: 16,
      fontWeight: fontWeightRegular,
      fontFamily: fontFamily,
      lineHeight: '24px',
      color: palette.text.primary
    },
    body2: {
      fontSize: 14,
      fontWeight: fontWeightMedium,
      fontFamily: fontFamily,
      lineHeight: '24px',
      color: palette.text.primary
    },
    body1: {
      fontSize: 14,
      fontWeight: fontWeightRegular,
      fontFamily: fontFamily,
      lineHeight: '20px',
      color: palette.text.primary
    },
    caption: {
      fontSize: 12,
      fontWeight: fontWeightRegular,
      fontFamily: fontFamily,
      lineHeight: 1,
      color: palette.text.secondary
    },
    button: {
      fontSize: fontSize,
      textTransform: 'uppercase',
      fontWeight: fontWeightMedium,
      fontFamily: fontFamily
    }
  };
}