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

var DeviceSignalCellularConnectedNoInternet2Bar = function DeviceSignalCellularConnectedNoInternet2Bar(props) {
  return _react2.default.createElement(
    _svgIcon2.default,
    props,
    _react2.default.createElement('path', { fillOpacity: '.3', d: 'M22 8V2L2 22h16V8z' }),
    _react2.default.createElement('path', { d: 'M14 22V10L2 22h12zm6-12v8h2v-8h-2zm0 12h2v-2h-2v2z' })
  );
};
DeviceSignalCellularConnectedNoInternet2Bar = (0, _pure2.default)(DeviceSignalCellularConnectedNoInternet2Bar);
DeviceSignalCellularConnectedNoInternet2Bar.displayName = 'DeviceSignalCellularConnectedNoInternet2Bar';

exports.default = DeviceSignalCellularConnectedNoInternet2Bar;