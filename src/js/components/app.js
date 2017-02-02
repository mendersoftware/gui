import React from 'react';
import Header from './header/header';
import Joyride from 'react-joyride';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RawTheme from '../themes/mender-theme.js';

var isDemoMode = false;

function getState() {
  return {
    ready: false,
    steps: []
  }
}

var App = React.createClass({
  childContextTypes: {
    location: React.PropTypes.object,
    muiTheme: React.PropTypes.object
  },
  getChildContext() { 
    var theme = getMuiTheme(RawTheme);
    return {
      muiTheme: theme,
      location: this.props.location
    };
  },
  getInitialState: function() {
    return getState();
  },
  componentDidMount: function() {
   // this.refs.joyride.start();
  },
  componentDidUpdate (prevProps, prevState) {
    if (!prevState.ready && this.state.ready) {
      // this.refs.joyride.start();
    }
  },
  makeReady: function(ready) {
    this.setState({ready:ready});
  },
  addSteps: function(steps) {
    var joyride = this.refs.joyride;

    if (!Array.isArray(steps)) {
        steps = [steps];
    }

    if (!steps.length) {
        return false;
    }

    this.setState(function(currentState) {
        currentState.steps = currentState.steps.concat(joyride.parseSteps(steps));
        return currentState;
    });
  },
  clearSteps: function() {
    this.setState({steps: []});
    this.refs.joyride.start();
  },
  addTooltip: function(data) {
    this.refs.joyride.addTooltip(data);
  },
  render: function() {
    return (
      <div className="wrapper">
        <Joyride ref="joyride" steps={this.state.steps} showOverlay={true} type='single' tooltipOffset={12} />
        <div className="header">
          <Header demo={isDemoMode} addSteps={this.addSteps} addTooltip={this.addTooltip} clearSteps={this.clearSteps} history={this.props.history} />
        </div>
        <div className="container">
          {React.cloneElement(this.props.children, {addSteps: this.addSteps, addTooltip: this.addTooltip, makeReady: this.makeReady})}
        </div>
      </div>
    )
  }
});

module.exports = App;