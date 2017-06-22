'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleSheet = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

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

var styleSheet = exports.styleSheet = (0, _jssThemeReactor.createStyleSheet)('MuiTableRow', function (theme) {
  return {
    root: {
      height: 48,
      '&:focus': {
        outline: 'none'
      }
    },
    head: {
      height: 64
    },
    footer: {
      height: 56
    },
    hover: {
      '&:hover': {
        background: theme.palette.background.contentFrame
      }
    },
    selected: {
      background: theme.palette.background.appBar
    }
  };
});

/**
 * Will automatically set dynamic row height
 * based on the material table element parent (head, body, etc).
 */
//  weak

function TableRow(props, context) {
  var _classNames;

  var classes = props.classes,
      classNameProp = props.className,
      children = props.children,
      hover = props.hover,
      selected = props.selected,
      other = (0, _objectWithoutProperties3.default)(props, ['classes', 'className', 'children', 'hover', 'selected']);
  var table = context.table;


  var className = (0, _classnames2.default)(classes.root, (_classNames = {}, (0, _defineProperty3.default)(_classNames, classes.head, table && table.head), (0, _defineProperty3.default)(_classNames, classes.footer, table && table.footer), (0, _defineProperty3.default)(_classNames, classes.hover, table && hover), (0, _defineProperty3.default)(_classNames, classes.selected, table && selected), _classNames), classNameProp);

  return _react2.default.createElement(
    'tr',
    (0, _extends3.default)({ className: className }, other),
    children
  );
}

TableRow.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * Should be valid `<tr>` children such as `TableCell`.
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
   * If `true`, the table row will shade on hover.
   */
  hover: _propTypes2.default.bool,
  /**
   * If `true`, the table row will have the selected shading.
   */
  selected: _propTypes2.default.bool
} : {};

TableRow.defaultProps = {
  hover: false,
  selected: false
};

TableRow.contextTypes = {
  table: _propTypes2.default.object
};

exports.default = (0, _withStyles2.default)(styleSheet)(TableRow);