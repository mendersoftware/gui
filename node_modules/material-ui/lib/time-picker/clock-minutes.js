'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _clockNumber = require('./clock-number');

var _clockNumber2 = _interopRequireDefault(_clockNumber);

var _clockPointer = require('./clock-pointer');

var _clockPointer2 = _interopRequireDefault(_clockPointer);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rad2deg(rad) {
  return rad * 57.29577951308232;
}

function getTouchEventOffsetValues(event) {
  var el = event.target;
  var boundingRect = el.getBoundingClientRect();

  var offset = {
    offsetX: event.clientX - boundingRect.left,
    offsetY: event.clientY - boundingRect.top
  };

  return offset;
}

var ClockMinutes = _react2.default.createClass({
  displayName: 'ClockMinutes',

  propTypes: {
    initialMinutes: _react2.default.PropTypes.number,
    onChange: _react2.default.PropTypes.func
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      initialMinutes: new Date().getMinutes(),
      onChange: function onChange() {}
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
    var clockElement = this.refs.mask;

    this.center = {
      x: clockElement.offsetWidth / 2,
      y: clockElement.offsetHeight / 2
    };

    this.basePoint = {
      x: this.center.x,
      y: 0
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },


  center: { x: 0, y: 0 },
  basePoint: { x: 0, y: 0 },

  isMousePressed: function isMousePressed(event) {
    if (typeof event.buttons === 'undefined') {
      return event.nativeEvent.which;
    }
    return event.buttons;
  },
  handleUp: function handleUp(event) {
    event.preventDefault();
    this.setClock(event.nativeEvent, true);
  },
  handleMove: function handleMove(event) {
    event.preventDefault();
    if (this.isMousePressed(event) !== 1) return;
    this.setClock(event.nativeEvent, false);
  },
  handleTouch: function handleTouch(event) {
    event.preventDefault();
    this.setClock(event.changedTouches[0], false);
  },
  setClock: function setClock(event, finish) {
    if (typeof event.offsetX === 'undefined') {
      var offset = getTouchEventOffsetValues(event);

      event.offsetX = offset.offsetX;
      event.offsetY = offset.offsetY;
    }

    var minutes = this.getMinutes(event.offsetX, event.offsetY);

    this.props.onChange(minutes, finish);
  },
  getMinutes: function getMinutes(offsetX, offsetY) {
    var step = 6;
    var x = offsetX - this.center.x;
    var y = offsetY - this.center.y;
    var cx = this.basePoint.x - this.center.x;
    var cy = this.basePoint.y - this.center.y;

    var atan = Math.atan2(cx, cy) - Math.atan2(x, y);

    var deg = rad2deg(atan);
    deg = Math.round(deg / step) * step;
    deg %= 360;

    var value = Math.floor(deg / step) || 0;

    return value;
  },
  _getMinuteNumbers: function _getMinuteNumbers() {
    var minutes = [];
    for (var i = 0; i < 12; i++) {
      minutes.push(i * 5);
    }
    var selectedMinutes = this.props.initialMinutes;
    var hasSelected = false;

    var numbers = minutes.map(function (minute) {
      var isSelected = selectedMinutes === minute;
      if (isSelected) hasSelected = true;
      return _react2.default.createElement(_clockNumber2.default, {
        key: minute, isSelected: isSelected, type: 'minute',
        value: minute
      });
    });

    return {
      numbers: numbers,
      hasSelected: hasSelected,
      selected: selectedMinutes
    };
  },
  render: function render() {
    var styles = {
      root: {
        height: '100%',
        width: '100%',
        borderRadius: '100%',
        position: 'relative',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      },

      hitMask: {
        height: '100%',
        width: '100%',
        pointerEvents: 'auto'
      }
    };

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var minutes = this._getMinuteNumbers();

    return _react2.default.createElement(
      'div',
      { ref: 'clock', style: prepareStyles(styles.root) },
      _react2.default.createElement(_clockPointer2.default, { value: minutes.selected, type: 'minute' }),
      minutes.numbers,
      _react2.default.createElement('div', { ref: 'mask', style: prepareStyles(styles.hitMask), hasSelected: minutes.hasSelected,
        onTouchMove: this.handleTouch, onTouchEnd: this.handleTouch,
        onMouseUp: this.handleUp, onMouseMove: this.handleMove
      })
    );
  }
});

exports.default = ClockMinutes;