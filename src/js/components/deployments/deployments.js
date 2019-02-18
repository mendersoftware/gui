import React from 'react';
import { Link } from 'react-router-dom';
import cookie from 'react-cookie';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

import Pending from './pendingdeployments';
import Progress from './inprogressdeployments';
import Past from './pastdeployments';
import Report from './report';
import ScheduleForm from './scheduleform';
import ScheduleButton from './schedulebutton';

import { preformatWithRequestID } from '../../helpers';
import { ListItemText } from '@material-ui/core';

const routes = {
  active: {
    route: '/deployments/active',
    title: 'Active'
  },
  finished: {
    route: '/deployments/finished',
    title: 'Finished'
  }
};

export default class Deployments extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  componentDidMount() {
    var self = this;

    clearAllRetryTimers();
    this.timer = setInterval(() => this._refreshDeployments(), this.state.refreshDeploymentsLength);
    this._refreshDeployments();

    var artifact = AppStore.getDeploymentArtifact();
    this.setState({ artifact });

    Promise.all([AppActions.getArtifacts(), AppActions.getAllDevices(), AppActions.getGroups()])
      .catch(err => console.log(`Error: ${err}`))
      .then(([artifacts, allDevices, groups]) => {
        const collatedArtifacts = AppStore.getCollatedArtifacts(artifacts);
        self.setState({ allDevices, collatedArtifacts, groups });
        return Promise.all(groups.map(group => AppActions.getAllDevices(group).then(devices => Promise.resolve({ [group]: devices }))));
      })
      .then(groupedDevices => {
        const state = groupedDevices.reduce((accu, item) => Object.assign(accu, item), { doneLoading: true });
        self.setState(state);
      });

    if (this.props.params) {
      this.setState({ reportType: this.props.params.tab });

      if (this.props.params.params) {
        var str = decodeURIComponent(this.props.params.params);
        var obj = str.split('&');

        var params = [];
        for (var i = 0; i < obj.length; i++) {
          var f = obj[i].split('=');
          params[f[0]] = f[1];
        }
        if (params.open) {
          if (params.id) {
            self._getReportById(params.id);
          } else {
            setTimeout(() => {
              self.dialogOpen('schedule');
            }, 400);
          }
        }
      }
    } else {
      this.setState({ reportType: 'active' });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers();
    AppStore.removeChangeListener(this._onChange.bind(this));
  }

  _getInitialState() {
    // set default date range before refreshing
    var startDate = new Date();
    startDate.setDate(startDate.getDate());
    startDate.setHours(0, 0, 0, 0); // set to start of day
    var endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return {
      docsVersion: this.props.docsVersion ? `${this.props.docsVersion}/` : 'development/',
      tabIndex: this._updateActive(),
      past: AppStore.getPastDeployments(),
      pending: AppStore.getPendingDeployments(),
      progress: AppStore.getDeploymentsInProgress() || [],
      events: AppStore.getEventLog(),
      collatedArtifacts: AppStore.getCollatedArtifacts(),
      groups: AppStore.getGroups(),
      invalid: true,
      refreshDeploymentsLength: 30000,
      hasDeployments: AppStore.getHasDeployments(),
      showHelptips: AppStore.showHelptips(),
      hasPending: AppStore.getTotalPendingDevices(),
      hasDevices: AppStore.getTotalAcceptedDevices(),
      user: AppStore.getCurrentUser(),
      pageLength: AppStore.getTotalDevices(),
      isHosted: window.location.hostname === 'hosted.mender.io',
      per_page: 20,
      startDate,
      endDate
    };
  }

  _refreshDeployments() {
    if (this._getCurrentLabel() === 'Finished') {
      this._refreshPast(null, null, null, null, this.state.groupFilter);
    } else {
      this._refreshInProgress();
      this._refreshPending();
    }

    if (this.state.showHelptips && !cookie.load(`${this.state.user.id}-onboarded`) && cookie.load(`${this.state.user.id}-deploymentID`)) {
      this._isOnBoardFinished(cookie.load(`${this.state.user.id}-deploymentID`));
    }
  }
  _refreshInProgress(page, per_page) {
    /*
    / refresh only in progress deployments
    /
    */
    var self = this;
    if (page) {
      self.setState({ prog_page: page });
    } else {
      page = self.state.prog_page;
    }

    return Promise.all([
      AppActions.getDeploymentsInProgress(page, per_page),
      // Get full count of deployments for pagination
      AppActions.getDeploymentCount('inprogress')
    ])
      .then(results => {
        const deployments = results[0];
        const progressCount = results[1];
        self.setState({ doneLoading: true, progressCount });
        clearRetryTimer('progress');
        if (progressCount && !deployments.length) {
          self._refreshInProgress(1);
        }
      })
      .catch(err => {
        console.log(err);
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, self.state.refreshDeploymentsLength);
      });
  }
  _refreshPending(page, per_page) {
    /*
    / refresh only pending deployments
    /
    */
    var self = this;
    if (page) {
      self.setState({ pend_page: page });
    } else {
      page = self.state.pend_page;
    }

    return AppActions.getPendingDeployments(page, per_page)
      .then(result => {
        self._dismissSnackBar();
        const { deployments, links } = result;

        // Get full count of deployments for pagination
        if (links.next || links.prev) {
          return AppActions.getDeploymentCount('pending').then(pendingCount => {
            self.setState({ pendingCount });
            if (pendingCount && !deployments.length) {
              self._refreshPending(1);
            }
          });
        } else {
          self.setState({ pendingCount: deployments.length });
        }
      })
      .catch(err => {
        console.log(err);
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, self.state.refreshDeploymentsLength);
      });
  }

  _changePastPage(page, startDate, endDate, per_page, group) {
    var self = this;
    self.setState({ doneLoading: false }, () => {
      clearInterval(self.timer);
      self._refreshPast(page, startDate, endDate, per_page, group);
      self.timer = setInterval(() => self._refreshDeployments(), self.state.refreshDeploymentsLength);
    });
  }
  _refreshPast(page, startDate, endDate, per_page, group) {
    /*
    / refresh only finished deployments
    /
    */
    var self = this;

    var oldCount = self.state.pastCount;
    var oldPage = self.state.past_page;

    startDate = startDate || self.state.startDate;
    endDate = endDate || self.state.endDate;
    per_page = per_page || self.state.per_page;

    // self.setState({ startDate, endDate, groupFilter: group });

    startDate = Math.round(Date.parse(startDate) / 1000);
    endDate = Math.round(Date.parse(endDate) / 1000);

    // get total count of past deployments first
    return AppActions.getDeploymentCount('finished', startDate, endDate, group)
      .then(count => {
        page = page || self.state.past_page || 1;
        self.setState({ pastCount: count, past_page: page });
        // only refresh deployments if page, count or date range has changed
        if (oldPage !== page || oldCount !== count || !self.state.doneLoading) {
          return AppActions.getPastDeployments(page, per_page, startDate, endDate, group);
        }
      })
      .then(() => {
        self.setState({ doneLoading: true });
        self._dismissSnackBar();
      })
      .catch(err => {
        console.log(err);
        self.setState({ doneLoading: true });
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, self.state.refreshDeploymentsLength);
      });
  }

  _dismissSnackBar() {
    setTimeout(() => {
      AppActions.setSnackbar('');
    }, 1500);
  }

  _onChange() {
    this.setState(this._getInitialState());
  }

  _getGroupDevices(group) {
    // get list of devices for each group and save them to state
    var self = this;
    return AppActions.getNumberOfDevicesInGroup((count, devices) => {
      let state = {};
      state[group] = devices;
      self.setState(state);
    }, group);
  }

  dialogDismiss() {
    this.setState({
      dialog: false,
      artifact: null,
      group: null
    });
  }
  dialogOpen(dialog) {
    if (dialog === 'schedule') {
      this.setState({
        dialogTitle: 'Create a deployment',
        scheduleForm: true,
        contentClass: 'dialog'
      });
    }
    if (dialog === 'report') {
      this.setState({
        scheduleForm: false,
        contentClass: 'largeDialog'
      });
    }
    this.setState({ dialog: true, filteredDevices: [], deploymentDevices: [] });
  }

  _retryDeployment(deployment, devices) {
    var self = this;
    var artifact = { name: deployment.artifact_name };
    this.setState({ artifact, group: deployment.name, filteredDevices: devices }, () => self._onScheduleSubmit());
  }

  _onScheduleSubmit() {
    var self = this;
    var ids = this.state.filteredDevices.map(device => device.id);
    var newDeployment = {
      name: decodeURIComponent(this.state.group) || 'All devices',
      artifact_name: this.state.artifact.name,
      devices: ids
    };
    self.setState({ doneLoading: false });
    self.dialogDismiss('dialog');

    return AppActions.createDeployment(newDeployment)
      .then(data => {
        var lastslashindex = data.lastIndexOf('/');
        var id = data.substring(lastslashindex + 1);
        clearInterval(self.timer);

        // onboarding
        if (self.state.showHelptips && !cookie.load(`${self.state.user.id}-onboarded`) && !cookie.load(`${self.state.user.id}-deploymentID`)) {
          cookie.save(`${self.state.user.id}-deploymentID`, id);
        }

        return AppActions.getSingleDeployment(id).then(data => {
          if (data) {
            // successfully retrieved new deployment
            if (self.state.currentTab !== 'Active') {
              self.context.router.history.push('/deployments/active');
              self._changeTab('/deployments/active');
            } else {
              self.timer = setInterval(() => self._refreshDeployments(), self.state.refreshDeploymentsLength);
              self._refreshDeployments();
            }
            AppActions.setSnackbar('Deployment created successfully', 8000);
          } else {
            AppActions.setSnackbar('Error while creating deployment');
          }
          return Promise.resolve();
        });
      })
      .then(() => self.setState({ doneLoading: true }))
      .catch(err => {
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `Error creating deployment. ${errMsg}`), null, 'Copy to clipboard');
      });
  }
  _deploymentParams(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
    var group = attr === 'group' ? val : this.state.group;
    var artifact = attr === 'artifact' ? val : this.state.artifact;
    this._getDeploymentDevices(group, artifact);
  }
  _getDeploymentDevices(group, artifact) {
    var devices = [];
    var filteredDevices = [];
    // set the selected groups devices to state, to be sent down to the child schedule form
    if (artifact && group) {
      devices = (group !== 'All devices' ? this.state[group] : this.state.allDevices) || [];
      filteredDevices = AppStore.filterDevicesByType(devices, artifact.device_types_compatible);
    }
    this.setState({ deploymentDevices: devices, filteredDevices: filteredDevices });
  }
  _getReportById(id) {
    var self = this;
    return AppActions.getSingleDeployment(id).then(data => setTimeout(() => self._showReport(data, self.state.reportType), 400));
  }
  _showReport(deployment, type) {
    var title = type === 'active' ? 'Deployment progress' : 'Results of deployment';
    var reportType = type;
    this.setState({ scheduleForm: false, selectedDeployment: deployment, dialogTitle: title, reportType: reportType });
    this.dialogOpen('report');
  }
  _scheduleDeployment(deployment) {
    this.setState({ dialog: false });

    var artifact = '';
    var group = '';
    var start_time = null;
    var end_time = null;
    var id = null;
    if (deployment) {
      if (deployment.id) {
        id = deployment.id;
      }
      if (deployment.artifact_name) {
        artifact = AppStore.getSoftwareArtifact('name', deployment.artifact_name);
      }
      if (deployment.group) {
        group = AppStore.getSingleGroup('name', deployment.group);
      }
      if (deployment.start_time) {
        start_time = deployment.start_time;
      }
      if (deployment.end_time) {
        end_time = deployment.end_time;
      }
    }
    this.setState({
      scheduleForm: true,
      artifactVal: artifact,
      id: id,
      start_time: start_time,
      end_time: end_time,
      artifact: artifact,
      group: group,
      groupVal: group
    });
    this.dialogOpen('schedule');
  }
  _handleRequestClose() {
    this._dismissSnackBar();
  }
  _showProgress(rowNumber) {
    var deployment = this.state.progress[rowNumber];
    this._showReport(deployment, 'active');
  }
  _abortDeployment(id) {
    var self = this;
    return AppActions.abortDeployment(id)
      .then(() => {
        self.setState({ doneLoading: false });
        clearInterval(self.timer);
        self.timer = setInterval(() => self._refreshDeployments(), self.state.refreshDeploymentsLength);
        self._refreshDeployments();
        self.dialogDismiss('dialog');
        AppActions.setSnackbar('The deployment was successfully aborted');
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was wan error while aborting the deployment: ${errMsg}`));
      });
  }
  updated() {
    // use to make sure re-renders dialog at correct height when device list built
    this.setState({ updated: true });
  }

  _finishOnboard() {
    this.setState({ onboardDialog: false });
    this.context.router.history.push('/deployments/finished');
    this._changeTab('/deployments/finished');
  }
  _isOnBoardFinished(id) {
    var self = this;
    return AppActions.getSingleDeployment(id).then(data => {
      if (data.status === 'finished') {
        self.setState({ onboardDialog: true });
        cookie.save(`${self.state.user.id}-onboarded`, true);
        cookie.remove(`${self.state.user.id}-deploymentID`);
      }
    });
  }

  // nested tabs
  componentWillReceiveProps() {
    // this.setState({ tabIndex: this._updateActive(), currentTab: this._getCurrentLabel() });
  }

  _updateActive(tab = this.context.router.route.match.params.tab) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.active.route;
  }

  _getCurrentLabel(tab = this.context.router.route.match.params.status) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].title;
    }
    return routes.active.title;
  }

  _changeTab(tabIndex) {
    var self = this;
    clearInterval(self.timer);
    self.timer = setInterval(() => self._refreshDeployments(), self.state.refreshDeploymentsLength);
    self.setState({ tabIndex, currentTab: self._getCurrentLabel(), pend_page: 1, past_page: 1, prog_page: 1 }, () => self._refreshDeployments());
    // self.context.router.history.push(tab.props.value);
    AppActions.setSnackbar('');
  }

  render() {
    var disabled = typeof this.state.filteredDevices !== 'undefined' && this.state.filteredDevices.length > 0 ? false : true;
    var scheduleActions = [
      <div key="schedule-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this.dialogDismiss('dialog')}>Cancel</Button>
      </div>,
      <Button variant="contained" key="schedule-action-button-2" primary="true" onClick={() => this._onScheduleSubmit()} ref="save" disabled={disabled}>
        Create deployment
      </Button>
    ];
    var reportActions = [
      <Button key="report-action-button-1" onClick={() => this.dialogDismiss('dialog')}>
        Close
      </Button>
    ];
    var onboardActions = [
      <Button variant="contained" key="onboard-action-button-1" primary="true" onClick={() => this._finishOnboard()}>
        Finish
      </Button>
    ];
    var dialogContent = '';

    if (this.state.scheduleForm) {
      dialogContent = (
        <ScheduleForm
          hasDeployments={this.state.hasDeployments}
          showHelptips={this.state.showHelptips}
          deploymentDevices={this.state.deploymentDevices}
          filteredDevices={this.state.filteredDevices}
          hasPending={this.state.hasPending}
          hasDevices={this.state.hasDevices}
          deploymentSettings={(...args) => this._deploymentParams(...args)}
          id={this.state.id}
          artifacts={this.state.collatedArtifacts}
          artifact={this.state.artifact}
          groups={this.state.groups}
          group={this.state.group}
        />
      );
    } else if (this.state.reportType === 'active') {
      dialogContent = <Report abort={id => this._abortDeployment(id)} updated={() => this.updated()} deployment={this.state.selectedDeployment} />;
    } else {
      dialogContent = (
        <Report
          retry={(deployment, devices) => this._retryDeployment(deployment, devices)}
          updated={() => this.updated()}
          past={true}
          deployment={this.state.selectedDeployment}
        />
      );
    }

    var physicalLink = this.state.isHosted ? (
      <p>
        Visit the <Link to="/help">help pages</Link> for guides on provisioning Raspberry Pi 3 and BeagleBone Black devices.
      </p>
    ) : (
      <p>
        <a href={`https://docs.mender.io/${this.state.docsVersion}getting-started/deploy-to-physical-devices`} target="_blank">
          Follow the tutorial
        </a>{' '}
        in our documentation to provision Raspberry Pi 3 or BeagleBone Black devices.
      </p>
    );
    // tabs
    const { tabIndex } = this.state;

    return (
      <div style={{ marginTop: '-15px' }}>
        <div className="top-right-button">
          <ScheduleButton secondary="true" openDialog={dialog => this.dialogOpen(dialog)} />
        </div>

        <Tabs value={tabIndex} onChange={tabIndex => this._changeTab(tabIndex)} style={{ display: 'inline-block' }}>
          {Object.values(routes).map(route => (
            <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.route} />
          ))}
        </Tabs>

        {tabIndex === routes.active.route && (
          <div className="margin-top">
            <Pending
              page={this.state.pend_page}
              count={this.state.pendingCount || this.state.pending.length}
              refreshPending={(...args) => this._refreshPending(...args)}
              pending={this.state.pending}
              abort={id => this._abortDeployment(id)}
            />
            <Progress
              page={this.state.prog_page}
              isActiveTab={this.state.currentTab === 'Active'}
              showHelptips={this.state.showHelptips && !cookie.load(`${this.state.user.id}-onboarded`)}
              hasDeployments={this.state.hasDeployments}
              devices={this.state.allDevices || []}
              hasArtifacts={this.state.collatedArtifacts.length}
              count={this.state.progressCount || this.state.progress.length}
              pendingCount={this.state.pendingCount || this.state.pending.length}
              refreshProgress={(...args) => this._refreshInProgress(...args)}
              abort={id => this._abortDeployment(id)}
              loading={!this.state.doneLoading}
              openReport={rowNum => this._showProgress(rowNum)}
              progress={this.state.progress}
              createClick={() => this.dialogOpen('schedule')}
            />
          </div>
        )}
        {tabIndex === routes.finished.route && (
          <div className="margin-top">
            <Past
              groups={this.state.groups}
              deviceGroup={this.state.groupFilter}
              createClick={() => this.dialogOpen('schedule')}
              pageSize={this.state.per_page}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              page={this.state.past_page}
              isActiveTab={this.state.currentTab === 'Finished'}
              showHelptips={this.state.showHelptips}
              count={this.state.pastCount}
              loading={!this.state.doneLoading}
              past={this.state.past}
              refreshPast={(...args) => this._changePastPage(...args)}
              showReport={(deployment, type) => this._showReport(deployment, type)}
            />
          </div>
        )}

        <Dialog
          ref="dialog"
          open={this.state.dialog || false}
          scroll={'body'}
          style={{ paddingTop: '0', fontSize: '13px', boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)' }}
        >
          <DialogTitle>{this.state.dialogTitle}</DialogTitle>
          <DialogContent className={this.state.contentClass} style={{ overflow: 'hidden' }}>
            {dialogContent}
          </DialogContent>
          <DialogActions style={{ marginBottom: '0' }}>{this.state.scheduleForm ? scheduleActions : reportActions}</DialogActions>
        </Dialog>

        <Dialog
          ref="onboard-complete"
          scroll={'body'}
          open={(this.state.onboardDialog && this.state.showHelptips) || false}
          style={{ boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)' }}
        >
          <DialogTitle>Congratulations!</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            <h3>You've completed your first deployment - so what's next?</h3>

            <List>
              <ListItem key="physical" disabled={true}>
                <ListItemText primary={<p>Try updating a physical device</p>} secondary={physicalLink} />
              </ListItem>

              <Divider />

              <ListItem key="yocto" disabled={true}>
                <ListItemText
                  primary={<p>Try building your own Yocto Project images for use with Mender</p>}
                  secondary={
                    <p>
                      See our{' '}
                      <a href={`https://docs.mender.io/${this.state.docsVersion}artifacts/building-mender-yocto-image`} target="_blank">
                        documentation site
                      </a>{' '}
                      for a step by step guide on how to build a Yocto Project image for a device.
                    </p>
                  }
                />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>{onboardActions}</DialogActions>
        </Dialog>
      </div>
    );
  }
}
