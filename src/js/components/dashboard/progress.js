import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ProgressChart from '../deployments/progressChart';
import Time from 'react-time';
import Loader from '../common/loader';

// material ui
import { List, ListItem } from 'material-ui/List';

export default class Progress extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      devices: {},
      selectedDevice: {}
    };
  }
  _clickHandle(id) {
    var params = {};
    params.id = id;
    params.tab = 'active';
    params.route = 'deployments';
    params.open = true;
    this.props.clickHandle(params);
  }
  _formatTime(date) {
    if (date) {
      return date
        .replace(' ', 'T')
        .replace(/ /g, '')
        .replace('UTC', '');
    }
    return;
  }
  render() {
    var deployments = this.props.deployments || [];
    var progress = deployments.map(function(deployment, index) {
      var progressChart = <ProgressChart deployment={deployment} index={index} />;

      var deploymentInfo = (
        <div className="deploymentInfo" style={{ width: '240px', height: 'auto' }}>
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
            <Time className="progressTime" value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
          </div>
          <div style={{ marginTop: '15px' }}>
            <div className="progressLabel" />
            <a onClick={() => this._clickHandle(deployment.id)}>View report</a>
          </div>
        </div>
      );

      return (
        <div className="deployment" key={index}>
          <ListItem
            disabled={true}
            style={{ minHeight: '100px', paddingLeft: '280px', paddingBottom: '15px' }}
            primaryText={progressChart}
            leftIcon={deploymentInfo}
          />
        </div>
      );
    }, this);

    return (
      <div className="progress-container">
        <div className="dashboard-header">
          <h2>Deployments in progress</h2>
        </div>
        <div className={deployments.length ? 'fadeIn' : 'hidden'}>
          <List style={{ paddingTop: '0' }}>{progress}</List>
          <Link to="/deployments" className="float-right">
            All deployments in progress
          </Link>
        </div>

        <Loader show={this.props.loading} fade={true} />

        <div className={deployments.length || this.props.loading ? 'hidden' : 'dashboard-placeholder'}>
          <p>Monitor ongoing deployments from here</p>
          <img src="assets/img/deployments.png" alt="deployments" />
        </div>
      </div>
    );
  }
}
