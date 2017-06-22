'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MuiThemeProviderDocs = exports.MUI_SHEET_ORDER = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _theme = require('./theme');

var _theme2 = _interopRequireDefault(_theme);

var _muiThemeProviderFactory = require('./muiThemeProviderFactory');

var _muiThemeProviderFactory2 = _interopRequireDefault(_muiThemeProviderFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MUI_SHEET_ORDER = exports.MUI_SHEET_ORDER = _muiThemeProviderFactory.MUI_SHEET_ORDER;
// eslint-disable-next-line max-len


var MuiThemeProvider = (0, _muiThemeProviderFactory2.default)((0, _theme2.default)());

exports.default = MuiThemeProvider;

var _ref = _react2.default.createElement('span', null);

var MuiThemeProviderDocs = exports.MuiThemeProviderDocs = function MuiThemeProviderDocs() {
  return _ref;
};

MuiThemeProviderDocs.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * You can only provide a single element.
   */
  children: _propTypes2.default.element.isRequired,
  /**
   * A style manager instance.
   */
  styleManager: _propTypes2.default.object,
  /**
   * A theme object.
   */
  theme: _propTypes2.default.object
} : {};