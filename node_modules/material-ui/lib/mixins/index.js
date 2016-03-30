'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StyleResizable = exports.StylePropable = undefined;

var _stylePropable = require('./style-propable');

var _stylePropable2 = _interopRequireDefault(_stylePropable);

var _styleResizable = require('./style-resizable');

var _styleResizable2 = _interopRequireDefault(_styleResizable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.StylePropable = _stylePropable2.default;
exports.StyleResizable = _styleResizable2.default;
exports.default = {
  StylePropable: _stylePropable2.default,
  StyleResizable: _styleResizable2.default
};