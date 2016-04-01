'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _transitions = require('../styles/transitions');

var _transitions2 = _interopRequireDefault(_transitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = {
  /**
   * @ignore
   * The material-ui theme applied to this component.
   */
  muiTheme: _react2.default.PropTypes.object.isRequired,

  /**
   * True if the hint text should be visible.
   */
  show: _react2.default.PropTypes.bool,

  /**
   * Override the inline-styles of the root element.
   */
  style: _react2.default.PropTypes.object,

  /**
   * The hint text displayed.
   */
  text: _react2.default.PropTypes.node
};

var defaultProps = {
  show: true
};

var TextFieldHint = function TextFieldHint(props) {
  var muiTheme = props.muiTheme;
  var show = props.show;
  var style = props.style;
  var text = props.text;
  var prepareStyles = muiTheme.prepareStyles;
  var hintColor = muiTheme.textField.hintColor;


  var styles = {
    root: {
      position: 'absolute',
      opacity: show ? 1 : 0,
      color: hintColor,
      transition: _transitions2.default.easeOut(),
      bottom: 12
    }
  };

  return _react2.default.createElement(
    'div',
    { style: prepareStyles((0, _simpleAssign2.default)({}, styles.root, style)) },
    text
  );
};

TextFieldHint.propTypes = propTypes;
TextFieldHint.defaultProps = defaultProps;

exports.default = TextFieldHint;