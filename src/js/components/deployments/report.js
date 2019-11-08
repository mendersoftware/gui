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

import { getDeviceById } from '../../actions/deviceActions';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { formatTime } from '../../helpers';
import Pagination from '../common/pagination';
import DeploymentStatus from './deploymentstatus';
import DeviceList from './deploymentdevicelist';
import Confirm from './confirm';

class DeploymentReport extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      stats: {
        failure: null
      },
      showDialog: false,
      logData: '',
      elapsed: 0,
      currentPage: 1,
      start: 0,
      perPage: 20,
      deviceCount: 0,
      showPending: true,
      abort: false,
      finished: false
    };
  }
  componentDidMount() {
    var self = this;
    self.timer;
    if (self.props.past) {
      AppActions.getSingleDeploymentStats(self.props.deployment.id).then(stats => self.setState({ stats, finished: true }));
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

    return AppActions.getSingleDeploymentDevices(self.props.deployment.id).then(devices => {
      var sortedDevices = AppStore.getOrderedDeploymentDevices(devices);
      sortedDevices = self.state.showPending ? sortedDevices : sortedDevices.filter(self._filterPending);
      self.setState({ allDevices: sortedDevices, deviceCount: devices.length });
      self._handlePageChange(self.state.currentPage);
    });
  }
  _getDeviceAttribute(device, attributeName) {
    var none = '-';
    const artifact = device.attributes ? device.attributes.find(attribute => attribute.name === attributeName) : null;
    return artifact ? artifact.value : none;
  }
  _getDeviceDetails(devices) {
    // get device artifact and inventory details not listed in schedule data
    devices.map(device => this.props.getDeviceById(device.id));
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
    return AppActions.getDeviceLog(this.props.deployment.id, id).then(logData => self.setState({ showDialog: true, logData, copied: false }));
  }
  exportLog() {
    var content = this.state.logData;
    var uriContent = `data:application/octet-stream,${encodeURIComponent(content)}`;
    window.open(uriContent, 'deviceLog');
  }
  dialogDismiss() {
    this.setState({
      showDialog: false,
      logData: null
    });
  }
  _setFinished(bool) {
    // deployment has finished, stop counter
    clearInterval(this.timer);
    clearInterval(this.timer2);
    this.setState({ finished: bool });
  }
  _handlePageChange(pageNo) {
    var start = pageNo * this.state.perPage - this.state.perPage;
    var end = Math.min(this.state.allDevices.length, pageNo * this.state.perPage);
    // cut slice from full list of devices
    var slice = this.state.allDevices.slice(start, end);
    if (!isEqual(slice, this.state.pagedDevices)) {
      var diff = differenceWith(slice, this.state.pagedDevices, isEqual);
      // only update those that have changed
      this._getDeviceDetails(diff);
    }
    this.setState({ currentPage: pageNo, start: start, end: end, pagedDevices: slice });
  }
  _abortHandler() {
    this.props.abort(this.props.deployment.id);
  }
  render() {
    const self = this;
    var deviceList = this.state.pagedDevices || [];
    var allDevices = this.state.allDevices || [];

    var encodedArtifactName = encodeURIComponent(this.props.deployment.artifact_name);
    var artifactLink = (
      <Link style={{ fontWeight: '500' }} to={`/releases/${encodedArtifactName}`}>
        {this.props.deployment.artifact_name}
      </Link>
    );

    var checkboxLabel = 'Show pending devices';

    var logActions = [
      <div key="log-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this.dialogDismiss('dialog')}>Cancel</Button>
      </div>,
      <CopyToClipboard
        key="log-action-button-2"
        style={{ marginRight: '10px', display: 'inline-block' }}
        text={this.state.logData}
        onCopy={() => this.setState({ copied: true })}
      >
        <Button>Copy to clipboard</Button>
      </CopyToClipboard>,
      <Button variant="contained" key="log-action-button-3" color="primary" onClick={() => this.exportLog()}>
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
    if (this.state.abort) {
      abort = <Confirm cancel={() => self.setState({ abort: false })} action={() => this._abortHandler()} type="abort" />;
    }

    var finished = '-';
    if (this.props.deployment.finished) {
      finished = <Time value={formatTime(this.props.deployment.finished)} format="YYYY-MM-DD HH:mm" />;
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
              <span>{this.props.deployment.name}</span>
            </div>
            <div>
              <div className="progressLabel"># devices:</div>
              <span>{this.state.deviceCount}</span>
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
                    <div className="progressLabel">Status:</div>Finished {this.state.stats.failure ? <span className="failures">with failures</span> : null}
                  </div>
                  <div>
                    <div className="progressLabel">Started:</div>
                    <Time value={formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" />
                  </div>
                  <div>
                    <div className="progressLabel">Finished:</div>
                    {finished}
                  </div>
                </div>
                <div className="deploymentInfo" style={{ height: 'auto', margin: '30px 30px 30px 0', display: 'inline-block', verticalAlign: 'top' }}>
                  {this.state.stats.failure || this.state.stats.aborted ? (
                    <div className="statusLarge">
                      <img src="assets/img/largeFail.png" />
                      <div className="statusWrapper">
                        <b className="red">{this.state.stats.failure || this.state.stats.aborted}</b> {pluralize('devices', this.state.stats.failure)} failed to
                        update
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
                            onClick={() => self.props.retry(self.props.deployment, self.state.allDevices)}
                          >
                            Retry deployment?
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {this.state.stats.success ? (
                    <div className="statusLarge">
                      <img src="assets/img/largeSuccess.png" />
                      <div className="statusWrapper">
                        <b className="green">
                          {this.state.stats.success === deviceList.length ? <span>All </span> : null}
                          {this.state.stats.success}
                        </b>{' '}
                        {pluralize('devices', this.state.stats.success)} updated successfully
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
                    <Time value={formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" />
                  </div>
                </div>
                <div className="inline-block">
                  <DeploymentStatus
                    isActiveTab={true}
                    setFinished={finished => this._setFinished(finished)}
                    finished={this.state.finished}
                    refresh={true}
                    vertical={true}
                    id={this.props.deployment.id}
                  />
                </div>
              </div>

              <div className="hidden" style={{ width: '240px', height: 'auto', margin: '30px 0 30px 30px', display: 'inline-block', verticalAlign: 'top' }}>
                <Checkbox label={checkboxLabel} onChange={(e, checked) => this._handleCheckbox(checked)} />
                <p style={{ marginLeft: '40px' }} className={this.state.deviceCount - allDevices.length ? 'info' : 'hidden'}>
                  {this.state.deviceCount - allDevices.length} devices pending
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

        <div style={{ minHeight: '20vh' }}>
          <DeviceList
            created={this.props.deployment.created}
            status={this.props.deployment.status}
            devices={deviceList}
            viewLog={id => this.viewLog(id)}
            past={this.props.past}
          />
          {allDevices.length ? (
            <Pagination
              count={allDevices.length}
              rowsPerPage={self.state.perPage}
              onChangeRowsPerPage={perPage => self.setState({ currentPage: 1, perPage })}
              page={self.state.currentPage}
              onChangePage={page => self._handlePageChange(page)}
            />
          ) : null}
        </div>

        <Dialog open={this.state.showDialog}>
          <DialogTitle>Deployment log for device</DialogTitle>
          <DialogContent>
            <div className="code log">{this.state.logData}</div>
            <p style={{ marginLeft: '24px' }}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
          </DialogContent>
          <DialogActions>{logActions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}

const actionCreators = { getDeviceById };

const mapStateToProps = state => {
  return {
    acceptedDevicesCount: state.devices.byStatus.accepted.total
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(DeploymentReport);
