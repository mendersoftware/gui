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

var EditorSpaceBar = function EditorSpaceBar(props) {
  return _react2.default.createElement(
    _svgIcon2.default,
    props,
    _react2.default.createElement('path', { d: 'M18 9v4H6V9H4v6h16V9z' })
  );
};
EditorSpaceBar = (0, _pure2.default)(EditorSpaceBar);
EditorSpaceBar.displayName = 'EditorSpaceBar';

exports.default = EditorSpaceBar;