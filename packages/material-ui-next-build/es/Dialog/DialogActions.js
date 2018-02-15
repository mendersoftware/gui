var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '../styles/withStyles';
import '../Button'; // So we don't have any override priority issue.

export const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    margin: `${theme.spacing.unit}px ${theme.spacing.unit / 2}px`,
    flex: '0 0 auto'
  },
  action: {
    margin: `0 ${theme.spacing.unit / 2}px`
  },
  button: {
    minWidth: 64
  }
});

function DialogActions(props) {
  const { children, classes, className } = props,
        other = _objectWithoutProperties(props, ['children', 'classes', 'className']);

  return React.createElement(
    'div',
    _extends({ className: classNames(classes.root, className) }, other),
    React.Children.map(children, child => {
      if (!React.isValidElement(child)) {
        return null;
      }

      return React.createElement(
        'div',
        { className: classes.action },
        React.cloneElement(child, {
          className: classNames(classes.button, child.props.className)
        })
      );
    })
  );
}

DialogActions.propTypes = {
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Useful to extend the style applied to components.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string
};

export default withStyles(styles, { name: 'MuiDialogActions' })(DialogActions);