var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// @inheritedComponent Transition

import React from 'react';
import PropTypes from 'prop-types';
import Transition from 'react-transition-group/Transition';
import { duration } from '../styles/transitions';
import withTheme from '../styles/withTheme';
import { reflow, getTransitionProps } from './utils';

const styles = {
  entering: {
    opacity: 1
  },
  entered: {
    opacity: 1
  }
};

/**
 * The Fade transition is used by the Modal component.
 * It's using [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
class Fade extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.handleEnter = node => {
      const { theme } = this.props;
      reflow(node); // So the animation always start from the start.

      const { duration: transitionDuration, delay } = getTransitionProps(this.props, {
        mode: 'enter'
      });
      node.style.transition = theme.transitions.create('opacity', {
        duration: transitionDuration,
        delay
      });
      node.style.webkitTransition = theme.transitions.create('opacity', {
        duration: transitionDuration,
        delay
      });

      if (this.props.onEnter) {
        this.props.onEnter(node);
      }
    }, this.handleExit = node => {
      const { theme } = this.props;
      const { duration: transitionDuration, delay } = getTransitionProps(this.props, {
        mode: 'exit'
      });
      node.style.transition = theme.transitions.create('opacity', {
        duration: transitionDuration,
        delay
      });
      node.style.webkitTransition = theme.transitions.create('opacity', {
        duration: transitionDuration,
        delay
      });

      if (this.props.onExit) {
        this.props.onExit(node);
      }
    }, _temp;
  }

  render() {
    const _props = this.props,
          { children, onEnter, onExit, style: styleProp, theme } = _props,
          other = _objectWithoutProperties(_props, ['children', 'onEnter', 'onExit', 'style', 'theme']);

    const style = _extends({}, styleProp, React.isValidElement(children) ? children.props.style : {});

    return React.createElement(
      Transition,
      _extends({ appear: true, onEnter: this.handleEnter, onExit: this.handleExit }, other),
      (state, childProps) => {
        return React.cloneElement(children, _extends({
          style: _extends({
            opacity: 0
          }, styles[state], style)
        }, childProps));
      }
    );
  }
}

Fade.propTypes = {
  /**
   * A single child content element.
   */
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
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
  onEntering: PropTypes.func,
  /**
   * @ignore
   */
  onExit: PropTypes.func,
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
   */
  timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({ enter: PropTypes.number, exit: PropTypes.number })])
};

Fade.defaultProps = {
  timeout: {
    enter: duration.enteringScreen,
    exit: duration.leavingScreen
  }
};

export default withTheme()(Fade);