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

var EditorVerticalAlignBottom = function EditorVerticalAlignBottom(props) {
  return _react2.default.createElement(
    _svgIcon2.default,
    props,
    _react2.default.createElement('path', { d: 'M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z' })
  );
};
EditorVerticalAlignBottom = (0, _pure2.default)(EditorVerticalAlignBottom);
EditorVerticalAlignBottom.displayName = 'EditorVerticalAlignBottom';

exports.default = EditorVerticalAlignBottom;