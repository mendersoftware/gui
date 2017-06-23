'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRender;

var _jss = require('jss');

var _jssPresetDefault = require('jss-preset-default');

var _jssPresetDefault2 = _interopRequireDefault(_jssPresetDefault);

var _jssThemeReactor = require('jss-theme-reactor');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

var _theme = require('../styles/theme');

var _theme2 = _interopRequireDefault(_theme);

var _MuiThemeProvider = require('../styles/MuiThemeProvider');

var _MuiThemeProvider2 = _interopRequireDefault(_MuiThemeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  weak

var babelPluginFlowReactPropTypes_proptype_Element = require('react').babelPluginFlowReactPropTypes_proptype_Element || require('prop-types').any;

// Generate a render to string function with the needed context.
function createRender() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$render = options.render,
      render = _options$render === undefined ? _enzyme.render : _options$render;

  var theme = (0, _theme2.default)();
  var jss = (0, _jss.create)((0, _jssPresetDefault2.default)());
  var styleManager = (0, _jssThemeReactor.createStyleManager)({ jss: jss, theme: theme });
  var renderWithContext = function renderWithContext(node) {
    return render(_react2.default.createElement(
      _MuiThemeProvider2.default,
      { styleManager: styleManager },
      node
    ));
  };

  renderWithContext.propTypes = process.env.NODE_ENV !== "production" ? babelPluginFlowReactPropTypes_proptype_Element === require('prop-types').any ? {} : babelPluginFlowReactPropTypes_proptype_Element : {};
  renderWithContext.cleanUp = function () {
    styleManager.reset();
  };

  return renderWithContext;
}