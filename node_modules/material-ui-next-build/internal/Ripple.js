'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleSheet = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _jssThemeReactor = require('jss-theme-reactor');

var _customPropTypes = require('../utils/customPropTypes');

var _customPropTypes2 = _interopRequireDefault(_customPropTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styleSheet = exports.styleSheet = (0, _jssThemeReactor.createStyleSheet)('MuiRipple', function (theme) {
  return {
    root: {
      opacity: 1
    },
    rootLeaving: {
      opacity: 0,
      animation: 'mui-ripple-exit 550ms ' + theme.transitions.easing.easeInOut
    },
    rootPulsating: {
      position: 'absolute',
      left: 0,
      top: 0,
      display: 'block',
      width: '100%',
      height: '100%',
      animation: 'mui-ripple-pulsate 1500ms ' + theme.transitions.easing.easeInOut + ' 200ms infinite',
      rippleVisible: {
        opacity: 0.2
      }
    },
    '@keyframes mui-ripple-enter': {
      '0%': {
        transform: 'scale(0)'
      },
      '100%': {
        transform: 'scale(1)'
      }
    },
    '@keyframes mui-ripple-exit': {
      '0%': {
        opacity: 1
      },
      '100%': {
        opacity: 0
      }
    },
    '@keyframes mui-ripple-pulsate': {
      '0%': {
        transform: 'scale(1)'
      },
      '50%': {
        transform: 'scale(0.9)'
      },
      '100%': {
        transform: 'scale(1)'
      }
    },
    ripple: {
      width: 50,
      height: 50,
      left: 0,
      top: 0,
      opacity: 0,
      position: 'absolute',
      borderRadius: '50%',
      background: 'currentColor'
    },
    rippleVisible: {
      opacity: 0.3,
      transform: 'scale(1)',
      animation: 'mui-ripple-enter 550ms ' + theme.transitions.easing.easeInOut
    },
    rippleFast: {
      animationDuration: '200ms'
    }
  };
});

/**
 * @ignore - internal component.
 */
//  weak

var Ripple = function (_Component) {
  (0, _inherits3.default)(Ripple, _Component);

  function Ripple() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Ripple);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Ripple.__proto__ || (0, _getPrototypeOf2.default)(Ripple)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      rippleVisible: false
    }, _this.ripple = null, _this.leaveTimer = null, _this.start = function (callback) {
      _this.setState({
        rippleVisible: true
      }, callback);
    }, _this.stop = function (callback) {
      _this.setState({
        rippleLeaving: true
      }, callback);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Ripple, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearTimeout(this.leaveTimer);
    }
  }, {
    key: 'componentWillEnter',
    value: function componentWillEnter(callback) {
      this.start(callback);
    }
  }, {
    key: 'componentWillLeave',
    value: function componentWillLeave(callback) {
      var _this2 = this;

      this.stop(function () {
        _this2.leaveTimer = setTimeout(function () {
          callback();
        }, 550);
      });
    }
  }, {
    key: 'getRippleStyles',
    value: function getRippleStyles() {
      var _props = this.props,
          rippleSize = _props.rippleSize,
          rippleX = _props.rippleX,
          rippleY = _props.rippleY;


      return {
        width: rippleSize,
        height: rippleSize,
        top: -(rippleSize / 2) + rippleY,
        left: -(rippleSize / 2) + rippleX
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var _classNames, _classNames2;

      var _props2 = this.props,
          classNameProp = _props2.className,
          pulsate = _props2.pulsate;
      var _state = this.state,
          rippleVisible = _state.rippleVisible,
          rippleLeaving = _state.rippleLeaving;

      var classes = this.context.styleManager.render(styleSheet);

      var className = (0, _classnames2.default)(classes.root, (_classNames = {}, (0, _defineProperty3.default)(_classNames, classes.rootLeaving, rippleLeaving), (0, _defineProperty3.default)(_classNames, classes.rootPulsating, pulsate), _classNames), classNameProp);

      var rippleClassName = (0, _classnames2.default)(classes.ripple, (_classNames2 = {}, (0, _defineProperty3.default)(_classNames2, classes.rippleVisible, rippleVisible), (0, _defineProperty3.default)(_classNames2, classes.rippleFast, pulsate), _classNames2));

      var rippleStyles = this.getRippleStyles();

      return _react2.default.createElement(
        'span',
        { className: className },
        _react2.default.createElement('span', { className: rippleClassName, style: rippleStyles })
      );
    }
  }]);
  return Ripple;
}(_react.Component);

Ripple.defaultProps = {
  pulsate: false
};


Ripple.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * @ignore
   */
  className: _propTypes2.default.string,
  /**
   * If `true`, the ripple pulsates, typically indicating the keyboard focus state of an element.
   */
  pulsate: _propTypes2.default.bool,
  /**
   * Diameter of the ripple.
   */
  rippleSize: _propTypes2.default.number.isRequired,
  /**
   * Horizontal position of the ripple center.
   */
  rippleX: _propTypes2.default.number.isRequired,
  /**
   * Vertical position of the ripple center.
   */
  rippleY: _propTypes2.default.number.isRequired
} : {};

Ripple.contextTypes = {
  styleManager: _customPropTypes2.default.muiRequired
};

exports.default = Ripple;