'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styles = undefined;

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

var _withStyles = require('../styles/withStyles');

var _withStyles2 = _interopRequireDefault(_withStyles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = exports.styles = function styles(theme) {
  return {
    root: {
      borderBottom: '1px solid ' + theme.palette.text.lightDivider,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'left'
    },
    numeric: {
      textAlign: 'right',
      flexDirection: 'row-reverse' // can be dynamically inherited at runtime by contents
    },
    head: {
      whiteSpace: 'pre'
    },
    padding: {
      padding: '0 ' + theme.spacing.unit * 7 + 'px 0 ' + theme.spacing.unit * 3 + 'px',
      '&:last-child': {
        paddingRight: theme.spacing.unit * 3
      }
    },
    compact: {
      paddingRight: theme.spacing.unit * 3
    },
    checkbox: {
      paddingLeft: 12,
      paddingRight: 12
    },
    footer: {}
  };
};

function TableCell(props, context) {
  var _classNames;

  var classes = props.classes,
      classNameProp = props.className,
      children = props.children,
      compact = props.compact,
      checkbox = props.checkbox,
      numeric = props.numeric,
      disablePadding = props.disablePadding,
      component = props.component,
      other = (0, _objectWithoutProperties3.default)(props, ['classes', 'className', 'children', 'compact', 'checkbox', 'numeric', 'disablePadding', 'component']);
  var table = context.table;

  var Component = void 0;
  if (component) {
    Component = component;
  } else {
    Component = table && table.head ? 'th' : 'td';
  }
  var className = (0, _classnames2.default)(classes.root, (_classNames = {}, (0, _defineProperty3.default)(_classNames, classes.numeric, numeric), (0, _defineProperty3.default)(_classNames, classes.compact, compact), (0, _defineProperty3.default)(_classNames, classes.checkbox, checkbox), (0, _defineProperty3.default)(_classNames, classes.padding, !disablePadding), (0, _defineProperty3.default)(_classNames, classes.head, table && table.head), (0, _defineProperty3.default)(_classNames, classes.footer, table && table.footer), _classNames), classNameProp);

  return _react2.default.createElement(
    Component,
    (0, _extends3.default)({ className: className }, other),
    children
  );
}

TableCell.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * If `true`, the cell padding will be adjusted to accommodate a checkbox.
   */
  checkbox: _propTypes2.default.bool,
  /**
   * The table cell contents.
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
   * If `true`, compact cell padding will be used to accommodate more content.
   */
  compact: _propTypes2.default.bool,
  /**
   * The component used for the root node.
   * Either a string to use a DOM element or a component.
   */
  component: _propTypes2.default.string,
  /**
   * If `true`, left/right cell padding will be disabled.
   */
  disablePadding: _propTypes2.default.bool,
  /**
   * If `true`, content will align to the right.
   */
  numeric: _propTypes2.default.bool
} : {};

TableCell.defaultProps = {
  checkbox: false,
  compact: false,
  numeric: false,
  disablePadding: false,
  component: null
};

TableCell.contextTypes = {
  table: _propTypes2.default.object
};

exports.default = (0, _withStyles2.default)(styles, { name: 'MuiTableCell' })(TableCell);