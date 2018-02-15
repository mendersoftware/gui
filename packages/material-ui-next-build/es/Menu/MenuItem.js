var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// @inheritedComponent ListItem

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '../styles/withStyles';
import ListItem from '../List/ListItem';

export const styles = theme => ({
  root: _extends({}, theme.typography.subheading, {
    height: theme.spacing.unit * 3,
    boxSizing: 'content-box',
    width: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&$selected': {
      backgroundColor: theme.palette.action.selected
    }
  }),
  selected: {}
});

function MenuItem(props) {
  const { classes, className: classNameProp, component, selected, role } = props,
        other = _objectWithoutProperties(props, ['classes', 'className', 'component', 'selected', 'role']);

  const className = classNames(classes.root, {
    [classes.selected]: selected
  }, classNameProp);

  return React.createElement(ListItem, _extends({
    button: true,
    role: role,
    tabIndex: -1,
    className: className,
    component: component
  }, other));
}

MenuItem.propTypes = {
  /**
   * Menu item contents.
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
   * The component used for the root node.
   * Either a string to use a DOM element or a component.
   */
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /**
   * @ignore
   */
  role: PropTypes.string,
  /**
   * Use to apply selected styling.
   */
  selected: PropTypes.bool
};

MenuItem.defaultProps = {
  component: 'li',
  role: 'menuitem',
  selected: false
};

export default withStyles(styles, { name: 'MuiMenuItem' })(MenuItem);