'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _reactAddonsPureRenderMixin2 = _interopRequireDefault(_reactAddonsPureRenderMixin);

var _autoPrefix = require('../styles/auto-prefix');

var _autoPrefix2 = _interopRequireDefault(_autoPrefix);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var CircleRipple = _react2.default.createClass({
  displayName: 'CircleRipple',


  propTypes: {
    aborted: _react2.default.PropTypes.bool,
    color: _react2.default.PropTypes.string,

    /**
     * @ignore
     * The material-ui theme applied to this component.
     */
    muiTheme: _react2.default.PropTypes.object.isRequired,

    opacity: _react2.default.PropTypes.number,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object
  },

  mixins: [_reactAddonsPureRenderMixin2.default],

  getDefaultProps: function getDefaultProps() {
    return {
      opacity: 0.1,
      aborted: false
    };
  },
  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this.enterTimer);
    clearTimeout(this.leaveTimer);
  },
  componentWillAppear: function componentWillAppear(callback) {
    this._initializeAnimation(callback);
  },
  componentWillEnter: function componentWillEnter(callback) {
    this._initializeAnimation(callback);
  },
  componentDidAppear: function componentDidAppear() {
    this._animate();
  },
  componentDidEnter: function componentDidEnter() {
    this._animate();
  },
  componentWillLeave: function componentWillLeave(callback) {
    var style = _reactDom2.default.findDOMNode(this).style;
    style.opacity = 0;
    //If the animation is aborted, remove from the DOM immediately
    var removeAfter = this.props.aborted ? 0 : 2000;
    this.enterTimer = setTimeout(callback, removeAfter);
  },
  _animate: function _animate() {
    var style = _reactDom2.default.findDOMNode(this).style;
    var transitionValue = _transitions2.default.easeOut('2s', 'opacity') + ', ' + _transitions2.default.easeOut('1s', 'transform');
    _autoPrefix2.default.set(style, 'transition', transitionValue, this.props.muiTheme);
    _autoPrefix2.default.set(style, 'transform', 'scale(1)', this.props.muiTheme);
  },
  _initializeAnimation: function _initializeAnimation(callback) {
    var style = _reactDom2.default.findDOMNode(this).style;
    style.opacity = this.props.opacity;
    _autoPrefix2.default.set(style, 'transform', 'scale(0)', this.props.muiTheme);
    this.leaveTimer = setTimeout(callback, 0);
  },
  render: function render() {
    var _props = this.props;
    var color = _props.color;
    var prepareStyles = _props.muiTheme.prepareStyles;
    var opacity = _props.opacity;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['color', 'muiTheme', 'opacity', 'style']);

    var mergedStyles = (0, _simpleAssign2.default)({
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: '100%',
      borderRadius: '50%',
      backgroundColor: color
    }, style);

    return _react2.default.createElement('div', _extends({}, other, { style: prepareStyles(mergedStyles) }));
  }
});

exports.default = CircleRipple;