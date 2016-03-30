'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactEventListener = require('react-event-listener');

var _reactEventListener2 = _interopRequireDefault(_reactEventListener);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _calendar = require('./calendar');

var _calendar2 = _interopRequireDefault(_calendar);

var _dialog = require('../dialog');

var _dialog2 = _interopRequireDefault(_dialog);

var _datePickerInline = require('./date-picker-inline');

var _datePickerInline2 = _interopRequireDefault(_datePickerInline);

var _flatButton = require('../flat-button');

var _flatButton2 = _interopRequireDefault(_flatButton);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _dateTime = require('../utils/date-time');

var _dateTime2 = _interopRequireDefault(_dateTime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DatePickerDialog = _react2.default.createClass({
  displayName: 'DatePickerDialog',


  propTypes: {
    DateTimeFormat: _react2.default.PropTypes.func,
    autoOk: _react2.default.PropTypes.bool,
    cancelLabel: _react2.default.PropTypes.string,
    container: _react2.default.PropTypes.oneOf(['dialog', 'inline']),
    disableYearSelection: _react2.default.PropTypes.bool,
    firstDayOfWeek: _react2.default.PropTypes.number,
    initialDate: _react2.default.PropTypes.object,
    locale: _react2.default.PropTypes.string,
    maxDate: _react2.default.PropTypes.object,
    minDate: _react2.default.PropTypes.object,
    mode: _react2.default.PropTypes.oneOf(['portrait', 'landscape']),
    okLabel: _react2.default.PropTypes.string,
    onAccept: _react2.default.PropTypes.func,
    onDismiss: _react2.default.PropTypes.func,
    onShow: _react2.default.PropTypes.func,
    shouldDisableDate: _react2.default.PropTypes.func,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,
    wordings: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      DateTimeFormat: _dateTime2.default.DateTimeFormat,
      container: 'dialog',
      locale: 'en-US',
      okLabel: 'OK',
      cancelLabel: 'Cancel'
    };
  },

  getInitialState: function getInitialState() {
    return {
      open: false,
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
  show: function show() {
    if (this.props.onShow && !this.state.open) this.props.onShow();
    this.setState({
      open: true
    });
  },
  dismiss: function dismiss() {
    if (this.props.onDismiss && this.state.open) this.props.onDismiss();
    this.setState({
      open: false
    });
  },
  handleTouchTapDay: function handleTouchTapDay() {
    if (this.props.autoOk) {
      setTimeout(this._handleOKTouchTap, 300);
    }
  },
  _handleCancelTouchTap: function _handleCancelTouchTap() {
    this.dismiss();
  },
  _handleOKTouchTap: function _handleOKTouchTap() {
    if (this.props.onAccept && !this.refs.calendar.isSelectedDateDisabled()) {
      this.props.onAccept(this.refs.calendar.getSelectedDate());
    }

    this.dismiss();
  },
  _handleWindowKeyUp: function _handleWindowKeyUp(event) {
    if (this.state.open) {
      switch ((0, _keycode2.default)(event)) {
        case 'enter':
          this._handleOKTouchTap();
          break;
      }
    }
  },
  render: function render() {
    var _props = this.props;
    var DateTimeFormat = _props.DateTimeFormat;
    var cancelLabel = _props.cancelLabel;
    var container = _props.container;
    var initialDate = _props.initialDate;
    var firstDayOfWeek = _props.firstDayOfWeek;
    var locale = _props.locale;
    var okLabel = _props.okLabel;
    var onAccept = _props.onAccept;
    var style = _props.style;
    var wordings = _props.wordings;

    var other = _objectWithoutProperties(_props, ['DateTimeFormat', 'cancelLabel', 'container', 'initialDate', 'firstDayOfWeek', 'locale', 'okLabel', 'onAccept', 'style', 'wordings']);

    var calendarTextColor = this.state.muiTheme.datePicker.calendarTextColor;


    var styles = {
      root: {
        fontSize: 14,
        color: calendarTextColor
      },

      dialogContent: {
        width: this.props.mode === 'landscape' ? 480 : 320
      },

      dialogBodyContent: {
        padding: 0
      },

      actions: {
        marginRight: 8
      }
    };

    var actions = [_react2.default.createElement(_flatButton2.default, {
      key: 0,
      label: wordings ? wordings.cancel : cancelLabel,
      primary: true,
      style: styles.actions,
      onTouchTap: this._handleCancelTouchTap
    })];

    if (!this.props.autoOk) {
      actions.push(_react2.default.createElement(_flatButton2.default, {
        key: 1,
        label: wordings ? wordings.ok : okLabel,
        primary: true,
        disabled: this.refs.calendar !== undefined && this.refs.calendar.isSelectedDateDisabled(),
        style: styles.actions,
        onTouchTap: this._handleOKTouchTap
      }));
    }

    // will change later when Popover is available.
    var Container = container === 'inline' ? _datePickerInline2.default : _dialog2.default;
    return _react2.default.createElement(
      Container,
      _extends({}, other, {
        ref: 'dialog',
        style: styles.root,
        contentStyle: styles.dialogContent,
        bodyStyle: styles.dialogBodyContent,
        actions: actions,
        repositionOnUpdate: false,
        open: this.state.open,
        onRequestClose: this.dismiss
      }),
      _react2.default.createElement(_reactEventListener2.default, {
        elementName: 'window',
        onKeyUp: this._handleWindowKeyUp
      }),
      _react2.default.createElement(_calendar2.default, {
        DateTimeFormat: DateTimeFormat,
        firstDayOfWeek: firstDayOfWeek,
        locale: locale,
        ref: 'calendar',
        onDayTouchTap: this.handleTouchTapDay,
        initialDate: this.props.initialDate,
        open: this.state.open,
        minDate: this.props.minDate,
        maxDate: this.props.maxDate,
        shouldDisableDate: this.props.shouldDisableDate,
        disableYearSelection: this.props.disableYearSelection,
        mode: this.props.mode
      })
    );
  }
});

exports.default = DatePickerDialog;