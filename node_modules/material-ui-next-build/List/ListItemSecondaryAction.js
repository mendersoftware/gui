'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleSheet = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _jssThemeReactor = require('jss-theme-reactor');

var _withStyles = require('../styles/withStyles');

var _withStyles2 = _interopRequireDefault(_withStyles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var babelPluginFlowReactPropTypes_proptype_Element = require('react').babelPluginFlowReactPropTypes_proptype_Element || require('prop-types').any; //  weak

var styleSheet = exports.styleSheet = (0, _jssThemeReactor.createStyleSheet)('MuiListItemSecondaryAction', function (theme) {
  return {
    root: {
      position: 'absolute',
      right: 4,
      top: '50%',
      marginTop: -theme.spacing.unit * 3
    }
  };
});

function ListItemSecondaryAction(props) {
  var children = props.children,
      classes = props.classes,
      className = props.className;


  return _react2.default.createElement(
    'div',
    { className: (0, _classnames2.default)(classes.root, className) },
    children
  );
}

ListItemSecondaryAction.propTypes = process.env.NODE_ENV !== "production" ? {
  children: typeof babelPluginFlowReactPropTypes_proptype_Element === 'function' ? babelPluginFlowReactPropTypes_proptype_Element : require('prop-types').shape(babelPluginFlowReactPropTypes_proptype_Element),
  classes: require('prop-types').object.isRequired,
  className: require('prop-types').string
} : {};
ListItemSecondaryAction.muiName = 'ListItemSecondaryAction';

exports.default = (0, _withStyles2.default)(styleSheet)(ListItemSecondaryAction);