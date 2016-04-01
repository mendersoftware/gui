'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _muiThemeable = require('./muiThemeable');

var _muiThemeable2 = _interopRequireDefault(_muiThemeable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var propTypes = {
  /**
   * The css class name of the root element.
   */
  className: _react2.default.PropTypes.string,

  /**
   * If true, the `Divider` will be indented `72px`.
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

var Divider = function Divider(props) {
  var inset = props.inset;
  var muiTheme = props.muiTheme;
  var style = props.style;

  var other = _objectWithoutProperties(props, ['inset', 'muiTheme', 'style']);

  var prepareStyles = muiTheme.prepareStyles;


  var styles = {
    root: {
      margin: 0,
      marginTop: -1,
      marginLeft: inset ? 72 : 0,
      height: 1,
      border: 'none',
      backgroundColor: muiTheme.rawTheme.palette.borderColor
    }
  };

  return _react2.default.createElement('hr', _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)({}, styles.root, style)) }));
};

Divider.propTypes = propTypes;
Divider.defaultProps = defaultProps;

Divider = (0, _muiThemeable2.default)()(Divider);
Divider.displayName = 'Divider';

exports.default = Divider;