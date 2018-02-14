var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '../styles/withStyles';

export const styles = theme => ({
  root: {
    color: 'inherit',
    display: 'table-row',
    height: 48,
    '&:focus': {
      outline: 'none'
    },
    verticalAlign: 'middle'
  },
  typeHead: {
    height: 56
  },
  typeFooter: {
    height: 56
  },
  selected: {
    backgroundColor: theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.04)' // grey[100]
    : 'rgba(255, 255, 255, 0.08)'
  },
  hover: {
    '&:hover': {
      backgroundColor: theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.07)' // grey[200]
      : 'rgba(255, 255, 255, 0.14)'
    }
  }
});

/**
 * Will automatically set dynamic row height
 * based on the material table element parent (head, body, etc).
 */
function TableRow(props, context) {
  const {
    classes,
    className: classNameProp,
    component: Component,
    hover,
    selected
  } = props,
        other = _objectWithoutProperties(props, ['classes', 'className', 'component', 'hover', 'selected']);
  const { table } = context;

  const className = classNames(classes.root, {
    [classes.typeHead]: table && table.head,
    [classes.typeFooter]: table && table.footer,
    [classes.hover]: table && hover,
    [classes.selected]: table && selected
  }, classNameProp);

  return React.createElement(Component, _extends({ className: className }, other));
}

TableRow.propTypes = {
  /**
   * Should be valid `<tr>` children such as `TableCell`.
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
   * If `true`, the table row will shade on hover.
   */
  hover: PropTypes.bool,
  /**
   * If `true`, the table row will have the selected shading.
   */
  selected: PropTypes.bool
};

TableRow.defaultProps = {
  component: 'tr',
  hover: false,
  selected: false
};

TableRow.contextTypes = {
  table: PropTypes.object
};

export default withStyles(styles, { name: 'MuiTableRow' })(TableRow);