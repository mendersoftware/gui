'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var tableRowColumn = state.muiTheme.tableRowColumn;


  var styles = {
    root: {
      paddingLeft: tableRowColumn.spacing,
      paddingRight: tableRowColumn.spacing,
      height: tableRowColumn.height,
      textAlign: 'left',
      fontSize: 13,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }
  };

  if (_react2.default.Children.count(props.children) === 1 && !isNaN(props.children)) {
    styles.textAlign = 'right';
  }

  return styles;
}

var TableRowColumn = _react2.default.createClass({
  displayName: 'TableRowColumn',


  propTypes: {
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * @ignore
     * Number to identify the header row. This property
     * is automatically populated when used with TableHeader.
     */
    columnNumber: _react2.default.PropTypes.number,

    /**
     * @ignore
     * If true, this column responds to hover events.
     */
    hoverable: _react2.default.PropTypes.bool,

    /**
     * Key for this element.
     */
    key: _react2.default.PropTypes.string,

    /**
     * @ignore
     * Callback function for click event.
     */
    onClick: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Callback function for hover event.
     */
    onHover: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Callback function for hover exit event.
     */
    onHoverExit: _react2.default.PropTypes.func,

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
      hoverable: false
    };
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
  _onClick: function _onClick(event) {
    if (this.props.onClick) this.props.onClick(event, this.props.columnNumber);
  },
  _onMouseEnter: function _onMouseEnter(event) {
    if (this.props.hoverable) {
      this.setState({ hovered: true });
      if (this.props.onHover) this.props.onHover(event, this.props.columnNumber);
    }
  },
  _onMouseLeave: function _onMouseLeave(event) {
    if (this.props.hoverable) {
      this.setState({ hovered: false });
      if (this.props.onHoverExit) this.props.onHoverExit(event, this.props.columnNumber);
    }
  },
  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var className = _props.className;
    var columnNumber = _props.columnNumber;
    var hoverable = _props.hoverable;
    var onClick = _props.onClick;
    var onHover = _props.onHover;
    var onHoverExit = _props.onHoverExit;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['children', 'className', 'columnNumber', 'hoverable', 'onClick', 'onHover', 'onHoverExit', 'style']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var handlers = {
      onClick: this._onClick,
      onMouseEnter: this._onMouseEnter,
      onMouseLeave: this._onMouseLeave
    };

    return _react2.default.createElement(
      'td',
      _extends({
        key: this.props.key,
        className: className,
        style: prepareStyles((0, _simpleAssign2.default)(styles.root, style))
      }, handlers, other),
      children
    );
  }
});

exports.default = TableRowColumn;