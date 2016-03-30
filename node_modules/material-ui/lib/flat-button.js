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

var _children = require('./utils/children');

var _children2 = _interopRequireDefault(_children);

var _colorManipulator = require('./utils/color-manipulator');

var _colorManipulator2 = _interopRequireDefault(_colorManipulator);

var _enhancedButton = require('./enhanced-button');

var _enhancedButton2 = _interopRequireDefault(_enhancedButton);

var _flatButtonLabel = require('./buttons/flat-button-label');

var _flatButtonLabel2 = _interopRequireDefault(_flatButtonLabel);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function validateLabel(props, propName, componentName) {
  if (!props.children && !props.label && !props.icon) {
    return new Error('Required prop label or children or icon was not specified in ' + componentName + '.');
  }
}

var FlatButton = _react2.default.createClass({
  displayName: 'FlatButton',


  propTypes: {
    /**
     * Color of button when mouse is not hovering over it.
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
     * Disables the button if set to true.
     */
    disabled: _react2.default.PropTypes.bool,

    /**
     * Color of button when mouse hovers over.
     */
    hoverColor: _react2.default.PropTypes.string,

    /**
     * URL to link to when button clicked if `linkButton` is set to true.
     */
    href: _react2.default.PropTypes.string,

    /**
     * Use this property to display an icon.
     */
    icon: _react2.default.PropTypes.node,

    /**
     * Label for the button.
     */
    label: validateLabel,

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
     * Callback function fired when the element is focused or blurred by the keyboard.
     *
     * @param {object} event `focus` or `blur` event targeting the element.
     * @param {boolean} isKeyboardFocused Indicates whether the element is focused.
     */
    onKeyboardFocus: _react2.default.PropTypes.func,

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
     * Callback function fired when the element is touched.
     *
     * @param {object} event `touchstart` event targeting the element.
     */
    onTouchStart: _react2.default.PropTypes.func,

    /**
     * If true, colors button according to
     * primaryTextColor from the Theme.
     */
    primary: _react2.default.PropTypes.bool,

    /**
     * Color for the ripple after button is clicked.
     */
    rippleColor: _react2.default.PropTypes.string,

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
      labelStyle: {},
      labelPosition: 'after',
      onKeyboardFocus: function onKeyboardFocus() {},
      onMouseEnter: function onMouseEnter() {},
      onMouseLeave: function onMouseLeave() {},
      onTouchStart: function onTouchStart() {},
      primary: false,
      secondary: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      hovered: false,
      isKeyboardFocused: false,
      touch: false,
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
  _handleKeyboardFocus: function _handleKeyboardFocus(event, isKeyboardFocused) {
    this.setState({ isKeyboardFocused: isKeyboardFocused });
    this.props.onKeyboardFocus(event, isKeyboardFocused);
  },
  _handleMouseEnter: function _handleMouseEnter(event) {
    //Cancel hover styles for touch devices
    if (!this.state.touch) this.setState({ hovered: true });
    this.props.onMouseEnter(event);
  },
  _handleMouseLeave: function _handleMouseLeave(event) {
    this.setState({ hovered: false });
    this.props.onMouseLeave(event);
  },
  _handleTouchStart: function _handleTouchStart(event) {
    this.setState({ touch: true });
    this.props.onTouchStart(event);
  },
  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var disabled = _props.disabled;
    var hoverColor = _props.hoverColor;
    var backgroundColor = _props.backgroundColor;
    var icon = _props.icon;
    var label = _props.label;
    var labelStyle = _props.labelStyle;
    var labelPosition = _props.labelPosition;
    var linkButton = _props.linkButton;
    var primary = _props.primary;
    var rippleColor = _props.rippleColor;
    var secondary = _props.secondary;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['children', 'disabled', 'hoverColor', 'backgroundColor', 'icon', 'label', 'labelStyle', 'labelPosition', 'linkButton', 'primary', 'rippleColor', 'secondary', 'style']);

    var _state$muiTheme = this.state.muiTheme;
    var _state$muiTheme$butto = _state$muiTheme.button;
    var buttonHeight = _state$muiTheme$butto.height;
    var buttonMinWidth = _state$muiTheme$butto.minWidth;
    var buttonTextTransform = _state$muiTheme$butto.textTransform;
    var _state$muiTheme$flatB = _state$muiTheme.flatButton;
    var buttonFilterColor = _state$muiTheme$flatB.buttonFilterColor;
    var buttonColor = _state$muiTheme$flatB.color;
    var disabledTextColor = _state$muiTheme$flatB.disabledTextColor;
    var fontSize = _state$muiTheme$flatB.fontSize;
    var fontWeight = _state$muiTheme$flatB.fontWeight;
    var primaryTextColor = _state$muiTheme$flatB.primaryTextColor;
    var secondaryTextColor = _state$muiTheme$flatB.secondaryTextColor;
    var textColor = _state$muiTheme$flatB.textColor;
    var _state$muiTheme$flatB2 = _state$muiTheme$flatB.textTransform;
    var textTransform = _state$muiTheme$flatB2 === undefined ? buttonTextTransform || 'uppercase' : _state$muiTheme$flatB2;

    var defaultTextColor = disabled ? disabledTextColor : primary ? primaryTextColor : secondary ? secondaryTextColor : textColor;

    var defaultHoverColor = _colorManipulator2.default.fade(buttonFilterColor, 0.2);
    var defaultRippleColor = buttonFilterColor;
    var buttonHoverColor = hoverColor || defaultHoverColor;
    var buttonRippleColor = rippleColor || defaultRippleColor;
    var buttonBackgroundColor = backgroundColor || buttonColor;
    var hovered = (this.state.hovered || this.state.isKeyboardFocused) && !disabled;

    var mergedRootStyles = (0, _simpleAssign2.default)({}, {
      color: defaultTextColor,
      transition: _transitions2.default.easeOut(),
      fontSize: fontSize,
      letterSpacing: 0,
      textTransform: textTransform,
      fontWeight: fontWeight,
      borderRadius: 2,
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: hovered ? buttonHoverColor : buttonBackgroundColor,
      lineHeight: buttonHeight + 'px',
      minWidth: buttonMinWidth,
      padding: 0,
      margin: 0,
      // That's the default value for a button but not a link
      textAlign: 'center'
    }, style);

    var iconCloned = void 0;
    var labelStyleIcon = {};

    if (icon) {
      iconCloned = _react2.default.cloneElement(icon, {
        color: mergedRootStyles.color,
        style: {
          lineHeight: buttonHeight + 'px',
          verticalAlign: 'middle',
          marginLeft: label && labelPosition !== 'before' ? 12 : 0,
          marginRight: label && labelPosition === 'before' ? 12 : 0
        }
      });

      if (labelPosition === 'before') {
        labelStyleIcon.paddingRight = 8;
      } else {
        labelStyleIcon.paddingLeft = 8;
      }
    }

    var labelElement = label ? _react2.default.createElement(_flatButtonLabel2.default, { label: label, style: (0, _simpleAssign2.default)({}, labelStyleIcon, labelStyle) }) : undefined;

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
      _enhancedButton2.default,
      _extends({}, other, {
        disabled: disabled,
        focusRippleColor: buttonRippleColor,
        focusRippleOpacity: 0.3,
        linkButton: linkButton,
        onKeyboardFocus: this._handleKeyboardFocus,
        onMouseLeave: this._handleMouseLeave,
        onMouseEnter: this._handleMouseEnter,
        onTouchStart: this._handleTouchStart,
        style: mergedRootStyles,
        touchRippleColor: buttonRippleColor,
        touchRippleOpacity: 0.3
      }),
      enhancedButtonChildren
    );
  }
});

exports.default = FlatButton;