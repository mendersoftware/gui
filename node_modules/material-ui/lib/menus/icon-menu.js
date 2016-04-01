'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _events = require('../utils/events');

var _events2 = _interopRequireDefault(_events);

var _propTypes = require('../utils/prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _menu = require('../menus/menu');

var _menu2 = _interopRequireDefault(_menu);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _popover = require('../popover/popover');

var _popover2 = _interopRequireDefault(_popover);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var IconMenu = _react2.default.createClass({
  displayName: 'IconMenu',


  propTypes: {
    /**
     * This is the point on the icon where the menu
     * targetOrigin will attach.
     * Options:
     * vertical: [top, middle, bottom]
     * horizontal: [left, center, right].
     */
    anchorOrigin: _propTypes2.default.origin,

    /**
     * Should be used to pass `MenuItem` components.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * This is the IconButton to render. This button will open the menu.
     */
    iconButtonElement: _react2.default.PropTypes.element.isRequired,

    /**
     * The style object to use to override underlying icon style.
     */
    iconStyle: _react2.default.PropTypes.object,

    /**
     * The style object to use to override underlying menu style.
     */
    menuStyle: _react2.default.PropTypes.object,

    /**
     * If true, the value can an be array and allow the menu to be a multi-select.
     */
    multiple: _react2.default.PropTypes.bool,

    /**
     * Fired when a menu item is touchTapped.
     */
    onItemTouchTap: _react2.default.PropTypes.func,

    /**
     * Fired when keyobard focuses on element.
     */
    onKeyboardFocus: _react2.default.PropTypes.func,

    /**
     * Fired when mouse is pressed on element.
     */
    onMouseDown: _react2.default.PropTypes.func,

    /**
     * Fired when mouse enters the element.
     */
    onMouseEnter: _react2.default.PropTypes.func,

    /**
     * Fired when mouse leaves the element.
     */
    onMouseLeave: _react2.default.PropTypes.func,

    /**
     * Fired when mouse is lifted inside the element.
     */
    onMouseUp: _react2.default.PropTypes.func,

    /**
     * Callback function that is fired when the open state
     * of the menu is requested to be changed. The provided
     * open argument determines whether the menu is requested
     * to be opened or closed. Also, the reason argument states
     * why the menu got closed or opened. It can be 'keyboard',
     * 'iconTap' for open action and 'enter', 'escape', 'itemTap',
     * 'clickAway' for close action.
     */
    onRequestChange: _react2.default.PropTypes.func,

    /**
     * Fired when element is touch tapped.
     */
    onTouchTap: _react2.default.PropTypes.func,

    /**
     * Controls whether the IconMenu is opened or not.
     */
    open: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * This is the point on the menu which will stick to the menu
     * origin.
     * Options:
     * vertical: [top, middle, bottom]
     * horizontal: [left, center, right].
     */
    targetOrigin: _propTypes2.default.origin,

    /**
     * Sets the delay in milliseconds before closing the
     * menu when an item is clicked.
     * If set to 0 then the auto close functionality
     * will be disabled.
     */
    touchTapCloseDelay: _react2.default.PropTypes.number,

    /**
     * If true, the popover will render on top of an invisible
     * layer, which will prevent clicks to the underlying elements.
     */
    useLayerForClickAway: _react2.default.PropTypes.bool
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'left'
      },
      multiple: false,
      open: null,
      onItemTouchTap: function onItemTouchTap() {},
      onKeyboardFocus: function onKeyboardFocus() {},
      onMouseDown: function onMouseDown() {},
      onMouseLeave: function onMouseLeave() {},
      onMouseEnter: function onMouseEnter() {},
      onMouseUp: function onMouseUp() {},
      onTouchTap: function onTouchTap() {},
      onRequestChange: function onRequestChange() {},
      targetOrigin: {
        vertical: 'top',
        horizontal: 'left'
      },
      touchTapCloseDelay: 200,
      useLayerForClickAway: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)(),
      iconButtonRef: this.props.iconButtonElement.props.ref || 'iconButton',
      menuInitiallyKeyboardFocused: false,
      open: false
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

    if (nextProps.open != null) {
      this.setState({
        open: nextProps.open,
        anchorEl: this.refs.iconMenuContainer
      });
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.timerCloseId) {
      clearTimeout(this.timerCloseId);
    }
  },


  timerCloseId: undefined,

  isOpen: function isOpen() {
    return this.state.open;
  },
  close: function close(reason, isKeyboard) {
    var _this = this;

    if (!this.state.open) {
      return;
    }

    if (this.props.open !== null) {
      this.props.onRequestChange(false, reason);
    }

    this.setState({ open: false }, function () {
      //Set focus on the icon button when the menu close
      if (isKeyboard) {
        var iconButton = _this.refs[_this.state.iconButtonRef];
        _reactDom2.default.findDOMNode(iconButton).focus();
        iconButton.setKeyboardFocus();
      }
    });
  },
  open: function open(reason, event) {
    if (this.props.open !== null) {
      this.props.onRequestChange(true, reason);

      return this.setState({
        menuInitiallyKeyboardFocused: _events2.default.isKeyboard(event),
        anchorEl: event.currentTarget
      });
    }

    this.setState({
      open: true,
      menuInitiallyKeyboardFocused: _events2.default.isKeyboard(event),
      anchorEl: event.currentTarget
    });

    event.preventDefault();
  },
  _handleItemTouchTap: function _handleItemTouchTap(event, child) {
    var _this2 = this;

    if (this.props.touchTapCloseDelay !== 0 && !child.props.hasOwnProperty('menuItems')) {
      (function () {
        var isKeyboard = _events2.default.isKeyboard(event);
        _this2.timerCloseId = setTimeout(function () {
          _this2.close(isKeyboard ? 'enter' : 'itemTap', isKeyboard);
        }, _this2.props.touchTapCloseDelay);
      })();
    }

    this.props.onItemTouchTap(event, child);
  },
  _handleMenuEscKeyDown: function _handleMenuEscKeyDown(event) {
    this.close('escape', event);
  },
  render: function render() {
    var _this3 = this;

    var _props = this.props;
    var anchorOrigin = _props.anchorOrigin;
    var className = _props.className;
    var iconButtonElement = _props.iconButtonElement;
    var iconStyle = _props.iconStyle;
    var onItemTouchTap = _props.onItemTouchTap;
    var onKeyboardFocus = _props.onKeyboardFocus;
    var onMouseDown = _props.onMouseDown;
    var onMouseLeave = _props.onMouseLeave;
    var onMouseEnter = _props.onMouseEnter;
    var onMouseUp = _props.onMouseUp;
    var onTouchTap = _props.onTouchTap;
    var menuStyle = _props.menuStyle;
    var style = _props.style;
    var targetOrigin = _props.targetOrigin;
    var useLayerForClickAway = _props.useLayerForClickAway;

    var other = _objectWithoutProperties(_props, ['anchorOrigin', 'className', 'iconButtonElement', 'iconStyle', 'onItemTouchTap', 'onKeyboardFocus', 'onMouseDown', 'onMouseLeave', 'onMouseEnter', 'onMouseUp', 'onTouchTap', 'menuStyle', 'style', 'targetOrigin', 'useLayerForClickAway']);

    var prepareStyles = this.state.muiTheme.prepareStyles;
    var _state = this.state;
    var open = _state.open;
    var anchorEl = _state.anchorEl;


    var styles = {
      root: {
        display: 'inline-block',
        position: 'relative'
      },

      menu: {
        position: 'relative'
      }
    };

    var mergedRootStyles = (0, _simpleAssign2.default)(styles.root, style);
    var mergedMenuStyles = (0, _simpleAssign2.default)(styles.menu, menuStyle);

    var iconButton = _react2.default.cloneElement(iconButtonElement, {
      onKeyboardFocus: this.props.onKeyboardFocus,
      iconStyle: (0, _simpleAssign2.default)({}, iconStyle, iconButtonElement.props.iconStyle),
      onTouchTap: function onTouchTap(event) {
        _this3.open(_events2.default.isKeyboard(event) ? 'keyboard' : 'iconTap', event);
        if (iconButtonElement.props.onTouchTap) iconButtonElement.props.onTouchTap(event);
      },
      ref: this.state.iconButtonRef
    });

    var menu = _react2.default.createElement(
      _menu2.default,
      _extends({}, other, {
        animateOpen: true,
        initiallyKeyboardFocused: this.state.menuInitiallyKeyboardFocused,
        onEscKeyDown: this._handleMenuEscKeyDown,
        onItemTouchTap: this._handleItemTouchTap,
        style: mergedMenuStyles
      }),
      this.props.children
    );

    return _react2.default.createElement(
      'div',
      {
        ref: 'iconMenuContainer',
        className: className,
        onMouseDown: onMouseDown,
        onMouseLeave: onMouseLeave,
        onMouseEnter: onMouseEnter,
        onMouseUp: onMouseUp,
        onTouchTap: onTouchTap,
        style: prepareStyles(mergedRootStyles)
      },
      iconButton,
      _react2.default.createElement(
        _popover2.default,
        {
          anchorOrigin: anchorOrigin,
          targetOrigin: targetOrigin,
          open: open,
          anchorEl: anchorEl,
          childContextTypes: this.constructor.childContextTypes,
          useLayerForClickAway: useLayerForClickAway,
          onRequestClose: this.close,
          context: this.context
        },
        menu
      )
    );
  }
});

exports.default = IconMenu;