import React from 'react';
var Time = require('react-time');
import { Router, Route, Link } from 'react-router';

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var ListDivider = mui.ListDivider;
var FontIcon = mui.FontIcon;


var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];


var Schedule = React.createClass({
  _clickHandle: function() {
    this.props.clickHandle(this.props.route);
  },
  _clickUpdate: function(e) {
    console.log(e);
  },
  render: function() {
    var schedule = this.props.updates.map(function(update, index) {
      if (index<5) {
        var group = update.group + " (" + update.devices.length + ")";
        var month = new Date(update.start_time);
        month = monthNames[month.getMonth()];
        var last = (this.props.updates.length === index+1) || index===4;
        return (
          <div key={index}>
            <ListItem
              disabled={true}
              primaryText={update.software_version}
              secondaryText={group}
              onClick={this._clickUpdate}
              leftIcon={<div style={{width:"auto", height:"auto"}}><span className="day"><Time value={update.start_time} format="DD" /></span><span className="month">{month}</span></div>}
              rightIcon={<Time style={{top:"18", right:"22"}} value={update.start_time} format="HH:mm" />} />
            <ListDivider inset={true} className={last ? "hidden" : null} />
          </div>
        )
      }
    }, this);
    return (
      <div className="updates-container">
        <div className="dashboard-header subsection">
          <h3>Upcoming<span className="dashboard-number">{schedule.length}</span></h3>
        </div>
        <div>
          <List>
            {schedule}
          </List>
          <div className={schedule.length ? 'hidden' : null}>
            <p className="italic">No updates scheduled</p>
          </div>
          <div>
            <Link to="/updates/schedule" className="float-right">View schedule</Link>
          </div>
        </div>
      </div>
    );
  }
});

Schedule.contextTypes = {
  router: React.PropTypes.func
};

module.exports = Schedule;