'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _textField = require('../text-field');

var _textField2 = _interopRequireDefault(_textField);

var _DropDownMenu = require('../DropDownMenu');

var _DropDownMenu2 = _interopRequireDefault(_DropDownMenu);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props) {
  return {
    label: {
      paddingLeft: 0,
      top: props.floatingLabelText ? 6 : -4
    },
    icon: {
      right: 0,
      top: props.floatingLabelText ? 22 : 14
    },
    hideDropDownUnderline: {
      borderTop: 'none'
    }
  };
}

var SelectField = _react2.default.createClass({
  displayName: 'SelectField',


  propTypes: {
    /**
     * The width will automatically be set according to the
     * items inside the menu. To control this width in css
     * instead, set this prop to `false`.
     */
    autoWidth: _react2.default.PropTypes.bool,

    /**
     * The `MenuItem` elements to populate the `Menu` with.
     * If the MenuItems have the prop `label` that value will
     * be used to render the representation of that
     * item within the field.
     */
    children: _react2.default.PropTypes.node,

    /**
     * Disables the select field if set to true.
     */
    disabled: _react2.default.PropTypes.bool,

    /**
     * The style object to use to override error styles.
     */
    errorStyle: _react2.default.PropTypes.object,

    /**
     * The error content to display.
     */
    errorText: _react2.default.PropTypes.node,

    /**
     * The style object to use to override floating label styles.
     */
    floatingLabelStyle: _react2.default.PropTypes.object,

    /**
     * The content to use for the floating label element.
     */
    floatingLabelText: _react2.default.PropTypes.node,

    /**
     * If true, the field receives the property width 100%.
     */
    fullWidth: _react2.default.PropTypes.bool,

    /**
     * The style object to use to override hint styles.
     */
    hintStyle: _react2.default.PropTypes.object,

    /**
     * The hint content to display.
     */
    hintText: _react2.default.PropTypes.node,

    /**
     * Overrides the styles of the icon element.
     */
    iconStyle: _react2.default.PropTypes.object,

    /**
     * Overrides the styles of label when the `SelectField` is inactive.
     */
    labelStyle: _react2.default.PropTypes.object,

    /**
     * Callback function that is fired when the `SelectField` loses focus.
     */
    onBlur: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the value changes.
     */
    onChange: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the `SelectField` gains focus.
     */
    onFocus: _react2.default.PropTypes.func,

    /**
     * The style object to use to override the `DropDownMenu`.
     */
    selectFieldRoot: _react2.default.PropTypes.object, // Must be changed!

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the underline element when disabled.
     */
    underlineDisabledStyle: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the underline element when focused.
     */
    underlineFocusStyle: _react2.default.PropTypes.object,

    /**
     * Overrides the styles of the underline element.
     */
    underlineStyle: _react2.default.PropTypes.object,

    /**
     * The value that is currently selected.
     */
    value: _react2.default.PropTypes.any
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      autoWidth: false,
      disabled: false,
      fullWidth: false
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
    var autoWidth = _props.autoWidth;
    var children = _props.children;
    var style = _props.style;
    var labelStyle = _props.labelStyle;
    var iconStyle = _props.iconStyle;
    var underlineDisabledStyle = _props.underlineDisabledStyle;
    var underlineFocusStyle = _props.underlineFocusStyle;
    var underlineStyle = _props.underlineStyle;
    var errorStyle = _props.errorStyle;
    var selectFieldRoot = _props.selectFieldRoot;
    var disabled = _props.disabled;
    var floatingLabelText = _props.floatingLabelText;
    var floatingLabelStyle = _props.floatingLabelStyle;
    var hintStyle = _props.hintStyle;
    var hintText = _props.hintText;
    var fullWidth = _props.fullWidth;
    var errorText = _props.errorText;
    var onFocus = _props.onFocus;
    var onBlur = _props.onBlur;
    var onChange = _props.onChange;
    var value = _props.value;

    var other = _objectWithoutProperties(_props, ['autoWidth', 'children', 'style', 'labelStyle', 'iconStyle', 'underlineDisabledStyle', 'underlineFocusStyle', 'underlineStyle', 'errorStyle', 'selectFieldRoot', 'disabled', 'floatingLabelText', 'floatingLabelStyle', 'hintStyle', 'hintText', 'fullWidth', 'errorText', 'onFocus', 'onBlur', 'onChange', 'value']);

    var styles = getStyles(this.props, this.state);

    return _react2.default.createElement(
      _textField2.default,
      {
        style: style,
        floatingLabelText: floatingLabelText,
        floatingLabelStyle: floatingLabelStyle,
        hintStyle: hintStyle,
        hintText: !hintText && !floatingLabelText ? ' ' : hintText,
        fullWidth: fullWidth,
        errorText: errorText,
        underlineStyle: underlineStyle,
        errorStyle: errorStyle,
        onFocus: onFocus,
        onBlur: onBlur,
        underlineDisabledStyle: underlineDisabledStyle,
        underlineFocusStyle: underlineFocusStyle
      },
      _react2.default.createElement(
        _DropDownMenu2.default,
        _extends({
          disabled: disabled,
          style: selectFieldRoot,
          labelStyle: (0, _simpleAssign2.default)(styles.label, labelStyle),
          iconStyle: (0, _simpleAssign2.default)(styles.icon, iconStyle),
          underlineStyle: styles.hideDropDownUnderline,
          autoWidth: autoWidth,
          value: value,
          onChange: onChange
        }, other),
        children
      )
    );
  }
});

exports.default = SelectField;