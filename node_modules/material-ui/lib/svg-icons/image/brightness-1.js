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

var ImageBrightness1 = function ImageBrightness1(props) {
  return _react2.default.createElement(
    _svgIcon2.default,
    props,
    _react2.default.createElement('circle', { cx: '12', cy: '12', r: '10' })
  );
};
ImageBrightness1 = (0, _pure2.default)(ImageBrightness1);
ImageBrightness1.displayName = 'ImageBrightness1';

exports.default = ImageBrightness1;