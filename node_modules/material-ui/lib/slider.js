'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _transitions = require('./styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _focusRipple = require('./ripples/focus-ripple');

var _focusRipple2 = _interopRequireDefault(_focusRipple);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/**
  * Verifies min/max range.
  * @param   {Object} props         Properties of the React component.
  * @param   {String} propName      Name of the property to validate.
  * @param   {String} componentName Name of the component whose property is being validated.
  * @returns {Object} Returns an Error if min >= max otherwise null.
  */
var minMaxPropType = function minMaxPropType(props, propName, componentName) {
  var error = _react2.default.PropTypes.number(props, propName, componentName);
  if (error !== null) return error;

  if (props.min >= props.max) {
    var errorMsg = propName === 'min' ? 'min should be less than max' : 'max should be greater than min';
    return new Error(errorMsg);
  }
};

/**
  * Verifies value is within the min/max range.
  * @param   {Object} props         Properties of the React component.
  * @param   {String} propName      Name of the property to validate.
  * @param   {String} componentName Name of the component whose property is being validated.
  * @returns {Object} Returns an Error if the value is not within the range otherwise null.
  */
var valueInRangePropType = function valueInRangePropType(props, propName, componentName) {
  var error = _react2.default.PropTypes.number(props, propName, componentName);
  if (error !== null) return error;

  var value = props[propName];
  if (value < props.min || props.max < value) {
    return new Error(propName + ' should be within the range specified by min and max');
  }
};

var getStyles = function getStyles(props, state) {
  var slider = state.muiTheme.slider;


  var fillGutter = slider.handleSize / 2;
  var disabledGutter = slider.trackSize + slider.handleSizeDisabled / 2;
  var calcDisabledSpacing = props.disabled ? ' - ' + disabledGutter + 'px' : '';

  var styles = {
    root: {
      touchCallout: 'none',
      userSelect: 'none',
      cursor: 'default',
      height: slider.handleSizeActive,
      position: 'relative',
      marginTop: 24,
      marginBottom: 48
    },
    track: {
      position: 'absolute',
      top: (slider.handleSizeActive - slider.trackSize) / 2,
      left: 0,
      width: '100%',
      height: slider.trackSize
    },
    filledAndRemaining: {
      position: 'absolute',
      top: 0,
      height: '100%',
      transition: _transitions2.default.easeOut(null, 'margin')
    },
    handle: {
      boxSizing: 'border-box',
      position: 'absolute',
      cursor: 'pointer',
      pointerEvents: 'inherit',
      top: 0,
      left: state.percent === 0 ? '0%' : state.percent * 100 + '%',
      zIndex: 1,
      margin: slider.trackSize / 2 + 'px 0 0 0',
      width: slider.handleSize,
      height: slider.handleSize,
      backgroundColor: slider.selectionColor,
      backgroundClip: 'padding-box',
      border: '0px solid transparent',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      transition: _transitions2.default.easeOut('450ms', 'background') + ', ' + _transitions2.default.easeOut('450ms', 'border-color') + ', ' + _transitions2.default.easeOut('450ms', 'width') + ', ' + _transitions2.default.easeOut('450ms', 'height'),
      overflow: 'visible',
      outline: 'none'
    },
    handleWhenDisabled: {
      boxSizing: 'content-box',
      cursor: 'not-allowed',
      backgroundColor: slider.trackColor,
      width: slider.handleSizeDisabled,
      height: slider.handleSizeDisabled,
      border: 'none'
    },
    handleWhenPercentZero: {
      border: slider.trackSize + 'px solid ' + slider.handleColorZero,
      backgroundColor: slider.handleFillColor,
      boxShadow: 'none'
    },
    handleWhenPercentZeroAndDisabled: {
      cursor: 'not-allowed',
      width: slider.handleSizeDisabled,
      height: slider.handleSizeDisabled
    },
    handleWhenPercentZeroAndFocused: {
      border: slider.trackSize + 'px solid ' + slider.trackColorSelected
    },
    handleWhenActive: {
      width: slider.handleSizeActive,
      height: slider.handleSizeActive
    },
    ripple: {
      height: slider.handleSize,
      width: slider.handleSize,
      overflow: 'visible'
    },
    rippleWhenPercentZero: {
      top: -slider.trackSize,
      left: -slider.trackSize
    },
    rippleInner: {
      height: '300%',
      width: '300%',
      top: -slider.handleSize,
      left: -slider.handleSize
    },
    rippleColor: {
      fill: state.percent === 0 ? slider.handleColorZero : slider.rippleColor
    }
  };
  styles.filled = (0, _simpleAssign2.default)({}, styles.filledAndRemaining, {
    left: 0,
    backgroundColor: props.disabled ? slider.trackColor : slider.selectionColor,
    marginRight: fillGutter,
    width: 'calc(' + state.percent * 100 + '%' + calcDisabledSpacing + ')'
  });
  styles.remaining = (0, _simpleAssign2.default)({}, styles.filledAndRemaining, {
    right: 0,
    backgroundColor: (state.hovered || state.focused) && !props.disabled ? slider.trackColorSelected : slider.trackColor,
    marginLeft: fillGutter,
    width: 'calc(' + (1 - state.percent) * 100 + '%' + calcDisabledSpacing + ')'
  });

  return styles;
};

var Slider = _react2.default.createClass({
  displayName: 'Slider',


  propTypes: {
    /**
     * The default value of the slider.
     */
    defaultValue: valueInRangePropType,

    /**
     * Describe the slider.
     */
    description: _react2.default.PropTypes.string,

    /**
     * Disables focus ripple if set to true.
     */
    disableFocusRipple: _react2.default.PropTypes.bool,

    /**
     * If true, the slider will not be interactable.
     */
    disabled: _react2.default.PropTypes.bool,

    /**
     * An error message for the slider.
     */
    error: _react2.default.PropTypes.string,

    /**
     * The maximum value the slider can slide to on
     * a scale from 0 to 1 inclusive. Cannot be equal to min.
     */
    max: minMaxPropType,

    /**
     * The minimum value the slider can slide to on a scale
     * from 0 to 1 inclusive. Cannot be equal to max.
     */
    min: minMaxPropType,

    /**
     * The name of the slider. Behaves like the name attribute
     * of an input element.
     */
    name: _react2.default.PropTypes.string,

    /**
     * Callback function that is fired when the focus has left the slider.
     */
    onBlur: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the user changes the slider's value.
     */
    onChange: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the slider has begun to move.
     */
    onDragStart: _react2.default.PropTypes.func,

    /**
     * Callback function that is fried when the slide has stopped moving.
     */
    onDragStop: _react2.default.PropTypes.func,

    /**
     * Callback fired when the user has focused on the slider.
     */
    onFocus: _react2.default.PropTypes.func,

    /**
     * Whether or not the slider is required in a form.
     */
    required: _react2.default.PropTypes.bool,

    /**
     * The granularity the slider can step through values.
     */
    step: _react2.default.PropTypes.number,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The value of the slider.
     */
    value: valueInRangePropType
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  //for passing default theme context to children
  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      disabled: false,
      disableFocusRipple: false,
      max: 1,
      min: 0,
      required: true,
      step: 0.01,
      style: {}
    };
  },
  getInitialState: function getInitialState() {
    var value = this.props.value;
    if (value === undefined) {
      value = this.props.defaultValue !== undefined ? this.props.defaultValue : this.props.min;
    }
    var percent = (value - this.props.min) / (this.props.max - this.props.min);
    if (isNaN(percent)) percent = 0;

    return {
      active: false,
      dragging: false,
      focused: false,
      hovered: false,
      percent: percent,
      value: value,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({ muiTheme: newMuiTheme });

    if (nextProps.value !== undefined && !this.state.dragging) {
      this.setValue(nextProps.value);
    }
  },
  _onHandleTouchStart: function _onHandleTouchStart(event) {
    if (document) {
      document.addEventListener('touchmove', this._dragTouchHandler, false);
      document.addEventListener('touchup', this._dragTouchEndHandler, false);
      document.addEventListener('touchend', this._dragTouchEndHandler, false);
      document.addEventListener('touchcancel', this._dragTouchEndHandler, false);
    }
    this._onDragStart(event);

    // Cancel scroll and context menu
    event.preventDefault();
  },
  _onHandleMouseDown: function _onHandleMouseDown(event) {
    if (document) {
      document.addEventListener('mousemove', this._dragHandler, false);
      document.addEventListener('mouseup', this._dragEndHandler, false);

      // Cancel text selection
      event.preventDefault();

      // Set focus manually since we called preventDefault()
      this.refs.handle.focus();
    }
    this._onDragStart(event);
  },
  _onHandleKeyDown: function _onHandleKeyDown(event) {
    var _this = this;

    var _props = this.props;
    var min = _props.min;
    var max = _props.max;
    var step = _props.step;

    var action = void 0;

    switch ((0, _keycode2.default)(event)) {
      case 'page down':
      case 'left':
      case 'down':
        action = 'decrease';
        break;
      case 'page up':
      case 'right':
      case 'up':
        action = 'increase';
        break;
      case 'home':
        action = 'home';
        break;
      case 'end':
        action = 'end';
        break;
    }

    if (action) {
      var newValue = void 0;
      var newPercent = void 0;

      // Cancel scroll
      event.preventDefault();

      // When pressing home or end the handle should be taken to the
      // beginning or end of the track respectively
      switch (action) {
        case 'decrease':
          newValue = Math.max(min, this.state.value - step);
          newPercent = (newValue - min) / (max - min);
          break;
        case 'increase':
          newValue = Math.min(max, this.state.value + step);
          newPercent = (newValue - min) / (max - min);
          break;
        case 'home':
          newValue = min;
          newPercent = 0;
          break;
        case 'end':
          newValue = max;
          newPercent = 1;
          break;
      }

      // We need to use toFixed() because of float point errors.
      // For example, 0.01 + 0.06 = 0.06999999999999999
      if (this.state.value !== newValue) {
        this.setState({
          percent: newPercent,
          value: parseFloat(newValue.toFixed(5))
        }, function () {
          if (_this.props.onChange) _this.props.onChange(event, _this.state.value);
        });
      }
    }
  },
  _dragHandler: function _dragHandler(event) {
    var _this2 = this;

    if (this._dragRunning) {
      return;
    }
    this._dragRunning = true;
    requestAnimationFrame(function () {
      _this2._onDragUpdate(event, event.clientX - _this2._getTrackLeft());
      _this2._dragRunning = false;
    });
  },
  _dragTouchHandler: function _dragTouchHandler(event) {
    var _this3 = this;

    if (this._dragRunning) {
      return;
    }
    this._dragRunning = true;
    requestAnimationFrame(function () {
      _this3._onDragUpdate(event, event.touches[0].clientX - _this3._getTrackLeft());
      _this3._dragRunning = false;
    });
  },
  _dragEndHandler: function _dragEndHandler(event) {
    if (document) {
      document.removeEventListener('mousemove', this._dragHandler, false);
      document.removeEventListener('mouseup', this._dragEndHandler, false);
    }

    this._onDragStop(event);
  },
  _dragTouchEndHandler: function _dragTouchEndHandler(event) {
    if (document) {
      document.removeEventListener('touchmove', this._dragTouchHandler, false);
      document.removeEventListener('touchup', this._dragTouchEndHandler, false);
      document.removeEventListener('touchend', this._dragTouchEndHandler, false);
      document.removeEventListener('touchcancel', this._dragTouchEndHandler, false);
    }

    this._onDragStop(event);
  },
  getValue: function getValue() {
    return this.state.value;
  },
  setValue: function setValue(i) {
    // calculate percentage
    var percent = (i - this.props.min) / (this.props.max - this.props.min);
    if (isNaN(percent)) percent = 0;
    // update state
    this.setState({
      value: i,
      percent: percent
    });
  },
  getPercent: function getPercent() {
    return this.state.percent;
  },
  setPercent: function setPercent(percent, callback) {
    var value = this._alignValue(this._percentToValue(percent));
    var _props2 = this.props;
    var min = _props2.min;
    var max = _props2.max;

    var alignedPercent = (value - min) / (max - min);
    if (this.state.value !== value) {
      this.setState({ value: value, percent: alignedPercent }, callback);
    }
  },
  clearValue: function clearValue() {
    this.setValue(this.props.min);
  },
  _alignValue: function _alignValue(val) {
    var _props3 = this.props;
    var step = _props3.step;
    var min = _props3.min;

    var alignValue = Math.round((val - min) / step) * step + min;
    return parseFloat(alignValue.toFixed(5));
  },
  handleTouchStart: function handleTouchStart(event) {
    if (!this.props.disabled && !this.state.dragging) {
      var pos = event.touches[0].clientX - this._getTrackLeft();
      this._dragX(event, pos);

      // Since the touch event fired for the track and handle is child of
      // track, we need to manually propagate the event to the handle.
      this._onHandleTouchStart(event);
    }
  },
  handleFocus: function handleFocus(event) {
    this.setState({ focused: true });
    if (this.props.onFocus) this.props.onFocus(event);
  },
  handleBlur: function handleBlur(event) {
    this.setState({ focused: false, active: false });
    if (this.props.onBlur) this.props.onBlur(event);
  },
  handleMouseDown: function handleMouseDown(event) {
    if (!this.props.disabled && !this.state.dragging) {
      var pos = event.clientX - this._getTrackLeft();
      this._dragX(event, pos);

      // Since the click event fired for the track and handle is child of
      // track, we need to manually propagate the event to the handle.
      this._onHandleMouseDown(event);
    }
  },
  handleMouseUp: function handleMouseUp() {
    if (!this.props.disabled) this.setState({ active: false });
  },
  handleMouseEnter: function handleMouseEnter() {
    this.setState({ hovered: true });
  },
  handleMouseLeave: function handleMouseLeave() {
    this.setState({ hovered: false });
  },
  _getTrackLeft: function _getTrackLeft() {
    return this.refs.track.getBoundingClientRect().left;
  },
  _onDragStart: function _onDragStart(event) {
    this.setState({
      dragging: true,
      active: true
    });
    if (this.props.onDragStart) this.props.onDragStart(event);
  },
  _onDragStop: function _onDragStop(event) {
    this.setState({
      dragging: false,
      active: false
    });
    if (this.props.onDragStop) this.props.onDragStop(event);
  },
  _onDragUpdate: function _onDragUpdate(event, pos) {
    if (!this.state.dragging) return;
    if (!this.props.disabled) this._dragX(event, pos);
  },
  _dragX: function _dragX(event, pos) {
    var max = this.refs.track.clientWidth;
    if (pos < 0) pos = 0;else if (pos > max) pos = max;
    this._updateWithChangeEvent(event, pos / max);
  },
  _updateWithChangeEvent: function _updateWithChangeEvent(event, percent) {
    var _this4 = this;

    this.setPercent(percent, function () {
      if (_this4.props.onChange) _this4.props.onChange(event, _this4.state.value);
    });
  },
  _percentToValue: function _percentToValue(percent) {
    return percent * (this.props.max - this.props.min) + this.props.min;
  },
  render: function render() {
    var _props4 = this.props;
    var description = _props4.description;
    var disabled = _props4.disabled;
    var disableFocusRipple = _props4.disableFocusRipple;
    var error = _props4.error;
    var max = _props4.max;
    var min = _props4.min;
    var name = _props4.name;
    var required = _props4.required;
    var step = _props4.step;
    var style = _props4.style;

    var others = _objectWithoutProperties(_props4, ['description', 'disabled', 'disableFocusRipple', 'error', 'max', 'min', 'name', 'required', 'step', 'style']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var percent = this.state.percent;
    if (percent > 1) percent = 1;else if (percent < 0) percent = 0;

    var styles = getStyles(this.props, this.state);
    var sliderStyles = (0, _simpleAssign2.default)({}, styles.root, style);
    var handleStyles = percent === 0 ? (0, _simpleAssign2.default)({}, styles.handle, styles.handleWhenPercentZero, this.state.active && styles.handleWhenActive, (this.state.hovered || this.state.focused) && !disabled && styles.handleWhenPercentZeroAndFocused, disabled && styles.handleWhenPercentZeroAndDisabled) : (0, _simpleAssign2.default)({}, styles.handle, this.state.active && styles.handleWhenActive, disabled && styles.handleWhenDisabled);
    var rippleStyle = (0, _simpleAssign2.default)({}, styles.ripple, percent === 0 && styles.rippleWhenPercentZero);
    var rippleShowCondition = (this.state.hovered || this.state.focused) && !this.state.active;

    var focusRipple = void 0;
    if (!disabled && !disableFocusRipple) {
      focusRipple = _react2.default.createElement(_focusRipple2.default, {
        ref: 'focusRipple',
        key: 'focusRipple',
        style: rippleStyle,
        innerStyle: styles.rippleInner,
        show: rippleShowCondition,
        muiTheme: this.state.muiTheme,
        color: styles.rippleColor.fill
      });
    }

    var handleDragProps = void 0;
    if (!disabled) {
      handleDragProps = {
        onTouchStart: this._onHandleTouchStart,
        onMouseDown: this._onHandleMouseDown,
        onKeyDown: this._onHandleKeyDown
      };
    }

    return _react2.default.createElement(
      'div',
      _extends({}, others, { style: prepareStyles((0, _simpleAssign2.default)({}, style)) }),
      _react2.default.createElement(
        'span',
        null,
        description
      ),
      _react2.default.createElement(
        'span',
        null,
        error
      ),
      _react2.default.createElement(
        'div',
        {
          style: prepareStyles(sliderStyles),
          onFocus: this.handleFocus,
          onBlur: this.handleBlur,
          onMouseDown: this.handleMouseDown,
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
          onMouseUp: this.handleMouseUp,
          onTouchStart: this.handleTouchStart
        },
        _react2.default.createElement(
          'div',
          { ref: 'track', style: prepareStyles(styles.track) },
          _react2.default.createElement('div', { style: prepareStyles(styles.filled) }),
          _react2.default.createElement('div', { style: prepareStyles(styles.remaining) }),
          _react2.default.createElement(
            'div',
            _extends({
              ref: 'handle',
              style: prepareStyles(handleStyles),
              tabIndex: 0
            }, handleDragProps),
            focusRipple
          )
        )
      ),
      _react2.default.createElement('input', { ref: 'input', type: 'hidden',
        name: name,
        value: this.state.value,
        required: required,
        min: min,
        max: max,
        step: step
      })
    );
  }
});

exports.default = Slider;