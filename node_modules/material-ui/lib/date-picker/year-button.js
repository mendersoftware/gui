'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enhancedButton = require('../enhanced-button');

var _enhancedButton2 = _interopRequireDefault(_enhancedButton);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var selected = props.selected;
  var year = props.year;
  var hover = state.hover;
  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var datePicker = _state$muiTheme.datePicker;


  return {
    root: {
      boxSizing: 'border-box',
      WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove mobile color flashing (deprecated)
      position: 'relative',
      display: 'block',
      margin: '0 auto',
      width: 36,
      fontSize: 14,
      padding: '8px 2px',
      color: year === new Date().getFullYear() && datePicker.color
    },
    label: {
      position: 'relative',
      top: -1,
      color: hover || selected ? datePicker.selectTextColor : baseTheme.palette.textColor
    },
    buttonState: {
      position: 'absolute',
      height: 32,
      width: 32,
      opacity: hover ? 0.6 : selected ? 1 : 0,
      borderRadius: '50%',
      transform: hover || selected ? 'scale(1.5)' : 'scale(0)',
      backgroundColor: datePicker.selectColor
    }
  };
}

var YearButton = _react2.default.createClass({
  displayName: 'YearButton',


  propTypes: {
    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,
    onTouchTap: _react2.default.PropTypes.func,
    selected: _react2.default.PropTypes.bool,
    year: _react2.default.PropTypes.number
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      selected: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      hover: false,
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
  _handleMouseEnter: function _handleMouseEnter() {
    this.setState({ hover: true });
  },
  _handleMouseLeave: function _handleMouseLeave() {
    this.setState({ hover: false });
  },
  _handleTouchTap: function _handleTouchTap(event) {
    if (this.props.onTouchTap) this.props.onTouchTap(event, this.props.year);
  },
  render: function render() {
    var _props = this.props;
    var className = _props.className;
    var year = _props.year;
    var onTouchTap = _props.onTouchTap;
    var selected = _props.selected;

    var other = _objectWithoutProperties(_props, ['className', 'year', 'onTouchTap', 'selected']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    return _react2.default.createElement(
      _enhancedButton2.default,
      _extends({}, other, {
        style: styles.root,
        disableFocusRipple: true,
        disableTouchRipple: true,
        onMouseEnter: this._handleMouseEnter,
        onMouseLeave: this._handleMouseLeave,
        onTouchTap: this._handleTouchTap
      }),
      _react2.default.createElement('div', { style: prepareStyles(styles.buttonState) }),
      _react2.default.createElement(
        'span',
        { style: prepareStyles(styles.label) },
        year
      )
    );
  }
});

exports.default = YearButton;