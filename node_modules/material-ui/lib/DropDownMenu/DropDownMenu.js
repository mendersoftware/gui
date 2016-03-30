'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _arrowDropDown = require('../svg-icons/navigation/arrow-drop-down');

var _arrowDropDown2 = _interopRequireDefault(_arrowDropDown);

var _menu = require('../menus/menu');

var _menu2 = _interopRequireDefault(_menu);

var _clearfix = require('../clearfix');

var _clearfix2 = _interopRequireDefault(_clearfix);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _popover = require('../popover/popover');

var _popover2 = _interopRequireDefault(_popover);

var _popoverAnimationFromTop = require('../popover/popover-animation-from-top');

var _popoverAnimationFromTop2 = _interopRequireDefault(_popoverAnimationFromTop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var anchorOrigin = {
  vertical: 'top',
  horizontal: 'left'
};

var DropDownMenu = _react2.default.createClass({
  displayName: 'DropDownMenu',


  // The nested styles for drop-down-menu are modified by toolbar and possibly
  // other user components, so it will give full access to its js styles rather
  // than just the parent.
  propTypes: {
    /**
     * The width will automatically be set according to the items inside the menu.
     * To control this width in css instead, set this prop to false.
     */
    autoWidth: _react2.default.PropTypes.bool,

    /**
     * The `MenuItem`s to populate the `Menu` with. If the `MenuItems` have the
     * prop `label` that value will be used to render the representation of that
     * item within the field.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * Disables the menu.
     */
    disabled: _react2.default.PropTypes.bool,

    /**
     * Overrides the styles of icon element.
     */
    iconStyle: _react2.default.PropTypes.object,

    /**
     * Overrides the styles of label when the `DropDownMenu` is inactive.
     */
    labelStyle: _react2.default.PropTypes.object,

    /**
     * The style object to use to override underlying list style.
     */
    listStyle: _react2.default.PropTypes.object,

    /**
     * The maximum height of the `Menu` when it is displayed.
     */
    maxHeight: _react2.default.PropTypes.number,

    /**
     * Overrides the styles of `Menu` when the `DropDownMenu` is displayed.
     */
    menuStyle: _react2.default.PropTypes.object,

    /**
     * Callback function fired when a menu item is clicked, other than the one currently selected.
     *
     * @param {object} event TouchTap event targeting the menu item that was clicked.
     * @param {number} key The index of the clicked menu item in the `children` collection.
     * @param {any} payload The `value` prop of the clicked menu item.
     */
    onChange: _react2.default.PropTypes.func,

    /**
     * Set to true to have the `DropDownMenu` automatically open on mount.
     */
    openImmediately: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * Overrides the inline-styles of the underline.
     */
    underlineStyle: _react2.default.PropTypes.object,

    /**
     * The value that is currently selected.
     */
    value: _react2.default.PropTypes.any
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
      autoWidth: true,
      disabled: false,
      openImmediately: false,
      maxHeight: 500
    };
  },
  getInitialState: function getInitialState() {
    return {
      open: false,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    if (this.props.autoWidth) this._setWidth();
    if (this.props.openImmediately) {
      /*eslint-disable react/no-did-mount-set-state */
      // Temorary fix to make openImmediately work with popover.
      setTimeout(function () {
        return _this.setState({ open: true, anchorEl: _this.refs.root });
      });
      /*eslint-enable react/no-did-mount-set-state */
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({ muiTheme: newMuiTheme });

    if (this.props.autoWidth) {
      this._setWidth();
    }
  },
  getStyles: function getStyles() {
    var disabled = this.props.disabled;

    var spacing = this.state.muiTheme.rawTheme.spacing;
    var palette = this.state.muiTheme.rawTheme.palette;
    var accentColor = this.state.muiTheme.dropDownMenu.accentColor;
    return {
      control: {
        cursor: disabled ? 'not-allowed' : 'pointer',
        height: '100%',
        position: 'relative',
        width: '100%'
      },
      icon: {
        fill: accentColor,
        position: 'absolute',
        right: spacing.desktopGutterLess,
        top: (spacing.desktopToolbarHeight - 24) / 2
      },
      label: {
        color: disabled ? palette.disabledColor : palette.textColor,
        lineHeight: spacing.desktopToolbarHeight + 'px',
        opacity: 1,
        position: 'relative',
        paddingLeft: spacing.desktopGutter,
        paddingRight: spacing.iconSize + spacing.desktopGutterLess + spacing.desktopGutterMini,
        top: 0
      },
      labelWhenOpen: {
        opacity: 0,
        top: spacing.desktopToolbarHeight / 8
      },
      rootWhenOpen: {
        opacity: 1
      },
      root: {
        display: 'inline-block',
        fontSize: spacing.desktopDropDownMenuFontSize,
        height: spacing.desktopSubheaderHeight,
        fontFamily: this.state.muiTheme.rawTheme.fontFamily,
        outline: 'none',
        position: 'relative',
        transition: _transitions2.default.easeOut()
      },
      underline: {
        borderTop: 'solid 1px ' + accentColor,
        bottom: 1,
        left: 0,
        margin: '-1px ' + spacing.desktopGutter + 'px',
        right: 0,
        position: 'absolute'
      }
    };
  },


  /**
   * This method is deprecated but still here because the TextField
   * need it in order to work. That will be addressed later.
   */
  getInputNode: function getInputNode() {
    var _this2 = this;

    var root = this.refs.root;

    root.focus = function () {
      if (!_this2.props.disabled) {
        _this2.setState({
          open: !_this2.state.open,
          anchorEl: _this2.refs.root
        });
      }
    };

    return root;
  },
  _setWidth: function _setWidth() {
    var el = this.refs.root;
    if (!this.props.style || !this.props.style.hasOwnProperty('width')) {
      el.style.width = 'auto';
    }
  },
  handleTouchTapControl: function handleTouchTapControl(event) {
    event.preventDefault();
    if (!this.props.disabled) {
      this.setState({
        open: !this.state.open,
        anchorEl: this.refs.root
      });
    }
  },
  _onMenuItemTouchTap: function _onMenuItemTouchTap(key, payload, event) {
    this.props.onChange(event, key, payload);

    this.setState({
      open: false
    });
  },
  handleRequestCloseMenu: function handleRequestCloseMenu() {
    this.setState({
      open: false,
      anchorEl: null
    });
  },
  render: function render() {
    var _this3 = this;

    var _props = this.props;
    var autoWidth = _props.autoWidth;
    var children = _props.children;
    var className = _props.className;
    var iconStyle = _props.iconStyle;
    var labelStyle = _props.labelStyle;
    var listStyle = _props.listStyle;
    var maxHeight = _props.maxHeight;
    var menuStyle = _props.menuStyle;
    var style = _props.style;
    var underlineStyle = _props.underlineStyle;
    var value = _props.value;

    var other = _objectWithoutProperties(_props, ['autoWidth', 'children', 'className', 'iconStyle', 'labelStyle', 'listStyle', 'maxHeight', 'menuStyle', 'style', 'underlineStyle', 'value']);

    var _state = this.state;
    var anchorEl = _state.anchorEl;
    var open = _state.open;
    var muiTheme = _state.muiTheme;
    var prepareStyles = muiTheme.prepareStyles;


    var styles = this.getStyles();

    var displayValue = '';
    _react2.default.Children.forEach(children, function (child) {
      if (value === child.props.value) {
        // This will need to be improved (in case primaryText is a node)
        displayValue = child.props.label || child.props.primaryText;
      }
    });

    var menuItemElements = _react2.default.Children.map(children, function (child, index) {
      return _react2.default.cloneElement(child, {
        onTouchTap: _this3._onMenuItemTouchTap.bind(_this3, index, child.props.value)
      });
    });

    var popoverStyle = void 0;
    if (anchorEl && !autoWidth) {
      popoverStyle = { width: anchorEl.clientWidth };
    }

    return _react2.default.createElement(
      'div',
      _extends({}, other, {
        ref: 'root',
        className: className,
        style: prepareStyles((0, _simpleAssign2.default)({}, styles.root, open && styles.rootWhenOpen, style))
      }),
      _react2.default.createElement(
        _clearfix2.default,
        { style: styles.control, onTouchTap: this.handleTouchTapControl },
        _react2.default.createElement(
          'div',
          {
            style: prepareStyles((0, _simpleAssign2.default)({}, styles.label, open && styles.labelWhenOpen, labelStyle))
          },
          displayValue
        ),
        _react2.default.createElement(_arrowDropDown2.default, { style: (0, _simpleAssign2.default)({}, styles.icon, iconStyle) }),
        _react2.default.createElement('div', { style: prepareStyles((0, _simpleAssign2.default)({}, styles.underline, underlineStyle)) })
      ),
      _react2.default.createElement(
        _popover2.default,
        {
          anchorOrigin: anchorOrigin,
          anchorEl: anchorEl,
          style: popoverStyle,
          animation: _popoverAnimationFromTop2.default,
          open: open,
          onRequestClose: this.handleRequestCloseMenu
        },
        _react2.default.createElement(
          _menu2.default,
          {
            maxHeight: maxHeight,
            desktop: true,
            value: value,
            style: menuStyle,
            listStyle: listStyle
          },
          menuItemElements
        )
      )
    );
  }
});

exports.default = DropDownMenu;