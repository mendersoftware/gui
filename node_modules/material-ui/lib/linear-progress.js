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

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getRelativeValue(value, min, max) {
  var clampedValue = Math.min(Math.max(min, value), max);
  var rangeValue = max - min;
  var relValue = Math.round(clampedValue / rangeValue * 10000) / 10000;
  return relValue * 100;
}

function getStyles(props, state) {
  var max = props.max;
  var min = props.min;
  var value = props.value;
  var palette = state.muiTheme.baseTheme.palette;


  var styles = {
    root: {
      position: 'relative',
      height: 4,
      display: 'block',
      width: '100%',
      backgroundColor: palette.primary3Color,
      borderRadius: 2,
      margin: 0,
      overflow: 'hidden'
    },
    bar: {
      height: '100%'
    },
    barFragment1: {},
    barFragment2: {}
  };

  if (props.mode === 'indeterminate') {
    styles.barFragment1 = {
      position: 'absolute',
      backgroundColor: props.color || palette.primary1Color,
      top: 0,
      left: 0,
      bottom: 0,
      transition: _transitions2.default.create('all', '840ms', null, 'cubic-bezier(0.650, 0.815, 0.735, 0.395)')
    };

    styles.barFragment2 = {
      position: 'absolute',
      backgroundColor: props.color || palette.primary1Color,
      top: 0,
      left: 0,
      bottom: 0,
      transition: _transitions2.default.create('all', '840ms', null, 'cubic-bezier(0.165, 0.840, 0.440, 1.000)')
    };
  } else {
    styles.bar.backgroundColor = props.color || palette.primary1Color;
    styles.bar.transition = _transitions2.default.create('width', '.3s', null, 'linear');
    styles.bar.width = getRelativeValue(value, min, max) + '%';
  }

  return styles;
}

var LinearProgress = _react2.default.createClass({
  displayName: 'LinearProgress',

  propTypes: {
    /**
     * The mode of show your progress, indeterminate for
     * when there is no value for progress.
     */
    color: _react2.default.PropTypes.string,

    /**
     * The max value of progress, only works in determinate mode.
     */
    max: _react2.default.PropTypes.number,

    /**
     * The min value of progress, only works in determinate mode.
     */
    min: _react2.default.PropTypes.number,

    /**
     * The mode of show your progress, indeterminate for when
     * there is no value for progress.
     */
    mode: _react2.default.PropTypes.oneOf(['determinate', 'indeterminate']),

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The value of progress, only works in determinate mode.
     */
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
      mode: 'indeterminate',
      value: 0,
      min: 0,
      max: 100
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
  componentDidMount: function componentDidMount() {
    var _this = this;

    this.timers.bar1 = this._barUpdate('bar1', 0, this.refs.bar1, [[-35, 100], [100, -90]]);

    this.timers.bar2 = setTimeout(function () {
      _this._barUpdate('bar2', 0, _this.refs.bar2, [[-200, 100], [107, -8]]);
    }, 850);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this.timers.bar1);
    clearTimeout(this.timers.bar2);
  },


  timers: {
    bar1: undefined,
    bar2: undefined
  },

  _barUpdate: function _barUpdate(id, step, barElement, stepValues) {
    var _this2 = this;

    if (this.props.mode !== 'indeterminate') return;

    step = step || 0;
    step %= 4;

    var right = this.state.muiTheme.isRtl ? 'left' : 'right';
    var left = this.state.muiTheme.isRtl ? 'right' : 'left';

    if (step === 0) {
      barElement.style[left] = stepValues[0][0] + '%';
      barElement.style[right] = stepValues[0][1] + '%';
    } else if (step === 1) {
      barElement.style.transitionDuration = '840ms';
    } else if (step === 2) {
      barElement.style[left] = stepValues[1][0] + '%';
      barElement.style[right] = stepValues[1][1] + '%';
    } else if (step === 3) {
      barElement.style.transitionDuration = '0ms';
    }
    this.timers[id] = setTimeout(function () {
      return _this2._barUpdate(id, step + 1, barElement, stepValues);
    }, 420);
  },
  render: function render() {
    var _props = this.props;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['style']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    return _react2.default.createElement(
      'div',
      _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) }),
      _react2.default.createElement(
        'div',
        { style: prepareStyles(styles.bar) },
        _react2.default.createElement('div', { ref: 'bar1', style: prepareStyles(styles.barFragment1) }),
        _react2.default.createElement('div', { ref: 'bar2', style: prepareStyles(styles.barFragment2) })
      )
    );
  }
});

exports.default = LinearProgress;