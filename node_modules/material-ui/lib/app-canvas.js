'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AppCanvas = _react2.default.createClass({
  displayName: 'AppCanvas',


  propTypes: {
    children: _react2.default.PropTypes.node
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

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
    var _state$muiTheme = this.state.muiTheme;
    var baseTheme = _state$muiTheme.baseTheme;
    var prepareStyles = _state$muiTheme.prepareStyles;


    var styles = {
      height: '100%',
      color: baseTheme.palette.textColor,
      backgroundColor: baseTheme.palette.canvasColor,
      direction: 'ltr'
    };

    var newChildren = _react2.default.Children.map(this.props.children, function (currentChild) {
      if (!currentChild) {
        // If undefined, skip it
        return null;
      }

      switch (currentChild.type.displayName) {
        case 'AppBar':
          return _react2.default.cloneElement(currentChild, {
            style: (0, _simpleAssign2.default)({}, currentChild.props.style, {
              position: 'fixed'
            })
          });
        default:
          return currentChild;
      }
    }, this);

    return _react2.default.createElement(
      'div',
      { style: prepareStyles(styles) },
      newChildren
    );
  }
});

exports.default = AppCanvas;