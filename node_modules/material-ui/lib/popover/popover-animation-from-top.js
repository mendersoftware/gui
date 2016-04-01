'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _paper = require('../paper');

var _paper2 = _interopRequireDefault(_paper);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _propTypes = require('../utils/prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getStyles(props, state) {
  var targetOrigin = props.targetOrigin;
  var open = state.open;
  var zIndex = state.muiTheme.zIndex;


  var horizontal = targetOrigin.horizontal.replace('middle', 'vertical');

  return {
    root: {
      opacity: open ? 1 : 0,
      transform: open ? 'scaleY(1)' : 'scaleY(0)',
      transformOrigin: horizontal + ' ' + targetOrigin.vertical,
      position: 'fixed',
      zIndex: zIndex.popover,
      transition: _transitions2.default.easeOut('450ms', ['transform', 'opacity']),
      maxHeight: '100%'
    }
  };
}

var PopoverAnimationFromTop = _react2.default.createClass({
  displayName: 'PopoverAnimationFromTop',


  propTypes: {
    children: _react2.default.PropTypes.node,
    className: _react2.default.PropTypes.string,
    open: _react2.default.PropTypes.bool.isRequired,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,
    targetOrigin: _propTypes2.default.origin,
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
      style: {},
      zDepth: 1
    };
  },
  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)(),
      open: false
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    this.setState({ open: true }); //eslint-disable-line react/no-did-mount-set-state
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      open: nextProps.open,
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  render: function render() {
    var _props = this.props;
    var className = _props.className;
    var style = _props.style;
    var zDepth = _props.zDepth;


    var styles = getStyles(this.props, this.state);

    return _react2.default.createElement(
      _paper2.default,
      {
        style: (0, _simpleAssign2.default)(styles.root, style),
        zDepth: zDepth,
        className: className
      },
      this.props.children
    );
  }
});

exports.default = PopoverAnimationFromTop;