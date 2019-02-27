import React from 'react';
import PropTypes from 'prop-types';
import Time from 'react-time';
import { Link } from 'react-router-dom';

// material ui
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import ListDivider from 'material-ui/Divider';

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default class Schedule extends React.Component {
  static contextTypes = {
    router: PropTypes.func
  };

  _clickHandle() {
    this.props.clickHandle(this.props.route);
  }
  _clickDeployment(e) {
    console.log(e);
  }
  render() {
    var schedule = this.props.deployments.map(function(deployment, index) {
      if (index < 5) {
        var group = `${deployment.group} (${deployment.devices.length})`;
        var month = new Date(deployment.start_time);
        month = monthNames[month.getMonth()];
        var last = this.props.deployments.length === index + 1 || index === 4;
        return (
          <div key={index}>
            <ListItem
              disabled={true}
              primaryText={deployment.artifact_name}
              secondaryText={group}
              onClick={e => this._clickDeployment(e)}
              leftIcon={
                <div style={{ width: 'auto', height: 'auto' }}>
                  <span className="day">
                    <Time value={deployment.start_time} format="DD" />
                  </span>
                  <span className="month">{month}</span>
                </div>
              }
              rightIcon={<Time style={{ top: '18', right: '22' }} value={deployment.start_time} format="HH:mm" />}
            />
            <ListDivider inset={true} className={last ? 'hidden' : null} />
          </div>
        );
      }
    }, this);
    return (
      <div className="deployments-container">
        <div className="dashboard-header subsection">
          <h3>
            Upcoming<span className="dashboard-number">{schedule.length}</span>
          </h3>
        </div>
        <div>
          <List>{schedule}</List>
          <div className={schedule.length ? 'hidden' : null}>
            <p className="italic">No deployments scheduled</p>
          </div>
          <div>
            <Link to="/deployments/schedule" className="float-right">
              View schedule
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
