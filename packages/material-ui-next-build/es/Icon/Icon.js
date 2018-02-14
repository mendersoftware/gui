var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '../styles/withStyles';
import { capitalize } from '../utils/helpers';

export const styles = theme => ({
  root: {
    userSelect: 'none'
  },
  colorPrimary: {
    color: theme.palette.primary.main
  },
  colorSecondary: {
    color: theme.palette.secondary.main
  },
  colorAction: {
    color: theme.palette.action.active
  },
  colorDisabled: {
    color: theme.palette.action.disabled
  },
  colorError: {
    color: theme.palette.error.main
  },
  fontSize: {
    width: '1em',
    height: '1em'
  }
});

function Icon(props) {
  const { children, classes, className: classNameProp, color, fontSize } = props,
        other = _objectWithoutProperties(props, ['children', 'classes', 'className', 'color', 'fontSize']);

  const className = classNames('material-icons', classes.root, {
    [classes[`color${capitalize(color)}`]]: color !== 'inherit',
    [classes.fontSize]: fontSize
  }, classNameProp);

  return React.createElement(
    'span',
    _extends({ className: className, 'aria-hidden': 'true' }, other),
    children
  );
}

Icon.propTypes = {
  /**
   * The name of the icon font ligature.
   */
  children: PropTypes.node,
  /**
   * Useful to extend the style applied to components.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   */
  color: PropTypes.oneOf(['inherit', 'secondary', 'action', 'disabled', 'error', 'primary']),
  /**
   * If `true`, the icon size will be determined by the font-size.
   */
  fontSize: PropTypes.bool
};

Icon.defaultProps = {
  color: 'inherit',
  fontSize: false
};

Icon.muiName = 'Icon';

export default withStyles(styles, { name: 'MuiIcon' })(Icon);