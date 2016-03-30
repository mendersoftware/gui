'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enhancedSwitch = require('./enhanced-switch');

var _enhancedSwitch2 = _interopRequireDefault(_enhancedSwitch);

var _transitions = require('./styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _checkBoxOutlineBlank = require('./svg-icons/toggle/check-box-outline-blank');

var _checkBoxOutlineBlank2 = _interopRequireDefault(_checkBoxOutlineBlank);

var _checkBox = require('./svg-icons/toggle/check-box');

var _checkBox2 = _interopRequireDefault(_checkBox);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _deprecatedPropType = require('./utils/deprecatedPropType');

var _deprecatedPropType2 = _interopRequireDefault(_deprecatedPropType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var checkbox = state.muiTheme.checkbox;


  var checkboxSize = 24;

  return {
    icon: {
      height: checkboxSize,
      width: checkboxSize
    },
    check: {
      position: 'absolute',
      opacity: 0,
      transform: 'scale(0)',
      transitionOrigin: '50% 50%',
      transition: _transitions2.default.easeOut('450ms', 'opacity', '0ms') + ', ' + _transitions2.default.easeOut('0ms', 'transform', '450ms'),
      fill: checkbox.checkedColor
    },
    box: {
      position: 'absolute',
      opacity: 1,
      fill: checkbox.boxColor,
      transition: _transitions2.default.easeOut('2s', null, '200ms')
    },
    checkWhenSwitched: {
      opacity: 1,
      transform: 'scale(1)',
      transition: _transitions2.default.easeOut('0ms', 'opacity', '0ms') + ', ' + _transitions2.default.easeOut('800ms', 'transform', '0ms')
    },
    boxWhenSwitched: {
      transition: _transitions2.default.easeOut('100ms', null, '0ms'),
      fill: checkbox.checkedColor
    },
    checkWhenDisabled: {
      fill: checkbox.disabledColor
    },
    boxWhenDisabled: {
      fill: props.checked ? 'transparent' : checkbox.disabledColor
    },
    label: {
      color: props.disabled ? checkbox.labelDisabledColor : checkbox.labelColor
    }
  };
}

var Checkbox = _react2.default.createClass({
  displayName: 'Checkbox',


  propTypes: {
    /**
     * Checkbox is checked if true.
     */
    checked: _react2.default.PropTypes.bool,

    /**
     * The SvgIcon to use for the checked state.
     * This is useful to create icon toggles.
     */
    checkedIcon: _react2.default.PropTypes.element,

    /**
     * The default state of our checkbox component.
     */
    defaultChecked: _react2.default.PropTypes.bool,

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
     * Where the label will be placed next to the checkbox.
     */
    labelPosition: _react2.default.PropTypes.oneOf(['left', 'right']),

    /**
     * Overrides the inline-styles of the Checkbox element label.
     */
    labelStyle: _react2.default.PropTypes.object,

    /**
     * Callback function that is fired when the checkbox is checked.
     *
     * @param {object} event `change` event targeting the underlying checkbox `input`.
     * @param {boolean} isInputChecked The `checked` value of the underlying checkbox `input`.
     */
    onCheck: _react2.default.PropTypes.func,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The SvgIcon to use for the unchecked state.
     * This is useful to create icon toggles.
     */
    unCheckedIcon: (0, _deprecatedPropType2.default)(_react2.default.PropTypes.element, 'Use uncheckedIcon instead.'),

    /**
     * The SvgIcon to use for the unchecked state.
     * This is useful to create icon toggles.
     */
    uncheckedIcon: _react2.default.PropTypes.element,

    /**
     * ValueLink for when using controlled checkbox.
     */
    valueLink: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      defaultChecked: false,
      labelPosition: 'right',
      disabled: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      switched: this.props.checked || this.props.defaultChecked || this.props.valueLink && this.props.valueLink.value || false,
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
      muiTheme: nextContext.muiTheme || this.state.muiTheme,
      switched: this.props.checked !== nextProps.checked ? nextProps.checked : this.state.switched
    });
  },
  isChecked: function isChecked() {
    return this.refs.enhancedSwitch.isSwitched();
  },
  setChecked: function setChecked(newCheckedValue) {
    this.refs.enhancedSwitch.setSwitched(newCheckedValue);
  },
  _handleCheck: function _handleCheck(event, isInputChecked) {
    if (this.props.onCheck) this.props.onCheck(event, isInputChecked);
  },
  _handleStateChange: function _handleStateChange(newSwitched) {
    this.setState({ switched: newSwitched });
  },
  render: function render() {
    var _props = this.props;
    var iconStyle = _props.iconStyle;
    var onCheck = _props.onCheck;
    var checkedIcon = _props.checkedIcon;
    var uncheckedIcon = _props.uncheckedIcon;
    var unCheckedIcon = _props.unCheckedIcon;

    var other = _objectWithoutProperties(_props, ['iconStyle', 'onCheck', 'checkedIcon', 'uncheckedIcon', 'unCheckedIcon']);

    var styles = getStyles(this.props, this.state);
    var boxStyles = (0, _simpleAssign2.default)(styles.box, this.state.switched && styles.boxWhenSwitched, iconStyle, this.props.disabled && styles.boxWhenDisabled);
    var checkStyles = (0, _simpleAssign2.default)(styles.check, this.state.switched && styles.checkWhenSwitched, iconStyle, this.props.disabled && styles.checkWhenDisabled);

    var checkedElement = checkedIcon ? _react2.default.cloneElement(checkedIcon, {
      style: (0, _simpleAssign2.default)(checkStyles, checkedIcon.props.style)
    }) : _react2.default.createElement(_checkBox2.default, {
      style: checkStyles
    });

    var unCheckedElement = unCheckedIcon || uncheckedIcon ? _react2.default.cloneElement(unCheckedIcon || uncheckedIcon, {
      style: (0, _simpleAssign2.default)(boxStyles, (unCheckedIcon || uncheckedIcon).props.style)
    }) : _react2.default.createElement(_checkBoxOutlineBlank2.default, {
      style: boxStyles
    });

    var checkboxElement = _react2.default.createElement(
      'div',
      null,
      unCheckedElement,
      checkedElement
    );

    var rippleColor = this.state.switched ? checkStyles.fill : boxStyles.fill;
    var mergedIconStyle = (0, _simpleAssign2.default)(styles.icon, iconStyle);

    var labelStyle = (0, _simpleAssign2.default)(styles.label, this.props.labelStyle);

    var enhancedSwitchProps = {
      ref: 'enhancedSwitch',
      inputType: 'checkbox',
      switched: this.state.switched,
      switchElement: checkboxElement,
      rippleColor: rippleColor,
      iconStyle: mergedIconStyle,
      onSwitch: this._handleCheck,
      labelStyle: labelStyle,
      onParentShouldUpdate: this._handleStateChange,
      defaultSwitched: this.props.defaultChecked,
      labelPosition: this.props.labelPosition
    };

    return _react2.default.createElement(_enhancedSwitch2.default, _extends({}, other, enhancedSwitchProps));
  }
});

exports.default = Checkbox;