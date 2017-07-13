'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleSheet = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _jssThemeReactor = require('jss-theme-reactor');

var _withStyles = require('../styles/withStyles');

var _withStyles2 = _interopRequireDefault(_withStyles);

var _Paper = require('../Paper');

var _Paper2 = _interopRequireDefault(_Paper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styleSheet = exports.styleSheet = (0, _jssThemeReactor.createStyleSheet)('MuiCard', {
  root: {
    overflow: 'hidden'
  }
});

function Card(props) {
  var classes = props.classes,
      className = props.className,
      raised = props.raised,
      other = (0, _objectWithoutProperties3.default)(props, ['classes', 'className', 'raised']);


  return _react2.default.createElement(_Paper2.default, (0, _extends3.default)({ className: (0, _classnames2.default)(classes.root, className), elevation: raised ? 8 : 2 }, other));
}

Card.propTypes = process.env.NODE_ENV !== "production" ? (0, _defineProperty3.default)({
  raised: require('prop-types').bool.isRequired,
  classes: require('prop-types').object.isRequired,
  className: require('prop-types').string
}, 'raised', require('prop-types').bool) : {};
Card.defaultProps = {
  raised: false
};

exports.default = (0, _withStyles2.default)(styleSheet)(Card);