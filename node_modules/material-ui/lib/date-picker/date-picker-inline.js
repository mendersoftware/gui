'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _popover = require('../popover/popover');

var _popover2 = _interopRequireDefault(_popover);

var _popoverAnimationFromTop = require('../popover/popover-animation-from-top');

var _popoverAnimationFromTop2 = _interopRequireDefault(_popoverAnimationFromTop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = {
  actions: {
    marginRight: 8,
    paddingBottom: 12,
    textAlign: 'right'
  }
};

var DatePickerInline = function (_React$Component) {
  _inherits(DatePickerInline, _React$Component);

  function DatePickerInline() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, DatePickerInline);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(DatePickerInline)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
      anchorEl: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(DatePickerInline, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.open) {
        this.setState({
          anchorEl: this.refs.root
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var actions = _props.actions;
      var children = _props.children;
      var style = _props.style;
      var onRequestClose = _props.onRequestClose;
      var open = _props.open;

      var other = _objectWithoutProperties(_props, ['actions', 'children', 'style', 'onRequestClose', 'open']);

      var anchorEl = this.state.anchorEl;


      return _react2.default.createElement(
        'div',
        _extends({}, other, { ref: 'root', style: style }),
        _react2.default.createElement(
          _popover2.default,
          {
            onRequestClose: onRequestClose,
            open: open,
            anchorEl: anchorEl,
            animation: _popoverAnimationFromTop2.default
          },
          children,
          _react2.default.createElement(
            'div',
            { style: styles.actions },
            actions
          )
        )
      );
    }
  }]);

  return DatePickerInline;
}(_react2.default.Component);

DatePickerInline.propTypes = {
  actions: _react2.default.PropTypes.node,
  children: _react2.default.PropTypes.node,
  onRequestClose: _react2.default.PropTypes.func.isRequired,
  open: _react2.default.PropTypes.bool.isRequired,

  /**
   * Override the inline-styles of the root element.
   */
  style: _react2.default.PropTypes.object
};
DatePickerInline.defaultProps = {
  open: false
};
exports.default = DatePickerInline;