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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getStyles(props, state) {
  var _titleBar;

  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var gridTile = _state$muiTheme.gridTile;


  var actionPos = props.actionIcon && props.actionPosition;

  var styles = {
    root: {
      position: 'relative',
      display: 'block',
      height: '100%',
      overflow: 'hidden'
    },
    titleBar: (_titleBar = {
      position: 'absolute',
      left: 0,
      right: 0
    }, _defineProperty(_titleBar, props.titlePosition, 0), _defineProperty(_titleBar, 'height', props.subtitle ? 68 : 48), _defineProperty(_titleBar, 'background', props.titleBackground), _defineProperty(_titleBar, 'display', 'flex'), _defineProperty(_titleBar, 'alignItems', 'center'), _titleBar),
    titleWrap: {
      flexGrow: 1,
      marginLeft: actionPos !== 'left' ? baseTheme.spacing.desktopGutterLess : 0,
      marginRight: actionPos === 'left' ? baseTheme.spacing.desktopGutterLess : 0,
      color: gridTile.textColor,
      overflow: 'hidden'
    },
    title: {
      fontSize: '16px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },
    subtitle: {
      fontSize: '12px',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },
    actionIcon: {
      order: actionPos === 'left' ? -1 : 1
    },
    childImg: {
      height: '100%',
      transform: 'translateX(-50%)',
      position: 'relative',
      left: '50%'
    }
  };
  return styles;
}

var GridTile = _react2.default.createClass({
  displayName: 'GridTile',


  propTypes: {
    /**
     * An IconButton element to be used as secondary action target
     * (primary action target is the tile itself).
     */
    actionIcon: _react2.default.PropTypes.element,

    /**
     * Position of secondary action IconButton.
     */
    actionPosition: _react2.default.PropTypes.oneOf(['left', 'right']),

    /**
     * Theoretically you can pass any node as children, but the main use case is to pass an img,
     * in whichcase GridTile takes care of making the image "cover" available space
     * (similar to background-size: cover or to object-fit:cover).
     */
    children: _react2.default.PropTypes.node,

    /**
     * Width of the tile in number of grid cells.
     */
    cols: _react2.default.PropTypes.number,

    /**
     * Either a string used as tag name for the tile root element, or a ReactComponent.
     * This is useful when you have, for example, a custom implementation of
     * a navigation link (that knowsabout your routes) and you want to use it as primary tile action.
     * In case you pass a ReactComponent, please make sure that it passes all props,
     * accepts styles overrides and render it's children.
     */
    rootClass: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]),

    /**
     * Height of the tile in number of grid cells.
     */
    rows: _react2.default.PropTypes.number,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * String or element serving as subtitle (support text).
     */
    subtitle: _react2.default.PropTypes.node,

    /**
     * Title to be displayed on tile.
     */
    title: _react2.default.PropTypes.node,

    /**
     * Style used for title bar background.
     * Useful for setting custom gradients for example
     */
    titleBackground: _react2.default.PropTypes.string,

    /**
     * Position of the title bar (container of title, subtitle and action icon).
     */
    titlePosition: _react2.default.PropTypes.oneOf(['top', 'bottom'])
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      titlePosition: 'bottom',
      titleBackground: 'rgba(0, 0, 0, 0.4)',
      actionPosition: 'right',
      cols: 1,
      rows: 1,
      rootClass: 'div'
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
  componentDidMount: function componentDidMount() {
    this._ensureImageCover();
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    this._ensureImageCover();
  },
  _ensureImageCover: function _ensureImageCover() {
    var imgEl = this.refs.img;

    if (imgEl) {
      (function () {
        var fit = function fit() {
          if (imgEl.offsetWidth < imgEl.parentNode.offsetWidth) {
            imgEl.style.height = 'auto';
            imgEl.style.left = '0';
            imgEl.style.width = '100%';
            imgEl.style.top = '50%';
            imgEl.style.transform = imgEl.style.WebkitTransform = 'translateY(-50%)';
          }
          imgEl.removeEventListener('load', fit);
          imgEl = null; // prevent closure memory leak
        };
        if (imgEl.complete) {
          fit();
        } else {
          imgEl.addEventListener('load', fit);
        }
      })();
    }
  },
  render: function render() {
    var _props = this.props;
    var title = _props.title;
    var subtitle = _props.subtitle;
    var titlePosition = _props.titlePosition;
    var titleBackground = _props.titleBackground;
    var actionIcon = _props.actionIcon;
    var actionPosition = _props.actionPosition;
    var style = _props.style;
    var children = _props.children;
    var rootClass = _props.rootClass;

    var other = _objectWithoutProperties(_props, ['title', 'subtitle', 'titlePosition', 'titleBackground', 'actionIcon', 'actionPosition', 'style', 'children', 'rootClass']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var mergedRootStyles = (0, _simpleAssign2.default)(styles.root, style);

    var titleBar = null;

    if (title) {
      titleBar = _react2.default.createElement(
        'div',
        { style: prepareStyles(styles.titleBar) },
        _react2.default.createElement(
          'div',
          { style: prepareStyles(styles.titleWrap) },
          _react2.default.createElement(
            'div',
            { style: prepareStyles(styles.title) },
            title
          ),
          subtitle ? _react2.default.createElement(
            'div',
            { style: prepareStyles(styles.subtitle) },
            subtitle
          ) : null
        ),
        actionIcon ? _react2.default.createElement(
          'div',
          { style: prepareStyles(styles.actionIcon) },
          actionIcon
        ) : null
      );
    }

    var newChildren = children;

    // if there is an image passed as children
    // clone it an put our styles
    if (_react2.default.Children.count(children) === 1) {
      newChildren = _react2.default.Children.map(children, function (child) {
        if (child.type === 'img') {
          return _react2.default.cloneElement(child, {
            ref: 'img',
            style: prepareStyles((0, _simpleAssign2.default)({}, styles.childImg, child.props.style))
          });
        } else {
          return child;
        }
      });
    }

    var RootTag = rootClass;
    return _react2.default.createElement(
      RootTag,
      _extends({ style: prepareStyles(mergedRootStyles) }, other),
      newChildren,
      titleBar
    );
  }
});

exports.default = GridTile;