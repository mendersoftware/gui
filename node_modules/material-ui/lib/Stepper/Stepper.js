'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _styles = require('../styles');

var _paper = require('../paper');

var _paper2 = _interopRequireDefault(_paper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Stepper = _react2.default.createClass({
  displayName: 'Stepper',

  propTypes: {
    /**
     * Set the active step.
     */
    activeStep: _react.PropTypes.number,

    /**
     * Should be two or more `HorizontalStep` or `VerticalStep`.
     */
    children: _react.PropTypes.node,

    /**
     * Override the inline-style of the content container.
     */
    containerStyle: _react.PropTypes.object,

    /**
     * Function used to set a suitable icon for the step, based on the current state of the step.
     *
     * @param {node} Step Component that is being updated.
     * @returns {node} - Icon that will be shown for the step.
     */
    createIcon: _react.PropTypes.func,

    /**
     * If true, it will be horizontal stepper. Should match the step type used for `children`.
     */
    horizontal: _react.PropTypes.bool,

    /**
     * Callback function fired when the step header is touched.
     *
     * @param {number} stepIndex - The index of step is being touched.
     * @param {node} Step component that is being touched.
     */
    onStepHeaderTouch: _react.PropTypes.func,

    /**
     * Override the inline-style of the step header wrapper.
     */
    stepHeadersWrapperStyle: _react.PropTypes.object,

    /**
     * Override the inline-style of the root element.
     */
    style: _react.PropTypes.object,

    /**
     * Callback function fired on re-render to set the background color of the icon.
     * If not passed, it will use the default theme.
     *
     * @param {node}  Step Component which is being updated.
     * @returns {string} The background color of the icon.
     */
    updateAvatarBackgroundColor: _react.PropTypes.func,

    /**
     * Callback function fired on re-render to update the completed status of the step.
     *
     * @param {number} stepIndex - The step that is being updated.
     * @param {node} Step Component that is being updated.
     * @returns {boolean} `true` if the step is completed.
     */
    updateCompletedStatus: _react.PropTypes.func
  },

  contextTypes: {
    muiTheme: _react.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react.PropTypes.object,
    createIcon: _react.PropTypes.func,
    updateAvatarBackgroundColor: _react.PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      activeStep: -1,
      onStepHeaderTouch: function onStepHeaderTouch() {},
      updateAvatarBackgroundColor: function updateAvatarBackgroundColor() {
        return null;
      },
      style: {},
      horizontal: false
    };
  },
  getInitialState: function getInitialState() {
    return {
      hoveredHeaderStepIndex: -1,
      muiTheme: this.context.muiTheme || (0, _styles.getMuiTheme)(),
      itemWidth: 0
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
      createIcon: this.props.createIcon,
      updateAvatarBackgroundColor: this.props.updateAvatarBackgroundColor
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (!this.props.horizontal) {
      return;
    }

    var childrenWrapperNode = this.refs.childrenWrapper;
    var containerWrapperNode = this.refs.containerWrapper;
    var actionsNode = this.refs.actions;

    if (containerWrapperNode.style.height === '0px' && nextProps.activeStep > -1) {
      containerWrapperNode.style.height = childrenWrapperNode.offsetHeight + actionsNode.offsetHeight + 40 + 'px';
      childrenWrapperNode.style.transition = 'none';
    } else if (nextProps.activeStep > this.getTotalSteps() - 1) {
      containerWrapperNode.style.height = '0px';
    } else {
      childrenWrapperNode.style.transition = 'all 1s';
    }
  },
  getTotalSteps: function getTotalSteps() {
    return _react2.default.Children.count(this.props.children);
  },
  getStylesForHorizontalStepper: function getStylesForHorizontalStepper() {
    var _props = this.props;
    var stepHeadersWrapperStyle = _props.stepHeadersWrapperStyle;
    var containerStyle = _props.containerStyle;
    var style = _props.style;
    var activeStep = _props.activeStep;


    var itemWidth = this.state.itemWidth;
    var translateX = -activeStep * itemWidth;

    var childrenWrapper = {
      transform: 'translate3d(' + translateX + 'px, 0px, 0px)',
      transition: 'all 1s'
    };

    var stepHeadersWrapper = (0, _simpleAssign2.default)({
      display: 'flex',
      width: '100%',
      margin: '0 auto'
    }, stepHeadersWrapperStyle);

    var wrapper = (0, _simpleAssign2.default)({
      overflow: 'hidden'
    }, activeStep > -1 && {
      transition: 'all 0.5s'
    }, style);

    var container = (0, _simpleAssign2.default)({
      transition: 'all 0.5s',
      height: 0
    }, containerStyle);

    return {
      wrapper: wrapper,
      container: container,
      stepHeadersWrapper: stepHeadersWrapper,
      childrenWrapper: childrenWrapper
    };
  },
  _handleHeaderStepHover: function _handleHeaderStepHover(stepIndex) {
    this.setState({
      hoveredHeaderStepIndex: stepIndex
    });
  },
  findFurthestOptionalStep: function findFurthestOptionalStep(index) {
    var children = this.props.children;


    while (index > 0 && children[index - 1].props.optional) {
      index--;
    }
    return index;
  },
  renderHorizontalStepper: function renderHorizontalStepper() {
    var _this = this;

    var _props2 = this.props;
    var children = _props2.children;
    var onStepHeaderTouch = _props2.onStepHeaderTouch;
    var activeStep = _props2.activeStep;
    var updateCompletedStatus = _props2.updateCompletedStatus;
    var hoveredHeaderStepIndex = this.state.hoveredHeaderStepIndex;


    var setOfChildren = [];
    var setOfActions = [];

    var steps = _react2.default.Children.map(children, function (step, index) {
      setOfChildren.push(step.props.children);
      setOfActions.push(step.props.actions);

      return _react2.default.cloneElement(step, {
        headerWidth: 100 / _this.getTotalSteps() + '%',
        key: index,
        stepIndex: index,
        isActive: activeStep === index,
        isStepHeaderHovered: hoveredHeaderStepIndex === index,
        onStepHeaderTouch: onStepHeaderTouch,
        onStepHeaderHover: _this._handleHeaderStepHover,
        isLastStep: index === _this.getTotalSteps() - 1,
        isFirstStep: index === 0,
        isCompleted: updateCompletedStatus(index, step),
        previousStepOptionalIndex: _this.findFurthestOptionalStep(index)
      });
    });

    var itemWidth = this.state.itemWidth;
    var styles = this.getStylesForHorizontalStepper();

    return _react2.default.createElement(
      'div',
      { style: styles.wrapper, ref: function ref(input) {
          if (input !== null && !_this.state.itemWidth) {
            _this.setState({
              itemWidth: input.offsetWidth
            });
          }
        }
      },
      _react2.default.createElement(
        _paper2.default,
        { style: styles.stepHeadersWrapper },
        steps
      ),
      _react2.default.createElement(
        'div',
        { style: styles.container, ref: 'containerWrapper' },
        _react2.default.createElement(
          'div',
          { style: styles.childrenWrapper, ref: 'childrenWrapper' },
          _react2.default.createElement(
            'div',
            { style: { display: 'inline-flex' } },
            setOfChildren.map(function (children, index) {
              return _react2.default.createElement(
                'div',
                { style: { width: itemWidth }, key: index },
                children
              );
            })
          )
        ),
        _react2.default.createElement(
          'div',
          { style: { padding: 20, display: 'flex', justifyContent: 'flex-end' }, ref: 'actions' },
          setOfActions[activeStep]
        )
      )
    );
  },
  renderVerticalStepper: function renderVerticalStepper() {
    var _this2 = this;

    var _props3 = this.props;
    var style = _props3.style;
    var children = _props3.children;
    var onStepHeaderTouch = _props3.onStepHeaderTouch;
    var activeStep = _props3.activeStep;
    var updateCompletedStatus = _props3.updateCompletedStatus;
    var hoveredHeaderStepIndex = this.state.hoveredHeaderStepIndex;


    var steps = _react2.default.Children.map(children, function (step, index) {
      return _react2.default.cloneElement(step, {
        key: index,
        stepIndex: index,
        isActive: activeStep === index,
        isStepHeaderHovered: hoveredHeaderStepIndex === index,
        onStepHeaderTouch: onStepHeaderTouch,
        onStepHeaderHover: _this2._handleHeaderStepHover,
        isLastStep: index === _this2.getTotalSteps() - 1,
        isCompleted: updateCompletedStatus(index, step),
        previousStepOptionalIndex: _this2.findFurthestOptionalStep(index)
      });
    });

    return _react2.default.createElement(
      'div',
      { style: style },
      steps
    );
  },
  render: function render() {
    var horizontal = this.props.horizontal;


    if (horizontal) {
      return this.renderHorizontalStepper();
    }

    return this.renderVerticalStepper();
  }
});

exports.default = Stepper;