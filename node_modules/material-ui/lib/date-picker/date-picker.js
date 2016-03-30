'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _dateTime = require('../utils/date-time');

var _dateTime2 = _interopRequireDefault(_dateTime);

var _datePickerDialog = require('./date-picker-dialog');

var _datePickerDialog2 = _interopRequireDefault(_datePickerDialog);

var _textField = require('../text-field');

var _textField2 = _interopRequireDefault(_textField);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _deprecatedPropType = require('../utils/deprecatedPropType');

var _deprecatedPropType2 = _interopRequireDefault(_deprecatedPropType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DatePicker = _react2.default.createClass({
  displayName: 'DatePicker',


  propTypes: {
    /**
     * Constructor for date formatting for the specified `locale`.
     * The constructor must follow this specification: ECMAScript Internationalization API 1.0 (ECMA-402).
     * `Intl.DateTimeFormat` is supported by most modern browsers, see http://caniuse.com/#search=intl,
     * otherwise https://github.com/andyearnshaw/Intl.js is a good polyfill.
     */
    DateTimeFormat: _react2.default.PropTypes.func,

    /**
     * If true, automatically accept and close the picker on select a date.
     */
    autoOk: _react2.default.PropTypes.bool,

    /**
     * Override the default text of the 'Cancel' button.
     */
    cancelLabel: _react2.default.PropTypes.string,

    /**
     * Used to control how the DatePicker will be displayed when a user tries to set a date.
     * `dialog` (default) displays the DatePicker as a dialog with a modal.
     * `inline` displays the DatePicker below the input field (similar to auto complete).
     */
    container: _react2.default.PropTypes.oneOf(['dialog', 'inline']),

    /**
     * This is the initial date value of the component.
     * If either `value` or `valueLink` is provided they will override this
     * prop with `value` taking precedence.
     */
    defaultDate: _react2.default.PropTypes.object,

    /**
     * Disables the year selection in the date picker.
     */
    disableYearSelection: _react2.default.PropTypes.bool,

    /**
     * Disables the DatePicker.
     */
    disabled: _react2.default.PropTypes.bool,

    /**
     * Used to change the first day of week. It varies from
     * Saturday to Monday between different locales.
     * The allowed range is 0 (Sunday) to 6 (Saturday).
     * The default is `1`, Monday, as per ISO 8601.
     */
    firstDayOfWeek: _react2.default.PropTypes.number,

    /**
     * This function is called to format the date displayed in the input box, and should return a string.
     * By default if no `locale` and `DateTimeFormat` is provided date objects are formatted to ISO 8601 YYYY-MM-DD.
     *
     * @param {object} date Date object to be formatted.
     * @returns {any} The formatted date.
     */
    formatDate: _react2.default.PropTypes.func,

    /**
     * Locale used for formatting the dialog date strings. If you are not using the default value, you
     * have to provide a `DateTimeFormat` that supports it.
     */
    locale: _react2.default.PropTypes.string,

    /**
     * The ending of a range of valid dates. The range includes the endDate.
     * The default value is current date + 100 years.
     */
    maxDate: _react2.default.PropTypes.object,

    /**
     * The beginning of a range of valid dates. The range includes the startDate.
     * The default value is current date - 100 years.
     */
    minDate: _react2.default.PropTypes.object,

    /**
     * Tells the component to display the picker in portrait or landscape mode.
     */
    mode: _react2.default.PropTypes.oneOf(['portrait', 'landscape']),

    /**
     * Override the default text of the 'OK' button.
     */
    okLabel: _react2.default.PropTypes.string,

    /**
     * Callback function that is fired when the date value changes.
     *
     * @param {null} null Since there is no particular event associated with the change,
     * the first argument will always be null.
     * @param {object} date The new date.
     */
    onChange: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the Date Picker's dialog is dismissed.
     */
    onDismiss: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the Date Picker's `TextField` gains focus.
     *
     * @param {object} event `focus` event targeting the `TextField`.
     */
    onFocus: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the Date Picker's dialog is shown.
     */
    onShow: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when a touch tap event occurs on the Date Picker's `TextField`.
     *
     * @param {object} event TouchTap event targeting the `TextField`.
     */
    onTouchTap: _react2.default.PropTypes.func,

    /**
     * Callback function used to determine if a day's entry should be disabled on the calendar.
     *
     * @param {object} day Date object of a day.
     * @returns {boolean} Indicates whether the day should be disabled.
     */
    shouldDisableDate: _react2.default.PropTypes.func,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of DatePicker's TextField element.
     */
    textFieldStyle: _react2.default.PropTypes.object,

    /**
     * Sets the date for the Date Picker programmatically.
     */
    value: _react2.default.PropTypes.any,

    /**
     * Creates a ValueLink with the value of date picker.
     */
    valueLink: _react2.default.PropTypes.object,

    /**
     * Wordings used inside the button of the dialog.
     */
    wordings: (0, _deprecatedPropType2.default)(_react2.default.PropTypes.object, 'Instead, use `cancelLabel` and `okLabel`.')
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      autoOk: false,
      cancelLabel: 'Cancel',
      container: 'dialog',
      disabled: false,
      disableYearSelection: false,
      firstDayOfWeek: 1,
      okLabel: 'OK',
      style: {}
    };
  },
  getInitialState: function getInitialState() {
    return {
      date: this._isControlled() ? this._getControlledDate() : this.props.defaultDate,
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

    if (this._isControlled()) {
      var newDate = this._getControlledDate(nextProps);
      if (!_dateTime2.default.isEqualDate(this.state.date, newDate)) {
        this.setState({
          date: newDate
        });
      }
    }
  },
  getDate: function getDate() {
    return this.state.date;
  },


  /**
   * Open the date-picker dialog programmatically from a parent.
   */
  openDialog: function openDialog() {
    /**
     * if the date is not selected then set it to new date
     * (get the current system date while doing so)
     * else set it to the currently selected date
     */
    if (this.state.date !== undefined) {
      this.setState({
        dialogDate: this.getDate()
      }, this.refs.dialogWindow.show);
    } else {
      this.setState({
        dialogDate: new Date()
      }, this.refs.dialogWindow.show);
    }
  },


  /**
   * Alias for `openDialog()` for an api consistent with TextField.
   */
  focus: function focus() {
    this.openDialog();
  },
  _handleDialogAccept: function _handleDialogAccept(date) {
    if (!this._isControlled()) {
      this.setState({
        date: date
      });
    }
    if (this.props.onChange) this.props.onChange(null, date);
    if (this.props.valueLink) this.props.valueLink.requestChange(date);
  },
  _handleInputFocus: function _handleInputFocus(event) {
    event.target.blur();
    if (this.props.onFocus) this.props.onFocus(event);
  },


  _handleInputTouchTap: function _handleInputTouchTap(event) {
    var _this = this;

    if (this.props.onTouchTap) this.props.onTouchTap(event);

    if (!this.props.disabled) setTimeout(function () {
      _this.openDialog();
    }, 0);
  },

  _isControlled: function _isControlled() {
    return this.props.hasOwnProperty('value') || this.props.hasOwnProperty('valueLink');
  },
  _getControlledDate: function _getControlledDate() {
    var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

    if (_dateTime2.default.isDateObject(props.value)) {
      return props.value;
    } else if (props.valueLink && _dateTime2.default.isDateObject(props.valueLink.value)) {
      return props.valueLink.value;
    }
  },
  _formatDate: function _formatDate(date) {
    if (this.props.locale && this.props.DateTimeFormat) {
      return new this.props.DateTimeFormat(this.props.locale, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }).format(date);
    } else {
      return _dateTime2.default.format(date);
    }
  },
  render: function render() {
    var _props = this.props;
    var DateTimeFormat = _props.DateTimeFormat;
    var autoOk = _props.autoOk;
    var cancelLabel = _props.cancelLabel;
    var container = _props.container;
    var defaultDate = _props.defaultDate;
    var disableYearSelection = _props.disableYearSelection;
    var firstDayOfWeek = _props.firstDayOfWeek;
    var locale = _props.locale;
    var maxDate = _props.maxDate;
    var minDate = _props.minDate;
    var mode = _props.mode;
    var okLabel = _props.okLabel;
    var onDismiss = _props.onDismiss;
    var onFocus = _props.onFocus;
    var onShow = _props.onShow;
    var onTouchTap = _props.onTouchTap;
    var style = _props.style;
    var textFieldStyle = _props.textFieldStyle;
    var valueLink = _props.valueLink;
    var wordings = _props.wordings;

    var other = _objectWithoutProperties(_props, ['DateTimeFormat', 'autoOk', 'cancelLabel', 'container', 'defaultDate', 'disableYearSelection', 'firstDayOfWeek', 'locale', 'maxDate', 'minDate', 'mode', 'okLabel', 'onDismiss', 'onFocus', 'onShow', 'onTouchTap', 'style', 'textFieldStyle', 'valueLink', 'wordings']);

    var formatDate = this.props.formatDate || this._formatDate;
    var prepareStyles = this.state.muiTheme.prepareStyles;


    return _react2.default.createElement(
      'div',
      { style: prepareStyles((0, _simpleAssign2.default)({}, style)) },
      _react2.default.createElement(_textField2.default, _extends({}, other, {
        style: textFieldStyle,
        ref: 'input',
        value: this.state.date ? formatDate(this.state.date) : undefined,
        onFocus: this._handleInputFocus,
        onTouchTap: this._handleInputTouchTap
      })),
      _react2.default.createElement(_datePickerDialog2.default, {
        DateTimeFormat: DateTimeFormat,
        autoOk: autoOk,
        cancelLabel: cancelLabel,
        container: container,
        disableYearSelection: disableYearSelection,
        firstDayOfWeek: firstDayOfWeek,
        initialDate: this.state.dialogDate,
        locale: locale,
        maxDate: maxDate,
        minDate: minDate,
        mode: mode,
        okLabel: okLabel,
        onAccept: this._handleDialogAccept,
        onShow: onShow,
        onDismiss: onDismiss,
        ref: 'dialogWindow',
        shouldDisableDate: this.props.shouldDisableDate,
        wordings: wordings
      })
    );
  }
});

exports.default = DatePicker;