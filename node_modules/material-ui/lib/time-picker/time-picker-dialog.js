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

var _clock = require('./clock');

var _clock2 = _interopRequireDefault(_clock);

var _dialog = require('../dialog');

var _dialog2 = _interopRequireDefault(_dialog);

var _flatButton = require('../flat-button');

var _flatButton2 = _interopRequireDefault(_flatButton);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var TimePickerDialog = _react2.default.createClass({
  displayName: 'TimePickerDialog',


  propTypes: {
    autoOk: _react2.default.PropTypes.bool,
    cancelLabel: _react2.default.PropTypes.string,
    format: _react2.default.PropTypes.oneOf(['ampm', '24hr']),
    initialTime: _react2.default.PropTypes.object,
    okLabel: _react2.default.PropTypes.string,
    onAccept: _react2.default.PropTypes.func,
    onDismiss: _react2.default.PropTypes.func,
    onShow: _react2.default.PropTypes.func
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
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
  getTheme: function getTheme() {
    return this.state.muiTheme.timePicker;
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
  _handleOKTouchTap: function _handleOKTouchTap() {
    this.dismiss();
    if (this.props.onAccept) {
      this.props.onAccept(this.refs.clock.getSelectedTime());
    }
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
    var initialTime = _props.initialTime;
    var onAccept = _props.onAccept;
    var format = _props.format;
    var autoOk = _props.autoOk;
    var okLabel = _props.okLabel;
    var cancelLabel = _props.cancelLabel;

    var other = _objectWithoutProperties(_props, ['initialTime', 'onAccept', 'format', 'autoOk', 'okLabel', 'cancelLabel']);

    var styles = {
      root: {
        fontSize: 14,
        color: this.getTheme().clockColor
      },
      dialogContent: {
        width: 280
      },
      body: {
        padding: 0
      }
    };

    var actions = [_react2.default.createElement(_flatButton2.default, {
      key: 0,
      label: cancelLabel,
      primary: true,
      onTouchTap: this.dismiss
    }), _react2.default.createElement(_flatButton2.default, {
      key: 1,
      label: okLabel,
      primary: true,
      onTouchTap: this._handleOKTouchTap
    })];

    var onClockChangeMinutes = autoOk === true ? this._handleOKTouchTap : undefined;

    return _react2.default.createElement(
      _dialog2.default,
      _extends({}, other, {
        ref: 'dialogWindow',
        style: styles.root,
        bodyStyle: styles.body,
        actions: actions,
        contentStyle: styles.dialogContent,
        repositionOnUpdate: false,
        open: this.state.open,
        onRequestClose: this.dismiss
      }),
      _react2.default.createElement(_reactEventListener2.default, { elementName: 'window', onKeyUp: this._handleWindowKeyUp }),
      _react2.default.createElement(_clock2.default, {
        ref: 'clock',
        format: format,
        initialTime: initialTime,
        onChangeMinutes: onClockChangeMinutes
      })
    );
  }
});

exports.default = TimePickerDialog;