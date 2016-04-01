'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pure = require('recompose/pure');

var _pure2 = _interopRequireDefault(_pure);

var _svgIcon = require('../../svg-icon');

var _svgIcon2 = _interopRequireDefault(_svgIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NavigationArrowDropUp = function NavigationArrowDropUp(props) {
  return _react2.default.createElement(
    _svgIcon2.default,
    props,
    _react2.default.createElement('path', { d: 'M7 14l5-5 5 5z' })
  );
};
NavigationArrowDropUp = (0, _pure2.default)(NavigationArrowDropUp);
NavigationArrowDropUp.displayName = 'NavigationArrowDropUp';

exports.default = NavigationArrowDropUp;