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

function getStyles(props, state) {
  var cardMedia = state.muiTheme.cardMedia;

  return {
    root: {
      position: 'relative'
    },
    overlayContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0
    },
    overlay: {
      height: '100%',
      position: 'relative'
    },
    overlayContent: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      paddingTop: 8,
      background: cardMedia.overlayContentBackground
    },
    media: {},
    mediaChild: {
      verticalAlign: 'top',
      maxWidth: '100%',
      minWidth: '100%',
      width: '100%'
    }
  };
}

var CardMedia = _react2.default.createClass({
  displayName: 'CardMedia',


  propTypes: {
    /**
     * If true, a click on this card component expands the card.
     */
    actAsExpander: _react2.default.PropTypes.bool,

    /**
     * Can be used to render elements inside the Card Media.
     */
    children: _react2.default.PropTypes.node,

    /**
     * If true, this card component is expandable.
     */
    expandable: _react2.default.PropTypes.bool,

    /**
     * Override the inline-styles of the Card Media.
     */
    mediaStyle: _react2.default.PropTypes.object,

    /**
     * Can be used to render overlay element in Card Media.
     */
    overlay: _react2.default.PropTypes.node,

    /**
     * Override the inline-styles of the overlay container.
     */
    overlayContainerStyle: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the overlay content.
     */
    overlayContentStyle: _react2.default.PropTypes.object,

    /**
     * Override the inline-styles of the overlay element.
     */
    overlayStyle: _react2.default.PropTypes.object,

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
    var rootStyle = (0, _simpleAssign2.default)(styles.root, this.props.style);
    var mediaStyle = (0, _simpleAssign2.default)(styles.media, this.props.mediaStyle);
    var overlayContainerStyle = (0, _simpleAssign2.default)(styles.overlayContainer, this.props.overlayContainerStyle);
    var overlayContentStyle = (0, _simpleAssign2.default)(styles.overlayContent, this.props.overlayContentStyle);
    var overlayStyle = (0, _simpleAssign2.default)(styles.overlay, this.props.overlayStyle);
    var titleColor = this.state.muiTheme.cardMedia.titleColor;
    var subtitleColor = this.state.muiTheme.cardMedia.subtitleColor;
    var color = this.state.muiTheme.cardMedia.color;

    var children = _react2.default.Children.map(this.props.children, function (child) {
      return _react2.default.cloneElement(child, {
        style: prepareStyles((0, _simpleAssign2.default)({}, styles.mediaChild, child.props.style))
      });
    });

    var overlayChildren = _react2.default.Children.map(this.props.overlay, function (child) {
      if (child.type.displayName === 'CardHeader' || child.type.displayName === 'CardTitle') {
        return _react2.default.cloneElement(child, {
          titleColor: titleColor,
          subtitleColor: subtitleColor
        });
      } else if (child.type.displayName === 'CardText') {
        return _react2.default.cloneElement(child, {
          color: color
        });
      } else {
        return child;
      }
    });

    return _react2.default.createElement(
      'div',
      _extends({}, this.props, { style: prepareStyles(rootStyle) }),
      _react2.default.createElement(
        'div',
        { style: prepareStyles(mediaStyle) },
        children
      ),
      this.props.overlay ? _react2.default.createElement(
        'div',
        { style: prepareStyles(overlayContainerStyle) },
        _react2.default.createElement(
          'div',
          { style: prepareStyles(overlayStyle) },
          _react2.default.createElement(
            'div',
            { style: prepareStyles(overlayContentStyle) },
            overlayChildren
          )
        )
      ) : ''
    );
  }
});

exports.default = CardMedia;