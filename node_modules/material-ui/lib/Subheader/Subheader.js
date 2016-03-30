'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _muiThemeable = require('./../muiThemeable');

var _muiThemeable2 = _interopRequireDefault(_muiThemeable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var propTypes = {
  /**
   * Node that will be placed inside the `Subheader`.
   */
  children: _react2.default.PropTypes.node,

  /**
   * If true, the `Subheader` will be indented by `72px`.
   */
  inset: _react2.default.PropTypes.bool,

  /**
   * @ignore
   * The material-ui theme applied to this component.
   */
  muiTheme: _react2.default.PropTypes.object.isRequired,

  /**
   * Override the inline-styles of the root element.
   */
  style: _react2.default.PropTypes.object
};

var defaultProps = {
  inset: false
};

var Subheader = function Subheader(props) {
  var muiTheme = props.muiTheme;
  var children = props.children;
  var inset = props.inset;
  var style = props.style;

  var other = _objectWithoutProperties(props, ['muiTheme', 'children', 'inset', 'style']);

  var prepareStyles = muiTheme.prepareStyles;
  var subheader = muiTheme.subheader;


  var styles = {
    root: {
      boxSizing: 'border-box',
      color: subheader.color,
      fontSize: 14,
      fontWeight: subheader.fontWeight,
      lineHeight: '48px',
      paddingLeft: inset ? 72 : 16,
      width: '100%'
    }
  };

  return _react2.default.createElement(
    'div',
    _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)({}, styles.root, style)) }),
    children
  );
};

Subheader.propTypes = propTypes;
Subheader.defaultProps = defaultProps;

Subheader = (0, _muiThemeable2.default)()(Subheader);
Subheader.displayName = 'Subheader';

exports.default = Subheader;