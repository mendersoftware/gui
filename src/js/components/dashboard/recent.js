import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import PropTypes from 'prop-types';
import RecentStats from './recentstats';
import Loader from '../common/loader';
import { formatTime } from '../../helpers';

export default class Recent extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      devices: {}
    };
  }

  render() {
    var deployments = this.props.deployments || [];
    var recent = deployments.map(function(deployment, index) {
      if (index < 3) {
        return (
          <Link className="deployment" key={index} to={`/deployments/finished/open=true&id=${deployment.id}`}>
            <div className="deploymentInfo">
              <div>
                <div className="progressLabel">Updating to:</div>
                {deployment.artifact_name}
              </div>
              <div>
                <div className="progressLabel">Device group:</div>
                {deployment.name}
              </div>
              <div>
                <div className="progressLabel">Started:</div>
                <Time className="progressTime" value={formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
              </div>
            </div>
            <RecentStats id={deployment.id} />
          </Link>
        );
      }
    }, this);
    return (
      <div>
        <div className="deployments-container">
          <div className="dashboard-header">
            <h2>Recent deployments</h2>
          </div>

          <Loader show={this.props.loading} fade={true} />

          <div className={deployments.length ? 'fadeIn' : 'hidden'}>
            <div className="block">{recent}</div>
            <Link to="/deployments/finished" className="float-right">
              All finished deployments
            </Link>
          </div>

          <div className={deployments.length || this.props.loading ? 'hidden' : 'dashboard-placeholder'}>
            <p>View the results of recent deployments here</p>
            <img src="assets/img/history.png" alt="recent" />
          </div>
        </div>
      </div>
    );
  }
}
