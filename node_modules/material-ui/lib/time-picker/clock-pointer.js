'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function calcAngle(value, base) {
  value %= base;
  var angle = 360 / base * value;
  return angle;
}

function isInner(props) {
  if (props.type !== 'hour') {
    return false;
  }
  return props.value < 1 || props.value > 12;
}

function getStyles(props, state) {
  var hasSelected = props.hasSelected;
  var type = props.type;
  var value = props.value;
  var inner = state.inner;
  var timePicker = state.muiTheme.timePicker;


  var angle = type === 'hour' ? calcAngle(value, 12) : calcAngle(value, 60);

  var styles = {
    root: {
      height: inner ? '30%' : '40%',
      background: timePicker.accentColor,
      width: 2,
      left: 'calc(50% - 1px)',
      position: 'absolute',
      bottom: '50%',
      transformOrigin: 'bottom',
      pointerEvents: 'none',
      transform: 'rotateZ(' + angle + 'deg)'
    },
    mark: {
      background: timePicker.selectTextColor,
      border: '4px solid ' + timePicker.accentColor,
      display: hasSelected && 'none',
      width: 7,
      height: 7,
      position: 'absolute',
      top: -5,
      left: -6,
      borderRadius: '100%'
    }
  };

  return styles;
}

var ClockPointer = _react2.default.createClass({
  displayName: 'ClockPointer',


  propTypes: {
    hasSelected: _react2.default.PropTypes.bool,
    type: _react2.default.PropTypes.oneOf(['hour', 'minute']),
    value: _react2.default.PropTypes.number
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      value: null,
      type: 'minute',
      hasSelected: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      inner: isInner(this.props),
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
      inner: isInner(nextProps),
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  render: function render() {
    if (this.props.value === null) {
      return _react2.default.createElement('span', null);
    }

    var styles = getStyles(this.props, this.state);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    return _react2.default.createElement(
      'div',
      { style: prepareStyles(styles.root) },
      _react2.default.createElement('div', { style: prepareStyles(styles.mark) })
    );
  }
});

exports.default = ClockPointer;