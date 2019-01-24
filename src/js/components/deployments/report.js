import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import CopyToClipboard from 'react-copy-to-clipboard';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import DeploymentStatus from './deploymentstatus';
import DeviceList from './deploymentdevicelist';
import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';
import pluralize from 'pluralize';
import update from 'react-addons-update';
import isEqual from 'lodash.isequal';
import differenceWith from 'lodash.differencewith';
import ConfirmAbort from './confirmabort';
import ConfirmRetry from './confirmretry';

// material ui
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import FontIcon from 'material-ui/FontIcon';
import BlockIcon from 'react-material-icons/icons/content/block';
import RefreshIcon from 'react-material-icons/icons/navigation/refresh';
import { AppContext } from '../../contexts/app-context';

export default class DeploymentReport extends React.Component {
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
    this.timer2 = this.props.past ? null : setInterval(self.refreshDeploymentDevices, 5000);
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
    const artifact = device.attributes.find(attribute => attribute.name === attributeName);
    return artifact ? artifact.value : none;
  }
  _getDeviceDetails(devices) {
    var self = this;
    // get device artifact and inventory details not listed in schedule data
    devices.forEach(device => self._setSingleDeviceDetails(device.id));
  }
  _setSingleDeviceDetails(id) {
    var self = this;
    const getInventory = AppActions.getDeviceById(id)
      .then(device_inventory => {
        var artifact = self._getDeviceAttribute(device_inventory, 'artifact_name');
        var device_type = self._getDeviceAttribute(device_inventory, 'device_type');
        var deviceInventory = self.state.deviceInventory || {};
        var inventory = { device_type: device_type, artifact: artifact };

        if (!self.state.stopRestCalls) {
          self.setState({
            deviceInventory: update(deviceInventory, { [id]: { $set: inventory } })
          });
        }
      })
      .catch(err => console.log('error ', err));

    const getAuthData = AppActions.getDeviceAuth(id)
      .then(data => {
        var deviceIdentity = self.state.deviceIdentity || {};
        if (!self.state.stopRestCalls) {
          self.setState({
            deviceIdentity: update(deviceIdentity, { [id]: { $set: data.identity_data } })
          });
        }
      })
      .catch(err => console.log(`Error: ${err}`));
    return Promise.all([getInventory, getAuthData]);
  }
  _filterPending(device) {
    return device.status !== 'pending';
  }
  _handleCheckbox(e, checked) {
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
      logData: null,
      stopRestCalls: true
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
  _formatTime(date) {
    if (date) {
      return date
        .replace(' ', 'T')
        .replace(/ /g, '')
        .replace('UTC', '');
    }
    return;
  }
  updatedList() {
    // use to make sure parent re-renders dialog when device list built
    this.props.updated();
  }
  _abortHandler() {
    this.props.abort(this.props.deployment.id);
  }
  _handleRetry() {
    this.props.retry(this.props.deployment, this.state.allDevices);
  }
  _hideConfirm(ref) {
    var self = this;
    var newState = {};
    newState[ref] = false;
    this.setState(newState);
    setTimeout(() => {
      self.setState(newState);
    }, 150);
  }
  _showConfirm(ref) {
    var newState = {};
    newState[ref] = true;
    this.setState(newState);
  }
  render() {
    var deviceList = this.state.pagedDevices || [];
    var allDevices = this.state.allDevices || [];

    var encodedArtifactName = encodeURIComponent(this.props.deployment.artifact_name);
    var artifactLink = (
      <Link style={{ fontWeight: '500' }} to={`/artifacts/${encodedArtifactName}`}>
        {this.props.deployment.artifact_name}
      </Link>
    );

    var checkboxLabel = 'Show pending devices';

    var logActions = [
      <div key="log-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <FlatButton label="Cancel" onClick={() => this.dialogDismiss('dialog')} />
      </div>,
      <CopyToClipboard
        key="log-action-button-2"
        style={{ marginRight: '10px', display: 'inline-block' }}
        text={this.state.logData}
        onCopy={() => this.setState({ copied: true })}
      >
        <FlatButton label="Copy to clipboard" />
      </CopyToClipboard>,
      <RaisedButton key="log-action-button-3" label="Export log" primary={true} onClick={() => this.exportLog()} />
    ];

    var abort = (
      <div className="float-right">
        <FlatButton
          label="Abort deployment"
          secondary={true}
          onClick={() => this._showConfirm('abort')}
          icon={<BlockIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}
        />
      </div>
    );
    if (this.state.abort) {
      abort = <ConfirmAbort cancel={() => this._hideConfirm('abort')} abort={() => this._abortHandler()} />;
    }

    var finished = '-';
    if (this.props.deployment.finished) {
      finished = <Time value={this._formatTime(this.props.deployment.finished)} format="YYYY-MM-DD HH:mm" />;
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
                    <div className="progressLabel">Status:</div>Finished<span className={this.state.stats.failure ? 'failures' : 'hidden'}> with failures</span>
                  </div>
                  <div>
                    <div className="progressLabel">Started:</div>
                    <Time value={this._formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" />
                  </div>
                  <div>
                    <div className="progressLabel">Finished:</div>
                    {finished}
                  </div>
                </div>
                <div className="deploymentInfo" style={{ height: 'auto', margin: '30px 30px 30px 0', display: 'inline-block', verticalAlign: 'top' }}>
                  <div className={this.state.stats.failure || this.state.stats.aborted ? 'statusLarge' : 'hidden'}>
                    <img src="assets/img/largeFail.png" />
                    <div className="statusWrapper">
                      <b className="red">{this.state.stats.failure || this.state.stats.aborted}</b> {pluralize('devices', this.state.stats.failure)} failed to
                      update
                    </div>

                    <div>
                      <div
                        id="reportRetry"
                        className={
                          this.state.retry ? 'float-right hint--bottom hint--always hint--large hint--info' : 'float-right hint--bottom hint--large hint--info'
                        }
                        data-hint="This will create a new deployment with the same device group and Artifact.&#10;Devices with this Artifact already installed will be skipped, all others will be updated."
                      >
                        {this.state.retry ? (
                          <ConfirmRetry cancel={() => this._hideConfirm('retry')} retry={() => this._handleRetry()} />
                        ) : (
                          <FlatButton
                            label="Retry deployment?"
                            secondary={true}
                            icon={<RefreshIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}
                            onClick={() => this._showConfirm('retry')}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={this.state.stats.success ? 'statusLarge' : 'hidden'}>
                    <img src="assets/img/largeSuccess.png" />
                    <div className="statusWrapper">
                      <b className="green">
                        <span className={this.state.stats.success === deviceList.length ? null : 'hidden'}>All </span>
                        {this.state.stats.success}
                      </b>{' '}
                      {pluralize('devices', this.state.stats.success)} updated successfully
                    </div>
                  </div>
                </div>

                <div className="hidden" style={{ width: '240px', height: 'auto', margin: '30px 0 30px 30px', display: 'inline-block', verticalAlign: 'top' }}>
                  <Checkbox label="Show only failures" onCheck={(e, checked) => this._handleCheckbox(e, checked)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="inline">
              <div className="progressStatus">
                <div id="progressStatus">
                  <h3 style={{ marginTop: '12px' }}>{this.state.finished ? 'Finished' : 'In progress'}</h3>
                  <h2>
                    <FontIcon className="material-icons" style={{ margin: '0 10px 0 -10px', color: '#ACD4D0', verticalAlign: 'text-top' }}>
                      timelapse
                    </FontIcon>
                    {this.state.elapsed}
                  </h2>
                  <div>
                    Started:
                    <Time value={this._formatTime(this.props.deployment.created)} format="YYYY-MM-DD HH:mm" />
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
                <Checkbox label={checkboxLabel} onCheck={(e, checked) => this._handleCheckbox(e, checked)} />
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
          <AppContext.Consumer>
            {(docsVersion, globalSettings) => (
              <DeviceList
                docsVersion={docsVersion}
                globalSettings={globalSettings}
                created={this.props.deployment.created}
                status={this.props.deployment.status}
                devices={deviceList}
                deviceIdentity={this.state.deviceIdentity}
                deviceInventory={this.state.deviceInventory}
                viewLog={id => this.viewLog(id)}
                finished={() => this.updatedList()}
                past={this.props.past}
              />
            )}
          </AppContext.Consumer>
          {allDevices.length ? (
            <Pagination
              locale={_en_US}
              simple
              pageSize={this.state.perPage}
              current={this.state.currentPage || 1}
              total={allDevices.length}
              onChange={page => this._handlePageChange(page)}
            />
          ) : null}
        </div>

        <Dialog
          title="Deployment log for device"
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          open={this.state.showDialog}
          actions={logActions}
          bodyStyle={{ padding: '0', overflow: 'hidden' }}
        >
          <div className="code log">{this.state.logData}</div>
          <p style={{ marginLeft: '24px' }}>{this.state.copied ? <span className="green fadeIn">Copied to clipboard.</span> : null}</p>
        </Dialog>
      </div>
    );
  }
}
