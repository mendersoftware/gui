'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _reactAddonsPureRenderMixin2 = _interopRequireDefault(_reactAddonsPureRenderMixin);

var _autoPrefix = require('../styles/auto-prefix');

var _autoPrefix2 = _interopRequireDefault(_autoPrefix);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

var _scaleIn = require('../transition-groups/scale-in');

var _scaleIn2 = _interopRequireDefault(_scaleIn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pulsateDuration = 750;

var FocusRipple = _react2.default.createClass({
  displayName: 'FocusRipple',


  propTypes: {
    color: _react2.default.PropTypes.string,
    innerStyle: _react2.default.PropTypes.object,

    /**
     * @ignore
     * The material-ui theme applied to this component.
     */
    muiTheme: _react2.default.PropTypes.object.isRequired,

    opacity: _react2.default.PropTypes.number,
    show: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object
  },

  mixins: [_reactAddonsPureRenderMixin2.default],

  componentDidMount: function componentDidMount() {
    if (this.props.show) {
      this.setRippleSize();
      this.pulsate();
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    if (this.props.show) {
      this.setRippleSize();
      this.pulsate();
    } else {
      if (this.timeout) clearTimeout(this.timeout);
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    clearTimeout(this.timeout);
  },
  getRippleElement: function getRippleElement(props) {
    var color = props.color;
    var innerStyle = props.innerStyle;
    var _props$muiTheme = props.muiTheme;
    var prepareStyles = _props$muiTheme.prepareStyles;
    var ripple = _props$muiTheme.ripple;
    var opacity = props.opacity;


    var innerStyles = (0, _simpleAssign2.default)({
      position: 'absolute',
      height: '100%',
      width: '100%',
      borderRadius: '50%',
      opacity: opacity ? opacity : 0.16,
      backgroundColor: color || ripple.color,
      transition: _transitions2.default.easeOut(pulsateDuration + 'ms', 'transform', null, _transitions2.default.easeInOutFunction)
    }, innerStyle);

    return _react2.default.createElement('div', { ref: 'innerCircle', style: prepareStyles((0, _simpleAssign2.default)({}, innerStyles)) });
  },
  pulsate: function pulsate() {
    var innerCircle = _reactDom2.default.findDOMNode(this.refs.innerCircle);
    if (!innerCircle) return;

    var startScale = 'scale(1)';
    var endScale = 'scale(0.85)';
    var currentScale = innerCircle.style.transform || startScale;
    var nextScale = currentScale === startScale ? endScale : startScale;

    _autoPrefix2.default.set(innerCircle.style, 'transform', nextScale, this.props.muiTheme);
    this.timeout = setTimeout(this.pulsate, pulsateDuration);
  },
  setRippleSize: function setRippleSize() {
    var el = _reactDom2.default.findDOMNode(this.refs.innerCircle);
    var height = el.offsetHeight;
    var width = el.offsetWidth;
    var size = Math.max(height, width);

    var oldTop = 0;
    // For browsers that don't support endsWith()
    if (el.style.top.indexOf('px', el.style.top.length - 2) !== -1) {
      oldTop = parseInt(el.style.top);
    }
    el.style.height = size + 'px';
    el.style.top = height / 2 - size / 2 + oldTop + 'px';
  },
  render: function render() {
    var _props = this.props;
    var show = _props.show;
    var style = _props.style;


    var mergedRootStyles = (0, _simpleAssign2.default)({
      height: '100%',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0
    }, style);

    var ripple = show ? this.getRippleElement(this.props) : null;

    return _react2.default.createElement(
      _scaleIn2.default,
      {
        maxScale: 0.85,
        style: mergedRootStyles
      },
      ripple
    );
  }
});

exports.default = FocusRipple;