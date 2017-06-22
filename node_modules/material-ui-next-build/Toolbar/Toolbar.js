'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleSheet = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _jssThemeReactor = require('jss-theme-reactor');

var _withStyles = require('../styles/withStyles');

var _withStyles2 = _interopRequireDefault(_withStyles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styleSheet = exports.styleSheet = (0, _jssThemeReactor.createStyleSheet)('MuiToolbar', function (theme) {
  return {
    root: (0, _defineProperty3.default)({
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: 56
    }, theme.breakpoints.up('sm'), {
      height: 64
    }),
    gutters: theme.mixins.gutters({})
  };
}); //  weak

function Toolbar(props) {
  var children = props.children,
      classes = props.classes,
      classNameProp = props.className,
      disableGutters = props.disableGutters,
      other = (0, _objectWithoutProperties3.default)(props, ['children', 'classes', 'className', 'disableGutters']);


  var className = (0, _classnames2.default)(classes.root, (0, _defineProperty3.default)({}, classes.gutters, !disableGutters), classNameProp);

  return _react2.default.createElement(
    'div',
    (0, _extends3.default)({ className: className }, other),
    children
  );
}

Toolbar.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * Can be a `ToolbarGroup` to render a group of related items.
   */
  children: _propTypes2.default.node,
  /**
   * Useful to extend the style applied to components.
   */
  classes: _propTypes2.default.object.isRequired,
  /**
   * @ignore
   */
  className: _propTypes2.default.string,
  /**
   * If `true`, disables gutter padding.
   */
  disableGutters: _propTypes2.default.bool
} : {};

Toolbar.defaultProps = {
  disableGutters: false
};

exports.default = (0, _withStyles2.default)(styleSheet)(Toolbar);