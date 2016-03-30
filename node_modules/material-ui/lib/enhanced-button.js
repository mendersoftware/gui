'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _reactAddonsPureRenderMixin2 = _interopRequireDefault(_reactAddonsPureRenderMixin);

var _children = require('./utils/children');

var _children2 = _interopRequireDefault(_children);

var _events = require('./utils/events');

var _events2 = _interopRequireDefault(_events);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _focusRipple = require('./ripples/focus-ripple');

var _focusRipple2 = _interopRequireDefault(_focusRipple);

var _touchRipple = require('./ripples/touch-ripple');

var _touchRipple2 = _interopRequireDefault(_touchRipple);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var styleInjected = false;
var listening = false;
var tabPressed = false;

function injectStyle() {
  if (!styleInjected) {
    // Remove inner padding and border in Firefox 4+.
    var style = document.createElement('style');
    style.innerHTML = '\n      button::-moz-focus-inner,\n      input::-moz-focus-inner {\n        border: 0;\n        padding: 0;\n      }\n    ';

    document.body.appendChild(style);
    styleInjected = true;
  }
}

function listenForTabPresses() {
  if (!listening) {
    _events2.default.on(window, 'keydown', function (event) {
      tabPressed = (0, _keycode2.default)(event) === 'tab';
    });
    listening = true;
  }
}

var EnhancedButton = _react2.default.createClass({
  displayName: 'EnhancedButton',


  propTypes: {
    centerRipple: _react2.default.PropTypes.bool,
    children: _react2.default.PropTypes.node,
    containerElement: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.element]),
    disableFocusRipple: _react2.default.PropTypes.bool,
    disableKeyboardFocus: _react2.default.PropTypes.bool,
    disableTouchRipple: _react2.default.PropTypes.bool,
    disabled: _react2.default.PropTypes.bool,
    focusRippleColor: _react2.default.PropTypes.string,
    focusRippleOpacity: _react2.default.PropTypes.number,
    keyboardFocused: _react2.default.PropTypes.bool,
    linkButton: _react2.default.PropTypes.bool,
    onBlur: _react2.default.PropTypes.func,
    onClick: _react2.default.PropTypes.func,
    onFocus: _react2.default.PropTypes.func,
    onKeyDown: _react2.default.PropTypes.func,
    onKeyUp: _react2.default.PropTypes.func,
    onKeyboardFocus: _react2.default.PropTypes.func,
    onTouchTap: _react2.default.PropTypes.func,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,
    tabIndex: _react2.default.PropTypes.number,
    touchRippleColor: _react2.default.PropTypes.string,
    touchRippleOpacity: _react2.default.PropTypes.number,
    type: _react2.default.PropTypes.string
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  mixins: [_reactAddonsPureRenderMixin2.default],

  getDefaultProps: function getDefaultProps() {
    return {
      containerElement: 'button',
      onBlur: function onBlur() {},
      onClick: function onClick() {},
      onFocus: function onFocus() {},
      onKeyboardFocus: function onKeyboardFocus() {},
      onKeyDown: function onKeyDown() {},
      onKeyUp: function onKeyUp() {},
      onTouchTap: function onTouchTap() {},
      tabIndex: 0,
      type: 'button'
    };
  },
  getInitialState: function getInitialState() {
    return {
      isKeyboardFocused: !this.props.disabled && this.props.keyboardFocused && !this.props.disableKeyboardFocus,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    injectStyle();
    listenForTabPresses();
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });

    if ((nextProps.disabled || nextProps.disableKeyboardFocus) && this.state.isKeyboardFocused) {
      this.setState({ isKeyboardFocused: false });
      if (nextProps.onKeyboardFocus) {
        nextProps.onKeyboardFocus(null, false);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this._focusTimeout);
  },
  isKeyboardFocused: function isKeyboardFocused() {
    return this.state.isKeyboardFocused;
  },
  removeKeyboardFocus: function removeKeyboardFocus(event) {
    if (this.state.isKeyboardFocused) {
      this.setState({ isKeyboardFocused: false });
      this.props.onKeyboardFocus(event, false);
    }
  },
  setKeyboardFocus: function setKeyboardFocus(event) {
    if (!this.state.isKeyboardFocused) {
      this.setState({ isKeyboardFocused: true });
      this.props.onKeyboardFocus(event, true);
    }
  },
  _cancelFocusTimeout: function _cancelFocusTimeout() {
    if (this._focusTimeout) {
      clearTimeout(this._focusTimeout);
      this._focusTimeout = null;
    }
  },
  _createButtonChildren: function _createButtonChildren() {
    var _props = this.props;
    var centerRipple = _props.centerRipple;
    var children = _props.children;
    var disabled = _props.disabled;
    var disableFocusRipple = _props.disableFocusRipple;
    var disableKeyboardFocus = _props.disableKeyboardFocus;
    var disableTouchRipple = _props.disableTouchRipple;
    var focusRippleColor = _props.focusRippleColor;
    var focusRippleOpacity = _props.focusRippleOpacity;
    var touchRippleColor = _props.touchRippleColor;
    var touchRippleOpacity = _props.touchRippleOpacity;
    var isKeyboardFocused = this.state.isKeyboardFocused;

    //Focus Ripple

    var focusRipple = isKeyboardFocused && !disabled && !disableFocusRipple && !disableKeyboardFocus ? _react2.default.createElement(_focusRipple2.default, {
      color: focusRippleColor,
      muiTheme: this.state.muiTheme,
      opacity: focusRippleOpacity,
      show: isKeyboardFocused
    }) : undefined;

    //Touch Ripple
    var touchRipple = !disabled && !disableTouchRipple ? _react2.default.createElement(
      _touchRipple2.default,
      {
        centerRipple: centerRipple,
        color: touchRippleColor,
        muiTheme: this.state.muiTheme,
        opacity: touchRippleOpacity
      },
      children
    ) : undefined;

    return _children2.default.create({
      focusRipple: focusRipple,
      touchRipple: touchRipple,
      children: touchRipple ? undefined : children
    });
  },
  _handleKeyDown: function _handleKeyDown(event) {
    if (!this.props.disabled && !this.props.disableKeyboardFocus) {
      if ((0, _keycode2.default)(event) === 'enter' && this.state.isKeyboardFocused) {
        this._handleTouchTap(event);
      }
    }
    this.props.onKeyDown(event);
  },
  _handleKeyUp: function _handleKeyUp(event) {
    if (!this.props.disabled && !this.props.disableKeyboardFocus) {
      if ((0, _keycode2.default)(event) === 'space' && this.state.isKeyboardFocused) {
        this._handleTouchTap(event);
      }
    }
    this.props.onKeyUp(event);
  },
  _handleBlur: function _handleBlur(event) {
    this._cancelFocusTimeout();
    this.removeKeyboardFocus(event);
    this.props.onBlur(event);
  },
  _handleFocus: function _handleFocus(event) {
    var _this = this;

    if (event) event.persist();
    if (!this.props.disabled && !this.props.disableKeyboardFocus) {
      //setTimeout is needed because the focus event fires first
      //Wait so that we can capture if this was a keyboard focus
      //or touch focus
      this._focusTimeout = setTimeout(function () {
        if (tabPressed) {
          _this.setKeyboardFocus(event);
        }
      }, 150);

      this.props.onFocus(event);
    }
  },
  _handleClick: function _handleClick(event) {
    if (!this.props.disabled) {
      tabPressed = false;
      this.props.onClick(event);
    }
  },
  _handleTouchTap: function _handleTouchTap(event) {
    this._cancelFocusTimeout();
    if (!this.props.disabled) {
      tabPressed = false;
      this.removeKeyboardFocus(event);
      this.props.onTouchTap(event);
    }
  },
  render: function render() {
    var _props2 = this.props;
    var centerRipple = _props2.centerRipple;
    var children = _props2.children;
    var containerElement = _props2.containerElement;
    var disabled = _props2.disabled;
    var disableFocusRipple = _props2.disableFocusRipple;
    var disableKeyboardFocus = _props2.disableKeyboardFocus;
    var disableTouchRipple = _props2.disableTouchRipple;
    var focusRippleColor = _props2.focusRippleColor;
    var focusRippleOpacity = _props2.focusRippleOpacity;
    var linkButton = _props2.linkButton;
    var touchRippleColor = _props2.touchRippleColor;
    var touchRippleOpacity = _props2.touchRippleOpacity;
    var onBlur = _props2.onBlur;
    var onClick = _props2.onClick;
    var onFocus = _props2.onFocus;
    var onKeyUp = _props2.onKeyUp;
    var onKeyDown = _props2.onKeyDown;
    var onTouchTap = _props2.onTouchTap;
    var style = _props2.style;
    var tabIndex = _props2.tabIndex;
    var type = _props2.type;

    var other = _objectWithoutProperties(_props2, ['centerRipple', 'children', 'containerElement', 'disabled', 'disableFocusRipple', 'disableKeyboardFocus', 'disableTouchRipple', 'focusRippleColor', 'focusRippleOpacity', 'linkButton', 'touchRippleColor', 'touchRippleOpacity', 'onBlur', 'onClick', 'onFocus', 'onKeyUp', 'onKeyDown', 'onTouchTap', 'style', 'tabIndex', 'type']);

    var _state$muiTheme = this.state.muiTheme;
    var prepareStyles = _state$muiTheme.prepareStyles;
    var enhancedButton = _state$muiTheme.enhancedButton;


    var mergedStyles = (0, _simpleAssign2.default)({
      border: 10,
      background: 'none',
      boxSizing: 'border-box',
      display: 'inline-block',
      fontFamily: this.state.muiTheme.rawTheme.fontFamily,
      WebkitTapHighlightColor: enhancedButton.tapHighlightColor, // Remove mobile color flashing (deprecated)
      cursor: disabled ? 'default' : 'pointer',
      textDecoration: 'none',
      outline: 'none',
      /*
        This is needed so that ripples do not bleed
        past border radius.
        See: http://stackoverflow.com/questions/17298739/
          css-overflow-hidden-not-working-in-chrome-when-parent-has-border-radius-and-chil
       */
      transform: disableTouchRipple && disableFocusRipple ? null : 'translate3d(0, 0, 0)',
      verticalAlign: other.hasOwnProperty('href') ? 'middle' : null
    }, style);

    if (disabled && linkButton) {
      return _react2.default.createElement(
        'span',
        _extends({}, other, {
          style: mergedStyles
        }),
        children
      );
    }

    var buttonProps = _extends({}, other, {
      style: prepareStyles(mergedStyles),
      disabled: disabled,
      onBlur: this._handleBlur,
      onClick: this._handleClick,
      onFocus: this._handleFocus,
      onTouchTap: this._handleTouchTap,
      onKeyUp: this._handleKeyUp,
      onKeyDown: this._handleKeyDown,
      tabIndex: tabIndex,
      type: type
    });
    var buttonChildren = this._createButtonChildren();

    // Provides backward compatibity. Added to support wrapping around <a> element.
    var targetLinkElement = buttonProps.hasOwnProperty('href') ? 'a' : 'span';

    return _react2.default.isValidElement(containerElement) ? _react2.default.cloneElement(containerElement, buttonProps, buttonChildren) : _react2.default.createElement(linkButton ? targetLinkElement : containerElement, buttonProps, buttonChildren);
  }
});

exports.default = EnhancedButton;