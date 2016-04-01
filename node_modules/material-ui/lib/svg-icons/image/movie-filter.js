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

var ImageMovieFilter = function ImageMovieFilter(props) {
  return _react2.default.createElement(
    _svgIcon2.default,
    props,
    _react2.default.createElement('path', { d: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zm-6.58 11.68L10.37 18l-1.05-2.32L7 14.63l2.32-1.05 1.05-2.32 1.05 2.32 2.32 1.05-2.32 1.05zm3.69-3.47l-.53 1.16-.53-1.16-1.16-.53 1.16-.53.53-1.15.53 1.16 1.16.53-1.16.52z' })
  );
};
ImageMovieFilter = (0, _pure2.default)(ImageMovieFilter);
ImageMovieFilter.displayName = 'ImageMovieFilter';

exports.default = ImageMovieFilter;