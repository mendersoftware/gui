import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var Repository = require('./repository.js');

function getState() {
  return {
    repo: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups()
  }
}

var Software = React.createClass({
  getInitialState: function() {
    return {
      repo: [],
      groups: [],
      software: []
    }
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },
  componentDidMount: function() {
    AppActions.getImages();
  },
  componentWillUnmount: function () {
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState({groups: AppStore.getGroups()}, function() {
    });
    this.setState({software: AppStore.getSoftwareRepo()}, function() {
    });
  },
  render: function() {
    return (
      <div className="contentContainer">
        <Repository software={this.state.software} groups={this.state.groups} />
      </div>
    );
  }
});

module.exports = Software;