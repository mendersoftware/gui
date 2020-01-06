import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import CopyToClipboard from 'react-copy-to-clipboard';

import pluralize from 'pluralize';
import isEqual from 'lodash.isequal';
import differenceWith from 'lodash.differencewith';

// material ui
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Block as BlockIcon, Timelapse as TimelapseIcon, Refresh as RefreshIcon } from '@material-ui/icons';

import { getDeviceAuth, getDeviceById } from '../../actions/deviceActions';
import { getDeviceLog, getSingleDeploymentDevices, getSingleDeploymentStats } from '../../actions/deploymentActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { formatTime, sortDeploymentDevices } from '../../helpers';
import Pagination from '../common/pagination';
import DeploymentStatus from './deploymentstatus';
import DeviceList from './deploymentdevicelist';
import Confirm from './confirm';

export class DeploymentReport extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      abort: false,
      deviceId: null,
      currentPage: 1,
      elapsed: 0,
      finished: false,
      perPage: 20,
      showDialog: false,
      showPending: true,
      start: 0,
      pagedDevices: []
    };
  }
  componentDidMount() {
    var self = this;
    self.timer;
    if (self.props.past) {
      self.setState({ finished: true });
    } else {
      self.timer = setInterval(() => this.tick(), 50);
    }
    this.timer2 = this.props.past ? null : setInterval(() => self.refreshDeploymentDevices(), 5000);
    this.refreshDeploymentDevices();
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
  tick() {
    var now = new Date();
    var then = new Date(this.props.deployment.created);

    // TODO refactor using momentjs:
    // get difference in seconds
    var difference = (now.getTime() - then.getTime()) / 1000;

    // Calculate the number of days left
    var days = Math.floor(difference / 86400);
    // After deducting the days calculate the number of hours left
    var hours = Math.floor((difference - days * 86400) / 3600);
    // After days and hours , how many minutes are left
    var minutes = Math.floor((difference - days * 86400 - hours * 3600) / 60);
    // Finally how many seconds left after removing days, hours and minutes.
    var secs = Math.floor(difference - days * 86400 - hours * 3600 - minutes * 60);
    secs = `0${secs}`.slice(-2);
    // Only show days if exists
    days = days ? `${days}d ` : '';

    var x = `${days + hours}h ${minutes}m ${secs}s`;
    this.setState({ elapsed: x });
  }
  refreshDeploymentDevices() {
    var self = this;

    return self.props.getSingleDeploymentDevices(self.props.deployment.id).then(() => self._handlePageChange(self.state.currentPage));
  }
  _getDeviceAttribute(device, attributeName) {
    return device.attributes ? device.attributes[attributeName] : '-';
  }
  _getDeviceDetails(devices) {
    // get device artifact, inventory and identity details not listed in schedule data
    devices.map(device => Promise.all([this.props.getDeviceById(device.id), this.props.getDeviceAuth(device.id)]));
  }

  _filterPending(device) {
    return device.status !== DEVICE_STATES.pending;
  }
  _handleCheckbox(checked) {
    this.setState({ showPending: checked, currentPage: 1 });
    this.refreshDeploymentDevices();
  }
  viewLog(id) {
    const self = this;
    return self.props.getDeviceLog(this.props.deployment.id, id).then(() => self.setState({ showDialog: true, copied: false, deviceId: id }));
  }
  exportLog(content) {
    const uriContent = `data:application/octet-stream,${encodeURIComponent(content)}`;
    window.open(uriContent, 'deviceLog');
  }

  _setFinished(bool) {
    // deployment has finished, stop counter
    clearInterval(this.timer);
    clearInterval(this.timer2);
    this.setState({ finished: bool });
  }
  _handlePageChange(pageNo) {
    var start = pageNo * this.state.perPage - this.state.perPage;
    var end = Math.min(this.props.deviceCount, pageNo * this.state.perPage);
    // cut slice from full list of devices
    const devices = this.state.showPending ? this.props.allDevices : this.props.allDevices.filter(this._filterPending);
    const slice = devices.slice(start, end);
    const self = this;
    const lackingData = this.state.pagedDevices.reduce((accu, device) => {
      if (!self.props.devicesById[device.id].identity_data || Object.keys(self.props.devicesById[device.id].attributes).length === 0) {
        accu.push(device);
      }
      return accu;
    }, []);
    if (!isEqual(slice, this.state.pagedDevices) || lackingData.length) {
      var diff = differenceWith(slice, this.state.pagedDevices, isEqual);
      // only update those that have changed
      this._getDeviceDetails(diff.concat(lackingData));
    }
    this.setState({ currentPage: pageNo, start: start, end: end, pagedDevices: slice });
  }
  _abortHandler() {
    this.props.abort(this.props.deployment.id);
  }
  render() {
    const self = this;
    const { allDevices, deployment, deviceCount } = self.props;
    const { stats = {}, devices } = deployment;
    const { deviceId, showDialog } = self.state;
    const logData = deviceId ? devices[deviceId].log : null;
    var deviceList = this.state.pagedDevices || [];

    var encodedArtifactName = encodeURIComponent(deployment.artifact_name);
    var artifactLink = (
      <Link style={{ fontWeight: '500' }} to={`/releases/${encodedArtifactName}`}>
        {deployment.artifact_name}
      </Link>
    );

    var checkboxLabel = 'Show pending devices';

    var logActions = [
      <div key="log-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => self.setState({ showDialog: false })}>Cancel</Button>
      </div>,
      <CopyToClipboard
        key="log-action-button-2"
        style={{ marginRight: '10px', display: 'inline-block' }}
        text={logData}
        onCopy={() => self.setState({ copied: true })}
      >
        <Button>Copy to clipboard</Button>
      </CopyToClipboard>,
      <Button variant="contained" key="log-action-button-3" color="primary" onClick={() => self.exportLog(logData)}>
        Export log
      </Button>
    ];

    var abort = (
      <div className="float-right">
        <Button
          color="secondary"
          onClick={() => self.setState({ abort: true })}
          icon={<BlockIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}
        >
          Abort deployment
        </Button>
      </div>
    );
    if (self.state.abort) {
      abort = <Confirm cancel={() => self.setState({ abort: false })} action={() => self._abortHandler()} type="abort" />;
    }

    var finished = '-';
    if (deployment.finished) {
      finished = <Time value={formatTime(deployment.finished)} format="YYYY-MM-DD HH:mm" />;
    }

    return (
      <div>
        <div className="report-container">
          <div className="deploymentInfo" style={{ width: '240px', height: 'auto', margin: '30px 30px 30px 0', display: 'inline-block', verticalAlign: 'top' }}>
            <div>
              <div className="progressLabel">Updating to:</div>
              <span>{artifactLink}</span>
            </div>
            <div>
              <div className="progressLabel">Device group:</div>
              <span>{deployment.name}</span>
            </div>
            <div>
              <div className="progressLabel"># devices:</div>
              <span>{deviceCount}</span>
            </div>
          </div>

          {this.props.past ? (
            <div className="inline">
              <div className="inline">
                <div
                  className="deploymentInfo"
                  style={{ width: '260px', height: 'auto', margin: '30px 30px 30px 0', display: 'inline-block', verticalAlign: 'top' }}
                >
                  <div>
                    <div className="progressLabel">Status:</div>Finished {stats.failure ? <span className="failures">with failures</span> : null}
                  </div>
                  <div>
                    <div className="progressLabel">Started:</div>
                    <Time value={formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
                  </div>
                  <div>
                    <div className="progressLabel">Finished:</div>
                    {finished}
                  </div>
                </div>
                <div className="deploymentInfo" style={{ height: 'auto', margin: '30px 30px 30px 0', display: 'inline-block', verticalAlign: 'top' }}>
                  {stats.failure || stats.aborted ? (
                    <div className="statusLarge">
                      <img src="assets/img/largeFail.png" />
                      <div className="statusWrapper">
                        <b className="red">{stats.failure || stats.aborted}</b> {pluralize('devices', stats.failure)} failed to update
                      </div>

                      <div>
                        <div
                          id="reportRetry"
                          className={
                            this.state.retry
                              ? 'float-right hint--bottom hint--always hint--large hint--info'
                              : 'float-right hint--bottom hint--large hint--info'
                          }
                          data-hint="This will create a new deployment with the same device group and Release.&#10;Devices with this Release already installed will be skipped, all others will be updated."
                        >
                          <Button
                            color="secondary"
                            icon={<RefreshIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}
                            onClick={() => self.props.retry(deployment, allDevices)}
                          >
                            Retry deployment?
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {stats.success ? (
                    <div className="statusLarge">
                      <img src="assets/img/largeSuccess.png" />
                      <div className="statusWrapper">
                        <b className="green">
                          {stats.success === deviceList.length ? <span>All </span> : null}
                          {stats.success}
                        </b>{' '}
                        {pluralize('devices', stats.success)} updated successfully
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="hidden" style={{ width: '240px', height: 'auto', margin: '30px 0 30px 30px', display: 'inline-block', verticalAlign: 'top' }}>
                  <Checkbox label="Show only failures" onChange={(e, checked) => this._handleCheckbox(checked)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="inline">
              <div className="progressStatus">
                <div id="progressStatus">
                  <h3 style={{ marginTop: '12px' }}>{this.state.finished ? 'Finished' : 'In progress'}</h3>
                  <h2>
                    <TimelapseIcon style={{ margin: '0 10px 0 -10px', color: '#ACD4D0', verticalAlign: 'text-top' }} />
                    {this.state.elapsed}
                  </h2>
                  <div>
                    Started:
                    <Time value={formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" />
                  </div>
                </div>
                <div className="inline-block">
                  <DeploymentStatus
                    isActiveTab={true}
                    setFinished={finished => this._setFinished(finished)}
                    finished={this.state.finished}
                    refresh={true}
                    vertical={true}
                    id={deployment.id}
                    stats={stats}
                    refreshStatus={id => self.props.getSingleDeploymentStats(id)}
                  />
                </div>
              </div>

              <div className="hidden" style={{ width: '240px', height: 'auto', margin: '30px 0 30px 30px', display: 'inline-block', verticalAlign: 'top' }}>
                <Checkbox label={checkboxLabel} onChange={(e, checked) => this._handleCheckbox(checked)} />
                <p style={{ marginLeft: '40px' }} className={deviceCount - allDevices.length ? 'info' : 'hidden'}>
                  {deviceCount - allDevices.length} devices pending
                </p>
              </div>

              {!this.state.finished ? (
                <div
                  id="reportAbort"
                  className={this.state.abort ? 'hint--bottom hint--always hint--large hint--info' : 'hint--bottom hint--large hint--info'}
                  data-hint="Devices that have not yet started the deployment will not start the deployment.&#10;Devices that have already completed the deployment are not affected by the abort.&#10;Devices that are in the middle of the deployment at the time of abort will finish deployment normally, but will perform a rollback."
                >
                  {abort}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {(deviceCount || deployment.deviceCount || !!deviceList.length) && (
          <div style={{ minHeight: '20vh' }}>
            <DeviceList created={deployment.created} status={deployment.status} devices={deviceList} viewLog={id => this.viewLog(id)} past={this.props.past} />
            <Pagination
              count={deviceCount || deployment.device_count}
              rowsPerPage={self.state.perPage}
              onChangeRowsPerPage={perPage => self.setState({ perPage }, () => self._handlePageChange(1))}
              page={self.state.currentPage}
              onChangePage={page => self._handlePageChange(page)}
            />
          </div>
        )}

        <Dialog open={showDialog}>
          <DialogTitle>Deployment log for device</DialogTitle>
          <DialogContent>
            <div className="code log">{logData}</div>
            <p style={{ marginLeft: '24px' }}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
          </DialogContent>
          <DialogActions>{logActions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}

const actionCreators = { getDeviceAuth, getDeviceById, getDeviceLog, getSingleDeploymentDevices, getSingleDeploymentStats };

const mapStateToProps = (state, ownProps) => {
  const allDevices = sortDeploymentDevices(Object.values(state.deployments.byId[ownProps.deployment.id].devices || {}));
  return {
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    allDevices,
    deviceCount: allDevices.length,
    devicesById: state.devices.byId,
    deployment: state.deployments.byId[ownProps.deployment.id]
  };
};

export default connect(mapStateToProps, actionCreators)(DeploymentReport);
