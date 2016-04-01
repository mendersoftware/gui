'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tableRowColumn = require('./table-row-column');

var _tableRowColumn2 = _interopRequireDefault(_tableRowColumn);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var tableFooter = state.muiTheme.tableFooter;


  return {
    cell: {
      borderTop: '1px solid ' + tableFooter.borderColor,
      verticalAlign: 'bottom',
      padding: 20,
      textAlign: 'left',
      whiteSpace: 'nowrap'
    }
  };
}

var TableFooter = _react2.default.createClass({
  displayName: 'TableFooter',


  propTypes: {
    /**
     * @ignore
     * Controls whether or not header rows should be adjusted
     * for a checkbox column. If the select all checkbox is true,
     * this property will not influence the number of columns.
     * This is mainly useful for "super header" rows so that
     * the checkbox column does not create an offset that needs
     * to be accounted for manually.
     */
    adjustForCheckbox: _react2.default.PropTypes.bool,
    /**
     * Children passed to table footer.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      adjustForCheckbox: true,
      style: {}
    };
  },
  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  render: function render() {
    var _props = this.props;
    var adjustForCheckbox = _props.adjustForCheckbox;
    var children = _props.children;
    var className = _props.className;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['adjustForCheckbox', 'children', 'className', 'style']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var footerRows = _react2.default.Children.map(children, function (child, rowNumber) {
      var newChildProps = {
        displayBorder: false,
        key: 'f-' + rowNumber,
        rowNumber: rowNumber,
        style: (0, _simpleAssign2.default)({}, styles.cell, child.props.style)
      };

      var newDescendants = void 0;
      if (adjustForCheckbox) {
        newDescendants = [_react2.default.createElement(_tableRowColumn2.default, { key: 'fpcb' + rowNumber, style: { width: 24 } })].concat(_toConsumableArray(_react2.default.Children.toArray(child.props.children)));
      }

      return _react2.default.cloneElement(child, newChildProps, newDescendants);
    });

    return _react2.default.createElement(
      'tfoot',
      _extends({ className: className, style: prepareStyles((0, _simpleAssign2.default)({}, style)) }, other),
      footerRows
    );
  }
});

exports.default = TableFooter;