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

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _shallowEqual = require('../utils/shallow-equal');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _colorManipulator = require('../utils/color-manipulator');

var _colorManipulator2 = _interopRequireDefault(_colorManipulator);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _deprecatedPropType = require('../utils/deprecatedPropType');

var _deprecatedPropType2 = _interopRequireDefault(_deprecatedPropType);

var _enhancedTextarea = require('../enhanced-textarea');

var _enhancedTextarea2 = _interopRequireDefault(_enhancedTextarea);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _TextFieldHint = require('./TextFieldHint');

var _TextFieldHint2 = _interopRequireDefault(_TextFieldHint);

var _TextFieldLabel = require('./TextFieldLabel');

var _TextFieldLabel2 = _interopRequireDefault(_TextFieldLabel);

var _TextFieldUnderline = require('./TextFieldUnderline');

var _TextFieldUnderline2 = _interopRequireDefault(_TextFieldUnderline);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var getStyles = function getStyles(props, state) {
  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var _state$muiTheme$textF = _state$muiTheme.textField;
  var floatingLabelColor = _state$muiTheme$textF.floatingLabelColor;
  var focusColor = _state$muiTheme$textF.focusColor;
  var textColor = _state$muiTheme$textF.textColor;
  var disabledTextColor = _state$muiTheme$textF.disabledTextColor;
  var backgroundColor = _state$muiTheme$textF.backgroundColor;
  var hintColor = _state$muiTheme$textF.hintColor;
  var errorColor = _state$muiTheme$textF.errorColor;


  var styles = {
    root: {
      fontSize: 16,
      lineHeight: '24px',
      width: props.fullWidth ? '100%' : 256,
      height: (props.rows - 1) * 24 + (props.floatingLabelText ? 72 : 48),
      display: 'inline-block',
      position: 'relative',
      backgroundColor: backgroundColor,
      fontFamily: baseTheme.fontFamily,
      transition: _transitions2.default.easeOut('200ms', 'height')
    },
    error: {
      position: 'relative',
      bottom: 2,
      fontSize: 12,
      lineHeight: '12px',
      color: errorColor,
      transition: _transitions2.default.easeOut()
    },
    floatingLabel: {
      color: hintColor,
      pointerEvents: 'none'
    },
    input: {
      WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove mobile color flashing (deprecated)
      padding: 0,
      position: 'relative',
      width: '100%',
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: 'rgba(0,0,0,0)',
      color: props.disabled ? disabledTextColor : textColor,
      font: 'inherit'
    },
    textarea: {}
  };

  (0, _simpleAssign2.default)(styles.error, props.errorStyle);

  (0, _simpleAssign2.default)(styles.textarea, styles.input, {
    marginTop: props.floatingLabelText ? 36 : 12,
    marginBottom: props.floatingLabelText ? -36 : -12,
    boxSizing: 'border-box',
    font: 'inherit'
  });

  if (state.isFocused) {
    styles.floatingLabel.color = focusColor;
  }

  if (state.hasValue) {
    styles.floatingLabel.color = _colorManipulator2.default.fade(props.disabled ? disabledTextColor : floatingLabelColor, 0.5);
  }

  if (props.floatingLabelText) {
    styles.input.boxSizing = 'border-box';

    if (!props.multiLine) {
      styles.input.marginTop = 14;
    }

    if (state.errorText) {
      styles.error.bottom = !props.multiLine ? styles.error.fontSize + 3 : 3;
    }
  }

  if (state.errorText) {
    if (state.isFocused) {
      styles.floatingLabel.color = styles.error.color;
    }
  }

  return styles;
};

/**
 * Check if a value is valid to be displayed inside an input.
 *
 * @param The value to check.
 * @returns True if the string provided is valid, false otherwise.
 */
function isValid(value) {
  return Boolean(value || value === 0);
}

var TextField = _react2.default.createClass({
  displayName: 'TextField',


  propTypes: {
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * The text string to use for the default value.
     */
    defaultValue: _react2.default.PropTypes.any,

    /**
     * Disables the text field if set to true.
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
     * If true, the floating label will float even when there is no value.
     */
    floatingLabelFixed: _react2.default.PropTypes.bool,

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
     * Override the inline-styles of the TextField's hint text element.
     */
    hintStyle: _react2.default.PropTypes.object,

    /**
     * The hint content to display.
     */
    hintText: _react2.default.PropTypes.node,

    /**
     * The id prop for the text field.
     */
    id: _react2.default.PropTypes.string,

    /**
     * Override the inline-styles of the TextField's input element.
     * When multiLine is false: define the style of the input element.
     * When multiLine is true: define the style of the container of the textarea.
     */
    inputStyle: _react2.default.PropTypes.object,

    /**
     * If true, a textarea element will be rendered.
     * The textarea also grows and shrinks according to the number of lines.
     */
    multiLine: _react2.default.PropTypes.bool,

    /**
     * Name applied to the input.
     */
    name: _react2.default.PropTypes.string,

    /**
     * Callback function that is fired when the textfield loses focus.
     */
    onBlur: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the textfield's value changes.
     */
    onChange: _react2.default.PropTypes.func,

    /**
     * The function to call when the user presses the Enter key.
     */
    onEnterKeyDown: (0, _deprecatedPropType2.default)(_react2.default.PropTypes.func, 'Use onKeyDown and check for keycode instead.'),

    /**
     * Callback function that is fired when the textfield gains focus.
     */
    onFocus: _react2.default.PropTypes.func,

    /**
     * Callback function fired when key is pressed down.
     */
    onKeyDown: _react2.default.PropTypes.func,

    /**
     * Number of rows to display when multiLine option is set to true.
     */
    rows: _react2.default.PropTypes.number,

    /**
     * Maximum number of rows to display when
     * multiLine option is set to true.
     */
    rowsMax: _react2.default.PropTypes.number,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the TextField's textarea element.
     * The TextField use either a textarea or an input,
     * this property has effects only when multiLine is true.
     */
    textareaStyle: _react2.default.PropTypes.object,

    /**
     * Specifies the type of input to display
     * such as "password" or "text".
     */
    type: _react2.default.PropTypes.string,

    /**
     * Override the inline-styles of the
     * TextField's underline element when disabled.
     */
    underlineDisabledStyle: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the TextField's
     * underline element when focussed.
     */
    underlineFocusStyle: _react2.default.PropTypes.object,

    /**
     * If true, shows the underline for the text field.
     */
    underlineShow: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the TextField's underline element.
     */
    underlineStyle: _react2.default.PropTypes.object,

    /**
     * The value of the text field.
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
      disabled: false,
      floatingLabelFixed: false,
      multiLine: false,
      fullWidth: false,
      type: 'text',
      underlineShow: true,
      rows: 1
    };
  },
  getInitialState: function getInitialState() {
    var props = this.props.children ? this.props.children.props : this.props;

    return {
      isFocused: false,
      errorText: this.props.errorText,
      hasValue: isValid(props.value) || isValid(props.defaultValue),
      isClean: true,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentWillMount: function componentWillMount() {
    var _props = this.props;
    var name = _props.name;
    var hintText = _props.hintText;
    var floatingLabelText = _props.floatingLabelText;
    var id = _props.id;


    process.env.NODE_ENV !== "production" ? (0, _warning2.default)(name || hintText || floatingLabelText || id, 'We don\'t have enough information\n      to build a robust unique id for the TextField component. Please provide an id or a name.') : void 0;

    var uniqueId = name + '-' + hintText + '-' + floatingLabelText + '-' + Math.floor(Math.random() * 0xFFFF);
    this.uniqueId = uniqueId.replace(/[^A-Za-z0-9-]/gi, '');
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newState = {
      errorText: nextProps.errorText,
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    };

    if (nextProps.children && nextProps.children.props) {
      nextProps = nextProps.children.props;
    }

    if (nextProps.hasOwnProperty('value')) {
      newState.hasValue = isValid(nextProps.value) || this.state.isClean && isValid(nextProps.defaultValue);
    }

    if (newState) this.setState(newState);
  },
  shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !(0, _shallowEqual2.default)(this.props, nextProps) || !(0, _shallowEqual2.default)(this.state, nextState) || !(0, _shallowEqual2.default)(this.context, nextContext);
  },
  blur: function blur() {
    if (this.input) this._getInputNode().blur();
  },
  focus: function focus() {
    if (this.input) this._getInputNode().focus();
  },
  select: function select() {
    if (this.input) this._getInputNode().select();
  },
  getValue: function getValue() {
    return this.input ? this._getInputNode().value : undefined;
  },
  _getInputNode: function _getInputNode() {
    return this.props.children || this.props.multiLine ? this.input.getInputNode() : _reactDom2.default.findDOMNode(this.input);
  },
  _handleInputBlur: function _handleInputBlur(event) {
    this.setState({ isFocused: false });
    if (this.props.onBlur) this.props.onBlur(event);
  },
  _handleInputChange: function _handleInputChange(event) {
    this.setState({ hasValue: isValid(event.target.value), isClean: false });
    if (this.props.onChange) this.props.onChange(event, event.target.value);
  },
  _handleInputFocus: function _handleInputFocus(event) {
    if (this.props.disabled) return;
    this.setState({ isFocused: true });
    if (this.props.onFocus) this.props.onFocus(event);
  },
  _handleInputKeyDown: function _handleInputKeyDown(event) {
    if ((0, _keycode2.default)(event) === 'enter' && this.props.onEnterKeyDown) this.props.onEnterKeyDown(event);
    if (this.props.onKeyDown) this.props.onKeyDown(event);
  },
  _handleTextAreaHeightChange: function _handleTextAreaHeightChange(event, height) {
    var newHeight = height + 24;
    if (this.props.floatingLabelText) newHeight += 24;
    _reactDom2.default.findDOMNode(this).style.height = newHeight + 'px';
  },
  _isControlled: function _isControlled() {
    return this.props.hasOwnProperty('value');
  },
  render: function render() {
    var _this = this;

    var _props2 = this.props;
    var className = _props2.className;
    var disabled = _props2.disabled;
    var errorStyle = _props2.errorStyle;
    var errorText = _props2.errorText;
    var floatingLabelFixed = _props2.floatingLabelFixed;
    var floatingLabelText = _props2.floatingLabelText;
    var fullWidth = _props2.fullWidth;
    var hintText = _props2.hintText;
    var hintStyle = _props2.hintStyle;
    var id = _props2.id;
    var inputStyle = _props2.inputStyle;
    var multiLine = _props2.multiLine;
    var onBlur = _props2.onBlur;
    var onChange = _props2.onChange;
    var onFocus = _props2.onFocus;
    var style = _props2.style;
    var type = _props2.type;
    var underlineDisabledStyle = _props2.underlineDisabledStyle;
    var underlineFocusStyle = _props2.underlineFocusStyle;
    var underlineShow = _props2.underlineShow;
    var underlineStyle = _props2.underlineStyle;
    var rows = _props2.rows;
    var rowsMax = _props2.rowsMax;
    var textareaStyle = _props2.textareaStyle;

    var other = _objectWithoutProperties(_props2, ['className', 'disabled', 'errorStyle', 'errorText', 'floatingLabelFixed', 'floatingLabelText', 'fullWidth', 'hintText', 'hintStyle', 'id', 'inputStyle', 'multiLine', 'onBlur', 'onChange', 'onFocus', 'style', 'type', 'underlineDisabledStyle', 'underlineFocusStyle', 'underlineShow', 'underlineStyle', 'rows', 'rowsMax', 'textareaStyle']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var inputId = id || this.uniqueId;

    var errorTextElement = this.state.errorText && _react2.default.createElement(
      'div',
      { style: prepareStyles(styles.error) },
      this.state.errorText
    );

    var floatingLabelTextElement = floatingLabelText && _react2.default.createElement(
      _TextFieldLabel2.default,
      {
        muiTheme: this.state.muiTheme,
        style: (0, _simpleAssign2.default)(styles.floatingLabel, this.props.floatingLabelStyle),
        htmlFor: inputId,
        shrink: this.state.hasValue || this.state.isFocused || floatingLabelFixed,
        disabled: disabled
      },
      floatingLabelText
    );

    var inputProps = {
      id: inputId,
      ref: function ref(elem) {
        return _this.input = elem;
      },
      disabled: this.props.disabled,
      onBlur: this._handleInputBlur,
      onChange: this._handleInputChange,
      onFocus: this._handleInputFocus,
      onKeyDown: this._handleInputKeyDown
    };

    var inputStyleMerged = (0, _simpleAssign2.default)(styles.input, inputStyle);

    var inputElement = void 0;
    if (this.props.children) {
      inputElement = _react2.default.cloneElement(this.props.children, _extends({}, inputProps, this.props.children.props, {
        style: (0, _simpleAssign2.default)(inputStyleMerged, this.props.children.props.style)
      }));
    } else {
      inputElement = multiLine ? _react2.default.createElement(_enhancedTextarea2.default, _extends({}, other, inputProps, {
        style: inputStyleMerged,
        rows: rows,
        rowsMax: rowsMax,
        onHeightChange: this._handleTextAreaHeightChange,
        textareaStyle: (0, _simpleAssign2.default)(styles.textarea, textareaStyle)
      })) : _react2.default.createElement('input', _extends({}, other, inputProps, {
        style: prepareStyles(inputStyleMerged),
        type: type
      }));
    }

    return _react2.default.createElement(
      'div',
      { className: className, style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) },
      floatingLabelTextElement,
      hintText ? _react2.default.createElement(_TextFieldHint2.default, {
        muiTheme: this.state.muiTheme,
        show: !(this.state.hasValue || floatingLabelText && !this.state.isFocused) || !this.state.hasValue && floatingLabelText && floatingLabelFixed && !this.state.isFocused,
        style: hintStyle,
        text: hintText
      }) : null,
      inputElement,
      underlineShow ? _react2.default.createElement(_TextFieldUnderline2.default, {
        disabled: disabled,
        disabledStyle: underlineDisabledStyle,
        error: !!this.state.errorText,
        errorStyle: errorStyle,
        focus: this.state.isFocused,
        focusStyle: underlineFocusStyle,
        muiTheme: this.state.muiTheme,
        style: underlineStyle
      }) : null,
      errorTextElement
    );
  }
});

exports.default = TextField;