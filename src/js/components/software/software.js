var React = require('react');
var AppStore = require('../../stores/app-store');

var Repository = require('./repository.js');

function getState() {
  return {
    installed: AppStore.getSoftwareInstalled(),
    repo: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups()
  }
}

var Software = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
  },
  render: function() {
  
    return (
      <div className="contentContainer">
        <Repository installed={this.state.installed} software={this.state.repo} groups={this.state.groups} />
      </div>
    );
  }
});

module.exports = Software;