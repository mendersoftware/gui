'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleSheet = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

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

var styleSheet = exports.styleSheet = (0, _jssThemeReactor.createStyleSheet)('MuiTableHead', function (theme) {
  return {
    root: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeightMedium,
      color: theme.palette.text.secondary
    }
  };
}); //  weak

var TableHead = function (_Component) {
  (0, _inherits3.default)(TableHead, _Component);

  function TableHead() {
    (0, _classCallCheck3.default)(this, TableHead);
    return (0, _possibleConstructorReturn3.default)(this, (TableHead.__proto__ || (0, _getPrototypeOf2.default)(TableHead)).apply(this, arguments));
  }

  (0, _createClass3.default)(TableHead, [{
    key: 'getChildContext',
    value: function getChildContext() {
      // eslint-disable-line class-methods-use-this
      return {
        table: {
          head: true
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          classes = _props.classes,
          classNameProp = _props.className,
          children = _props.children,
          other = (0, _objectWithoutProperties3.default)(_props, ['classes', 'className', 'children']);

      var className = (0, _classnames2.default)(classes.root, classNameProp);

      return _react2.default.createElement(
        'thead',
        (0, _extends3.default)({ className: className }, other),
        children
      );
    }
  }]);
  return TableHead;
}(_react.Component);

TableHead.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * Should be valid `<thead>` children such as `TableRow`.
   */
  children: _propTypes2.default.node,
  /**
   * Useful to extend the style applied to components.
   */
  classes: _propTypes2.default.object.isRequired,
  /**
   * @ignore
   */
  className: _propTypes2.default.string
} : {};

TableHead.contextTypes = {
  table: _propTypes2.default.object
};

TableHead.childContextTypes = {
  table: _propTypes2.default.object
};

exports.default = (0, _withStyles2.default)(styleSheet)(TableHead);