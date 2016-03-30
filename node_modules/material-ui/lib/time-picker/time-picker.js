'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _dateTime = require('../utils/date-time.js');

var _dateTime2 = _interopRequireDefault(_dateTime);

var _timePickerDialog = require('./time-picker-dialog');

var _timePickerDialog2 = _interopRequireDefault(_timePickerDialog);

var _textField = require('../text-field');

var _textField2 = _interopRequireDefault(_textField);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var emptyTime = new Date();
emptyTime.setHours(0);
emptyTime.setMinutes(0);
emptyTime.setSeconds(0);
emptyTime.setMilliseconds(0);

var TimePicker = _react2.default.createClass({
  displayName: 'TimePicker',


  propTypes: {
    /**
     * If true, automatically accept and close the picker on set minutes.
     */
    autoOk: _react2.default.PropTypes.bool,

    /**
     * Override the label of the 'Cancel' button.
     */
    cancelLabel: _react2.default.PropTypes.string,

    /**
     * This is the initial time value of the component.
     */
    defaultTime: _react2.default.PropTypes.object,

    /**
     * Tells the component to display the picker in
     * ampm (12hr) format or 24hr format.
     */
    format: _react2.default.PropTypes.oneOf(['ampm', '24hr']),

    /**
     * Override the label of the 'OK' button.
     */
    okLabel: _react2.default.PropTypes.string,

    /**
     * Callback function that is fired when the time
     * value changes. The time value is passed in a Date
     * Object.Since there is no particular event associated
     * with the change the first argument will always be null
     * and the second argument will be the new Date instance.
     */
    onChange: _react2.default.PropTypes.func,

    /**
     * Fired when the timepicker dialog is dismissed.
     */
    onDismiss: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the timepicker field gains focus.
     */
    onFocus: _react2.default.PropTypes.func,

    /**
     * Fired when the timepicker dialog is shown.
     */
    onShow: _react2.default.PropTypes.func,

    /**
     * Callback for touch tap event.
     */
    onTouchTap: _react2.default.PropTypes.func,

    /**
     * It's technically more correct to refer to
     * "12 noon" and "12 midnight" rather than
     * "12 a.m." and "12 p.m." and it avoids real
     * confusion between different locales. By default
     * (for compatibility reasons) TimePicker uses
     * (12 a.m./12 p.m.) To use (noon/midnight) set pedantic={true}.
     */
    pedantic: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of TimePicker's TextField element.
     */
    textFieldStyle: _react2.default.PropTypes.object,

    /**
     * Sets the time for the Time Picker programmatically.
     */
    value: _react2.default.PropTypes.object

  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      defaultTime: null,
      format: 'ampm',
      pedantic: false,
      autoOk: false,
      style: {},
      okLabel: 'OK',
      cancelLabel: 'Cancel'
    };
  },
  getInitialState: function getInitialState() {
    return {
      time: this._isControlled() ? this._getControlledTime() : this.props.defaultTime,
      dialogTime: new Date(),
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newState = this.state;
    if (nextContext.muiTheme) {
      newState.muiTheme = nextContext.muiTheme;
    }
    newState.time = this._getControlledTime(nextProps);
    this.setState(newState);
  },


  /**
   * Deprecated.
   * returns timepicker value.
   **/
  getTime: function getTime() {
    process.env.NODE_ENV !== "production" ? (0, _warning2.default)(false, 'getTime() method is deprecated. Use the defaultTime property\n    instead. Or use the TimePicker as a controlled component with the value\n    property.') : void 0;
    return this.state.time;
  },


  /**
   * Deprecated
   * sets timepicker value.
   **/
  setTime: function setTime(time) {
    process.env.NODE_ENV !== "production" ? (0, _warning2.default)(false, 'setTime() method is deprecated. Use the defaultTime property\n    instead. Or use the TimePicker as a controlled component with the value\n    property.') : void 0;
    this.setState({ time: time ? time : emptyTime });
  },


  /**
   * Alias for `openDialog()` for an api consistent with TextField.
   */
  focus: function focus() {
    this.openDialog();
  },
  openDialog: function openDialog() {
    this.setState({
      dialogTime: this.state.time
    });
    this.refs.dialogWindow.show();
  },
  _handleDialogAccept: function _handleDialogAccept(t) {
    this.setState({
      time: t
    });
    if (this.props.onChange) this.props.onChange(null, t);
  },
  _handleInputFocus: function _handleInputFocus(event) {
    event.target.blur();
    if (this.props.onFocus) this.props.onFocus(event);
  },
  _handleInputTouchTap: function _handleInputTouchTap(event) {
    event.preventDefault();

    this.openDialog();

    if (this.props.onTouchTap) this.props.onTouchTap(event);
  },
  _isControlled: function _isControlled() {
    return this.props.value !== null;
  },
  _getControlledTime: function _getControlledTime() {
    var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

    var result = null;
    if (_dateTime2.default.isDateObject(props.value)) {
      result = props.value;
    }
    return result;
  },
  render: function render() {
    var _props = this.props;
    var autoOk = _props.autoOk;
    var cancelLabel = _props.cancelLabel;
    var format = _props.format;
    var okLabel = _props.okLabel;
    var onFocus = _props.onFocus;
    var onTouchTap = _props.onTouchTap;
    var onShow = _props.onShow;
    var onDismiss = _props.onDismiss;
    var pedantic = _props.pedantic;
    var style = _props.style;
    var textFieldStyle = _props.textFieldStyle;

    var other = _objectWithoutProperties(_props, ['autoOk', 'cancelLabel', 'format', 'okLabel', 'onFocus', 'onTouchTap', 'onShow', 'onDismiss', 'pedantic', 'style', 'textFieldStyle']);

    var _state = this.state;
    var prepareStyles = _state.muiTheme.prepareStyles;
    var time = _state.time;


    return _react2.default.createElement(
      'div',
      { style: prepareStyles((0, _simpleAssign2.default)({}, style)) },
      _react2.default.createElement(_textField2.default, _extends({}, other, {
        style: textFieldStyle,
        ref: 'input',
        value: time === emptyTime ? null : _dateTime2.default.formatTime(time, format, pedantic),
        onFocus: this._handleInputFocus,
        onTouchTap: this._handleInputTouchTap
      })),
      _react2.default.createElement(_timePickerDialog2.default, {
        ref: 'dialogWindow',
        initialTime: this.state.dialogTime,
        onAccept: this._handleDialogAccept,
        onShow: onShow,
        onDismiss: onDismiss,
        format: format,
        okLabel: okLabel,
        cancelLabel: cancelLabel,
        autoOk: autoOk
      })
    );
  }
});

exports.default = TimePicker;