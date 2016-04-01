'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _simpleAssign = require('simple-assign');

var _simpleAssign2 = _interopRequireDefault(_simpleAssign);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getMuiTheme = require('./styles/getMuiTheme');

var _getMuiTheme2 = _interopRequireDefault(_getMuiTheme);

var _reactEventListener = require('react-event-listener');

var _reactEventListener2 = _interopRequireDefault(_reactEventListener);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var rowsHeight = 24;

function getStyles(props, state) {
  return {
    root: {
      position: 'relative' },
    //because the shadow has position: 'absolute'
    textarea: {
      height: state.height,
      width: '100%',
      resize: 'none',
      font: 'inherit',
      padding: 0,
      cursor: props.disabled ? 'default' : 'initial'
    },
    shadow: {
      resize: 'none',
      // Overflow also needed to here to remove the extra row
      // added to textareas in Firefox.
      overflow: 'hidden',
      // Visibility needed to hide the extra text area on ipads
      visibility: 'hidden',
      position: 'absolute',
      height: 'initial'
    }
  };
}

var EnhancedTextarea = _react2.default.createClass({
  displayName: 'EnhancedTextarea',


  propTypes: {
    defaultValue: _react2.default.PropTypes.any,
    disabled: _react2.default.PropTypes.bool,
    onChange: _react2.default.PropTypes.func,
    onHeightChange: _react2.default.PropTypes.func,
    rows: _react2.default.PropTypes.number,
    rowsMax: _react2.default.PropTypes.number,
    shadowStyle: _react2.default.PropTypes.object,
    /**
     * Override the inline-styles of the root element.
     */
    style: _react2.default.PropTypes.object,
    textareaStyle: _react2.default.PropTypes.object,
    value: _react2.default.PropTypes.string,
    valueLink: _react2.default.PropTypes.object
  },

  contextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  childContextTypes: {
    muiTheme: _react2.default.PropTypes.object
  },

  getDefaultProps: function getDefaultProps() {
    return {
      rows: 1
    };
  },
  getInitialState: function getInitialState() {
    return {
      height: this.props.rows * rowsHeight,
      muiTheme: this.context.muiTheme || (0, _getMuiTheme2.default)()
    };
  },
  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  componentDidMount: function componentDidMount() {
    this._syncHeightWithShadow();
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.value !== this.props.value) {
      this._syncHeightWithShadow(nextProps.value);
    }

    this.setState({
      muiTheme: nextContext.muiTheme || this.state.muiTheme
    });
  },
  handleResize: function handleResize(event) {
    this._syncHeightWithShadow(undefined, event);
  },
  getInputNode: function getInputNode() {
    return this.refs.input;
  },
  setValue: function setValue(value) {
    this.getInputNode().value = value;
    this._syncHeightWithShadow(value);
  },
  _syncHeightWithShadow: function _syncHeightWithShadow(newValue, event) {
    var shadow = this.refs.shadow;

    if (newValue !== undefined) {
      shadow.value = newValue;
    }

    var newHeight = shadow.scrollHeight;

    if (this.props.rowsMax >= this.props.rows) {
      newHeight = Math.min(this.props.rowsMax * rowsHeight, newHeight);
    }

    newHeight = Math.max(newHeight, rowsHeight);

    if (this.state.height !== newHeight) {
      this.setState({
        height: newHeight
      });

      if (this.props.onHeightChange) {
        this.props.onHeightChange(event, newHeight);
      }
    }
  },
  _handleChange: function _handleChange(event) {
    this._syncHeightWithShadow(event.target.value);

    if (this.props.hasOwnProperty('valueLink')) {
      this.props.valueLink.requestChange(event.target.value);
    }

    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  render: function render() {
    var _props = this.props;
    var onChange = _props.onChange;
    var onHeightChange = _props.onHeightChange;
    var rows = _props.rows;
    var shadowStyle = _props.shadowStyle;
    var style = _props.style;
    var textareaStyle = _props.textareaStyle;
    var valueLink = _props.valueLink;

    var other = _objectWithoutProperties(_props, ['onChange', 'onHeightChange', 'rows', 'shadowStyle', 'style', 'textareaStyle', 'valueLink']);

    var prepareStyles = this.state.muiTheme.prepareStyles;


    var styles = getStyles(this.props, this.state);
    var rootStyles = (0, _simpleAssign2.default)({}, styles.root, style);
    var textareaStyles = (0, _simpleAssign2.default)({}, styles.textarea, textareaStyle);
    var shadowStyles = (0, _simpleAssign2.default)({}, textareaStyles, styles.shadow, shadowStyle);

    if (this.props.hasOwnProperty('valueLink')) {
      other.value = this.props.valueLink.value;
    }

    return _react2.default.createElement(
      'div',
      { style: prepareStyles(rootStyles) },
      _react2.default.createElement(_reactEventListener2.default, { elementName: 'window', onResize: this.handleResize }),
      _react2.default.createElement('textarea', {
        ref: 'shadow',
        style: prepareStyles(shadowStyles),
        tabIndex: '-1',
        rows: this.props.rows,
        defaultValue: this.props.defaultValue,
        readOnly: true,
        value: this.props.value,
        valueLink: this.props.valueLink
      }),
      _react2.default.createElement('textarea', _extends({}, other, {
        ref: 'input',
        rows: this.props.rows,
        style: prepareStyles(textareaStyles),
        onChange: this._handleChange
      }))
    );
  }
});

exports.default = EnhancedTextarea;