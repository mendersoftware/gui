'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var backgroundColor = props.backgroundColor;
  var color = props.color;
  var size = props.size;
  var src = props.src;
  var avatar = state.muiTheme.avatar;


  var styles = {
    root: {
      color: color || avatar.color,
      backgroundColor: backgroundColor || avatar.backgroundColor,
      userSelect: 'none',
      display: 'inline-block',
      textAlign: 'center',
      lineHeight: size + 'px',
      fontSize: size / 2 + 4,
      borderRadius: '50%',
      height: size,
      width: size
    },
    icon: {
      color: color || avatar.color,
      margin: 8
    }
  };

  if (src && avatar.borderColor) {
    (0, _simpleAssign2.default)(styles.root, {
      border: 'solid 1px ' + avatar.borderColor,
      height: size - 2,
      width: size - 2
    });
  }

  return styles;
}

var Avatar = _react2.default.createClass({
  displayName: 'Avatar',


  propTypes: {
    /**
     * The backgroundColor of the avatar. Does not apply to image avatars.
     */
    backgroundColor: _react2.default.PropTypes.string,

    /**
     * Can be used, for instance, to render a letter inside the avatar.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root `div` or `img` element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * The icon or letter's color.
     */
    color: _react2.default.PropTypes.string,

    /**
     * This is the SvgIcon or FontIcon to be used inside the avatar.
     */
    icon: _react2.default.PropTypes.element,

    /**
     * This is the size of the avatar in pixels.
     */
    size: _react2.default.PropTypes.number,

    /**
     * If passed in, this component will render an img element. Otherwise, a div will be rendered.
     */
    src: _react2.default.PropTypes.string,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      size: 40
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
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  render: function render() {
    var _props = this.props;
    var icon = _props.icon;
    var src = _props.src;
    var style = _props.style;
    var className = _props.className;

    var other = _objectWithoutProperties(_props, ['icon', 'src', 'style', 'className']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    if (src) {
      return _react2.default.createElement('img', _extends({}, other, {
        src: src,
        style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)),
        className: className
      }));
    } else {
      return _react2.default.createElement(
        'div',
        _extends({}, other, {
          style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)),
          className: className
        }),
        icon && _react2.default.cloneElement(icon, {
          color: styles.icon.color,
          style: (0, _simpleAssign2.default)(styles.icon, icon.props.style)
        }),
        this.props.children
      );
    }
  }
});

exports.default = Avatar;