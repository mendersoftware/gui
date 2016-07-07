import React from 'react';
import { Router, Route, Link } from 'react-router';

var Health = React.createClass({
  _clickHandle: function(route) {
    this.props.clickHandle(route);
  },
  render: function() {
    var down = encodeURIComponent("status=not connected");
    var up = encodeURIComponent("status=connected");
    return (
      <div className="health margin-bottom-large">
        <div className="dashboard-header">
          <h2>Device heartbeats</h2>
        </div>

        <div className={this.props.health.total ? null : "hidden" }>
          <div className={this.props.health.down ? "health-panel red" : "hidden" }>
            <div className="health-icon down"></div>
            <div className="health-text">
              <span className="number">{this.props.health.down}</span>
              <span>Not connected</span>
            </div>
            <Link to={`/devices/${down}`} className="float-right">View devices</Link>
          </div>
          <div style={{padding: "0 4%"}} className={this.props.health.down ? "hidden" : "margin-bottom margin-top" }>
            <div className="health-icon healthy">
              <img src="assets/img/check.png" />
            </div>
            <div className="health-text">
              <span>All {this.props.health.total} of your devices are reporting</span>
            </div>
        
          </div>
          <div className="health-panel green">
            <div className="health-icon down"></div>
            <div className="health-text">
              <span className="number">{this.props.health.up}</span>
              <span>Connected</span>
            </div>
            <Link to={`/devices/${up}`} className={this.props.health.up ? "float-right" : "hidden" }>View devices</Link>
          </div>
          <div className="clear">
          </div>
        </div>

        <div className={this.props.health.total ? "hidden" : "dashboard-placeholder" }>
          <p>No connected devices yet</p>
          <img src="assets/img/connected.png" alt="connected" />
        </div>
      </div>
    );
  }
});


Health.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Health;