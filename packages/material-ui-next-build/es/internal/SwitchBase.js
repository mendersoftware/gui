var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckBoxOutlineBlankIcon from '../internal/svg-icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '../internal/svg-icons/CheckBox';
import withStyles from '../styles/withStyles';
import IconButton from '../IconButton';

export const styles = {
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'none'
  },
  input: {
    cursor: 'inherit',
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    margin: 0,
    padding: 0
  },
  default: {},
  checked: {},
  disabled: {}
};

/**
 * @ignore - internal component.
 */
class SwitchBase extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {}, this.input = null, this.isControlled = null, this.handleInputChange = event => {
      const checked = event.target.checked;

      if (!this.isControlled) {
        this.setState({ checked });
      }

      if (this.props.onChange) {
        this.props.onChange(event, checked);
      }
    }, _temp;
  }

  componentWillMount() {
    const { props } = this;

    this.isControlled = props.checked != null;

    if (!this.isControlled) {
      // not controlled, use internal state
      this.setState({
        checked: props.defaultChecked !== undefined ? props.defaultChecked : false
      });
    }
  }

  render() {
    const _props = this.props,
          {
      checked: checkedProp,
      checkedIcon,
      classes,
      className: classNameProp,
      disabled: disabledProp,
      icon: iconProp,
      inputProps,
      inputRef,
      inputType,
      name,
      onChange,
      tabIndex,
      value
    } = _props,
          other = _objectWithoutProperties(_props, ['checked', 'checkedIcon', 'classes', 'className', 'disabled', 'icon', 'inputProps', 'inputRef', 'inputType', 'name', 'onChange', 'tabIndex', 'value']);

    const { muiFormControl } = this.context;
    let disabled = disabledProp;

    if (muiFormControl) {
      if (typeof disabled === 'undefined') {
        disabled = muiFormControl.disabled;
      }
    }

    const checked = this.isControlled ? checkedProp : this.state.checked;
    const className = classNames(classes.root, classes.default, classNameProp, {
      [classes.checked]: checked,
      [classes.disabled]: disabled
    });

    const icon = checked ? checkedIcon : iconProp;

    return React.createElement(
      IconButton,
      _extends({
        'data-mui-test': 'SwitchBase',
        component: 'span',
        className: className,
        disabled: disabled,
        tabIndex: null,
        role: undefined
      }, other),
      icon,
      React.createElement('input', _extends({
        type: inputType,
        name: name,
        checked: checkedProp,
        onChange: this.handleInputChange,
        className: classes.input,
        disabled: disabled,
        tabIndex: tabIndex,
        value: value,
        ref: inputRef
      }, inputProps))
    );
  }
}

// NB: If changed, please update Checkbox, Switch and Radio
// so that the API documentation is updated.
SwitchBase.propTypes = {
  /**
   * If `true`, the component is checked.
   */
  checked: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  /**
   * The icon to display when the component is checked.
   */
  checkedIcon: PropTypes.node,
  /**
   * Useful to extend the style applied to components.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * @ignore
   */
  defaultChecked: PropTypes.bool,
  /**
   * If `true`, the switch will be disabled.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the ripple effect will be disabled.
   */
  disableRipple: PropTypes.bool,
  /**
   * The icon to display when the component is unchecked.
   */
  icon: PropTypes.node,
  /**
   * If `true`, the component appears indeterminate.
   */
  indeterminate: PropTypes.bool,
  /**
   * The icon to display when the component is indeterminate.
   */
  indeterminateIcon: PropTypes.node,
  /**
   * Properties applied to the `input` element.
   */
  inputProps: PropTypes.object,
  /**
   * Use that property to pass a ref callback to the native input component.
   */
  inputRef: PropTypes.func,
  /**
   * The input component property `type`.
   */
  inputType: PropTypes.string,
  /*
   * @ignore
   */
  name: PropTypes.string,
  /**
   * Callback fired when the state is changed.
   *
   * @param {object} event The event source of the callback
   * @param {boolean} checked The `checked` value of the switch
   */
  onChange: PropTypes.func,
  /**
   * @ignore
   */
  tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The value of the component.
   */
  value: PropTypes.string
};

SwitchBase.defaultProps = {
  checkedIcon: React.createElement(CheckBoxIcon, null),
  disableRipple: false,
  icon: React.createElement(CheckBoxOutlineBlankIcon, null),
  inputType: 'checkbox'
};

SwitchBase.contextTypes = {
  muiFormControl: PropTypes.object
};

export default withStyles(styles, { name: 'MuiSwitchBase' })(SwitchBase);