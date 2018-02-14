var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '../styles/withStyles';
import { fade } from '../styles/colorManipulator';

export const styles = theme => ({
  root: {
    height: 1,
    margin: 0, // Reset browser default style.
    border: 'none',
    flexShrink: 0
  },
  inset: {
    marginLeft: 72
  },
  default: {
    backgroundColor: theme.palette.divider
  },
  light: {
    backgroundColor: fade(theme.palette.divider, 0.08)
  },
  absolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%'
  }
});

function Divider(props) {
  const {
    absolute,
    classes,
    className: classNameProp,
    component: Component,
    inset,
    light
  } = props,
        other = _objectWithoutProperties(props, ['absolute', 'classes', 'className', 'component', 'inset', 'light']);

  const className = classNames(classes.root, {
    [classes.absolute]: absolute,
    [classes.inset]: inset
  }, light ? classes.light : classes.default, classNameProp);

  return React.createElement(Component, _extends({ className: className }, other));
}

Divider.propTypes = {
  absolute: PropTypes.bool,
  /**
   * Useful to extend the style applied to components.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a DOM element or a component.
   */
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /**
   * If `true`, the divider will be indented.
   */
  inset: PropTypes.bool,
  /**
   * If `true`, the divider will have a lighter color.
   */
  light: PropTypes.bool
};

Divider.defaultProps = {
  absolute: false,
  component: 'hr',
  inset: false,
  light: false
};

export default withStyles(styles, { name: 'MuiDivider' })(Divider);