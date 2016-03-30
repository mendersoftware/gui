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

var _children = require('./utils/children');

var _children2 = _interopRequireDefault(_children);

var _enhancedButton = require('./enhanced-button');

var _enhancedButton2 = _interopRequireDefault(_enhancedButton);

var _paper = require('./paper');

var _paper2 = _interopRequireDefault(_paper);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function validateLabel(props, propName, componentName) {
  if (!props.children && !props.label && !props.icon) {
    return new Error('Required prop label or children or icon was not specified in ' + componentName + '.');
  }
}

function getStyles(props, state) {
  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var button = _state$muiTheme.button;
  var raisedButton = _state$muiTheme.raisedButton;
  var disabled = props.disabled;
  var disabledBackgroundColor = props.disabledBackgroundColor;
  var disabledLabelColor = props.disabledLabelColor;
  var fullWidth = props.fullWidth;
  var icon = props.icon;
  var label = props.label;
  var labelPosition = props.labelPosition;
  var primary = props.primary;
  var secondary = props.secondary;
  var style = props.style;


  var amount = primary || secondary ? 0.4 : 0.08;

  var backgroundColor = raisedButton.color;
  var labelColor = raisedButton.textColor;

  if (disabled) {
    backgroundColor = disabledBackgroundColor || raisedButton.disabledColor;
    labelColor = disabledLabelColor || raisedButton.disabledTextColor;
  } else if (primary) {
    backgroundColor = raisedButton.primaryColor;
    labelColor = raisedButton.primaryTextColor;
  } else if (secondary) {
    backgroundColor = raisedButton.secondaryColor;
    labelColor = raisedButton.secondaryTextColor;
  } else {
    if (props.backgroundColor) {
      backgroundColor = props.backgroundColor;
    }
    if (props.labelColor) {
      labelColor = props.labelColor;
    }
  }

  return {
    root: {
      display: 'inline-block',
      minWidth: fullWidth ? '100%' : button.minWidth,
      height: button.height,
      transition: _transitions2.default.easeOut()
    },
    container: {
      position: 'relative',
      height: '100%',
      width: '100%',
      padding: 0,
      overflow: 'hidden',
      borderRadius: 2,
      transition: _transitions2.default.easeOut(),
      backgroundColor: backgroundColor,
      // That's the default value for a button but not a link
      textAlign: 'center'
    },
    label: {
      position: 'relative',
      verticalAlign: 'middle',
      opacity: 1,
      fontSize: '14px',
      letterSpacing: 0,
      textTransform: raisedButton.textTransform || button.textTransform || 'uppercase',
      fontWeight: raisedButton.fontWeight,
      margin: 0,
      userSelect: 'none',
      paddingLeft: icon && labelPosition !== 'before' ? 8 : baseTheme.spacing.desktopGutterLess,
      paddingRight: icon && labelPosition === 'before' ? 8 : baseTheme.spacing.desktopGutterLess,
      lineHeight: style && style.height || button.height + 'px',
      color: labelColor
    },
    icon: {
      lineHeight: style && style.height || button.height + 'px',
      verticalAlign: 'middle',
      marginLeft: label && labelPosition !== 'before' ? 12 : 0,
      marginRight: label && labelPosition === 'before' ? 12 : 0
    },
    overlay: {
      backgroundColor: state.hovered && !disabled && _colorManipulator2.default.fade(labelColor, amount),
      transition: _transitions2.default.easeOut(),
      top: 0
    },
    overlayWhenHovered: {},
    ripple: {
      color: labelColor,
      opacity: !(primary || secondary) ? 0.1 : 0.16
    }
  };
}

var RaisedButton = _react2.default.createClass({
  displayName: 'RaisedButton',


  propTypes: {
    /**
     * Override the background color. Always takes precedence unless the button is disabled.
     */
    backgroundColor: _react2.default.PropTypes.string,

    /**
     * This is what will be displayed inside the button.
     * If a label is specified, the text within the label prop will
     * be displayed. Otherwise, the component will expect children
     * which will then be displayed. (In our example,
     * we are nesting an `<input type="file" />` and a `span`
     * that acts as our label to be displayed.) This only
     * applies to flat and raised buttons.
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
     * Override the background color if the button is disabled.
     */
    disabledBackgroundColor: _react2.default.PropTypes.string,

    /**
     * Color of the label if disabled is true.
     */
    disabledLabelColor: _react2.default.PropTypes.string,

    /**
     * If true, then the button will take up the full
     * width of its container.
     */
    fullWidth: _react2.default.PropTypes.bool,

    /**
     * URL to link to when button clicked if `linkButton` is set to true.
     */
    href: _react2.default.PropTypes.string,

    /**
     * Use this property to display an icon.
     */
    icon: _react2.default.PropTypes.node,

    /**
     * The label for the button.
     */
    label: validateLabel,

    /**
     * The color of the label for the button.
     */
    labelColor: _react2.default.PropTypes.string,

    /**
     * Place label before or after the passed children.
     */
    labelPosition: _react2.default.PropTypes.oneOf(['before', 'after']),

    /**
     * Override the inline-styles of the button's label element.
     */
    labelStyle: _react2.default.PropTypes.object,

    /**
     * Enables use of `href` property to provide a URL to link to if set to true.
     */
    linkButton: _react2.default.PropTypes.bool,

    /**
     * Callback function for when the mouse is pressed down inside this element.
     */
    onMouseDown: _react2.default.PropTypes.func,

    /**
     * Callback function for when the mouse enters this element.
     */
    onMouseEnter: _react2.default.PropTypes.func,

    /**
     * Callback function for when the mouse leaves this element.
     */
    onMouseLeave: _react2.default.PropTypes.func,

    /**
     * Callback function for when the mouse is realeased
     * above this element.
     */
    onMouseUp: _react2.default.PropTypes.func,

    /**
     * Callback function for when a touchTap event ends.
     */
    onTouchEnd: _react2.default.PropTypes.func,

    /**
     * Callback function for when a touchTap event starts.
     */
    onTouchStart: _react2.default.PropTypes.func,

    /**
     * If true, colors button according to
     * primaryTextColor from the Theme.
     */
    primary: _react2.default.PropTypes.bool,

    /**
     * Override the inline style of ripple element.
     */
    rippleStyle: _react2.default.PropTypes.object,

    /**
     * If true, colors button according to secondaryTextColor from the theme.
     * The primary prop has precendent if set to true.
     */
    secondary: _react2.default.PropTypes.bool,

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
      disabled: false,
      labelPosition: 'after',
      fullWidth: false,
      primary: false,
      secondary: false
    };
  },

  getInitialState: function getInitialState() {
    var zDepth = this.props.disabled ? 0 : 1;
    return {
      hovered: false,
      touched: false,
      initialZDepth: zDepth,
      zDepth: zDepth,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var zDepth = nextProps.disabled ? 0 : 1;
    this.setState({
      zDepth: zDepth,
      initialZDepth: zDepth,
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  _handleMouseDown: function _handleMouseDown(event) {
    //only listen to left clicks
    if (event.button === 0) {
      this.setState({ zDepth: this.state.initialZDepth + 1 });
    }
    if (this.props.onMouseDown) this.props.onMouseDown(event);
  },
  _handleMouseUp: function _handleMouseUp(event) {
    this.setState({ zDepth: this.state.initialZDepth });
    if (this.props.onMouseUp) this.props.onMouseUp(event);
  },
  _handleMouseLeave: function _handleMouseLeave(event) {
    if (!this.refs.container.isKeyboardFocused()) this.setState({ zDepth: this.state.initialZDepth, hovered: false });
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
      zDepth: this.state.initialZDepth + 1
    });
    if (this.props.onTouchStart) this.props.onTouchStart(event);
  },
  _handleTouchEnd: function _handleTouchEnd(event) {
    this.setState({ zDepth: this.state.initialZDepth });
    if (this.props.onTouchEnd) this.props.onTouchEnd(event);
  },


  _handleKeyboardFocus: function _handleKeyboardFocus(styles) {
    return function (event, keyboardFocused) {
      if (keyboardFocused && !undefined.props.disabled) {
        undefined.setState({ zDepth: undefined.state.initialZDepth + 1 });
        var amount = undefined.props.primary || undefined.props.secondary ? 0.4 : 0.08;
        undefined.refs.overlay.style.backgroundColor = _colorManipulator2.default.fade((0, _simpleAssign2.default)({}, styles.label, undefined.props.labelStyle).color, amount);
      } else if (!undefined.state.hovered) {
        undefined.setState({ zDepth: undefined.state.initialZDepth });
        undefined.refs.overlay.style.backgroundColor = 'transparent';
      }
    };
  },

  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var className = _props.className;
    var disabled = _props.disabled;
    var icon = _props.icon;
    var label = _props.label;
    var labelPosition = _props.labelPosition;
    var labelStyle = _props.labelStyle;
    var primary = _props.primary;
    var rippleStyle = _props.rippleStyle;
    var secondary = _props.secondary;

    var other = _objectWithoutProperties(_props, ['children', 'className', 'disabled', 'icon', 'label', 'labelPosition', 'labelStyle', 'primary', 'rippleStyle', 'secondary']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);
    var mergedRippleStyles = (0, _simpleAssign2.default)({}, styles.ripple, rippleStyle);

    var buttonEventHandlers = disabled && {
      onMouseDown: this._handleMouseDown,
      onMouseUp: this._handleMouseUp,
      onMouseLeave: this._handleMouseLeave,
      onMouseEnter: this._handleMouseEnter,
      onTouchStart: this._handleTouchStart,
      onTouchEnd: this._handleTouchEnd,
      onKeyboardFocus: this._handleKeyboardFocus
    };

    var labelElement = label && _react2.default.createElement(
      'span',
      { style: prepareStyles((0, _simpleAssign2.default)(styles.label, labelStyle)) },
      label
    );

    var iconCloned = icon && _react2.default.cloneElement(icon, {
      color: styles.label.color,
      style: styles.icon
    });

    // Place label before or after children.
    var childrenFragment = labelPosition === 'before' ? {
      labelElement: labelElement,
      iconCloned: iconCloned,
      children: children
    } : {
      children: children,
      iconCloned: iconCloned,
      labelElement: labelElement
    };
    var enhancedButtonChildren = _children2.default.create(childrenFragment);

    return _react2.default.createElement(
      _paper2.default,
      {
        className: className,
        style: (0, _simpleAssign2.default)(styles.root, this.props.style),
        zDepth: this.state.zDepth
      },
      _react2.default.createElement(
        _enhancedButton2.default,
        _extends({}, other, buttonEventHandlers, {
          ref: 'container',
          disabled: disabled,
          style: styles.container,
          focusRippleColor: mergedRippleStyles.color,
          touchRippleColor: mergedRippleStyles.color,
          focusRippleOpacity: mergedRippleStyles.opacity,
          touchRippleOpacity: mergedRippleStyles.opacity
        }),
        _react2.default.createElement(
          'div',
          {
            ref: 'overlay',
            style: prepareStyles(styles.overlay)
          },
          enhancedButtonChildren
        )
      )
    );
  }
});

exports.default = RaisedButton;