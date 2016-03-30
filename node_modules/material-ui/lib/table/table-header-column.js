'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tooltip = require('../tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var tableHeaderColumn = state.muiTheme.tableHeaderColumn;


  return {
    root: {
      fontWeight: 'normal',
      fontSize: 12,
      paddingLeft: tableHeaderColumn.spacing,
      paddingRight: tableHeaderColumn.spacing,
      height: tableHeaderColumn.height,
      textAlign: 'left',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      color: tableHeaderColumn.textColor,
      position: 'relative'
    },
    tooltip: {
      boxSizing: 'border-box',
      marginTop: tableHeaderColumn.height / 2
    }
  };
}

var TableHeaderColumn = _react2.default.createClass({
  displayName: 'TableHeaderColumn',


  propTypes: {
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * Number to identify the header row. This property
     * is automatically populated when used with TableHeader.
     */
    columnNumber: _react2.default.PropTypes.number,

    /**
     * Key prop for table header column.
     */
    key: _react2.default.PropTypes.string,

    /**
     * @ignore
     * Callback function for click event.
     */
    onClick: _react2.default.PropTypes.func,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The string to supply to the tooltip. If not
     * string is supplied no tooltip will be shown.
     */
    tooltip: _react2.default.PropTypes.string,

    /**
     * Additional styling that can be applied to the tooltip.
     */
    tooltipStyle: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)(),
      hovered: false
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
  _onMouseEnter: function _onMouseEnter() {
    if (this.props.tooltip !== undefined) this.setState({ hovered: true });
  },
  _onMouseLeave: function _onMouseLeave() {
    if (this.props.tooltip !== undefined) this.setState({ hovered: false });
  },
  _onClick: function _onClick(event) {
    if (this.props.onClick) this.props.onClick(event, this.props.columnNumber);
  },
  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var className = _props.className;
    var columnNumber = _props.columnNumber;
    var onClick = _props.onClick;
    var style = _props.style;
    var tooltip = _props.tooltip;
    var tooltipStyle = _props.tooltipStyle;

    var other = _objectWithoutProperties(_props, ['children', 'className', 'columnNumber', 'onClick', 'style', 'tooltip', 'tooltipStyle']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);
    var handlers = {
      onMouseEnter: this._onMouseEnter,
      onMouseLeave: this._onMouseLeave,
      onClick: this._onClick
    };

    var tooltipNode = void 0;

    if (tooltip !== undefined) {
      tooltipNode = _react2.default.createElement(_tooltip2.default, {
        label: tooltip,
        show: this.state.hovered,
        style: (0, _simpleAssign2.default)(styles.tooltip, tooltipStyle)
      });
    }

    return _react2.default.createElement(
      'th',
      _extends({
        key: this.props.key,
        className: className,
        style: prepareStyles((0, _simpleAssign2.default)(styles.root, style))
      }, handlers, other),
      tooltipNode,
      children
    );
  }
});

exports.default = TableHeaderColumn;