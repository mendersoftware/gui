'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _transitions = require('./styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var SvgIcon = _react2.default.createClass({
  displayName: 'SvgIcon',


  propTypes: {
    /**
     * Elements passed into the SVG Icon.
     */
    children: _react2.default.PropTypes.node,

    /**
     * This is the fill color of the svg icon.
     * If not specified, this component will default
     * to muiTheme.palette.textColor.
     */
    color: _react2.default.PropTypes.string,

    /**
     * This is the icon color when the mouse hovers over the icon.
     */
    hoverColor: _react2.default.PropTypes.string,

    /**
     * Function called when mouse enters this element.
     */
    onMouseEnter: _react2.default.PropTypes.func,

    /**
     * Function called when mouse leaves this element.
     */
    onMouseLeave: _react2.default.PropTypes.func,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * Allows you to redifine what the coordinates
     * without units mean inside an svg element. For example,
     * if the SVG element is 500 (width) by 200 (height), and you
     * pass viewBox="0 0 50 20", this means that the coordinates inside
     * the svg will go from the top left corner (0,0) to bottom right (50,20)
     * and each unit will be worth 10px.
     */
    viewBox: _react2.default.PropTypes.string
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      onMouseEnter: function onMouseEnter() {},
      onMouseLeave: function onMouseLeave() {},
      viewBox: '0 0 24 24'
    };
  },
  getInitialState: function getInitialState() {
    return {
      hovered: false,
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
  _handleMouseLeave: function _handleMouseLeave(event) {
    this.setState({ hovered: false });
    this.props.onMouseLeave(event);
  },
  _handleMouseEnter: function _handleMouseEnter(event) {
    this.setState({ hovered: true });
    this.props.onMouseEnter(event);
  },
  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var color = _props.color;
    var hoverColor = _props.hoverColor;
    var onMouseEnter = _props.onMouseEnter;
    var onMouseLeave = _props.onMouseLeave;
    var style = _props.style;
    var viewBox = _props.viewBox;

    var other = _objectWithoutProperties(_props, ['children', 'color', 'hoverColor', 'onMouseEnter', 'onMouseLeave', 'style', 'viewBox']);

    var _state$muiTheme = this.state.muiTheme;
    var baseTheme = _state$muiTheme.baseTheme;
    var prepareStyles = _state$muiTheme.prepareStyles;


    var offColor = color ? color : style && style.fill ? style.fill : baseTheme.palette.textColor;
    var onColor = hoverColor ? hoverColor : offColor;

    var mergedStyles = (0, _simpleAssign2.default)({
      display: 'inline-block',
      fill: this.state.hovered ? onColor : offColor,
      height: 24,
      width: 24,
      userSelect: 'none',
      transition: _transitions2.default.easeOut()
    }, style);

    return _react2.default.createElement(
      'svg',
      _extends({}, other, {
        onMouseEnter: this._handleMouseEnter,
        onMouseLeave: this._handleMouseLeave,
        style: prepareStyles(mergedStyles),
        viewBox: viewBox
      }),
      children
    );
  }
});

exports.default = SvgIcon;