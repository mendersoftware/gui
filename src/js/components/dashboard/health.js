import React from 'react';
import { Router, Route, Link } from 'react-router';

// material ui
var mui = require('material-ui');

var Health = React.createClass({
  _clickHandle: function(status) {
    this.props.clickHandle({route:"devices", status:status});
  },
  render: function() {
    return (
      <div className="health">
        <div className="dashboard-header">
          <h2>Devices <span className="dashboard-number">8</span></h2>
        </div>
        <div className="dashboard-container">
          <div className="health-panel red" onClick={this._clickHandle.bind(null, "down")}>
            <span className="number">{this.props.health.down}</span>
            <span>down</span>
          </div>
          <div className="health-panel green" onClick={this._clickHandle.bind(null, "up")}>
            <span className="number">{this.props.health.up}</span>
            <span>up</span>
          </div>
          <div className="health-panel lightestgrey">
            <span className={this.props.health.nogroup ? "number" : "hidden"} style={{marginRight:"0"}}>+</span>
            <span className="number">{this.props.health.nogroup}</span>
            <span>new</span>
          </div>
          <div className="clear">
            <Link to="/devices" className="float-right">Manage devices</Link>
          </div>
        </div>
      </div>
    );
  }
});


Health.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Health;