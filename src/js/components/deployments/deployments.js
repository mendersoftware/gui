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
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

import Pending from './pendingdeployments';
import Progress from './inprogressdeployments';
import Past from './pastdeployments';
import Report from './report';
import ScheduleDialog from './scheduledialog';
import BaseOnboardingTip from '../helptips/baseonboardingtip';

import { preformatWithRequestID } from '../../helpers';

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
    const today = new Date();
    today.setHours(0, 0, 0);
    const tonight = new Date();
    tonight.setHours(23, 59, 59);
    this.state = {
      docsVersion: this.props.docsVersion ? `${this.props.docsVersion}/` : 'development/',
      invalid: true,
      startDate: today,
      endDate: tonight,
      per_page: 20,
      refreshDeploymentsLength: 30000,
      dialog: false,
      scheduleDialog: false,
      ...this._getInitialState()
    };
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
        let state = { allDevices, collatedArtifacts, groups, doneLoading: true };
        return Promise.all([
          Promise.all(groups.map(group => AppActions.getAllDevicesInGroup(group).then(devices => Promise.resolve({ [group]: devices })))),
          Promise.resolve(state)
        ]);
      })
      .then(([groupedDevices, state]) => {
        state = groupedDevices.reduce((accu, item) => Object.assign(accu, item), state);
        self.setState(state);
      });

    if (this.props.match) {
      this.setState({ reportType: this.props.match.params.tab });

      const params = new URLSearchParams(this.props.location.search);
      if (params && params.get('open')) {
        if (params.get('id')) {
          self._getReportById(params.get('id'));
        } else if (params.get('release')) {
          const release = AppStore.getRelease(params.get('release'));
          self.setState({ scheduleDialog: true, releaseArtifacts: release.Artifacts });
        } else {
          setTimeout(() => {
            self.setState({ scheduleDialog: true });
          }, 400);
        }
      }
    } else {
      this.setState({ reportType: 'active' });
    }

    const query = new URLSearchParams(this.props.location.search);
    this.setState({ scheduleDialog: Boolean(query.get('open')) || false });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers();
    AppStore.removeChangeListener(this._onChange.bind(this));
  }

  _getInitialState() {
    return {
      tabIndex: this._updateActive(),
      past: AppStore.getPastDeployments(),
      pending: AppStore.getPendingDeployments(),
      progress: AppStore.getDeploymentsInProgress() || [],
      events: AppStore.getEventLog(),
      collatedArtifacts: AppStore.getCollatedArtifacts(),
      groups: AppStore.getGroups(),
      hasDeployments: AppStore.getHasDeployments(),
      showHelptips: AppStore.showHelptips(),
      hasPending: AppStore.getTotalPendingDevices(),
      hasDevices: AppStore.getTotalAcceptedDevices(),
      user: AppStore.getCurrentUser(),
      pageLength: AppStore.getTotalDevices(),
      isHosted: window.location.hostname === 'hosted.mender.io'
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

    self.setState({ startDate, endDate, groupFilter: group });

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
    return AppActions.getAllDevicesInGroup(group).then(devices => {
      let state = {};
      state[group] = devices;
      self.setState(state);
    });
  }

  dialogDismiss() {
    this.setState({
      reportDialog: false,
      artifact: null,
      group: null
    });
  }

  _retryDeployment(deployment, devices) {
    var self = this;
    var artifact = { name: deployment.artifact_name, device_types_compatible: deployment.device_types_compatible || [] };
    this.setState({ artifact, group: deployment.name, filteredDevices: devices }, () => self._onScheduleSubmit(deployment.name, devices, artifact));
  }

  _onScheduleSubmit(group, devices, artifact) {
    var self = this;
    var ids = devices.map(device => device.id);
    var newDeployment = {
      name: decodeURIComponent(group) || 'All devices',
      artifact_name: artifact.name,
      devices: ids
    };
    self.setState({ doneLoading: false, scheduleDialog: false });

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
    return AppActions.getSingleDeployment(id).then(data => self._showReport(data, self.state.reportType));
  }
  _showReport(selectedDeployment, reportType) {
    this.setState({ scheduleDialog: false, selectedDeployment, reportType, reportDialog: true });
  }
  _scheduleDeployment(deployment) {
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
      dialog: false,
      scheduleDialog: true,
      id: id,
      start_time: start_time,
      end_time: end_time,
      artifact: artifact,
      group: group
    });
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
        self.setState({ scheduleDialog: false });
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

  _getCurrentLabel(tab = this.context.router.route.match.params.tab) {
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
    AppActions.setSnackbar('');
  }

  render() {
    const self = this;
    var reportActions = [
      <Button key="report-action-button-1" onClick={() => self.setState({ reportDialog: false })}>
        Close
      </Button>
    ];
    var onboardActions = [
      <Button
        component={Link}
        to="/deployments/finished"
        variant="contained"
        key="onboard-action-button-1"
        color="primary"
        onClick={() => self.setState({ onboardDialog: false })}
      >
        Finish
      </Button>
    ];
    var dialogContent = '';

    if (this.state.reportType === 'active') {
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
      <div className="relative" style={{ marginTop: '-15px' }}>
        <Button
          className="top-right-button"
          color="secondary"
          variant="contained"
          onClick={() => this.setState({ scheduleDialog: true })}
          style={{ position: 'absolute' }}
        >
          Create a deployment
        </Button>
        <Tabs value={tabIndex} onChange={(e, tabIndex) => this._changeTab(tabIndex)} style={{ display: 'inline-block' }}>
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
              createClick={() => this.setState({ scheduleDialog: true })}
            />
          </div>
        )}
        {tabIndex === routes.finished.route && (
          <div className="margin-top">
            <Past
              groups={this.state.groups}
              deviceGroup={this.state.groupFilter}
              createClick={() => this.setState({ scheduleDialog: true })}
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

        <Dialog open={self.state.reportDialog} fullWidth={true} maxWidth="lg">
          <DialogTitle>{self.state.reportType === 'active' ? 'Deployment progress' : 'Results of deployment'}</DialogTitle>
          <DialogContent className={self.state.contentClass} style={{ overflow: 'hidden' }}>
            {dialogContent}
          </DialogContent>
          <DialogActions>{reportActions}</DialogActions>
        </Dialog>

        <ScheduleDialog
          open={this.state.scheduleDialog}
          hasDeployments={this.state.hasDeployments}
          showHelptips={this.state.showHelptips}
          deploymentDevices={this.state.deploymentDevices}
          filteredDevices={this.state.filteredDevices}
          hasPending={this.state.hasPending}
          hasDevices={this.state.hasDevices}
          deploymentSettings={(...args) => this._deploymentParams(...args)}
          releaseArtifacts={this.state.releaseArtifacts}
          artifacts={this.state.collatedArtifacts}
          artifact={this.state.artifact}
          groups={this.state.groups}
          group={this.state.group}
          onDismiss={() => this.setState({ scheduleDialog: false })}
          onScheduleSubmit={(...args) => this._onScheduleSubmit(...args)}
        />

        <Dialog open={(self.state.onboardDialog && self.state.showHelptips) || false}>
          <DialogTitle>Congratulations!</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            <h3>{`You've completed your first deployment - so what's next?`}</h3>
            <List>
              <ListItem key="physical">
                <ListItemText primary={<h3>Try updating a physical device</h3>} secondary={physicalLink} />
              </ListItem>
              <Divider />
              <ListItem key="yocto">
                <ListItemText
                  primary={<h3>Try building your own Yocto Project images for use with Mender</h3>}
                  secondary={
                    <p>
                      See our{' '}
                      <a href={`https://docs.mender.io/${this.state.docsVersion}artifacts/yocto-project/building`} target="_blank">
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
        {this.state.showHelptips && (this.state.past.length || this.state.pastCount) && !window.location.hash.includes('finished') ? (
          <BaseOnboardingTip id={12} anchor={{ left: 240, top: 50 }} component={<div>Your deployment has finished, click here to view it</div>} />
        ) : null}
      </div>
    );
  }
}
