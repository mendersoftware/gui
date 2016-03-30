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

var HorizontalStep = _react2.default.createClass({
  displayName: 'HorizontalStep',

  propTypes: {

    /**
     * @ignore
     * The width of step header, unit is % which passed from Stepper.
     */
    headerWidth: _react2.default.PropTypes.string,

    /**
     * @ignore
     * If true, the step is active.
     */
    isActive: _react2.default.PropTypes.bool,

    /**
     * @ignore
     * If true, the step is completed.
     */
    isCompleted: _react2.default.PropTypes.bool,

    /**
     * @ignore
     * If true, the step is the first step.
     */
    isFirstStep: _react2.default.PropTypes.bool,

    /**
     * @ignore
     * If true, the step is the last step.
     */
    isLastStep: _react2.default.PropTypes.bool,

    /**
     * @ignore
     * If true, the step header is hovered.
     */
    isStepHeaderHovered: _react2.default.PropTypes.bool,

    /**
     * @ignore
     * Callback function will be called when step header is hovered.
     */
    onStepHeaderHover: _react2.default.PropTypes.func,

    /**
     * @ignore
     * Call back function will be called when step header is touched.
     */
    onStepHeaderTouch: _react2.default.PropTypes.func,

    /**
     * Override inline-style of step header wrapper.
     */
    stepHeaderWrapperStyle: _react2.default.PropTypes.object,

    /**
     * @ignore
     * The index of step in array of Steps.
     */
    stepIndex: _react2.default.PropTypes.number,

    /**
     * The label of step which be shown in step header.
     */
    stepLabel: _react2.default.PropTypes.node
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object,
    createIcon: _react2.default.PropTypes.func,
    updateAvatarBackgroundColor: _react2.default.PropTypes.func
  },

  //for passing default theme context to children
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
  getStyles: function getStyles() {
    var _props = this.props;
    var headerWidth = _props.headerWidth;
    var isActive = _props.isActive;
    var isCompleted = _props.isCompleted;
    var isStepHeaderHovered = _props.isStepHeaderHovered;
    var stepHeaderWrapperStyle = _props.stepHeaderWrapperStyle;


    var theme = this.state.muiTheme.stepper;

    var customAvatarBackgroundColor = this.context.updateAvatarBackgroundColor(this);
    var avatarBackgroundColor = customAvatarBackgroundColor || (isActive || isCompleted ? theme.activeAvatarColor : isStepHeaderHovered ? theme.hoveredAvatarColor : theme.inactiveAvatarColor);

    var stepHeaderWrapper = (0, _simpleAssign2.default)({
      width: headerWidth,
      display: 'table-cell',
      position: 'relative',
      padding: 24,
      color: theme.inactiveTextColor,
      cursor: 'pointer'
    }, stepHeaderWrapperStyle, isStepHeaderHovered && !isActive && {
      backgroundColor: theme.hoveredHeaderColor,
      color: theme.hoveredTextColor

    }, (isActive || isActive && isStepHeaderHovered || isCompleted) && {
      color: theme.activeTextColor

    });

    var avatar = {
      backgroundColor: avatarBackgroundColor,
      color: 'white',
      margin: '0 auto',
      // display: 'block',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    var stepLabel = {
      marginTop: 8,
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'center'
    };

    var connectorLine = {
      top: 36,
      height: 1,
      borderTop: '1px solid #BDBDBD',
      position: 'absolute'
    };

    var connectorLineLeft = (0, _simpleAssign2.default)({
      left: 0,
      right: '50%',
      marginRight: 16
    }, connectorLine);

    var connectorLineRight = (0, _simpleAssign2.default)({
      right: 0,
      left: '50%',
      marginLeft: 16
    }, connectorLine);

    var stepLabelWrapper = {
      margin: '0 auto',
      textAlign: 'center'
    };

    var styles = {
      stepHeaderWrapper: stepHeaderWrapper,
      avatar: avatar,
      stepLabel: stepLabel,
      connectorLineLeft: connectorLineLeft,
      connectorLineRight: connectorLineRight,
      stepLabelWrapper: stepLabelWrapper
    };

    return styles;
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
  render: function render() {
    var styles = this.getStyles();
    var _props2 = this.props;
    var isFirstStep = _props2.isFirstStep;
    var isLastStep = _props2.isLastStep;
    var stepLabel = _props2.stepLabel;


    var icon = this.context.createIcon(this);
    var avatarView = _react2.default.createElement(_avatar2.default, { size: 24, style: styles.avatar, icon: icon });

    return _react2.default.createElement(
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
        avatarView,
        _react2.default.createElement(
          'div',
          { style: styles.stepLabel },
          stepLabel
        ),
        !isFirstStep && _react2.default.createElement('div', { style: styles.connectorLineLeft }),
        !isLastStep && _react2.default.createElement('div', { style: styles.connectorLineRight })
      )
    );
  }
});

exports.default = HorizontalStep;