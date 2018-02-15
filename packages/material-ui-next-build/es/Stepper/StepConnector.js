var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '../styles/withStyles';

export const styles = theme => ({
  root: {
    flex: '1 1 auto'
  },
  horizontal: {},
  vertical: {
    marginLeft: 12, // half icon
    padding: `0 0 ${theme.spacing.unit}px`
  },
  alternativeLabel: {
    position: 'absolute',
    top: theme.spacing.unit + 4,
    left: 'calc(50% + 20px)',
    right: 'calc(-50% + 20px)'
  },
  line: {
    display: 'block',
    borderColor: theme.palette.type === 'light' ? theme.palette.grey[400] : theme.palette.grey[600]
  },
  lineHorizontal: {
    borderTopStyle: 'solid',
    borderTopWidth: 1
  },
  lineVertical: {
    borderLeftStyle: 'solid',
    borderLeftWidth: 1,
    minHeight: theme.spacing.unit * 3
  }
});

/**
 * @ignore - internal component.
 */
function StepConnector(props) {
  const { alternativeLabel, className: classNameProp, classes, orientation } = props,
        other = _objectWithoutProperties(props, ['alternativeLabel', 'className', 'classes', 'orientation']);

  const className = classNames(classes.root, classes[orientation], {
    [classes.alternativeLabel]: alternativeLabel
  }, classNameProp);
  const lineClassName = classNames(classes.line, {
    [classes.lineHorizontal]: orientation === 'horizontal',
    [classes.lineVertical]: orientation === 'vertical'
  });

  return React.createElement(
    'div',
    _extends({ className: className }, other),
    React.createElement('span', { className: lineClassName })
  );
}

StepConnector.propTypes = {
  /**
   * @ignore
   * Set internally by Step when it's supplied with the alternativeLabel property.
   */
  alternativeLabel: PropTypes.bool,
  /**
   * Useful to extend the style applied to the component.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * @ignore
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical'])
};

StepConnector.defaultProps = {
  alternativeLabel: false,
  orientation: 'horizontal'
};

export default withStyles(styles, { name: 'MuiStepConnector' })(StepConnector);