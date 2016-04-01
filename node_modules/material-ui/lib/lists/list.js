'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _reactAddonsPureRenderMixin2 = _interopRequireDefault(_reactAddonsPureRenderMixin);

var _propTypes = require('../utils/prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _Subheader = require('../Subheader');

var _Subheader2 = _interopRequireDefault(_Subheader);

var _deprecatedPropType = require('../utils/deprecatedPropType');

var _deprecatedPropType2 = _interopRequireDefault(_deprecatedPropType);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var List = _react2.default.createClass({
  displayName: 'List',


  propTypes: {
    /**
     * These are usually ListItems that are passed to
     * be part of the list.
     */
    children: _react2.default.PropTypes.node,

    /**
     * If true, the subheader will be indented by 72px.
     */
    insetSubheader: (0, _deprecatedPropType2.default)(_react2.default.PropTypes.bool, 'Refer to the `subheader` property.'),

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,

    /**
     * The subheader string that will be displayed at the top of the list.
     */
    subheader: (0, _deprecatedPropType2.default)(_react2.default.PropTypes.node, 'Instead, nest the `Subheader` component directly inside the `List`.'),

    /**
     * The style object to override subheader styles.
     */
    subheaderStyle: (0, _deprecatedPropType2.default)(_react2.default.PropTypes.object, 'Refer to the `subheader` property.'),

    /**
     * @ignore
     * ** Breaking change ** List no longer supports `zDepth`. Instead, wrap it in `Paper`
     * or another component that provides zDepth.
     */
    zDepth: _propTypes2.default.zDepth
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  mixins: [_reactAddonsPureRenderMixin2.default],

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
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var _props$insetSubheader = _props.insetSubheader;
    var insetSubheader = _props$insetSubheader === undefined ? false : _props$insetSubheader;
    var style = _props.style;
    var subheader = _props.subheader;
    var subheaderStyle = _props.subheaderStyle;
    var zDepth = _props.zDepth;

    var other = _objectWithoutProperties(_props, ['children', 'insetSubheader', 'style', 'subheader', 'subheaderStyle', 'zDepth']);

    process.env.NODE_ENV !== "production" ? (0, _warning2.default)(typeof zDepth === 'undefined', 'List no longer supports `zDepth`. Instead, wrap it in `Paper` ' + 'or another component that provides zDepth.') : void 0;

    var hasSubheader = false;

    if (subheader) {
      hasSubheader = true;
    } else {
      var firstChild = _react2.default.Children.toArray(children)[0];
      if (_react2.default.isValidElement(firstChild) && firstChild.type === _Subheader2.default) {
        hasSubheader = true;
      }
    }

    var styles = {
      root: {
        padding: 0,
        paddingBottom: 8,
        paddingTop: hasSubheader ? 0 : 8
      }
    };

    return _react2.default.createElement(
      'div',
      _extends({}, other, {
        style: (0, _simpleAssign2.default)(styles.root, style)
      }),
      subheader && _react2.default.createElement(
        _Subheader2.default,
        { inset: insetSubheader, style: subheaderStyle },
        subheader
      ),
      children
    );
  }
});

exports.default = List;