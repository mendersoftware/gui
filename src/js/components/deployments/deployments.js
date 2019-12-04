import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@material-ui/core';

import { getAllGroupDevices, selectDevice } from '../../actions/deviceActions';
import { selectRelease } from '../../actions/releaseActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, createDeployment, getDeploymentCount, getDeploymentsByStatus, selectDeployment } from '../../actions/deploymentActions';

import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

import Loader from '../common/loader';
import DeploymentsList from './deploymentslist';
import Progress from './inprogressdeployments';
import Past from './pastdeployments';
import Report from './report';
import CreateDialog from './createdeployment';

import { deepCompare, preformatWithRequestID, standardizePhases } from '../../helpers';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';

const MAX_PREVIOUS_PHASES_COUNT = 5;
const DEFAULT_PENDING_INPROGRESS_COUNT = 10;

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

const refreshDeploymentsLength = 30000;

export class Deployments extends React.Component {
  constructor(props, context) {
    super(props, context);
    const today = new Date();
    today.setHours(0, 0, 0);
    const tonight = new Date();
    tonight.setHours(23, 59, 59);
    this.state = {
      invalid: true,
      startDate: today,
      endDate: tonight,
      per_page: 20,
      progPage: 1,
      pendPage: 1,
      pastPage: 1,
      reportDialog: false,
      createDialog: false,
      tabIndex: this._updateActive()
    };
  }

  componentDidMount() {
    var self = this;
    clearAllRetryTimers(self.props.setSnackbar);
    self.props.selectRelease();
    self.props.selectDevice();
    self.props.groups.map(group => self.props.getAllGroupDevices(group));
    let startDate = self.state.startDate;
    if (this.props.match) {
      const params = new URLSearchParams(this.props.location.search);
      if (params) {
        if (params.get('open')) {
          if (params.get('id')) {
            self.props.selectDeployment(params.get('id')).then(() => self._showReport(self.state.reportType));
          } else if (params.get('release')) {
            self.props.selectRelease(params.get('release'));
          } else if (params.get('deviceId')) {
            self.props.selectDevice(params.get('deviceId')).catch(err => {
              console.log(err);
              var errMsg = err.res.body.error || '';
              self.props.setSnackbar(preformatWithRequestID(err.res, `Error fetching device details. ${errMsg}`), null, 'Copy to clipboard');
            });
          } else {
            setTimeout(() => self.setState({ createDialog: true }), 400);
          }
        } else if (params.get('from')) {
          startDate = new Date(params.get('from'));
          startDate.setHours(0, 0, 0);
        }
      }
    }
    const query = new URLSearchParams(this.props.location.search);
    self.setState(
      {
        createDialog: Boolean(query.get('open')),
        reportType: this.props.match ? this.props.match.params.tab : 'active',
        startDate,
        tabIndex: this._updateActive()
      },
      () => {
        self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
        self._refreshDeployments();
      }
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    clearAllRetryTimers(this.props.setSnackbar);
  }

  _refreshDeployments() {
    if (this._getCurrentLabel() === routes.finished.title) {
      this._refreshPast(null, null, null, null, this.state.groupFilter);
    } else {
      this._refreshInProgress();
      this._refreshPending();
      if (!this.props.onboardingComplete) {
        this._refreshPast(null, null, null, null, this.state.groupFilter);
      }
    }
  }
  _refreshInProgress(page, per_page = DEFAULT_PENDING_INPROGRESS_COUNT) {
    /*
    / refresh only in progress deployments
    /
    */
    var self = this;
    if (page) {
      self.setState({ progPage: page });
    } else {
      page = self.state.progPage;
    }

    return Promise.all([
      self.props.getDeploymentsByStatus('inprogress', page, per_page),
      // Get full count of deployments for pagination
      self.props.getDeploymentCount('inprogress')
    ])
      .then(results => {
        const deployments = results[0];
        self.setState({ doneLoading: true });
        clearRetryTimer('progress', self.props.setSnackbar);
        if (self.props.progressCount && !deployments.length) {
          self._refreshInProgress(1);
        }
      })
      .catch(err => {
        console.log(err);
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
      });
  }
  _refreshPending(page, per_page = DEFAULT_PENDING_INPROGRESS_COUNT) {
    /*
    / refresh only pending deployments
    /
    */
    var self = this;
    if (page) {
      self.setState({ pendPage: page });
    } else {
      page = self.state.pendPage;
    }

    return Promise.all([self.props.getDeploymentsByStatus('pending', page, per_page), self.props.getDeploymentCount('pending')])
      .then(() => self.props.setSnackbar(''))
      .catch(err => {
        console.log(err);
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
      });
  }

  _changePastPage(
    page = this.state.pastPage,
    startDate = this.state.startDate,
    endDate = this.state.endDate,
    per_page = this.state.per_page,
    group = this.state.group
  ) {
    var self = this;
    self.setState({ doneLoading: false }, () => {
      clearInterval(self.timer);
      self._refreshPast(page, startDate, endDate, per_page, group);
      self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
    });
  }
  _refreshPast(page, startDate, endDate, per_page, group) {
    /*
    / refresh only finished deployments
    /
    */
    var self = this;

    var oldPage = self.state.pastPage;

    startDate = startDate || self.state.startDate;
    endDate = endDate || self.state.endDate;
    per_page = per_page || self.state.per_page;

    self.setState({ startDate, endDate, groupFilter: group });

    startDate = Math.round(Date.parse(startDate) / 1000);
    endDate = Math.round(Date.parse(endDate) / 1000);

    // get total count of past deployments first
    return self.props
      .getDeploymentCount('finished', startDate, endDate, group)
      .then(() => {
        page = page || self.state.pastPage || 1;
        self.setState({ pastPage: page });
        // only refresh deployments if page, count or date range has changed
        if (oldPage !== page || !self.state.doneLoading) {
          return self.props.getDeploymentsByStatus('finished', page, per_page, startDate, endDate, group);
        }
      })
      .then(() => {
        self.setState({ doneLoading: true });
        self.props.setSnackbar('');
      })
      .catch(err => {
        console.log(err);
        self.setState({ doneLoading: true });
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
      });
  }

  _retryDeployment(deployment, devices) {
    const self = this;
    const release = { name: deployment.artifact_name, device_types_compatible: deployment.device_types_compatible || [] };
    const deploymentObject = {
      group: deployment.name,
      deploymentDeviceIds: devices.map(item => item.id),
      release,
      phases: null
    };
    self.setState({ deploymentObject, createDialog: true, reportDialog: false });
  }

  _onScheduleSubmit(deploymentObject) {
    const self = this;
    const { group, deploymentDeviceIds, release, phases } = deploymentObject;
    const newDeployment = {
      name: decodeURIComponent(group) || 'All devices',
      artifact_name: release.Name,
      devices: deploymentDeviceIds,
      phases
    };
    self.setState({ doneLoading: false, createDialog: false, reportDialog: false });

    return self.props
      .createDeployment(newDeployment)
      .catch(err => {
        self.props.setSnackbar('Error while creating deployment');
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `Error creating deployment. ${errMsg}`), null, 'Copy to clipboard');
      })
      .then(() => {
        clearInterval(self.timer);
        // successfully retrieved new deployment
        if (self._getCurrentLabel() !== routes.active.title) {
          self.props.history.push(routes.active.route);
          self._changeTab(routes.active.route);
        } else {
          self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
          self._refreshDeployments();
        }
        self.props.setSnackbar('Deployment created successfully', 8000);
        if (phases) {
          const standardPhases = standardizePhases(phases);
          let previousPhases = self.props.settings.previousPhases || [];
          previousPhases = previousPhases.map(standardizePhases);
          if (!previousPhases.find(previousPhaseList => previousPhaseList.every(oldPhase => standardPhases.find(phase => deepCompare(phase, oldPhase))))) {
            previousPhases.push(standardPhases);
          }
          self.props.saveGlobalSettings({ previousPhases: previousPhases.slice(-1 * MAX_PREVIOUS_PHASES_COUNT) });
        }
        self.setState({ doneLoading: true, deploymentObject: null });
      });
  }
  _showReport(reportType) {
    this.setState({ createDialog: false, reportType, reportDialog: true });
  }
  _showProgress(rowNumber) {
    const self = this;
    const deployment = self.props.progress[rowNumber];
    this.props.selectDeployment(deployment.id).then(() => self._showReport('active'));
  }
  _abortDeployment(id) {
    var self = this;
    return self.props
      .abortDeployment(id)
      .then(() => {
        clearInterval(self.timer);
        self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
        self._refreshDeployments();
        self.setState({ createDialog: false, doneLoading: false });
        self.props.setSnackbar('The deployment was successfully aborted');
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was wan error while aborting the deployment: ${errMsg}`));
      });
  }
  updated() {
    // use to make sure re-renders dialog at correct height when device list built
    this.setState({ updated: true });
  }

  _updateActive(tab = this.props.match.params.tab) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.active.route;
  }

  _getCurrentLabel(tab = this.props.match.params.tab) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].title;
    }
    return routes.active.title;
  }

  _changeTab(tabIndex) {
    var self = this;
    clearInterval(self.timer);
    self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
    self.setState({ tabIndex, pendPage: 1, pastPage: 1, progPage: 1 }, () => self._refreshDeployments());
    self.props.setSnackbar('');
  }

  closeReport() {
    const self = this;
    self.setState({ reportDialog: false, selectedDeployment: null }, () => self.props.selectDeployment());
  }

  render() {
    const self = this;
    const dialogProps = {
      updated: () => this.setState({ updated: true }),
      deployment: this.props.selectedDeployment
    };
    let dialogContent = <Report retry={(deployment, devices) => this._retryDeployment(deployment, devices)} past={true} {...dialogProps} />;
    if (this.state.reportType === 'active') {
      dialogContent = <Report abort={id => this._abortDeployment(id)} {...dialogProps} />;
    }

    // tabs
    const { groups, isEnterprise, onboardingComplete, past, pastCount, pending, pendingCount, progress, progressCount } = self.props;
    const {
      contentClass,
      createDialog,
      deploymentObject,
      doneLoading,
      groupFilter,
      per_page,
      pastPage,
      pendPage,
      progPage,
      reportDialog,
      reportType,
      startDate,
      endDate,
      tabIndex
    } = self.state;
    let onboardingComponent = null;
    if (past.length || pastCount) {
      onboardingComponent = getOnboardingComponentFor('deployments-past', { anchor: { left: 240, top: 50 } });
    }

    return (
      <div className="relative">
        <Button
          className="top-right-button"
          color="secondary"
          variant="contained"
          onClick={() => this.setState({ createDialog: true })}
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
          <>
            {doneLoading ? (
              <div className="margin-top">
                <DeploymentsList
                  abort={id => this._abortDeployment(id)}
                  count={pendingCount || pending.length}
                  items={pending}
                  page={pendPage}
                  refreshItems={(...args) => this._refreshPending(...args)}
                  isEnterprise={isEnterprise}
                  isActiveTab={self._getCurrentLabel() === routes.active.title}
                  title="pending"
                  type="pending"
                />
                <Progress
                  abort={id => this._abortDeployment(id)}
                  count={progressCount || progress.length}
                  isActiveTab={self._getCurrentLabel() === routes.active.title}
                  items={progress}
                  onboardingComplete={onboardingComplete}
                  openReport={rowNum => this._showProgress(rowNum)}
                  page={progPage}
                  pastDeploymentsCount={pastCount}
                  refreshItems={(...args) => this._refreshInProgress(...args)}
                  title="In progress"
                  type="progress"
                />
                {!(progressCount || progress.length || pendingCount || pending.length) && (
                  <div className={progress.length || !doneLoading ? 'hidden' : 'dashboard-placeholder'}>
                    <p>Pending and ongoing deployments will appear here. </p>
                    <p>
                      <a onClick={() => this.setState({ createDialog: true })}>Create a deployment</a> to get started
                    </p>
                    <img src="assets/img/deployments.png" alt="In progress" />
                  </div>
                )}
              </div>
            ) : (
              <Loader show={doneLoading} />
            )}
          </>
        )}
        {tabIndex === routes.finished.route && (
          <div className="margin-top">
            <Past
              groups={groups}
              deviceGroup={groupFilter}
              createClick={() => this.setState({ createDialog: true })}
              pageSize={per_page}
              onChangeRowsPerPage={perPage => self.setState({ per_page: perPage, pastPage: 1 }, () => self._changePastPage())}
              startDate={startDate}
              endDate={endDate}
              page={pastPage}
              isActiveTab={self._getCurrentLabel() === routes.finished.title}
              count={pastCount}
              loading={!doneLoading}
              past={past}
              refreshPast={(...args) => this._changePastPage(...args)}
              showReport={type => this._showReport(type)}
            />
          </div>
        )}

        {reportDialog && (
          <Dialog open={reportDialog} fullWidth={true} maxWidth="lg">
            <DialogTitle>{reportType === 'active' ? 'Deployment progress' : 'Results of deployment'}</DialogTitle>
            <DialogContent className={contentClass} style={{ overflow: 'hidden' }}>
              {dialogContent}
            </DialogContent>
            <DialogActions>
              <Button key="report-action-button-1" onClick={() => self.closeReport()}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {createDialog && (
          <CreateDialog
            open={createDialog}
            onDismiss={() => self.setState({ createDialog: false, deploymentObject: null })}
            onScheduleSubmit={(...args) => this._onScheduleSubmit(...args)}
            deploymentObject={deploymentObject}
          />
        )}
        {onboardingComponent}
      </div>
    );
  }
}

const actionCreators = {
  abortDeployment,
  createDeployment,
  getAllGroupDevices,
  getDeploymentCount,
  getDeploymentsByStatus,
  saveGlobalSettings,
  selectDevice,
  selectDeployment,
  selectRelease,
  setSnackbar
};

const tryMapDeployments = (accu, id) => {
  if (accu.state.deployments.byId[id]) {
    accu.deployments.push(accu.state.deployments.byId[id]);
  }
  return accu;
};

const mapStateToProps = state => {
  const progress = state.deployments.byStatus.inprogress.deploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const pending = state.deployments.byStatus.pending.deploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const past = state.deployments.byStatus.finished.deploymentIds.map(id => state.deployments.byId[id]);
  return {
    finishedCount: state.deployments.byStatus.finished.total,
    groups: Object.keys(state.devices.groups.byId),
    groupDevices: state.devices.groups.byId,
    hasDeployments: Object.keys(state.deployments.byId).length > 0,
    isEnterprise: state.app.features.isEnterprise || state.app.features.isHosted,
    onboardingComplete: state.users.onboarding.complete,
    past,
    pastCount: state.deployments.byStatus.finished.total,
    pending,
    pendingCount: state.deployments.byStatus.pending.total,
    progress,
    progressCount: state.deployments.byStatus.inprogress.total,
    selectedDeployment: state.deployments.byId[state.deployments.selectedDeployment],
    settings: state.users.globalSettings,
    showHelptips: state.users.showHelptips,
    user: state.users.byId[state.users.currentUser] || {}
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Deployments));
