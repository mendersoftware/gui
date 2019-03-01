import React from 'react';
import { Link } from 'react-router';

import Loader from '../common/loader';
import DeploymentActivity from './deploymentactivity';

export default class Recent extends React.Component {
  render() {
    const self = this;
    const { deployments, loading } = self.props;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setHours(-24);
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
    return loading ? (
      <Loader show={loading} fade={true} />
    ) : (
      <div>
        <div className={deployments.length || loading ? 'hidden' : 'dashboard-placeholder'}>
          <p>No recent deployment activity</p>
          <Link to="/deployments">Go to deployments</Link>
        </div>
        <div className={`deployments-container ${deployments.length ? 'fadeIn' : 'hidden'}`}>
          {Object.keys(deploymentsByDay).map(key =>
            deploymentsByDay[key].length ? <DeploymentActivity key={key} title={key} deployments={deploymentsByDay[key]} /> : null
          )}
          <Link to="/deployments/finished">View all deployments</Link>
        </div>
      </div>
    );
  }
}
