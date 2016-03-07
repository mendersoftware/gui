import React from 'react';
import { Router, Route, Link } from 'react-router';

var ProgressBar = require('../updates/progressBar.js');
var Time = require('react-time');

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var Divider = mui.Divider;
var FontIcon = mui.FontIcon;


var Progress = React.createClass({
  _clickHandle: function () {
    this.props.clickHandle(this.props.route);
  },
  _formatTime: function(date) {
    return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
  },
  render: function() {
    var progress = this.props.updates.map(function(update, index) {
      var progressBar = (
        <ProgressBar update={update} />
      );
     
      var last = (this.props.updates.length === index+1) || index===4;
      return (
        <div key={index}>
          <ListItem
            disabled={true}
            style={{paddingBottom:"12", height:"50"}}
            primaryText={progressBar}
            secondaryText={<Time style={{fontSize:"12"}} className="progressTime" value={this._formatTime(update.created)} format="YY/MM/DD HH:mm" />}
            onClick={this._clickHandle}
            leftIcon={<div style={{width:"110", height:"auto"}}><span className="progress-version">{update.version}</span><span className="progress-group">{update.name}</span></div>}
          />
          <Divider className={last ? "hidden" : null} />
        </div>
      );
    }, this);

    return (
      <div className="updates-container">
        <div className="dashboard-header subsection">
          <h3>In progress<span className="dashboard-number">{progress.length}</span></h3>
        </div>
        <div>
          <List>
            {progress}
          </List>
          <div className={progress.length ? 'hidden' : null}>
            <p className="italic">No updates in progress</p>
          </div>
          <Link to="/updates" className="float-right">All updates</Link>
        </div>
      </div>
    );
  }
});

Progress.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Progress;