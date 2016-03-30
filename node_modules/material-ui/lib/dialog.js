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

var _reactEventListener = require('react-event-listener');

var _reactEventListener2 = _interopRequireDefault(_reactEventListener);

var _keycode = require('keycode');

var _keycode2 = _interopRequireDefault(_keycode);

var _transitions = require('./styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _overlay = require('./overlay');

var _overlay2 = _interopRequireDefault(_overlay);

var _renderToLayer = require('./render-to-layer');

var _renderToLayer2 = _interopRequireDefault(_renderToLayer);

var _paper = require('./paper');

var _paper2 = _interopRequireDefault(_paper);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _reactAddonsTransitionGroup = require('react-addons-transition-group');

var _reactAddonsTransitionGroup2 = _interopRequireDefault(_reactAddonsTransitionGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var TransitionItem = _react2.default.createClass({
  displayName: 'TransitionItem',


  propTypes: {
    children: _react2.default.PropTypes.node,
    style: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getInitialState: function getInitialState() {
    return {
      style: {},
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
  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this.enterTimeout);
    clearTimeout(this.leaveTimeout);
  },
  componentWillEnter: function componentWillEnter(callback) {
    this.componentWillAppear(callback);
  },
  componentWillAppear: function componentWillAppear(callback) {
    var spacing = this.state.muiTheme.baseTheme.spacing;

    this.setState({
      style: {
        opacity: 1,
        transform: 'translate3d(0, ' + spacing.desktopKeylineIncrement + 'px, 0)'
      }
    });

    this.enterTimeout = setTimeout(callback, 450); // matches transition duration
  },
  componentWillLeave: function componentWillLeave(callback) {
    this.setState({
      style: {
        opacity: 0,
        transform: 'translate3d(0, 0, 0)'
      }
    });

    this.leaveTimeout = setTimeout(callback, 450); // matches transition duration
  },
  render: function render() {
    var _props = this.props;
    var style = _props.style;
    var children = _props.children;

    var other = _objectWithoutProperties(_props, ['style', 'children']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    return _react2.default.createElement(
      'div',
      _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)({}, this.state.style, style)) }),
      children
    );
  }
});

function getStyles(props, state) {
  var autoScrollBodyContent = props.autoScrollBodyContent;
  var open = props.open;
  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var zIndex = _state$muiTheme.zIndex;


  var gutter = baseTheme.spacing.desktopGutter;

  return {
    root: {
      position: 'fixed',
      boxSizing: 'border-box',
      WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove mobile color flashing (deprecated)
      zIndex: zIndex.dialog,
      top: 0,
      left: open ? 0 : -10000,
      width: '100%',
      height: '100%',
      transition: open ? _transitions2.default.easeOut('0ms', 'left', '0ms') : _transitions2.default.easeOut('0ms', 'left', '450ms')
    },
    content: {
      boxSizing: 'border-box',
      WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove mobile color flashing (deprecated)
      transition: _transitions2.default.easeOut(),
      position: 'relative',
      width: '75%',
      maxWidth: baseTheme.spacing.desktopKeylineIncrement * 12,
      margin: '0 auto',
      zIndex: zIndex.dialog
    },
    body: {
      padding: baseTheme.spacing.desktopGutter,
      overflowY: autoScrollBodyContent ? 'auto' : 'hidden'
    },
    actionsContainer: {
      boxSizing: 'border-box',
      WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove mobile color flashing (deprecated)
      padding: 8,
      marginBottom: 8,
      width: '100%',
      textAlign: 'right'
    },
    overlay: {
      zIndex: zIndex.dialogOverlay
    },
    title: {
      margin: 0,
      padding: gutter + 'px ' + gutter + 'px 0 ' + gutter + 'px',
      color: baseTheme.palette.textColor,
      fontSize: 24,
      lineHeight: '32px',
      fontWeight: 400
    }
  };
}

var DialogInline = _react2.default.createClass({
  displayName: 'DialogInline',


  propTypes: {
    actions: _react2.default.PropTypes.node,
    actionsContainerClassName: _react2.default.PropTypes.string,
    actionsContainerStyle: _react2.default.PropTypes.object,
    autoDetectWindowHeight: _react2.default.PropTypes.bool,
    autoScrollBodyContent: _react2.default.PropTypes.bool,
    bodyClassName: _react2.default.PropTypes.string,
    bodyStyle: _react2.default.PropTypes.object,
    children: _react2.default.PropTypes.node,
    className: _react2.default.PropTypes.string,
    contentClassName: _react2.default.PropTypes.string,
    contentStyle: _react2.default.PropTypes.object,
    modal: _react2.default.PropTypes.bool,
    onRequestClose: _react2.default.PropTypes.func,
    open: _react2.default.PropTypes.bool.isRequired,
    overlayClassName: _react2.default.PropTypes.string,
    overlayStyle: _react2.default.PropTypes.object,
    repositionOnUpdate: _react2.default.PropTypes.bool,
    style: _react2.default.PropTypes.object,
    title: _react2.default.PropTypes.node,
    titleClassName: _react2.default.PropTypes.string,
    titleStyle: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
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
    this._positionDialog();
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    this._positionDialog();
  },
  _positionDialog: function _positionDialog() {
    var _props2 = this.props;
    var actions = _props2.actions;
    var autoDetectWindowHeight = _props2.autoDetectWindowHeight;
    var autoScrollBodyContent = _props2.autoScrollBodyContent;
    var bodyStyle = _props2.bodyStyle;
    var open = _props2.open;
    var repositionOnUpdate = _props2.repositionOnUpdate;
    var title = _props2.title;


    if (!open) {
      return;
    }

    var clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var container = _reactDom2.default.findDOMNode(this);
    var dialogWindow = _reactDom2.default.findDOMNode(this.refs.dialogWindow);
    var dialogContent = _reactDom2.default.findDOMNode(this.refs.dialogContent);
    var minPaddingTop = 16;

    //Reset the height in case the window was resized.
    dialogWindow.style.height = '';
    dialogContent.style.height = '';

    var dialogWindowHeight = dialogWindow.offsetHeight;
    var paddingTop = (clientHeight - dialogWindowHeight) / 2 - 64;
    if (paddingTop < minPaddingTop) paddingTop = minPaddingTop;

    //Vertically center the dialog window, but make sure it doesn't
    //transition to that position.
    if (repositionOnUpdate || !container.style.paddingTop) {
      container.style.paddingTop = paddingTop + 'px';
    }

    // Force a height if the dialog is taller than clientHeight
    if (autoDetectWindowHeight || autoScrollBodyContent) {
      var styles = getStyles(this.props, this.state);
      styles.body = (0, _simpleAssign2.default)(styles.body, bodyStyle);
      var maxDialogContentHeight = clientHeight - 2 * (styles.body.padding + 64);

      if (title) maxDialogContentHeight -= dialogContent.previousSibling.offsetHeight;

      if (_react2.default.Children.count(actions)) {
        maxDialogContentHeight -= dialogContent.nextSibling.offsetHeight;
      }

      dialogContent.style.maxHeight = maxDialogContentHeight + 'px';
    }
  },
  _requestClose: function _requestClose(buttonClicked) {
    if (!buttonClicked && this.props.modal) {
      return;
    }

    if (this.props.onRequestClose) {
      this.props.onRequestClose(!!buttonClicked);
    }
  },
  _handleOverlayTouchTap: function _handleOverlayTouchTap() {
    this._requestClose(false);
  },
  _handleWindowKeyUp: function _handleWindowKeyUp(event) {
    if ((0, _keycode2.default)(event) === 'esc') {
      this._requestClose(false);
    }
  },
  _handleResize: function _handleResize() {
    if (this.props.open) {
      this._positionDialog();
    }
  },
  render: function render() {
    var _props3 = this.props;
    var actions = _props3.actions;
    var actionsContainerClassName = _props3.actionsContainerClassName;
    var actionsContainerStyle = _props3.actionsContainerStyle;
    var bodyClassName = _props3.bodyClassName;
    var bodyStyle = _props3.bodyStyle;
    var children = _props3.children;
    var className = _props3.className;
    var contentClassName = _props3.contentClassName;
    var contentStyle = _props3.contentStyle;
    var overlayClassName = _props3.overlayClassName;
    var overlayStyle = _props3.overlayStyle;
    var open = _props3.open;
    var titleClassName = _props3.titleClassName;
    var titleStyle = _props3.titleStyle;
    var title = _props3.title;
    var style = _props3.style;
    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    styles.root = (0, _simpleAssign2.default)(styles.root, style);
    styles.content = (0, _simpleAssign2.default)(styles.content, contentStyle);
    styles.body = (0, _simpleAssign2.default)(styles.body, bodyStyle);
    styles.actionsContainer = (0, _simpleAssign2.default)(styles.actionsContainer, actionsContainerStyle);
    styles.overlay = (0, _simpleAssign2.default)(styles.overlay, overlayStyle);
    styles.title = (0, _simpleAssign2.default)(styles.title, titleStyle);

    var actionsContainer = _react2.default.Children.count(actions) > 0 && _react2.default.createElement(
      'div',
      { className: actionsContainerClassName, style: prepareStyles(styles.actionsContainer) },
      _react2.default.Children.toArray(actions)
    );

    var titleElement = typeof title === 'string' ? _react2.default.createElement(
      'h3',
      { className: titleClassName, style: prepareStyles(styles.title) },
      title
    ) : title;

    return _react2.default.createElement(
      'div',
      { className: className, style: prepareStyles(styles.root) },
      _react2.default.createElement(_reactEventListener2.default, {
        elementName: 'window',
        onKeyUp: this._handleWindowKeyUp,
        onResize: this._handleResize
      }),
      _react2.default.createElement(
        _reactAddonsTransitionGroup2.default,
        {
          component: 'div', ref: 'dialogWindow',
          transitionAppear: true, transitionAppearTimeout: 450,
          transitionEnter: true, transitionEnterTimeout: 450
        },
        open && _react2.default.createElement(
          TransitionItem,
          {
            className: contentClassName,
            style: styles.content
          },
          _react2.default.createElement(
            _paper2.default,
            {
              zDepth: 4
            },
            titleElement,
            _react2.default.createElement(
              'div',
              {
                ref: 'dialogContent',
                className: bodyClassName,
                style: prepareStyles(styles.body)
              },
              children
            ),
            actionsContainer
          )
        )
      ),
      _react2.default.createElement(_overlay2.default, {
        show: open,
        className: overlayClassName,
        style: styles.overlay,
        onTouchTap: this._handleOverlayTouchTap
      })
    );
  }
});

var Dialog = _react2.default.createClass({
  displayName: 'Dialog',


  propTypes: {
    /**
     * Action buttons to display below the Dialog content (`children`).
     * This property accepts either a React element, or an array of React elements.
     */
    actions: _react2.default.PropTypes.node,

    /**
     * The `className` to add to the actions container's root element.
     */
    actionsContainerClassName: _react2.default.PropTypes.string,

    /**
     * Overrides the inline-styles of the actions container's root element.
     */
    actionsContainerStyle: _react2.default.PropTypes.object,

    /**
     * If set to true, the height of the `Dialog` will be auto detected. A max height
     * will be enforced so that the content does not extend beyond the viewport.
     */
    autoDetectWindowHeight: _react2.default.PropTypes.bool,

    /**
     * If set to true, the body content of the `Dialog` will be scrollable.
     */
    autoScrollBodyContent: _react2.default.PropTypes.bool,

    /**
     * The `className` to add to the content's root element under the title.
     */
    bodyClassName: _react2.default.PropTypes.string,

    /**
     * Overrides the inline-styles of the content's root element under the title.
     */
    bodyStyle: _react2.default.PropTypes.object,

    /**
     * The contents of the `Dialog`.
     */
    children: _react2.default.PropTypes.node,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * The `className` to add to the content container.
     */
    contentClassName: _react2.default.PropTypes.string,

    /**
     * Overrides the inline-styles of the content container.
     */
    contentStyle: _react2.default.PropTypes.object,

    /**
     * Force the user to use one of the actions in the `Dialog`.
     * Clicking outside the `Dialog` will not trigger the `onRequestClose`.
     */
    modal: _react2.default.PropTypes.bool,

    /**
     * Fired when the `Dialog` is requested to be closed by a click outside the `Dialog` or on the buttons.
     *
     * @param {bool} buttonClicked Determines whether a button click triggered this request.
     */
    onRequestClose: _react2.default.PropTypes.func,

    /**
     * Controls whether the Dialog is opened or not.
     */
    open: _react2.default.PropTypes.bool.isRequired,

    /**
     * The `className` to add to the `Overlay` component that is rendered behind the `Dialog`.
     */
    overlayClassName: _react2.default.PropTypes.string,

    /**
     * Overrides the inline-styles of the `Overlay` component that is rendered behind the `Dialog`.
     */
    overlayStyle: _react2.default.PropTypes.object,

    /**
     * Determines whether the `Dialog` should be repositioned when it's contents are updated.
     */
    repositionOnUpdate: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The title to display on the `Dialog`. Could be number, string, element or an array containing these types.
     */
    title: _react2.default.PropTypes.node,

    /**
     * The `className` to add to the title's root container element.
     */
    titleClassName: _react2.default.PropTypes.string,

    /**
     * Overrides the inline-styles of the title's root container element.
     */
    titleStyle: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      autoDetectWindowHeight: true,
      autoScrollBodyContent: false,
      modal: false,
      repositionOnUpdate: true
    };
  },
  renderLayer: function renderLayer() {
    return _react2.default.createElement(DialogInline, this.props);
  },
  render: function render() {
    return _react2.default.createElement(_renderToLayer2.default, { render: this.renderLayer, open: true, useLayerForClickAway: false });
  }
});

exports.default = Dialog;