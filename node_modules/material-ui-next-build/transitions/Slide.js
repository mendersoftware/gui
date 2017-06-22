'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = require('react-dom');

var _Transition = require('../internal/Transition');

var _Transition2 = _interopRequireDefault(_Transition);

var _customPropTypes = require('../utils/customPropTypes');

var _customPropTypes2 = _interopRequireDefault(_customPropTypes);

var _transitions = require('../styles/transitions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//  weak

var GUTTER = 24;

// Translate the element so he can't be seen in the screen.
// Later, we gonna translate back the element to his original location
// with `translate3d(0, 0, 0)`.`
function getTranslateValue(props, element) {
  var direction = props.direction;

  var rect = element.getBoundingClientRect();

  if (direction === 'left') {
    return 'translate3d(calc(100vw - ' + rect.left + 'px), 0, 0)';
  } else if (direction === 'right') {
    return 'translate3d(' + (0 - (rect.left + rect.width + GUTTER)) + 'px, 0, 0)';
  } else if (direction === 'up') {
    return 'translate3d(0, calc(100vh - ' + rect.top + 'px), 0)';
  }

  // direction === 'down
  return 'translate3d(0, ' + (0 - (rect.top + rect.height)) + 'px, 0)';
}

var Slide = function (_Component) {
  (0, _inherits3.default)(Slide, _Component);

  function Slide() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Slide);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Slide.__proto__ || (0, _getPrototypeOf2.default)(Slide)).call.apply(_ref, [this].concat(args))), _this), _this.transition = null, _this.handleEnter = function (element) {
      // Reset the transformation when needed.
      // That's triggering a reflow.
      if (element.style.transform) {
        element.style.transform = 'translate3d(0, 0, 0)';
        element.style.WebkitTransform = 'translate3d(0, 0, 0)';
      }
      var transform = getTranslateValue(_this.props, element);
      element.style.transform = transform;
      element.style.WebkitTransform = transform;

      if (_this.props.onEnter) {
        _this.props.onEnter(element);
      }
    }, _this.handleEntering = function (element) {
      var transitions = _this.context.styleManager.theme.transitions;

      element.style.transition = transitions.create('transform', {
        duration: _this.props.enterTransitionDuration,
        easing: transitions.easing.easeOut
      });
      element.style.WebkitTransition = transitions.create('-webkit-transform', {
        duration: _this.props.enterTransitionDuration,
        easing: transitions.easing.easeOut
      });
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.WebkitTransform = 'translate3d(0, 0, 0)';
      if (_this.props.onEntering) {
        _this.props.onEntering(element);
      }
    }, _this.handleExit = function (element) {
      var transitions = _this.context.styleManager.theme.transitions;

      element.style.transition = transitions.create('transform', {
        duration: _this.props.leaveTransitionDuration,
        easing: transitions.easing.sharp
      });
      element.style.WebkitTransition = transitions.create('-webkit-transform', {
        duration: _this.props.leaveTransitionDuration,
        easing: transitions.easing.sharp
      });
      var transform = getTranslateValue(_this.props, element);
      element.style.transform = transform;
      element.style.WebkitTransform = transform;

      if (_this.props.onExit) {
        _this.props.onExit(element);
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Slide, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (!this.props.in) {
        // We need to set initial translate values of transition element
        // otherwise component will be shown when in=false.
        var element = (0, _reactDom.findDOMNode)(this.transition);
        var transform = getTranslateValue(this.props, element);
        // $FlowFixMe
        element.style.transform = transform;
        // $FlowFixMe
        element.style.WebkitTransform = transform;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          children = _props.children,
          offset = _props.offset,
          onEnter = _props.onEnter,
          onEntering = _props.onEntering,
          onExit = _props.onExit,
          enterTransitionDuration = _props.enterTransitionDuration,
          leaveTransitionDuration = _props.leaveTransitionDuration,
          other = (0, _objectWithoutProperties3.default)(_props, ['children', 'offset', 'onEnter', 'onEntering', 'onExit', 'enterTransitionDuration', 'leaveTransitionDuration']);


      return _react2.default.createElement(
        _Transition2.default,
        (0, _extends3.default)({
          onEnter: this.handleEnter,
          onEntering: this.handleEntering,
          onExit: this.handleExit,
          timeout: Math.max(enterTransitionDuration, leaveTransitionDuration) + 10,
          transitionAppear: true
        }, other, {
          ref: function ref(_ref2) {
            _this2.transition = _ref2;
          }
        }),
        children
      );
    }
  }]);
  return Slide;
}(_react.Component);

Slide.defaultProps = {
  direction: 'down',
  enterTransitionDuration: _transitions.duration.enteringScreen,
  leaveTransitionDuration: _transitions.duration.leavingScreen
};


Slide.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * @ignore
   */
  children: _propTypes2.default.node,
  /**
   * @ignore
   */
  className: _propTypes2.default.string,
  /**
   * Direction the child element will enter from.
   */
  direction: _propTypes2.default.oneOf(['left', 'right', 'up', 'down']),
  /**
   * Duration of the animation when the element is entering.
   */
  enterTransitionDuration: _propTypes2.default.number,
  /**
   * If `true`, show the component; triggers the enter or exit animation.
   */
  in: _propTypes2.default.bool,
  /**
   * Duration of the animation when the element is exiting.
   */
  leaveTransitionDuration: _propTypes2.default.number,
  /**
   * Slide in by a fixed number of pixels or %.
   */
  offset: _propTypes2.default.string,
  /**
   * Callback fired before the component enters.
   */
  onEnter: _propTypes2.default.func,
  /**
   * Callback fired when the component is entering.
   */
  onEntering: _propTypes2.default.func,
  /**
   * Callback fired when the component has entered.
   */
  onEntered: _propTypes2.default.func, // eslint-disable-line react/sort-prop-types
  /**
   * Callback fired before the component exits.
   */
  onExit: _propTypes2.default.func,
  /**
   * Callback fired when the component is exiting.
   */
  onExiting: _propTypes2.default.func,
  /**
   * Callback fired when the component has exited.
   */
  onExited: _propTypes2.default.func // eslint-disable-line react/sort-prop-types
} : {};

Slide.contextTypes = {
  styleManager: _customPropTypes2.default.muiRequired
};

exports.default = Slide;