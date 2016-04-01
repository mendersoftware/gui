'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('../styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getStyles() {
  return {
    root: {
      padding: 8,
      position: 'relative'
    },
    action: {
      marginRight: 8
    }
  };
}

var CardActions = _react2.default.createClass({
  displayName: 'CardActions',


  propTypes: {
    /**
     * If true, a click on this card component expands the card.
     */
    actAsExpander: _react2.default.PropTypes.bool,

    /**
     * Can be used to render elements inside the Card Action.
     */
    children: _react2.default.PropTypes.node,

    /**
     * If true, this card component is expandable.
     */
    expandable: _react2.default.PropTypes.bool,

    /**
     * If true, this card component will include a button to expand the card.
     */
    showExpandableButton: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object
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
    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var children = _react2.default.Children.map(this.props.children, function (child) {
      if (_react2.default.isValidElement(child)) {
        return _react2.default.cloneElement(child, {
          style: (0, _simpleAssign2.default)({}, styles.action, child.props.style)
        });
      }
    });

    return _react2.default.createElement(
      'div',
      _extends({}, this.props, { style: prepareStyles((0, _simpleAssign2.default)(styles.root, this.props.style)) }),
      children
    );
  }
});

exports.default = CardActions;