'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _reactAddonsPureRenderMixin2 = _interopRequireDefault(_reactAddonsPureRenderMixin);

var _reactAddonsTransitionGroup = require('react-addons-transition-group');

var _reactAddonsTransitionGroup2 = _interopRequireDefault(_reactAddonsTransitionGroup);

var _dom = require('../utils/dom');

var _dom2 = _interopRequireDefault(_dom);

var _circleRipple = require('./circle-ripple');

var _circleRipple2 = _interopRequireDefault(_circleRipple);

var _reactAddonsUpdate = require('react-addons-update');

var _reactAddonsUpdate2 = _interopRequireDefault(_reactAddonsUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function push(array, obj) {
  var newObj = Array.isArray(obj) ? obj : [obj];
  return (0, _reactAddonsUpdate2.default)(array, { $push: newObj });
}

function shift(array) {
  //Remove the first element in the array using React immutability helpers
  return (0, _reactAddonsUpdate2.default)(array, { $splice: [[0, 1]] });
}

var TouchRipple = _react2.default.createClass({
  displayName: 'TouchRipple',


  propTypes: {
    abortOnScroll: _react2.default.PropTypes.bool,
    centerRipple: _react2.default.PropTypes.bool,
    children: _react2.default.PropTypes.node,
    color: _react2.default.PropTypes.string,

    /**
     * @ignore
     * The material-ui theme applied to this component.
     */
    muiTheme: _react2.default.PropTypes.object.isRequired,

    opacity: _react2.default.PropTypes.number,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object
  },

  mixins: [_reactAddonsPureRenderMixin2.default],

  getDefaultProps: function getDefaultProps() {
    return {
      abortOnScroll: true
    };
  },
  getInitialState: function getInitialState() {
    //Touch start produces a mouse down event for compat reasons. To avoid
    //showing ripples twice we skip showing a ripple for the first mouse down
    //after a touch start. Note we don't store ignoreNextMouseDown in this.state
    //to avoid re-rendering when we change it
    this._ignoreNextMouseDown = false;

    return {
      //This prop allows us to only render the ReactTransitionGroup
      //on the first click of the component, making the inital
      //render faster
      hasRipples: false,
      nextKey: 0,
      ripples: []
    };
  },
  start: function start(event, isRippleTouchGenerated) {
    var theme = this.props.muiTheme.ripple;

    if (this._ignoreNextMouseDown && !isRippleTouchGenerated) {
      this._ignoreNextMouseDown = false;
      return;
    }

    var ripples = this.state.ripples;

    //Add a ripple to the ripples array
    ripples = push(ripples, _react2.default.createElement(_circleRipple2.default, {
      key: this.state.nextKey,
      muiTheme: this.props.muiTheme,
      style: !this.props.centerRipple ? this._getRippleStyle(event) : {},
      color: this.props.color || theme.color,
      opacity: this.props.opacity,
      touchGenerated: isRippleTouchGenerated
    }));

    this._ignoreNextMouseDown = isRippleTouchGenerated;
    this.setState({
      hasRipples: true,
      nextKey: this.state.nextKey + 1,
      ripples: ripples
    });
  },
  end: function end() {
    var currentRipples = this.state.ripples;
    this.setState({
      ripples: shift(currentRipples)
    });
    if (this.props.abortOnScroll) {
      this._stopListeningForScrollAbort();
    }
  },
  _handleMouseDown: function _handleMouseDown(event) {
    //only listen to left clicks
    if (event.button === 0) this.start(event, false);
  },
  _handleMouseUp: function _handleMouseUp() {
    this.end();
  },
  _handleMouseLeave: function _handleMouseLeave() {
    this.end();
  },
  _handleTouchStart: function _handleTouchStart(event) {
    event.stopPropagation();
    //If the user is swiping (not just tapping), save the position so we can
    //abort ripples if the user appears to be scrolling
    if (this.props.abortOnScroll && event.touches) {
      this._startListeningForScrollAbort(event);
      this._startTime = Date.now();
    }
    this.start(event, true);
  },
  _handleTouchEnd: function _handleTouchEnd() {
    this.end();
  },


  //Check if the user seems to be scrolling and abort the animation if so
  _handleTouchMove: function _handleTouchMove(event) {
    var _this = this;

    //Stop trying to abort if we're already 300ms into the animation
    var timeSinceStart = Math.abs(Date.now() - this._startTime);
    if (timeSinceStart > 300) {
      this._stopListeningForScrollAbort();
      return;
    }

    //If the user is scrolling...
    var deltaY = Math.abs(event.touches[0].clientY - this._firstTouchY);
    var deltaX = Math.abs(event.touches[0].clientX - this._firstTouchX);
    //Call it a scroll after an arbitrary 6px (feels reasonable in testing)
    if (deltaY > 6 || deltaX > 6) {
      var currentRipples = this.state.ripples;
      var ripple = currentRipples[0];
      //This clone will replace the ripple in ReactTransitionGroup with a
      //version that will disappear immediately when removed from the DOM
      var abortedRipple = _react2.default.cloneElement(ripple, { aborted: true });
      //Remove the old ripple and replace it with the new updated one
      currentRipples = shift(currentRipples);
      currentRipples = push(currentRipples, abortedRipple);
      this.setState({ ripples: currentRipples }, function () {
        //Call end after we've set the ripple to abort otherwise the setState
        //in end() merges with this and the ripple abort fails
        _this.end();
      });
    }
  },
  _startListeningForScrollAbort: function _startListeningForScrollAbort(event) {
    this._firstTouchY = event.touches[0].clientY;
    this._firstTouchX = event.touches[0].clientX;
    //Note that when scolling Chrome throttles this event to every 200ms
    //Also note we don't listen for scroll events directly as there's no general
    //way to cover cases like scrolling within containers on the page
    document.body.addEventListener('touchmove', this._handleTouchMove);
  },
  _stopListeningForScrollAbort: function _stopListeningForScrollAbort() {
    document.body.removeEventListener('touchmove', this._handleTouchMove);
  },
  _getRippleStyle: function _getRippleStyle(event) {
    var style = {};
    var el = _reactDom2.default.findDOMNode(this);
    var elHeight = el.offsetHeight;
    var elWidth = el.offsetWidth;
    var offset = _dom2.default.offset(el);
    var isTouchEvent = event.touches && event.touches.length;
    var pageX = isTouchEvent ? event.touches[0].pageX : event.pageX;
    var pageY = isTouchEvent ? event.touches[0].pageY : event.pageY;
    var pointerX = pageX - offset.left;
    var pointerY = pageY - offset.top;
    var topLeftDiag = this._calcDiag(pointerX, pointerY);
    var topRightDiag = this._calcDiag(elWidth - pointerX, pointerY);
    var botRightDiag = this._calcDiag(elWidth - pointerX, elHeight - pointerY);
    var botLeftDiag = this._calcDiag(pointerX, elHeight - pointerY);
    var rippleRadius = Math.max(topLeftDiag, topRightDiag, botRightDiag, botLeftDiag);
    var rippleSize = rippleRadius * 2;
    var left = pointerX - rippleRadius;
    var top = pointerY - rippleRadius;

    style.height = rippleSize + 'px';
    style.width = rippleSize + 'px';
    style.top = top + 'px';
    style.left = left + 'px';

    return style;
  },
  _calcDiag: function _calcDiag(a, b) {
    return Math.sqrt(a * a + b * b);
  },
  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var prepareStyles = _props.muiTheme.prepareStyles;
    var style = _props.style;
    var _state = this.state;
    var hasRipples = _state.hasRipples;
    var ripples = _state.ripples;


    var rippleGroup = void 0;
    if (hasRipples) {
      var mergedStyles = (0, _simpleAssign2.default)({
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }, style);

      rippleGroup = _react2.default.createElement(
        _reactAddonsTransitionGroup2.default,
        { style: prepareStyles(mergedStyles) },
        ripples
      );
    }

    return _react2.default.createElement(
      'div',
      {
        onMouseUp: this._handleMouseUp,
        onMouseDown: this._handleMouseDown,
        onMouseLeave: this._handleMouseLeave,
        onTouchStart: this._handleTouchStart,
        onTouchEnd: this._handleTouchEnd
      },
      rippleGroup,
      children
    );
  }
});

exports.default = TouchRipple;