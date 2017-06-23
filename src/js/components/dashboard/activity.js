import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Link } from 'react-router';
import Time from 'react-time';
var createReactClass = require('create-react-class');

import FontIcon from 'material-ui/FontIcon';

var tooltip = {
  title: 'Recent activity',
  text: '<div class="development"><i class="material-icons">build</i>Under development</div>All recent activity by you or any other users will show here - giving you full visibility over what\'s been happening with your devices and deployments.',
  selector: '#activity-info',
  position: 'top-right',
  type: 'hover',
  trigger: '.activity-log'
};

var Activity = createReactClass({
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
          <div className={this.props.showTooltips ? "activity joyride-beacon" : "hidden"}>
            <span className="joyride-beacon__inner"></span>
            <span className="joyride-beacon__outer"></span>
          </div>
        </div>
        <div>
          <div className="margin-bottom">
            {activity}
            <div className={this.props.activity.length ? "hidden" : "dashboard-placeholder" }>
              <p>Recent user activity will be shown here</p>
              <div id="activity-info" className="tooltip info">
                <FontIcon className="material-icons">info</FontIcon>
              </div>
              <img src="assets/img/activity.png" alt="activity" />
            </div>
          </div>
          
        </div>
      </div>
    );
  }
});

Activity.contextTypes = {
  router: PropTypes.object
};

module.exports = Activity;