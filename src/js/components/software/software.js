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
    console.log("did mount");
    AppActions.getImages();
  },
  componentWillUnmount: function () {
    console.log("unmount");
    AppStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    console.log("change");
    this.setState({groups: AppStore.getGroups()}, function() {
      console.log("got groups");
    });
    this.setState({software: AppStore.getSoftwareRepo()}, function() {
      console.log("got software");
    });
  },
  render: function() {
  console.log(this.state.software);
    return (
      <div className="contentContainer">
        <Repository software={this.state.software} groups={this.state.groups} />
      </div>
    );
  }
});

module.exports = Software;