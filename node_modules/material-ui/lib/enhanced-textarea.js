'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var StylePropable = require('./mixins/style-propable');
var AutoPrefix = require('./styles/auto-prefix');

var rowsHeight = 24;

var styles = {
  textarea: {
    width: '100%',
    resize: 'none',
    font: 'inherit',
    padding: 0
  },
  shadow: {
    width: '100%',
    resize: 'none',
    // Overflow also needed to here to remove the extra row
    // added to textareas in Firefox.
    overflow: 'hidden',
    font: 'inherit',
    padding: 0,
    position: 'absolute',
    opacity: 0
  }
};

var EnhancedTextarea = React.createClass({
  displayName: 'EnhancedTextarea',

  mixins: [StylePropable],

  propTypes: {
    onChange: React.PropTypes.func,
    onHeightChange: React.PropTypes.func,
    textareaStyle: React.PropTypes.object,
    rows: React.PropTypes.number,
    rowsMax: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      rows: 1
    };
  },

  getInitialState: function getInitialState() {
    return {
      height: this.props.rows * rowsHeight
    };
  },

  componentDidMount: function componentDidMount() {
    this._syncHeightWithShadow();
  },

  render: function render() {
    var _props = this.props;
    var onChange = _props.onChange;
    var onHeightChange = _props.onHeightChange;
    var rows = _props.rows;
    var style = _props.style;
    var textareaStyle = _props.textareaStyle;
    var valueLink = _props.valueLink;

    var other = _objectWithoutProperties(_props, ['onChange', 'onHeightChange', 'rows', 'style', 'textareaStyle', 'valueLink']);

    var textareaStyles = this.mergeAndPrefix(styles.textarea, textareaStyle, {
      height: this.state.height
    });

    var shadowStyles = this.mergeAndPrefix(styles.shadow);

    if (this.props.hasOwnProperty('valueLink')) {
      other.value = this.props.valueLink.value;
    }

    if (this.props.disabled) {
      style.cursor = 'default';
    }

    return React.createElement(
      'div',
      { style: this.props.style },
      React.createElement('textarea', {
        ref: 'shadow',
        style: AutoPrefix.all(shadowStyles),
        tabIndex: '-1',
        rows: this.props.rows,
        defaultValue: this.props.defaultValue,
        readOnly: true,
        value: this.props.value,
        valueLink: this.props.valueLink }),
      React.createElement('textarea', _extends({}, other, {
        ref: 'input',
        rows: this.props.rows,
        style: AutoPrefix.all(textareaStyles),
        onChange: this._handleChange }))
    );
  },

  getInputNode: function getInputNode() {
    return React.findDOMNode(this.refs.input);
  },

  setValue: function setValue(value) {
    this.getInputNode().value = value;
    this._syncHeightWithShadow(value);
  },

  _syncHeightWithShadow: function _syncHeightWithShadow(newValue, e) {
    var shadow = React.findDOMNode(this.refs.shadow);

    if (newValue !== undefined) {
      shadow.value = newValue;
    }

    var newHeight = shadow.scrollHeight;

    if (this.props.rowsMax > this.props.rows) {
      newHeight = Math.min(this.props.rowsMax * rowsHeight, newHeight);
    }

    if (this.state.height !== newHeight) {
      this.setState({
        height: newHeight
      });

      if (this.props.onHeightChange) {
        this.props.onHeightChange(e, newHeight);
      }
    }
  },

  _handleChange: function _handleChange(e) {
    this._syncHeightWithShadow(e.target.value);

    if (this.props.hasOwnProperty('valueLink')) {
      this.props.valueLink.requestChange(e.target.value);
    }

    if (this.props.onChange) {
      this.props.onChange(e);
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this._syncHeightWithShadow(nextProps.value);
    }
  }
});

module.exports = EnhancedTextarea;