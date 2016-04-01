'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _autoPrefix = require('./styles/auto-prefix');

var _autoPrefix2 = _interopRequireDefault(_autoPrefix);

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
  var size = props.size;
  var value = props.value;
  var palette = state.muiTheme.baseTheme.palette;


  var zoom = size * 1.4;
  var baseSize = 50;
  var margin = Math.round((50 * zoom - 50) / 2);

  if (margin < 0) margin = 0;

  var styles = {
    root: {
      position: 'relative',
      margin: margin,
      display: 'inline-block',
      width: baseSize,
      height: baseSize
    },
    wrapper: {
      width: baseSize,
      height: baseSize,
      display: 'inline-block',
      transition: _transitions2.default.create('transform', '20s', null, 'linear'),
      transitionTimingFunction: 'linear'
    },
    svg: {
      height: baseSize,
      position: 'relative',
      transform: 'scale(' + zoom + ')',
      width: baseSize
    },
    path: {
      strokeDasharray: '89,200',
      strokeDashoffset: 0,
      stroke: props.color || palette.primary1Color,
      strokeLinecap: 'round',
      transition: _transitions2.default.create('all', '1.5s', null, 'ease-in-out')
    }
  };

  if (props.mode === 'determinate') {
    var relVal = getRelativeValue(value, min, max);
    styles.path.transition = _transitions2.default.create('all', '0.3s', null, 'linear');
    styles.path.strokeDasharray = Math.round(relVal * 1.25) + ',200';
  }

  return styles;
}

var CircularProgress = _react2.default.createClass({
  displayName: 'CircularProgress',


  propTypes: {
    /**
     * Override the progress's color.
     */
    color: _react2.default.PropTypes.string,

    /**
     * Style for inner wrapper div.
     */
    innerStyle: _react2.default.PropTypes.object,

    /**
     * The max value of progress, only works in determinate mode.
     */
    max: _react2.default.PropTypes.number,

    /**
     * The min value of progress, only works in determinate mode.
     */
    min: _react2.default.PropTypes.number,

    /**
     * The mode of show your progress, indeterminate
     * for when there is no value for progress.
     */
    mode: _react2.default.PropTypes.oneOf(['determinate', 'indeterminate']),

    /**
     * The size of the progress.
     */
    size: _react2.default.PropTypes.number,

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
      max: 100,
      size: 1
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
    this._scalePath(this.refs.path);
    this._rotateWrapper(this.refs.wrapper);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this.scalePathTimer);
    clearTimeout(this.rotateWrapperTimer);
  },


  scalePathTimer: undefined,
  rotateWrapperTimer: undefined,

  _scalePath: function _scalePath(path, step) {
    var _this = this;

    if (this.props.mode !== 'indeterminate') return;

    step = step || 0;
    step %= 3;

    if (step === 0) {
      path.style.strokeDasharray = '1, 200';
      path.style.strokeDashoffset = 0;
      path.style.transitionDuration = '0ms';
    } else if (step === 1) {
      path.style.strokeDasharray = '89, 200';
      path.style.strokeDashoffset = -35;
      path.style.transitionDuration = '750ms';
    } else {
      path.style.strokeDasharray = '89,200';
      path.style.strokeDashoffset = -124;
      path.style.transitionDuration = '850ms';
    }

    this.scalePathTimer = setTimeout(function () {
      return _this._scalePath(path, step + 1);
    }, step ? 750 : 250);
  },
  _rotateWrapper: function _rotateWrapper(wrapper) {
    var _this2 = this;

    if (this.props.mode !== 'indeterminate') return;

    _autoPrefix2.default.set(wrapper.style, 'transform', 'rotate(0deg)', this.state.muiTheme);
    _autoPrefix2.default.set(wrapper.style, 'transitionDuration', '0ms', this.state.muiTheme);

    setTimeout(function () {
      _autoPrefix2.default.set(wrapper.style, 'transform', 'rotate(1800deg)', _this2.state.muiTheme);
      _autoPrefix2.default.set(wrapper.style, 'transitionDuration', '10s', _this2.state.muiTheme);
      _autoPrefix2.default.set(wrapper.style, 'transitionTimingFunction', 'linear', _this2.state.muiTheme);
    }, 50);

    this.rotateWrapperTimer = setTimeout(function () {
      return _this2._rotateWrapper(wrapper);
    }, 10050);
  },
  render: function render() {
    var _props = this.props;
    var style = _props.style;
    var innerStyle = _props.innerStyle;
    var size = _props.size;

    var other = _objectWithoutProperties(_props, ['style', 'innerStyle', 'size']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    return _react2.default.createElement(
      'div',
      _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) }),
      _react2.default.createElement(
        'div',
        { ref: 'wrapper', style: prepareStyles((0, _simpleAssign2.default)(styles.wrapper, innerStyle)) },
        _react2.default.createElement(
          'svg',
          { style: prepareStyles(styles.svg) },
          _react2.default.createElement('circle', {
            ref: 'path', style: prepareStyles(styles.path), cx: '25',
            cy: '25', r: '20', fill: 'none',
            strokeWidth: '2.5', strokeMiterlimit: '10'
          })
        )
      )
    );
  }
});

exports.default = CircularProgress;