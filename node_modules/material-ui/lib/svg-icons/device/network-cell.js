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

var DeviceNetworkCell = function DeviceNetworkCell(props) {
  return _react2.default.createElement(
    _svgIcon2.default,
    props,
    _react2.default.createElement('path', { fillOpacity: '.3', d: 'M2 22h20V2z' }),
    _react2.default.createElement('path', { d: 'M17 7L2 22h15z' })
  );
};
DeviceNetworkCell = (0, _pure2.default)(DeviceNetworkCell);
DeviceNetworkCell.displayName = 'DeviceNetworkCell';

exports.default = DeviceNetworkCell;