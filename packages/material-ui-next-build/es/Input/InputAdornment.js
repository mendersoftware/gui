var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Typography from '../Typography';
import withStyles from '../styles/withStyles';

export const styles = theme => ({
  root: {
    display: 'flex',
    maxHeight: '2em',
    alignItems: 'center'
  },
  positionStart: {
    marginRight: theme.spacing.unit
  },
  positionEnd: {
    marginLeft: theme.spacing.unit
  }
});

function InputAdornment(props) {
  const {
    children,
    component: Component,
    classes,
    className,
    disableTypography,
    position
  } = props,
        other = _objectWithoutProperties(props, ['children', 'component', 'classes', 'className', 'disableTypography', 'position']);

  return React.createElement(
    Component,
    _extends({
      className: classNames(classes.root, {
        [classes.positionStart]: position === 'start',
        [classes.positionEnd]: position === 'end'
      }, className)
    }, other),
    typeof children === 'string' && !disableTypography ? React.createElement(
      Typography,
      { color: 'textSecondary' },
      children
    ) : children
  );
}

InputAdornment.propTypes = {
  /**
   * The content of the component, normally an `IconButton` or string.
   */
  children: PropTypes.node.isRequired,
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
   * If children is a string then disable wrapping in a Typography component.
   */
  disableTypography: PropTypes.bool,
  /**
   * The position this adornment should appear relative to the `Input`.
   */
  position: PropTypes.oneOf(['start', 'end'])
};

InputAdornment.defaultProps = {
  component: 'div',
  disableTypography: false
};

export default withStyles(styles, { name: 'MuiInputAdornment' })(InputAdornment);