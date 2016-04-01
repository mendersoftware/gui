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

var _colorManipulator = require('./utils/color-manipulator');

var _colorManipulator2 = _interopRequireDefault(_colorManipulator);

var _enhancedButton = require('./enhanced-button');

var _enhancedButton2 = _interopRequireDefault(_enhancedButton);

var _fontIcon = require('./font-icon');

var _fontIcon2 = _interopRequireDefault(_fontIcon);

var _paper = require('./paper');

var _paper2 = _interopRequireDefault(_paper);

var _children = require('./utils/children');

var _children2 = _interopRequireDefault(_children);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _propTypes = require('./utils/prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var floatingActionButton = state.muiTheme.floatingActionButton;


  var backgroundColor = props.backgroundColor || floatingActionButton.color;
  var iconColor = floatingActionButton.iconColor;

  if (props.disabled) {
    backgroundColor = props.disabledColor || floatingActionButton.disabledColor;
    iconColor = floatingActionButton.disabledTextColor;
  } else if (props.secondary) {
    backgroundColor = floatingActionButton.secondaryColor;
    iconColor = floatingActionButton.secondaryIconColor;
  }

  return {
    root: {
      transition: _transitions2.default.easeOut(),
      display: 'inline-block'
    },
    container: {
      backgroundColor: backgroundColor,
      transition: _transitions2.default.easeOut(),
      position: 'relative',
      height: floatingActionButton.buttonSize,
      width: floatingActionButton.buttonSize,
      padding: 0,
      overflow: 'hidden',
      borderRadius: '50%',
      textAlign: 'center',
      verticalAlign: 'bottom'
    },
    containerWhenMini: {
      height: floatingActionButton.miniSize,
      width: floatingActionButton.miniSize
    },
    overlay: {
      transition: _transitions2.default.easeOut(),
      top: 0
    },
    overlayWhenHovered: {
      backgroundColor: _colorManipulator2.default.fade(iconColor, 0.4)
    },
    icon: {
      height: floatingActionButton.buttonSize,
      lineHeight: floatingActionButton.buttonSize + 'px',
      fill: floatingActionButton.iconColor,
      color: iconColor
    },
    iconWhenMini: {
      height: floatingActionButton.miniSize,
      lineHeight: floatingActionButton.miniSize + 'px'
    }
  };
}

var FloatingActionButton = _react2.default.createClass({
  displayName: 'FloatingActionButton',


  propTypes: {
    /**
     * This value will override the default background color for the button.
     * However it will not override the default disabled background color.
     * This has to be set separately using the disabledColor attribute.
     */
    backgroundColor: _react2.default.PropTypes.string,

    /**
     * This is what displayed inside the floating action button; for example, a SVG Icon.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * Disables the button if set to true.
     */
    disabled: _react2.default.PropTypes.bool,

    /**
     * This value will override the default background color for the button when it is disabled.
     */
    disabledColor: _react2.default.PropTypes.string,

    /**
     * URL to link to when button clicked if `linkButton` is set to true.
     */
    href: _react2.default.PropTypes.string,

    /**
     * The icon within the FloatingActionButton is a FontIcon component.
     * This property is the classname of the icon to be displayed inside the button.
     * An alternative to adding an iconClassName would be to manually insert a
     * FontIcon component or custom SvgIcon component or as a child of FloatingActionButton.
     */
    iconClassName: _react2.default.PropTypes.string,

    /**
     * This is the equivalent to iconClassName except that it is used for
     * overriding the inline-styles of the FontIcon component.
     */
    iconStyle: _react2.default.PropTypes.object,

    /**
     * Enables use of `href` property to provide a URL to link to if set to true.
     */
    linkButton: _react2.default.PropTypes.bool,

    /**
     * If true, the button will be a small floating action button.
     */
    mini: _react2.default.PropTypes.bool,

    /**
     * Callback function fired when a mouse button is pressed down on the elmeent.
     *
     * @param {object} event `mousedown` event targeting the element.
     */
    onMouseDown: _react2.default.PropTypes.func,

    /**
     * Callback function fired when the mouse enters the element.
     *
     * @param {object} event `mouseenter` event targeting the element.
     */
    onMouseEnter: _react2.default.PropTypes.func,

    /**
     * Callback function fired when the mouse leaves the element.
     *
     * @param {object} event `mouseleave` event targeting the element.
     */
    onMouseLeave: _react2.default.PropTypes.func,

    /**
     * Callback function fired when a mouse button is released on the element.
     *
     * @param {object} event `mouseup` event targeting the element.
     */
    onMouseUp: _react2.default.PropTypes.func,

    /**
     * Callback function fired when a touch point is removed from the element.
     *
     * @param {object} event `touchend` event targeting the element.
     */
    onTouchEnd: _react2.default.PropTypes.func,

    /**
     * Callback function fired when the element is touched.
     *
     * @param {object} event `touchstart` event targeting the element.
     */
    onTouchStart: _react2.default.PropTypes.func,

    /**
     * If true, the button will use the secondary button colors.
     */
    secondary: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The zDepth of the underlying `Paper` component.
     */
    zDepth: _propTypes2.default.zDepth
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      disabled: false,
      mini: false,
      secondary: false,
      zDepth: 2
    };
  },
  getInitialState: function getInitialState() {
    return {
      hovered: false,
      touch: false,
      zDepth: this.props.disabled ? 0 : this.props.zDepth,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    process.env.NODE_ENV !== "production" ? (0, _warning2.default)(!this.props.iconClassName || !this.props.children, 'You have set both an iconClassName and a child icon. ' + 'It is recommended you use only one method when adding ' + 'icons to FloatingActionButtons.') : void 0;
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newState = {
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    };

    if (nextProps.disabled !== this.props.disabled) {
      var zDepth = nextProps.disabled ? 0 : this.props.zDepth;
      newState.zDepth = zDepth;
    }

    this.setState(newState);
  },
  _handleMouseDown: function _handleMouseDown(event) {
    //only listen to left clicks
    if (event.button === 0) {
      this.setState({ zDepth: this.props.zDepth + 1 });
    }
    if (this.props.onMouseDown) this.props.onMouseDown(event);
  },
  _handleMouseUp: function _handleMouseUp(event) {
    this.setState({ zDepth: this.props.zDepth });
    if (this.props.onMouseUp) this.props.onMouseUp(event);
  },
  _handleMouseLeave: function _handleMouseLeave(event) {
    if (!this.refs.container.isKeyboardFocused()) this.setState({ zDepth: this.props.zDepth, hovered: false });
    if (this.props.onMouseLeave) this.props.onMouseLeave(event);
  },
  _handleMouseEnter: function _handleMouseEnter(event) {
    if (!this.refs.container.isKeyboardFocused() && !this.state.touch) {
      this.setState({ hovered: true });
    }
    if (this.props.onMouseEnter) this.props.onMouseEnter(event);
  },
  _handleTouchStart: function _handleTouchStart(event) {
    this.setState({
      touch: true,
      zDepth: this.props.zDepth + 1
    });
    if (this.props.onTouchStart) this.props.onTouchStart(event);
  },
  _handleTouchEnd: function _handleTouchEnd(event) {
    this.setState({ zDepth: this.props.zDepth });
    if (this.props.onTouchEnd) this.props.onTouchEnd(event);
  },
  _handleKeyboardFocus: function _handleKeyboardFocus(event, keyboardFocused) {
    if (keyboardFocused && !this.props.disabled) {
      this.setState({ zDepth: this.props.zDepth + 1 });
      this.refs.overlay.style.backgroundColor = _colorManipulator2.default.fade(this.getStyles().icon.color, 0.4);
    } else if (!this.state.hovered) {
      this.setState({ zDepth: this.props.zDepth });
      this.refs.overlay.style.backgroundColor = 'transparent';
    }
  },
  render: function render() {
    var _props = this.props;
    var className = _props.className;
    var disabled = _props.disabled;
    var mini = _props.mini;
    var secondary = _props.secondary;
    var iconStyle = _props.iconStyle;
    var iconClassName = _props.iconClassName;

    var other = _objectWithoutProperties(_props, ['className', 'disabled', 'mini', 'secondary', 'iconStyle', 'iconClassName']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var iconElement = void 0;
    if (iconClassName) {
      iconElement = _react2.default.createElement(_fontIcon2.default, {
        className: iconClassName,
        style: (0, _simpleAssign2.default)({}, styles.icon, mini && styles.iconWhenMini, iconStyle)
      });
    }

    var children = _children2.default.extend(this.props.children, {
      style: (0, _simpleAssign2.default)({}, styles.icon, mini && styles.iconWhenMini, iconStyle)
    });

    var buttonEventHandlers = disabled ? null : {
      onMouseDown: this._handleMouseDown,
      onMouseUp: this._handleMouseUp,
      onMouseLeave: this._handleMouseLeave,
      onMouseEnter: this._handleMouseEnter,
      onTouchStart: this._handleTouchStart,
      onTouchEnd: this._handleTouchEnd,
      onKeyboardFocus: this._handleKeyboardFocus
    };

    return _react2.default.createElement(
      _paper2.default,
      {
        className: className,
        style: (0, _simpleAssign2.default)(styles.root, this.props.style),
        zDepth: this.state.zDepth,
        circle: true
      },
      _react2.default.createElement(
        _enhancedButton2.default,
        _extends({}, other, buttonEventHandlers, {
          ref: 'container',
          disabled: disabled,
          style: (0, _simpleAssign2.default)(styles.container, this.props.mini && styles.containerWhenMini, iconStyle),
          focusRippleColor: styles.icon.color,
          touchRippleColor: styles.icon.color
        }),
        _react2.default.createElement(
          'div',
          {
            ref: 'overlay',
            style: prepareStyles((0, _simpleAssign2.default)(styles.overlay, this.state.hovered && !this.props.disabled && styles.overlayWhenHovered))
          },
          iconElement,
          children
        )
      )
    );
  }
});

exports.default = FloatingActionButton;