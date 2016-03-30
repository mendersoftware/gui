'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _transitions = require('./styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _ClickAwayListener = require('./ClickAwayListener');

var _ClickAwayListener2 = _interopRequireDefault(_ClickAwayListener);

var _flatButton = require('./flat-button');

var _flatButton2 = _interopRequireDefault(_flatButton);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _styleResizable = require('./mixins/style-resizable');

var _styleResizable2 = _interopRequireDefault(_styleResizable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props, state) {
  var _state$muiTheme = state.muiTheme;
  var baseTheme = _state$muiTheme.baseTheme;
  var snackbar = _state$muiTheme.snackbar;
  var zIndex = _state$muiTheme.zIndex;
  var open = state.open;
  var _baseTheme$spacing = baseTheme.spacing;
  var desktopGutter = _baseTheme$spacing.desktopGutter;
  var desktopSubheaderHeight = _baseTheme$spacing.desktopSubheaderHeight;


  var isSmall = state.deviceSize === _styleResizable2.default.statics.Sizes.SMALL;

  var styles = {
    root: {
      position: 'fixed',
      left: 0,
      display: 'flex',
      right: 0,
      bottom: 0,
      zIndex: zIndex.snackbar,
      visibility: open ? 'visible' : 'hidden',
      transform: open ? 'translate3d(0, 0, 0)' : 'translate3d(0, ' + desktopSubheaderHeight + 'px, 0)',
      transition: _transitions2.default.easeOut('400ms', 'transform') + ', ' + _transitions2.default.easeOut('400ms', 'visibility')
    },
    body: {
      backgroundColor: snackbar.backgroundColor,
      padding: '0 ' + desktopGutter + 'px',
      height: desktopSubheaderHeight,
      lineHeight: desktopSubheaderHeight + 'px',
      borderRadius: isSmall ? 0 : 2,
      maxWidth: isSmall ? 'inherit' : 568,
      minWidth: isSmall ? 'inherit' : 288,
      flexGrow: isSmall ? 1 : 0,
      margin: 'auto'
    },
    content: {
      fontSize: 14,
      color: snackbar.textColor,
      opacity: open ? 1 : 0,
      transition: open ? _transitions2.default.easeOut('500ms', 'opacity', '100ms') : _transitions2.default.easeOut('400ms', 'opacity')
    },
    action: {
      color: snackbar.actionColor,
      float: 'right',
      marginTop: 6,
      marginRight: -16,
      marginLeft: desktopGutter,
      backgroundColor: 'transparent'
    }
  };

  return styles;
}

var Snackbar = _react2.default.createClass({
  displayName: 'Snackbar',


  propTypes: {
    /**
     * The label for the action on the snackbar.
     */
    action: _react2.default.PropTypes.string,

    /**
     * The number of milliseconds to wait before automatically dismissing.
     * If no value is specified the snackbar will dismiss normally.
     * If a value is provided the snackbar can still be dismissed normally.
     * If a snackbar is dismissed before the timer expires, the timer will be cleared.
     */
    autoHideDuration: _react2.default.PropTypes.number,

    /**
     * Override the inline-styles of the body element.
     */
    bodyStyle: _react2.default.PropTypes.object,

    /**
     * The css class name of the root element.
     */
    className: _react2.default.PropTypes.string,

    /**
     * The message to be displayed.
     *
     * (Note: If the message is an element or array, and the `Snackbar` may re-render while it is still open,
     * ensure that the same object remains as the `message` property if you want to avoid the `Snackbar` hiding and
     * showing again)
     */
    message: _react2.default.PropTypes.node.isRequired,

    /**
     * Fired when the action button is touchtapped.
     *
     * @param {object} event Action button event.
     */
    onActionTouchTap: _react2.default.PropTypes.func,

    /**
     * Fired when the `Snackbar` is requested to be closed by a click outside the `Snackbar`, or after the
     * `autoHideDuration` timer expires.
     *
     * Typically `onRequestClose` is used to set state in the parent component, which is used to control the `Snackbar`
     * `open` prop.
     *
     * The `reason` parameter can optionally be used to control the response to `onRequestClose`,
     * for example ignoring `clickaway`.
     *
     * @param {string} reason Can be:`"timeout"` (`autoHideDuration` expired) or: `"clickaway"`
     */
    onRequestClose: _react2.default.PropTypes.func,

    /**
     * Controls whether the `Snackbar` is opened or not.
     */
    open: _react2.default.PropTypes.bool.isRequired,

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

  mixins: [_styleResizable2.default],

  getInitialState: function getInitialState() {
    return {
      open: this.props.open,
      message: this.props.message,
      action: this.props.action,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    if (this.state.open) {
      this.setAutoHideTimer();
      this.setTransitionTimer();
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var _this = this;

    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });

    if (this.state.open && nextProps.open === this.props.open && (nextProps.message !== this.props.message || nextProps.action !== this.props.action)) {
      this.setState({
        open: false
      });

      clearTimeout(this.timerOneAtTheTimeId);
      this.timerOneAtTheTimeId = setTimeout(function () {
        _this.setState({
          message: nextProps.message,
          action: nextProps.action,
          open: true
        });
      }, 400);
    } else {
      var open = nextProps.open;

      this.setState({
        open: open !== null ? open : this.state.open,
        message: nextProps.message,
        action: nextProps.action
      });
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevState.open !== this.state.open) {
      if (this.state.open) {
        this.setAutoHideTimer();
        this.setTransitionTimer();
      } else {
        clearTimeout(this.timerAutoHideId);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this.timerAutoHideId);
    clearTimeout(this.timerTransitionId);
    clearTimeout(this.timerOneAtTheTimeId);
  },


  manuallyBindClickAway: true,

  timerAutoHideId: undefined,
  timerTransitionId: undefined,
  timerOneAtTheTimeId: undefined,

  componentClickAway: function componentClickAway() {
    if (this.timerTransitionId) return; // If transitioning, don't close snackbar

    if (this.props.open !== null && this.props.onRequestClose) {
      this.props.onRequestClose('clickaway');
    } else {
      this.setState({ open: false });
    }
  },


  // Timer that controls delay before snackbar auto hides
  setAutoHideTimer: function setAutoHideTimer() {
    var _this2 = this;

    var autoHideDuration = this.props.autoHideDuration;

    if (autoHideDuration > 0) {
      clearTimeout(this.timerAutoHideId);
      this.timerAutoHideId = setTimeout(function () {
        if (_this2.props.open !== null && _this2.props.onRequestClose) {
          _this2.props.onRequestClose('timeout');
        } else {
          _this2.setState({ open: false });
        }
      }, autoHideDuration);
    }
  },


  // Timer that controls delay before click-away events are captured (based on when animation completes)
  setTransitionTimer: function setTransitionTimer() {
    var _this3 = this;

    this.timerTransitionId = setTimeout(function () {
      _this3.timerTransitionId = undefined;
    }, 400);
  },
  render: function render() {
    var _props = this.props;
    var onActionTouchTap = _props.onActionTouchTap;
    var style = _props.style;
    var bodyStyle = _props.bodyStyle;

    var others = _objectWithoutProperties(_props, ['onActionTouchTap', 'style', 'bodyStyle']);

    var _state = this.state;
    var action = _state.action;
    var message = _state.message;
    var prepareStyles = _state.muiTheme.prepareStyles;
    var open = _state.open;


    var styles = getStyles(this.props, this.state);

    var actionButton = action && _react2.default.createElement(_flatButton2.default, {
      style: styles.action,
      label: action,
      onTouchTap: onActionTouchTap
    });

    return _react2.default.createElement(
      _ClickAwayListener2.default,
      { onClickAway: open && this.componentClickAway },
      _react2.default.createElement(
        'div',
        _extends({}, others, { style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) }),
        _react2.default.createElement(
          'div',
          { style: prepareStyles((0, _simpleAssign2.default)(styles.body, bodyStyle)) },
          _react2.default.createElement(
            'div',
            { style: prepareStyles(styles.content) },
            _react2.default.createElement(
              'span',
              null,
              message
            ),
            actionButton
          )
        )
      )
    );
  }
});

exports.default = Snackbar;