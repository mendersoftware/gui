'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _touchRipple = require('../ripples/touch-ripple');

var _touchRipple2 = _interopRequireDefault(_touchRipple);

var _avatar = require('../avatar');

var _avatar2 = _interopRequireDefault(_avatar);

var _styles = require('../styles');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Step = _react2.default.createClass({
  displayName: 'Step',

  propTypes: {
    /**
     * An array of nodes for handling moving or canceling steps.
     */
    actions: _react.PropTypes.arrayOf(_react.PropTypes.node),

    /**
     * Override the inline-style of the div which contains the actions.
     */
    actionsWrapperStyle: _react.PropTypes.object,

    children: _react.PropTypes.node,

    /**
     * Override the inline-style of the div which contains all the children, including control button groups.
     */
    childrenWrapperStyle: _react.PropTypes.object,

    /**
     * Override the inline-style of the connector line.
     */
    connectorLineStyle: _react.PropTypes.object,

    /**
     * @ignore
     * If true, the step is active.
     */
    isActive: _react.PropTypes.bool,

    /**
     * @ignore
     * If true, the step is completed.
     */
    isCompleted: _react.PropTypes.bool,

    /**
     * @ignore
     * If true, the step is the last one.
     */
    isLastStep: _react.PropTypes.bool,

    /**
     * @ignore
     * If true, the header of step is hovered.
     */
    isStepHeaderHovered: _react.PropTypes.bool,

    /**
     * @ignore
     * Callback function fired when the header of step is hovered.
     */
    onStepHeaderHover: _react.PropTypes.func,

    /**
     * @ignore
     * Callback function fired when the header of step is touched.
     */
    onStepHeaderTouch: _react.PropTypes.func,

    /**
     * @ignore
     * The index of the furthest optional step.
     */
    previousStepOptionalIndex: _react.PropTypes.number,

    /**
     * Override the inline-style of step container, which contains connector line and children.
     */
    stepContainerStyle: _react.PropTypes.object,

    /**
     * Override the inline-style of step header (not including left avatar).
     */
    stepHeaderStyle: _react.PropTypes.object,

    /**
     * Override the inline-style of step header wrapper, including left avatar.
     */
    stepHeaderWrapperStyle: _react.PropTypes.object,

    /**
     * @ignore
     * The index of step in array of Steps.
     */
    stepIndex: _react.PropTypes.number,

    /**
     * Customize the step label.
     */
    stepLabel: _react.PropTypes.node
  },

  contextTypes: {
    muiTheme: _react.PropTypes.object,
    createIcon: _react.PropTypes.func,
    updateAvatarBackgroundColor: _react.PropTypes.func
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _styles.getMuiTheme)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    var isActive = this.props.isActive;


    if (isActive) {
      (function () {
        var childrenWrapperNode = _this.refs.childrenWrapper;
        childrenWrapperNode.style.opacity = 1;

        var containerWrapper = _this.refs.containerWrapper;
        containerWrapper.style.height = childrenWrapperNode.children[0].offsetHeight + 'px';

        setTimeout(function () {
          containerWrapper.style.height = 'auto';
          childrenWrapperNode.style.height = 'auto';
        }, 300);
      })();
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var _this2 = this;

    var isActive = this.props.isActive;


    if (!isActive && nextProps.isActive) {
      (function () {
        var childrenWrapperNode = _this2.refs.childrenWrapper;
        childrenWrapperNode.style.opacity = 1;

        var containerWrapper = _this2.refs.containerWrapper;
        containerWrapper.style.height = childrenWrapperNode.children[0].offsetHeight + 'px';

        setTimeout(function () {
          containerWrapper.style.height = 'auto';
          childrenWrapperNode.style.height = 'auto';
        }, 300);
      })();
    }

    if (isActive && !nextProps.isActive) {
      var _childrenWrapperNode = this.refs.childrenWrapper;
      _childrenWrapperNode.style.opacity = '0';
      _childrenWrapperNode.style.height = '100%';

      var _containerWrapper = this.refs.containerWrapper;
      _containerWrapper.style.height = '32px';
    }
  },
  handleStepHeaderTouch: function handleStepHeaderTouch() {
    this.props.onStepHeaderTouch(this.props.stepIndex, this);
  },
  handleStepHeaderMouseHover: function handleStepHeaderMouseHover() {
    this.props.onStepHeaderHover(this.props.stepIndex);
  },
  handleStepHeaderMouseLeave: function handleStepHeaderMouseLeave() {
    this.props.onStepHeaderHover(-1);
  },
  getStyles: function getStyles() {
    var _props = this.props;
    var isActive = _props.isActive;
    var isCompleted = _props.isCompleted;
    var isStepHeaderHovered = _props.isStepHeaderHovered;
    var stepHeaderStyle = _props.stepHeaderStyle;
    var stepHeaderWrapperStyle = _props.stepHeaderWrapperStyle;
    var connectorLineStyle = _props.connectorLineStyle;
    var stepContainerStyle = _props.stepContainerStyle;
    var actionsWrapperStyle = _props.actionsWrapperStyle;
    var childrenWrapperStyle = _props.childrenWrapperStyle;


    var theme = this.state.muiTheme.stepper;

    var customAvatarBackgroundColor = this.context.updateAvatarBackgroundColor(this);

    var avatarBackgroundColor = customAvatarBackgroundColor || (isActive || isCompleted ? theme.activeAvatarColor : isStepHeaderHovered ? theme.hoveredAvatarColor : theme.inactiveAvatarColor);

    var stepHeaderWrapper = (0, _simpleAssign2.default)({
      cursor: 'pointer',
      color: theme.inactiveTextColor,
      paddingLeft: 24,
      paddingTop: 24,
      paddingBottom: 24,
      marginTop: -32,
      position: 'relative'

    }, stepHeaderWrapperStyle, isStepHeaderHovered && !isActive && {
      backgroundColor: theme.hoveredHeaderColor,
      color: theme.hoveredTextColor

    }, (isActive || isActive && isStepHeaderHovered || isCompleted) && {
      color: theme.activeTextColor

    }, this.props.stepIndex === 0 && {
      marginTop: 0
    });

    var stepContainer = (0, _simpleAssign2.default)({
      paddingLeft: 36,
      position: 'relative',
      height: 32,
      transition: 'height 0.2s'

    }, stepContainerStyle, isActive && {
      paddingBottom: 36 + 24,
      marginBottom: 8,
      marginTop: -8
    });

    var connectorLine = (0, _simpleAssign2.default)({
      borderLeft: '1px solid',
      borderLeftColor: theme.connectorLineColor,
      height: '100%',
      position: 'absolute',
      marginTop: -16

    }, connectorLineStyle, isActive && {
      marginTop: -8
    });

    var actionsWrapper = (0, _simpleAssign2.default)({
      marginTop: 16
    }, actionsWrapperStyle);

    var childrenWrapper = (0, _simpleAssign2.default)({
      paddingLeft: 24,
      transition: 'height 0.05s',
      opacity: 0,
      overflow: 'hidden'
    }, childrenWrapperStyle);

    var stepHeader = (0, _simpleAssign2.default)({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    }, stepHeaderStyle);

    return {
      avatar: {
        backgroundColor: avatarBackgroundColor,
        fontSize: 12,
        marginRight: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },

      stepHeaderWrapper: stepHeaderWrapper,
      stepContainer: stepContainer,
      connectorLine: connectorLine,
      actionsWrapper: actionsWrapper,
      childrenWrapper: childrenWrapper,
      stepHeader: stepHeader
    };
  },
  render: function render() {
    var _props2 = this.props;
    var children = _props2.children;
    var stepLabel = _props2.stepLabel;
    var actions = _props2.actions;
    var isLastStep = _props2.isLastStep;


    var styles = this.getStyles();

    var icon = this.context.createIcon(this);

    var avatarView = _react2.default.createElement(_avatar2.default, { size: 24, style: styles.avatar, icon: icon });

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        {
          style: styles.stepHeaderWrapper,
          onClick: this.handleStepHeaderTouch,
          onMouseOver: this.handleStepHeaderMouseHover,
          onMouseLeave: this.handleStepHeaderMouseLeave
        },
        _react2.default.createElement(
          _touchRipple2.default,
          { muiTheme: this.state.muiTheme },
          _react2.default.createElement(
            'div',
            { style: styles.stepHeader },
            avatarView,
            stepLabel
          )
        )
      ),
      _react2.default.createElement(
        'div',
        { style: styles.stepContainer, ref: 'containerWrapper' },
        !isLastStep && _react2.default.createElement('div', { style: styles.connectorLine }),
        _react2.default.createElement(
          'div',
          { style: styles.childrenWrapper, ref: 'childrenWrapper' },
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'div',
              null,
              children
            ),
            _react2.default.createElement(
              'div',
              { style: styles.actionsWrapper },
              actions
            )
          )
        )
      )
    );
  }
});

exports.default = Step;