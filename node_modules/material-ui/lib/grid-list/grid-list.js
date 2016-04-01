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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function getStyles(props) {
  return {
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      margin: -props.padding / 2
    },
    item: {
      boxSizing: 'border-box',
      padding: props.padding / 2
    }
  };
}

var GridList = _react2.default.createClass({
  displayName: 'GridList',


  propTypes: {
    /**
     * Number of px for one cell height.
     */
    cellHeight: _react2.default.PropTypes.number,

    /**
     * Grid Tiles that will be in Grid List.
     */
    children: _react2.default.PropTypes.node,

    /**
     * Number of columns.
     */
    cols: _react2.default.PropTypes.number,

    /**
     * Number of px for the padding/spacing between items.
     */
    padding: _react2.default.PropTypes.number,

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

  getDefaultProps: function getDefaultProps() {
    return {
      cols: 2,
      padding: 4,
      cellHeight: 180
    };
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
    var _props = this.props;
    var cols = _props.cols;
    var padding = _props.padding;
    var cellHeight = _props.cellHeight;
    var children = _props.children;
    var style = _props.style;

    var other = _objectWithoutProperties(_props, ['cols', 'padding', 'cellHeight', 'children', 'style']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);

    var mergedRootStyles = (0, _simpleAssign2.default)(styles.root, style);

    var wrappedChildren = _react2.default.Children.map(children, function (currentChild) {
      if (_react2.default.isValidElement(currentChild) && currentChild.type.displayName === 'Subheader') {
        return currentChild;
      }
      var childCols = currentChild.props.cols || 1;
      var childRows = currentChild.props.rows || 1;
      var itemStyle = (0, _simpleAssign2.default)({}, styles.item, {
        width: 100 / cols * childCols + '%',
        height: cellHeight * childRows + padding
      });

      return _react2.default.createElement(
        'div',
        { style: prepareStyles(itemStyle) },
        currentChild
      );
    });

    return _react2.default.createElement(
      'div',
      _extends({ style: prepareStyles(mergedRootStyles) }, other),
      wrappedChildren
    );
  }
});

exports.default = GridList;