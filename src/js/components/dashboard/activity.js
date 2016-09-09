import React from 'react';
import { Router, Route, Link } from 'react-router';
import Time from 'react-time';

var tooltip = {
  title: 'Recent activity',
  text: 'Recent activity by you or any other users will show here - so you can see what\'s been going on!',
  selector: '.activity',
  position: 'top-right',
  type: 'hover'
};

var Activity = React.createClass({
  componentDidMount: function() {
    this.props.addTooltip(tooltip);
  },
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
      <div style={{position: "relative"}} className="activity-log">
        <div className="dashboard-header">
          <h2 className="inline-block">User activity</h2>
          <div className="activity joyride-beacon">
            <span className="joyride-beacon__inner"></span>
            <span className="joyride-beacon__outer"></span>
          </div>
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