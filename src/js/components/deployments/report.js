import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import isEqual from 'lodash.isequal';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@material-ui/core';
import { Block as BlockIcon } from '@material-ui/icons';

import { getDeviceAuth, getDeviceById } from '../../actions/deviceActions';
import { getDeviceLog, getSingleDeploymentDevices, getSingleDeploymentStats } from '../../actions/deploymentActions';
import { sortDeploymentDevices } from '../../helpers';
import DeploymentLog from './deployment-report/deploymentlog';
import DeploymentOverview from './deployment-report/overview';
import Review from './deployment-wizard/review';
import Confirm from './confirm';

momentDurationFormatSetup(moment);

export class DeploymentReport extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      aborting: false,
      deviceId: null,
      elapsed: moment(),
      showDialog: false,
      showPending: true,
      tabIndex: 'devices'
    };
  }

  componentDidMount() {
    var self = this;
    clearInterval(self.timer);
    clearInterval(self.timer2);
    if (!(self.props.deployment.finished || self.props.deployment.status === 'finished')) {
      self.timer = setInterval(() => self.setState({ elapsed: moment() }), 300);
      self.timer2 = this.props.past ? null : setInterval(() => self.refreshDeploymentDevices(), 5000);
    }
    self.refreshDeploymentDevices();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearInterval(this.timer2);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const mapToRelevance = ({ deployment, globalSettings, past }) => ({ deployment, globalSettings, past });
    const nextRelevant = mapToRelevance(nextProps);
    const thisRelevant = mapToRelevance(this.props);
    return !isEqual(thisRelevant, nextRelevant) || !isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps) {
    var self = this;
    if (
      prevProps.deployment.stats !== self.props.deployment.stats &&
      self.props.deployment.stats &&
      self.props.deployment.stats.downloading +
        self.props.deployment.stats.installing +
        self.props.deployment.stats.rebooting +
        self.props.deployment.stats.pending <=
        0
    ) {
      // if no more devices in "progress" statuses, deployment has finished, stop counter
      clearInterval(self.timer);
      clearInterval(self.timer2);
    }
  }

  refreshDeploymentDevices() {
    var self = this;
    if (!self.props.deployment.id) {
      return;
    }
    return Promise.all([self.props.getSingleDeploymentStats(self.props.deployment.id), self.props.getSingleDeploymentDevices(self.props.deployment.id)]);
  }

  viewLog(id) {
    const self = this;
    return self.props.getDeviceLog(self.props.deployment.id, id).then(() => self.setState({ showDialog: true, deviceId: id }));
  }

  render() {
    const self = this;
    const { abort, allDevices, contentClass, deployment, onClose, retry, type } = self.props;
    const { created = new Date().toISOString(), devices } = deployment;
    const { aborting, deviceId, elapsed, showDialog, tabIndex } = self.state;
    const logData = deviceId ? devices[deviceId].log : null;
    const duration = moment.duration(elapsed.diff(moment(created)));
    return (
      <Dialog open={true} fullWidth={true} maxWidth="lg">
        <DialogTitle>{`Deployment ${type !== 'scheduled' ? 'details' : 'report'}`}</DialogTitle>
        <DialogContent className={contentClass} style={{ overflow: 'hidden' }}>
          {type !== 'scheduled' && (
            <Tabs value={tabIndex} onChange={(e, tabIndex) => self.setState({ tabIndex })}>
              <Tab label="Devices overview" value="devices" />
              <Tab label="Deployment details" value="details" />
            </Tabs>
          )}
          {tabIndex === 'devices' && (
            <DeploymentOverview
              duration={duration}
              onAbortClick={() => abort(deployment.id)}
              onRetryClick={() => retry(deployment, Object.values(allDevices))}
              viewLog={id => self.viewLog(id)}
              {...self.props}
            />
          )}
          {tabIndex === 'details' && (
            <div className="margin-left margin-right">
              <Review deploymentDeviceIds={Object.keys(allDevices)} group={deployment.name} {...self.props} />
            </div>
          )}
          {type === 'scheduled' && (
            <div className="margin-left-large margin-top">
              {aborting ? (
                <Confirm cancel={() => self.setState({ aborting: !aborting })} action={() => abort(deployment.id)} type="abort" />
              ) : (
                <Button color="secondary" variant="contained" onClick={() => self.setState({ aborting: !aborting })} startIcon={<BlockIcon fontSize="small" />}>
                  Abort deployment
                </Button>
              )}
            </div>
          )}
          {showDialog && <DeploymentLog logData={logData} onClose={() => self.setState({ showDialog: false })} />}
        </DialogContent>
        <DialogActions>
          <Button key="report-action-button-1" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const actionCreators = { getDeviceAuth, getDeviceById, getDeviceLog, getSingleDeploymentDevices, getSingleDeploymentStats };

const mapStateToProps = state => {
  const devices = state.deployments.byId[state.deployments.selectedDeployment]?.devices || {};
  const allDevices = sortDeploymentDevices(Object.values(devices));
  const deployment = state.deployments.byId[state.deployments.selectedDeployment] || {};
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    allDevices,
    deviceCount: allDevices.length,
    devicesById: state.devices.byId,
    deployment,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    isHosted: state.app.features.isHosted,
    release: deployment.artifact_name ? state.releases.byId[deployment.artifact_name] : {}
  };
};

export default connect(mapStateToProps, actionCreators)(DeploymentReport);
