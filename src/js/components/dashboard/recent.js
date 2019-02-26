import React from 'react';
import { Link } from 'react-router';
import Time from 'react-time';

// material ui
import FontIcon from 'material-ui/FontIcon';

import DeploymentActivity from './deploymentactivity';

var RecentStats = require('./recentstats');
var Loader = require('../common/loader');

export default class Recent extends React.Component {
  render() {
    const self = this;
    var deployments = self.props.deployments || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setHours(-24 * 7);
    const deploymentsByDay = deployments.reduce(
      (accu, item) => {
        const creation = new Date(item.created);
        if (creation > today) {
          accu.today.push(item);
        } else if (creation > yesterday) {
          accu.yesterday.push(item);
        }
        return accu;
      },
      { today: [], yesterday: [] }
    );
    return (
      <div className={`deployments-container ${deployments.length ? 'fadeIn' : 'hidden'}`}>
        {Object.keys(deploymentsByDay).map(key =>
          deploymentsByDay[key].length ? <DeploymentActivity key={key} title={key} deployments={deploymentsByDay[key]} /> : null
        )}
        <Link to="/deployments/finished">View all deployments</Link>
      </div>
    );
  }
}
