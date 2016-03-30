'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var firstChild = props.firstChild;
  var lastChild = props.lastChild;
  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var button = _state$muiTheme.button;
  var toolbar = _state$muiTheme.toolbar;


  var marginHorizontal = baseTheme.spacing.desktopGutter;
  var marginVertical = (toolbar.height - button.height) / 2;

  var styles = {
    root: {
      position: 'relative',
      marginLeft: firstChild ? -marginHorizontal : undefined,
      marginRight: lastChild ? -marginHorizontal : undefined,
      display: 'flex',
      justifyContent: 'space-between'
    },
    dropDownMenu: {
      root: {
        color: toolbar.color, // removes hover color change, we want to keep it
        marginRight: baseTheme.spacing.desktopGutter,
        flex: 1,
        whiteSpace: 'nowrap'
      },
      controlBg: {
        backgroundColor: toolbar.menuHoverColor,
        borderRadius: 0
      },
      underline: {
        display: 'none'
      }
    },
    button: {
      margin: marginVertical + 'px ' + marginHorizontal + 'px',
      position: 'relative'
    },
    icon: {
      root: {
        cursor: 'pointer',
        color: toolbar.iconColor,
        lineHeight: toolbar.height + 'px',
        paddingLeft: baseTheme.spacing.desktopGutter
      },
      hover: {
        color: toolbar.hoverColor
      }
    },
    span: {
      color: toolbar.iconColor,
      lineHeight: toolbar.height + 'px'
    }
  };

  return styles;
}

var ToolbarGroup = _react2.default.createClass({
  displayName: 'ToolbarGroup',

  propTypes: {
    /**
     * Can be any node or number of nodes.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * Set this to true for if the `ToolbarGroup` is the first child of `Toolbar`
     * to prevent setting the left gap.
     */
    firstChild: _react2.default.PropTypes.bool,

    /**
     * Determines the side the `ToolbarGroup` will snap to. Either 'left' or 'right'.
     */
    float: _react2.default.PropTypes.oneOf(['left', 'right']),

    /**
     * Set this to true for if the `ToolbarGroup` is the last child of `Toolbar`
     * to prevent setting the right gap.
     */
    lastChild: _react2.default.PropTypes.bool,

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
      firstChild: false,
      lastChild: false
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


  _handleMouseEnterFontIcon: function _handleMouseEnterFontIcon(style) {
    return function (event) {
      event.target.style.zIndex = style.hover.zIndex;
      event.target.style.color = style.hover.color;
    };
  },

  _handleMouseLeaveFontIcon: function _handleMouseLeaveFontIcon(style) {
    return function (event) {
      event.target.style.zIndex = 'auto';
      event.target.style.color = style.root.color;
    };
  },

  render: function render() {
    var _this = this;

    var _props = this.props;
    var children = _props.children;
    var className = _props.className;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['children', 'className', 'style']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var newChildren = _react2.default.Children.map(children, function (currentChild) {
      if (!currentChild) {
        return null;
      }
      if (!currentChild.type) {
        return currentChild;
      }
      switch (currentChild.type.displayName) {
        case 'DropDownMenu':
          return _react2.default.cloneElement(currentChild, {
            style: (0, _simpleAssign2.default)({}, styles.dropDownMenu.root, currentChild.props.style),
            styleControlBg: styles.dropDownMenu.controlBg,
            styleUnderline: styles.dropDownMenu.underline
          });
        case 'RaisedButton':
        case 'FlatButton':
          return _react2.default.cloneElement(currentChild, {
            style: (0, _simpleAssign2.default)({}, styles.button, currentChild.props.style)
          });
        case 'FontIcon':
          return _react2.default.cloneElement(currentChild, {
            style: (0, _simpleAssign2.default)({}, styles.icon.root, currentChild.props.style),
            onMouseEnter: _this._handleMouseEnterFontIcon(styles.icon),
            onMouseLeave: _this._handleMouseLeaveFontIcon(styles.icon)
          });
        case 'ToolbarSeparator':
        case 'ToolbarTitle':
          return _react2.default.cloneElement(currentChild, {
            style: (0, _simpleAssign2.default)({}, styles.span, currentChild.props.style)
          });
        default:
          return currentChild;
      }
    }, this);

    return _react2.default.createElement(
      'div',
      _extends({}, other, { className: className, style: prepareStyles((0, _simpleAssign2.default)({}, styles.root, style)) }),
      newChildren
    );
  }
});

exports.default = ToolbarGroup;