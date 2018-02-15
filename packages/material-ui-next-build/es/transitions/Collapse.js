var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// @inheritedComponent Transition

import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Transition from 'react-transition-group/Transition';
import withStyles from '../styles/withStyles';
import { duration } from '../styles/transitions';
import { getTransitionProps } from './utils';

export const styles = theme => ({
  container: {
    height: 0,
    overflow: 'hidden',
    transition: theme.transitions.create('height')
  },
  entered: {
    height: 'auto'
  },
  wrapper: {
    // Hack to get children with a negative margin to not falsify the height computation.
    display: 'flex'
  },
  wrapperInner: {
    width: '100%'
  }
});

class Collapse extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.wrapper = null, this.autoTransitionDuration = undefined, this.handleEnter = node => {
      node.style.height = this.props.collapsedHeight;

      if (this.props.onEnter) {
        this.props.onEnter(node);
      }
    }, this.handleEntering = node => {
      const { timeout, theme } = this.props;
      const wrapperHeight = this.wrapper ? this.wrapper.clientHeight : 0;

      const { duration: transitionDuration } = getTransitionProps(this.props, {
        mode: 'enter'
      });

      if (timeout === 'auto') {
        const duration2 = theme.transitions.getAutoHeightDuration(wrapperHeight);
        node.style.transitionDuration = `${duration2}ms`;
        this.autoTransitionDuration = duration2;
      } else {
        node.style.transitionDuration = typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
      }

      node.style.height = `${wrapperHeight}px`;

      if (this.props.onEntering) {
        this.props.onEntering(node);
      }
    }, this.handleEntered = node => {
      node.style.height = 'auto';

      if (this.props.onEntered) {
        this.props.onEntered(node);
      }
    }, this.handleExit = node => {
      const wrapperHeight = this.wrapper ? this.wrapper.clientHeight : 0;
      node.style.height = `${wrapperHeight}px`;

      if (this.props.onExit) {
        this.props.onExit(node);
      }
    }, this.handleExiting = node => {
      const { timeout, theme } = this.props;
      const wrapperHeight = this.wrapper ? this.wrapper.clientHeight : 0;

      const { duration: transitionDuration } = getTransitionProps(this.props, {
        mode: 'exit'
      });

      if (timeout === 'auto') {
        const duration2 = theme.transitions.getAutoHeightDuration(wrapperHeight);
        node.style.transitionDuration = `${duration2}ms`;
        this.autoTransitionDuration = duration2;
      } else {
        node.style.transitionDuration = typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
      }

      node.style.height = this.props.collapsedHeight;

      if (this.props.onExiting) {
        this.props.onExiting(node);
      }
    }, this.addEndListener = (node, next) => {
      if (this.props.timeout === 'auto') {
        setTimeout(next, this.autoTransitionDuration || 0);
      }
    }, _temp;
  }

  render() {
    const _props = this.props,
          {
      children,
      classes,
      className,
      collapsedHeight,
      component: Component,
      onEnter,
      onEntered,
      onEntering,
      onExit,
      onExiting,
      style,
      theme,
      timeout
    } = _props,
          other = _objectWithoutProperties(_props, ['children', 'classes', 'className', 'collapsedHeight', 'component', 'onEnter', 'onEntered', 'onEntering', 'onExit', 'onExiting', 'style', 'theme', 'timeout']);

    return React.createElement(
      Transition,
      _extends({
        onEntering: this.handleEntering,
        onEnter: this.handleEnter,
        onEntered: this.handleEntered,
        onExiting: this.handleExiting,
        onExit: this.handleExit,
        addEndListener: this.addEndListener,
        timeout: timeout === 'auto' ? null : timeout
      }, other),
      (state, childProps) => {
        return React.createElement(
          Component,
          _extends({
            className: classNames(classes.container, {
              [classes.entered]: state === 'entered'
            }, className),
            style: _extends({}, style, {
              minHeight: collapsedHeight
            })
          }, childProps),
          React.createElement(
            'div',
            {
              className: classes.wrapper,
              ref: node => {
                this.wrapper = node;
              }
            },
            React.createElement(
              'div',
              { className: classes.wrapperInner },
              children
            )
          )
        );
      }
    );
  }
}

Collapse.propTypes = {
  /**
   * The content node to be collapsed.
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
   * The height of the container when collapsed.
   */
  collapsedHeight: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a DOM element or a component.
   */
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /**
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
  /**
   * @ignore
   */
  onEnter: PropTypes.func,
  /**
   * @ignore
   */
  onEntered: PropTypes.func,
  /**
   * @ignore
   */
  onEntering: PropTypes.func,
  /**
   * @ignore
   */
  onExit: PropTypes.func,
  /**
   * @ignore
   */
  onExiting: PropTypes.func,
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * @ignore
   */
  theme: PropTypes.object.isRequired,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   *
   * Set to 'auto' to automatically calculate transition time based on height.
   */
  timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({ enter: PropTypes.number, exit: PropTypes.number }), PropTypes.oneOf(['auto'])])
};

Collapse.defaultProps = {
  collapsedHeight: '0px',
  component: 'div',
  timeout: duration.standard
};

export default withStyles(styles, {
  withTheme: true,
  name: 'MuiCollapse'
})(Collapse);