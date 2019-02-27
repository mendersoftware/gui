import React from 'react';
import PropTypes from 'prop-types';
import Time from 'react-time';

export default class Activity extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };
  _clickHandle() {
    this.props.clickHandle();
  }

  render() {
    var activity = this.props.activity.map((log, index) => {
      return (
        <div key={index} className="activityWrapper">
          <div className={log.negative ? 'activityEntry negative' : 'activityEntry'}>
            <p className="summary">{log.summary}</p>
            <p>{log.details}</p>
          </div>
          <Time style={{ fontSize: '12' }} className="activityTime" value={log.timestamp} format="YYYY-MM-DD HH:mm" />
        </div>
      );
    });
    return (
      <div style={{ position: 'relative' }} className="activity-log">
        <div className="dashboard-header">
          <h2 className="inline-block">User activity</h2>
        </div>
        <div>
          <div className="margin-bottom">
            {activity}
            <div className={this.props.activity.length ? 'hidden' : 'dashboard-placeholder'}>
              <p>Recent user activity will be shown here</p>
              <img src="assets/img/activity.png" alt="activity" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
