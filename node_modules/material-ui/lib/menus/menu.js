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

var _reactAddonsUpdate = require('react-addons-update');

var _reactAddonsUpdate2 = _interopRequireDefault(_reactAddonsUpdate);

var _ClickAwayListener = require('../ClickAwayListener');

var _ClickAwayListener2 = _interopRequireDefault(_ClickAwayListener);

var _autoPrefix = require('../styles/auto-prefix');

var _autoPrefix2 = _interopRequireDefault(_autoPrefix);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _propTypes = require('../utils/prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _list = require('../lists/list');

var _list2 = _interopRequireDefault(_list);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _deprecatedPropType = require('../utils/deprecatedPropType');

var _deprecatedPropType2 = _interopRequireDefault(_deprecatedPropType);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var Menu = _react2.default.createClass({
  displayName: 'Menu',


  propTypes: {
    /**
     * If true, the menu will apply transitions when added it
     * gets added to the DOM. In order for transitions to
     * work, wrap the menu inside a ReactTransitionGroup.
     */
    animated: (0, _deprecatedPropType2.default)(_react2.default.PropTypes.bool, 'Instead, use a [Popover](/#/components/popover).'),

    /**
     * If true, the width will automatically be
     * set according to the items inside the menu
     * using the proper keyline increment.
     */
    autoWidth: _react2.default.PropTypes.bool,

    /**
     * Children for the Menu. Usually MenuItems.
     */
    children: _react2.default.PropTypes.node,

    /**
     * Indicates if the menu should render with compact desktop styles.
     */
    desktop: _react2.default.PropTypes.bool,

    /**
     * Disable the auto focus feature.
     */
    disableAutoFocus: _react2.default.PropTypes.bool,

    /**
     * True if this item should be focused by the keyboard initially.
     */
    initiallyKeyboardFocused: _react2.default.PropTypes.bool,

    /**
     * The style object to use to override underlying list style.
     */
    listStyle: _react2.default.PropTypes.object,

    /**
     * The maxHeight of the menu in pixels. If
     * specified, the menu will scroll if larger than the maxHeight.
     */
    maxHeight: _react2.default.PropTypes.number,

    /**
     * If true, the value can be an array and allow the menu to be a multi-select.
     */
    multiple: _react2.default.PropTypes.bool,

    /**
     * Fired when a menu item is touchTapped and the menu item
     * value is not equal to the current menu value.
     */
    onChange: _react2.default.PropTypes.func,

    /**
     * Fired when an Esc key is keyed down.
     */
    onEscKeyDown: _react2.default.PropTypes.func,

    /**
     * Fired when a menu item is touchTapped.
     */
    onItemTouchTap: _react2.default.PropTypes.func,

    /**
     * Fired when a key is pressed.
     */
    onKeyDown: _react2.default.PropTypes.func,

    /**
     * This is the placement of the menu relative to the IconButton.
     */
    openDirection: _propTypes2.default.corners,

    /**
     * Style for the selected Menu Item.
     */
    selectedMenuItemStyle: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The value of the selected menu item. If passed in,
     * this will make the menu a controlled component.
     * This component also supports valueLink.
     */
    value: _react2.default.PropTypes.any,

    /**
     * ValueLink for this component when controlled.
     */
    valueLink: _react2.default.PropTypes.object,

    /**
     * Sets the width of the menu. If not specified, the menu
     * width will be dictated by its children. The rendered
     * width will always be a keyline increment
     * (64px for desktop, 56px otherwise).
     */
    width: _propTypes2.default.stringOrNumber,

    /**
     * @ignore
     * Menu no longer supports `zDepth`. Instead, wrap it in `Paper`
     * or another component that provides zDepth.
     */
    zDepth: _propTypes2.default.zDepth
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      autoWidth: true,
      desktop: false,
      disableAutoFocus: false,
      initiallyKeyboardFocused: false,
      maxHeight: null,
      multiple: false,
      onChange: function onChange() {},
      onEscKeyDown: function onEscKeyDown() {},
      onItemTouchTap: function onItemTouchTap() {},
      onKeyDown: function onKeyDown() {},
      openDirection: 'bottom-left'
    };
  },
  getInitialState: function getInitialState() {
    var filteredChildren = this._getFilteredChildren(this.props.children);
    var selectedIndex = this._getSelectedIndex(this.props, filteredChildren);

    return {
      focusIndex: this.props.disableAutoFocus ? -1 : selectedIndex >= 0 ? selectedIndex : 0,
      isKeyboardFocused: this.props.initiallyKeyboardFocused,
      keyWidth: this.props.desktop ? 64 : 56,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    if (this.props.autoWidth) this._setWidth();
    if (!this.props.animated) this._animateOpen();
    this._setScollPosition();
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var filteredChildren = this._getFilteredChildren(nextProps.children);
    var selectedIndex = this._getSelectedIndex(nextProps, filteredChildren);

    this.setState({
      focusIndex: nextProps.disableAutoFocus ? -1 : selectedIndex >= 0 ? selectedIndex : 0,
      keyWidth: nextProps.desktop ? 64 : 56,
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    if (this.props.autoWidth) this._setWidth();
  },
  componentClickAway: function componentClickAway(event) {
    if (event.defaultPrevented) {
      return;
    }

    this._setFocusIndex(-1, false);
  },


  // Do not use outside of this component, it will be removed once valueLink is deprecated
  getValueLink: function getValueLink(props) {
    return props.valueLink || {
      value: props.value,
      requestChange: props.onChange
    };
  },
  setKeyboardFocused: function setKeyboardFocused(keyboardFocused) {
    this.setState({
      isKeyboardFocused: keyboardFocused
    });
  },
  _getFilteredChildren: function _getFilteredChildren(children) {
    var filteredChildren = [];
    _react2.default.Children.forEach(children, function (child) {
      if (child) {
        filteredChildren.push(child);
      }
    });
    return filteredChildren;
  },
  _animateOpen: function _animateOpen() {
    var rootStyle = _reactDom2.default.findDOMNode(this).style;
    var scrollContainerStyle = _reactDom2.default.findDOMNode(this.refs.scrollContainer).style;
    var menuContainers = _reactDom2.default.findDOMNode(this.refs.list).childNodes;

    _autoPrefix2.default.set(rootStyle, 'transform', 'scaleX(1)', this.state.muiTheme);
    _autoPrefix2.default.set(scrollContainerStyle, 'transform', 'scaleY(1)', this.state.muiTheme);
    scrollContainerStyle.opacity = 1;

    for (var i = 0; i < menuContainers.length; ++i) {
      menuContainers[i].style.opacity = 1;
    }
  },
  _cloneMenuItem: function _cloneMenuItem(child, childIndex, styles) {
    var _this = this;

    var _props = this.props;
    var desktop = _props.desktop;
    var selectedMenuItemStyle = _props.selectedMenuItemStyle;


    var selected = this._isChildSelected(child, this.props);
    var selectedChildrenStyles = {};

    if (selected) {
      selectedChildrenStyles = (0, _simpleAssign2.default)(styles.selectedMenuItem, selectedMenuItemStyle);
    }

    var mergedChildrenStyles = (0, _simpleAssign2.default)({}, child.props.style, selectedChildrenStyles);

    var isFocused = childIndex === this.state.focusIndex;
    var focusState = 'none';
    if (isFocused) {
      focusState = this.state.isKeyboardFocused ? 'keyboard-focused' : 'focused';
    }

    return _react2.default.cloneElement(child, {
      desktop: desktop,
      focusState: focusState,
      onTouchTap: function onTouchTap(event) {
        _this._handleMenuItemTouchTap(event, child);
        if (child.props.onTouchTap) child.props.onTouchTap(event);
      },
      ref: isFocused ? 'focusedMenuItem' : null,
      style: mergedChildrenStyles
    });
  },
  _decrementKeyboardFocusIndex: function _decrementKeyboardFocusIndex() {
    var index = this.state.focusIndex;

    index--;
    if (index < 0) index = 0;

    this._setFocusIndex(index, true);
  },
  _getCascadeChildrenCount: function _getCascadeChildrenCount(filteredChildren) {
    var _props2 = this.props;
    var desktop = _props2.desktop;
    var maxHeight = _props2.maxHeight;

    var count = 1;
    var currentHeight = desktop ? 16 : 8;
    var menuItemHeight = desktop ? 32 : 48;

    //MaxHeight isn't set - cascade all of the children
    if (!maxHeight) return filteredChildren.length;

    //Count all the children that will fit inside the
    //max menu height
    filteredChildren.forEach(function (child) {
      if (currentHeight < maxHeight) {
        var childIsADivider = child.type && child.type.displayName === 'Divider';

        currentHeight += childIsADivider ? 16 : menuItemHeight;
        count++;
      }
    });

    return count;
  },
  _getMenuItemCount: function _getMenuItemCount(filteredChildren) {
    var menuItemCount = 0;
    filteredChildren.forEach(function (child) {
      var childIsADivider = child.type && child.type.displayName === 'Divider';
      var childIsDisabled = child.props.disabled;
      if (!childIsADivider && !childIsDisabled) menuItemCount++;
    });
    return menuItemCount;
  },
  _getSelectedIndex: function _getSelectedIndex(props, filteredChildren) {
    var _this2 = this;

    var selectedIndex = -1;
    var menuItemIndex = 0;

    filteredChildren.forEach(function (child) {
      var childIsADivider = child.type && child.type.displayName === 'Divider';

      if (_this2._isChildSelected(child, props)) selectedIndex = menuItemIndex;
      if (!childIsADivider) menuItemIndex++;
    });

    return selectedIndex;
  },
  _handleKeyDown: function _handleKeyDown(event) {
    var filteredChildren = this._getFilteredChildren(this.props.children);
    switch ((0, _keycode2.default)(event)) {
      case 'down':
        event.preventDefault();
        this._incrementKeyboardFocusIndex(filteredChildren);
        break;
      case 'esc':
        this.props.onEscKeyDown(event);
        break;
      case 'tab':
        event.preventDefault();
        if (event.shiftKey) {
          this._decrementKeyboardFocusIndex();
        } else {
          this._incrementKeyboardFocusIndex(filteredChildren);
        }
        break;
      case 'up':
        event.preventDefault();
        this._decrementKeyboardFocusIndex();
        break;
    }
    this.props.onKeyDown(event);
  },
  _handleMenuItemTouchTap: function _handleMenuItemTouchTap(event, item) {
    var children = this.props.children;
    var multiple = this.props.multiple;
    var valueLink = this.getValueLink(this.props);
    var menuValue = valueLink.value;
    var itemValue = item.props.value;
    var focusIndex = _react2.default.isValidElement(children) ? 0 : children.indexOf(item);

    this._setFocusIndex(focusIndex, false);

    if (multiple) {
      var index = menuValue.indexOf(itemValue);
      var newMenuValue = index === -1 ? (0, _reactAddonsUpdate2.default)(menuValue, { $push: [itemValue] }) : (0, _reactAddonsUpdate2.default)(menuValue, { $splice: [[index, 1]] });

      valueLink.requestChange(event, newMenuValue);
    } else if (!multiple && itemValue !== menuValue) {
      valueLink.requestChange(event, itemValue);
    }

    this.props.onItemTouchTap(event, item);
  },
  _incrementKeyboardFocusIndex: function _incrementKeyboardFocusIndex(filteredChildren) {
    var index = this.state.focusIndex;
    var maxIndex = this._getMenuItemCount(filteredChildren) - 1;

    index++;
    if (index > maxIndex) index = maxIndex;

    this._setFocusIndex(index, true);
  },
  _isChildSelected: function _isChildSelected(child, props) {
    var menuValue = this.getValueLink(props).value;
    var childValue = child.props.value;

    if (props.multiple) {
      return menuValue.length && menuValue.indexOf(childValue) !== -1;
    } else {
      return child.props.hasOwnProperty('value') && menuValue === childValue;
    }
  },
  _setFocusIndex: function _setFocusIndex(newIndex, isKeyboardFocused) {
    this.setState({
      focusIndex: newIndex,
      isKeyboardFocused: isKeyboardFocused
    });
  },
  _setScollPosition: function _setScollPosition() {
    var desktop = this.props.desktop;
    var focusedMenuItem = this.refs.focusedMenuItem;
    var menuItemHeight = desktop ? 32 : 48;

    if (focusedMenuItem) {
      var selectedOffSet = _reactDom2.default.findDOMNode(focusedMenuItem).offsetTop;

      //Make the focused item be the 2nd item in the list the
      //user sees
      var scrollTop = selectedOffSet - menuItemHeight;
      if (scrollTop < menuItemHeight) scrollTop = 0;

      _reactDom2.default.findDOMNode(this.refs.scrollContainer).scrollTop = scrollTop;
    }
  },
  _setWidth: function _setWidth() {
    var el = _reactDom2.default.findDOMNode(this);
    var listEl = _reactDom2.default.findDOMNode(this.refs.list);
    var elWidth = el.offsetWidth;
    var keyWidth = this.state.keyWidth;
    var minWidth = keyWidth * 1.5;
    var keyIncrements = elWidth / keyWidth;
    var newWidth = void 0;

    keyIncrements = keyIncrements <= 1.5 ? 1.5 : Math.ceil(keyIncrements);
    newWidth = keyIncrements * keyWidth;

    if (newWidth < minWidth) newWidth = minWidth;

    el.style.width = newWidth + 'px';
    listEl.style.width = newWidth + 'px';
  },
  render: function render() {
    var _this3 = this;

    var _props3 = this.props;
    var animated = _props3.animated;
    var autoWidth = _props3.autoWidth;
    var children = _props3.children;
    var desktop = _props3.desktop;
    var initiallyKeyboardFocused = _props3.initiallyKeyboardFocused;
    var listStyle = _props3.listStyle;
    var maxHeight = _props3.maxHeight;
    var multiple = _props3.multiple;
    var openDirection = _props3.openDirection;
    var selectedMenuItemStyle = _props3.selectedMenuItemStyle;
    var style = _props3.style;
    var value = _props3.value;
    var valueLink = _props3.valueLink;
    var width = _props3.width;
    var zDepth = _props3.zDepth;

    var other = _objectWithoutProperties(_props3, ['animated', 'autoWidth', 'children', 'desktop', 'initiallyKeyboardFocused', 'listStyle', 'maxHeight', 'multiple', 'openDirection', 'selectedMenuItemStyle', 'style', 'value', 'valueLink', 'width', 'zDepth']);

    process.env.NODE_ENV !== "production" ? (0, _warning2.default)(typeof zDepth === 'undefined', 'Menu no longer supports `zDepth`. Instead, wrap it in `Paper` ' + 'or another component that provides `zDepth`.') : void 0;

    var _state = this.state;
    var focusIndex = _state.focusIndex;
    var muiTheme = _state.muiTheme;
    var prepareStyles = muiTheme.prepareStyles;


    var openDown = openDirection.split('-')[0] === 'bottom';
    var openLeft = openDirection.split('-')[1] === 'left';

    var rawTheme = muiTheme.rawTheme;

    var styles = {
      root: {
        //Nested div bacause the List scales x faster than
        //it scales y
        transition: animated ? _transitions2.default.easeOut('250ms', 'transform') : null,
        zIndex: muiTheme.zIndex.menu,
        top: openDown ? 0 : null,
        bottom: !openDown ? 0 : null,
        left: !openLeft ? 0 : null,
        right: openLeft ? 0 : null,
        transform: animated ? 'scaleX(0)' : null,
        transformOrigin: openLeft ? 'right' : 'left',
        opacity: 0,
        maxHeight: maxHeight,
        overflowY: maxHeight ? 'auto' : null
      },

      divider: {
        marginTop: 7,
        marginBottom: 8
      },

      list: {
        display: 'table-cell',
        paddingBottom: desktop ? 16 : 8,
        paddingTop: desktop ? 16 : 8,
        userSelect: 'none',
        width: width
      },

      menuItemContainer: {
        transition: animated ? _transitions2.default.easeOut(null, 'opacity') : null,
        opacity: 0
      },

      selectedMenuItem: {
        color: rawTheme.palette.accent1Color
      }
    };

    var mergedRootStyles = (0, _simpleAssign2.default)(styles.root, style);
    var mergedListStyles = (0, _simpleAssign2.default)(styles.list, listStyle);

    var filteredChildren = this._getFilteredChildren(children);

    //Cascade children opacity
    var cumulativeDelay = openDown ? 175 : 325;
    var cascadeChildrenCount = this._getCascadeChildrenCount(filteredChildren);
    var cumulativeDelayIncrement = Math.ceil(150 / cascadeChildrenCount);

    var menuItemIndex = 0;
    var newChildren = _react2.default.Children.map(filteredChildren, function (child) {
      var childIsADivider = child.type && child.type.displayName === 'Divider';
      var childIsDisabled = child.props.disabled;
      var childrenContainerStyles = {};

      if (animated) {
        var transitionDelay = 0;

        //Only cascade the visible menu items
        if (menuItemIndex >= focusIndex - 1 && menuItemIndex <= focusIndex + cascadeChildrenCount - 1) {
          cumulativeDelay = openDown ? cumulativeDelay + cumulativeDelayIncrement : cumulativeDelay - cumulativeDelayIncrement;
          transitionDelay = cumulativeDelay;
        }

        childrenContainerStyles = (0, _simpleAssign2.default)({}, styles.menuItemContainer, {
          transitionDelay: transitionDelay + 'ms'
        });
      }

      var clonedChild = childIsADivider ? _react2.default.cloneElement(child, { style: styles.divider }) : childIsDisabled ? _react2.default.cloneElement(child, { desktop: desktop }) : _this3._cloneMenuItem(child, menuItemIndex, styles);

      if (!childIsADivider && !childIsDisabled) menuItemIndex++;

      return animated ? _react2.default.createElement(
        'div',
        { style: prepareStyles(childrenContainerStyles) },
        clonedChild
      ) : clonedChild;
    });

    return _react2.default.createElement(
      _ClickAwayListener2.default,
      { onClickAway: this.componentClickAway },
      _react2.default.createElement(
        'div',
        { onKeyDown: this._handleKeyDown, style: prepareStyles(mergedRootStyles), ref: 'scrollContainer' },
        _react2.default.createElement(
          _list2.default,
          _extends({}, other, {
            ref: 'list',
            style: mergedListStyles
          }),
          newChildren
        )
      )
    );
  }
});

exports.default = Menu;