import React from 'react';
import { Router, Route, Link } from 'react-router';

// material ui
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;

var Health = React.createClass({
  _clickHandle: function(route) {
    this.props.clickHandle(route);
  },
  _closeOnboard: function() {
    this.props.closeHandle("reviewDevices", true);
  },
  render: function() {
    var unauthorized_str = '';
    if (this.props.unauthorized.length) {
      if (this.props.unauthorized.length > 1) {
        unauthorized_str = 'are ' + this.props.unauthorized.length + ' devices';
      } else {
        unauthorized_str = 'is ' + this.props.unauthorized.length + ' device';
      }
    }
    return (
      <div className="health">
        <div className="dashboard-header">
          <h2>Devices <span className="dashboard-number">{this.props.health.total}</span></h2>
        </div>
          
        <div className={this.props.unauthorized.length && !this.props.hideReview ? "authorize onboard" : "hidden" }>
          <div className="close" onClick={this._closeOnboard}/>
          <p>There {unauthorized_str} waiting authorization</p>
          <RaisedButton onClick={this._clickHandle.bind(null, {route:"devices"})} primary={true} label="Review details" />
        </div>

        <div className={this.props.health.total ? null : "hidden" }>
          <div className="health-panel red" onClick={this._clickHandle.bind(null, {route:"devices", status:"down"})}>
            <span className="number">{this.props.health.down}</span>
            <span>down</span>
          </div>
          <div className="health-panel green" onClick={this._clickHandle.bind(null, {route:"devices", status:"up"})}>
            <span className="number">{this.props.health.up}</span>
            <span>up</span>
          </div>
          <div className="clear">
            <Link to="/devices" className="float-right">Manage devices</Link>
          </div>
        </div>

        <div className={this.props.health.total ? "hidden" : "dashboard-placeholder" }>
          <p>No connected devices yet</p>
          <img src="/assets/img/connected.png" alt="connected" />
        </div>
      </div>
    );
  }
});


Health.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Health;