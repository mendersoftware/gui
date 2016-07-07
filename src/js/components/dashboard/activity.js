import React from 'react';
import { Router, Route, Link } from 'react-router';

import Time from 'react-time';

// material ui
import mui from 'material-ui';

var Activity = React.createClass({
  _clickHandle: function() {
    this.props.clickHandle();
  },
  render: function() {
    var activity = this.props.activity.map(function(log, index) {
      return (
        <div key={index} className="activityWrapper">
          <div className={log.negative ? "activityEntry negative" : "activityEntry"}>
            <p className="summary">{log.summary}</p>
            <p>{log.details}</p>
          </div>
          <Time style={{fontSize:"12"}} className="activityTime" value={log.timestamp} format="YYYY-MM-DD HH:mm" />
        </div>
      )
    }); 
    return (
      <div className="activity-log">
        <div className="dashboard-header">
          <h2>User activity</h2>
        </div>
        <div>
          <div className="margin-bottom">
            {activity}
            <div className={this.props.activity.length ? "hidden" : "dashboard-placeholder" }>
              <p>No recent user activity</p>
              <img src="assets/img/activity.png" alt="activity" />
            </div>
          </div>
          
        </div>
      </div>
    );
  }
});

Activity.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Activity;