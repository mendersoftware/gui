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

var _enhancedSwitch = require('./enhanced-switch');

var _enhancedSwitch2 = _interopRequireDefault(_enhancedSwitch);

var _radioButtonUnchecked = require('./svg-icons/toggle/radio-button-unchecked');

var _radioButtonUnchecked2 = _interopRequireDefault(_radioButtonUnchecked);

var _radioButtonChecked = require('./svg-icons/toggle/radio-button-checked');

var _radioButtonChecked2 = _interopRequireDefault(_radioButtonChecked);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var radioButton = state.muiTheme.radioButton;


  return {
    icon: {
      height: radioButton.size,
      width: radioButton.size
    },
    target: {
      transition: _transitions2.default.easeOut(),
      position: 'absolute',
      opacity: 1,
      transform: 'scale(1)',
      fill: radioButton.borderColor
    },
    fill: {
      position: 'absolute',
      opacity: 1,
      transform: 'scale(0)',
      transformOrigin: '50% 50%',
      transition: _transitions2.default.easeOut(),
      fill: radioButton.checkedColor
    },
    targetWhenChecked: {
      opacity: 0,
      transform: 'scale(0)'
    },
    fillWhenChecked: {
      opacity: 1,
      transform: 'scale(1)'
    },
    targetWhenDisabled: {
      fill: radioButton.disabledColor
    },
    fillWhenDisabled: {
      fill: radioButton.disabledColor
    },
    label: {
      color: props.disabled ? radioButton.labelDisabledColor : radioButton.labelColor
    },
    ripple: {
      color: props.checked ? radioButton.checkedColor : radioButton.borderColor
    }
  };
}

var RadioButton = _react2.default.createClass({
  displayName: 'RadioButton',


  propTypes: {
    /**
     * @ignore
     * checked if true
     * Used internally by `RadioButtonGroup`.
     */
    checked: _react2.default.PropTypes.bool,

    /**
     * The icon element to show when radio button is checked.
     */
    checkedIcon: _react2.default.PropTypes.element,

    /**
     * Disabled if true.
     */
    disabled: _react2.default.PropTypes.bool,

    /**
     * Overrides the inline-styles of the icon element.
     */
    iconStyle: _react2.default.PropTypes.object,

    /**
    * Overrides the inline-styles of the input element.
    */
    inputStyle: _react2.default.PropTypes.object,

    /**
     * @ignore
     * Used internally by `RadioButtonGroup`. Use the `labelPosition` property of `RadioButtonGroup` instead.
     * Where the label will be placed next to the radio button.
     */
    labelPosition: _react2.default.PropTypes.oneOf(['left', 'right']),

    /**
     * Overrides the inline-styles of the RadioButton element label.
     */
    labelStyle: _react2.default.PropTypes.object,

    /**
     * Callback function for checked event.
     */
    onCheck: _react2.default.PropTypes.func,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The icon element to show when radio button is unchecked.
     */
    uncheckedIcon: _react2.default.PropTypes.element,

    /**
     * The value of our radio button component.
     */
    value: _react2.default.PropTypes.string
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      checked: false,
      disabled: false,
      labelPosition: 'right'
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
  getTheme: function getTheme() {
    return this.state.muiTheme.radioButton;
  },


  // Only called when selected, not when unselected.
  _handleCheck: function _handleCheck(event) {
    if (this.props.onCheck) this.props.onCheck(event, this.props.value);
  },
  _handleStateChange: function _handleStateChange() {},
  isChecked: function isChecked() {
    return this.refs.enhancedSwitch.isSwitched();
  },


  // Use RadioButtonGroup.setSelectedValue(newSelectionValue) to set a
  // RadioButton's checked value.
  setChecked: function setChecked(newCheckedValue) {
    this.refs.enhancedSwitch.setSwitched(newCheckedValue);
  },
  getValue: function getValue() {
    return this.refs.enhancedSwitch.getValue();
  },
  render: function render() {
    var _props = this.props;
    var checkedIcon = _props.checkedIcon;
    var checked = _props.checked;
    var iconStyle = _props.iconStyle;
    var labelStyle = _props.labelStyle;
    var labelPosition = _props.labelPosition;
    var onCheck = _props.onCheck;
    var uncheckedIcon = _props.uncheckedIcon;
    var disabled = _props.disabled;

    var other = _objectWithoutProperties(_props, ['checkedIcon', 'checked', 'iconStyle', 'labelStyle', 'labelPosition', 'onCheck', 'uncheckedIcon', 'disabled']);

    var styles = getStyles(this.props, this.state);

    var uncheckedStyles = (0, _simpleAssign2.default)(styles.target, checked && styles.targetWhenChecked, iconStyle, disabled && styles.targetWhenDisabled);

    var checkedStyles = (0, _simpleAssign2.default)(styles.fill, checked && styles.fillWhenChecked, iconStyle, disabled && styles.fillWhenDisabled);

    var uncheckedElement = _react2.default.isValidElement(uncheckedIcon) ? _react2.default.cloneElement(uncheckedIcon, {
      style: (0, _simpleAssign2.default)(uncheckedStyles, uncheckedIcon.props.style)
    }) : _react2.default.createElement(_radioButtonUnchecked2.default, { style: uncheckedStyles });

    var checkedElement = _react2.default.isValidElement(checkedIcon) ? _react2.default.cloneElement(checkedIcon, {
      style: (0, _simpleAssign2.default)(checkedStyles, checkedIcon.props.style)
    }) : _react2.default.createElement(_radioButtonChecked2.default, { style: checkedStyles });

    var mergedIconStyle = (0, _simpleAssign2.default)(styles.icon, iconStyle);
    var mergedLabelStyle = (0, _simpleAssign2.default)(styles.label, labelStyle);

    return _react2.default.createElement(_enhancedSwitch2.default, _extends({}, other, {
      ref: 'enhancedSwitch',
      inputType: 'radio',
      checked: checked,
      switched: checked,
      disabled: disabled,
      rippleColor: styles.ripple.color,
      iconStyle: mergedIconStyle,
      labelStyle: mergedLabelStyle,
      labelPosition: labelPosition,
      onSwitch: this._handleCheck,
      onParentShouldUpdate: this._handleStateChange,
      switchElement: _react2.default.createElement(
        'div',
        null,
        uncheckedElement,
        checkedElement
      )
    }));
  }
});

exports.default = RadioButton;