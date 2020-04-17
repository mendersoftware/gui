import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Button, Tab, Tabs } from '@material-ui/core';

import { getAllGroupDevices, selectDevice } from '../../actions/deviceActions';
import { selectRelease } from '../../actions/releaseActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, createDeployment, getDeploymentCount, getDeploymentsByStatus, selectDeployment } from '../../actions/deploymentActions';
import * as DeviceConstants from '../../constants/deviceConstants';

import { setRetryTimer, clearRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

import CreateDialog from './createdeployment';
import Progress from './inprogressdeployments';
import Past from './pastdeployments';
import Report from './report';
import Scheduled from './scheduleddeployments';

import { deepCompare, preformatWithRequestID, standardizePhases } from '../../helpers';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';

const MAX_PREVIOUS_PHASES_COUNT = 5;
export const DEFAULT_PENDING_INPROGRESS_COUNT = 10;

const routes = {
  active: {
    route: '/deployments/active',
    title: 'Active'
  },
  scheduled: {
    route: '/deployments/scheduled',
    title: 'Scheduled'
  },
  finished: {
    route: '/deployments/finished',
    title: 'Finished'
  }
};

const defaultRefreshDeploymentsLength = 30000;
const minimalRefreshDeploymentsLength = 2000;

const deploymentStatusMap = {
  finished: 'past',
  inprogress: 'prog',
  pending: 'pend'
};

export class Deployments extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentRefreshDeploymentLength: defaultRefreshDeploymentsLength,
      deploymentObject: {},
      invalid: true,
      per_page: 20,
      progPage: 1,
      pendPage: 1,
      createDialog: false,
      reportDialog: false,
      startDate: null,
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
            self.showReport(self.state.reportType, params.get('id'));
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
        clearTimeout(self.dynamicTimer);
        self._refreshDeployments(minimalRefreshDeploymentsLength);
      }
    );
  }

  componentWillUnmount() {
    clearTimeout(this.dynamicTimer);
    clearAllRetryTimers(this.props.setSnackbar);
  }

  // deploymentStatus = <finished|inprogress|pending>
  refreshDeployments(page, per_page = this.state.per_page, deploymentStatus, startDate, endDate, group, fullRefresh = true) {
    var self = this;
    let tasks = [self.props.getDeploymentCount(deploymentStatus, startDate, endDate, group)];
    if (fullRefresh) {
      tasks.push(self.props.getDeploymentsByStatus(deploymentStatus, page, per_page, startDate, endDate, group));
    }

    return Promise.all(tasks)
      .then(([countAction, deploymentsAction]) => {
        self.props.setSnackbar('');
        clearRetryTimer(deploymentStatus, self.props.setSnackbar);
        if (countAction.deploymentIds.length && deploymentsAction && !deploymentsAction[0].deploymentIds.length) {
          return self.refreshDeployments(...arguments);
        }
      })
      .catch(err => {
        console.log(err);
        var errormsg = err.error || 'Please check your connection';
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, defaultRefreshDeploymentsLength, self.props.setSnackbar);
      })
      .finally(() => {
        const mappedDeploymentStatus = deploymentStatusMap[deploymentStatus];
        self.setState({
          doneLoading: true,
          [`${mappedDeploymentStatus}Page`]: page
        });
      });
  }

  _refreshDeployments(refreshLength = defaultRefreshDeploymentsLength) {
    const self = this;
    let tasks = [self._refreshInProgress(), self._refreshPending()];
    if (!self.props.onboardingComplete && self._getCurrentLabel() === routes.finished.title) {
      tasks.push(self.refreshDeployments(1, DEFAULT_PENDING_INPROGRESS_COUNT, 'finished'));
    }
    return Promise.all(tasks).then(() => {
      const currentRefreshDeploymentLength = Math.min(refreshLength, self.state.currentRefreshDeploymentLength * 2);
      self.setState({ currentRefreshDeploymentLength });
      clearTimeout(self.dynamicTimer);
      self.dynamicTimer = setTimeout(() => self._refreshDeployments(), currentRefreshDeploymentLength);
    });
  }

  /*
  / refresh only in progress deployments
  /
  */
  _refreshInProgress(page = this.state.progPage, per_page = DEFAULT_PENDING_INPROGRESS_COUNT) {
    return this.refreshDeployments(page, per_page, 'inprogress');
  }

  /*
  / refresh only pending deployments
  /
  */
  _refreshPending(page = this.state.pendPage, per_page = DEFAULT_PENDING_INPROGRESS_COUNT) {
    return this.refreshDeployments(page, per_page, 'pending');
  }

  retryDeployment(deployment, devices) {
    const self = this;
    const release = { Name: deployment.artifact_name, device_types_compatible: deployment.device_types_compatible || [] };
    const deploymentObject = {
      group: deployment.name,
      deploymentDeviceIds: devices.map(item => item.id),
      release,
      phases: null
    };
    self.setState({ deploymentObject, createDialog: true, reportDialog: false });
  }

  onScheduleSubmit(deploymentObject) {
    const self = this;
    const { group, deploymentDeviceIds, phases, release, retries } = deploymentObject;
    const newDeployment = {
      name: decodeURIComponent(group) || 'All devices',
      artifact_name: release.Name,
      devices: deploymentDeviceIds,
      phases,
      retries
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
        self.setState({ doneLoading: true, deploymentObject: {} });
        clearTimeout(self.dynamicTimer);
        // successfully retrieved new deployment
        if (self._getCurrentLabel() !== routes.active.title) {
          self.props.history.push(routes.active.route);
          self._changeTab(routes.active.route);
        } else {
          self._refreshDeployments(minimalRefreshDeploymentsLength);
        }
      });
  }

  showReport(reportType, deploymentId) {
    const self = this;
    self.props.selectDeployment(deploymentId).then(() => self.setState({ createDialog: false, reportType, reportDialog: true }));
  }

  _abortDeployment(id) {
    var self = this;
    return self.props
      .abortDeployment(id)
      .then(() => {
        clearTimeout(self.dynamicTimer);
        self.setState({ createDialog: false, reportDialog: false, doneLoading: false });
        self.props.setSnackbar('The deployment was successfully aborted');
        self._refreshDeployments();
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res ? err.res.body.error : '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was wan error while aborting the deployment: ${errMsg}`));
      });
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
    clearTimeout(self.dynamicTimer);
    self.setState({ tabIndex, pendPage: 1, progPage: 1 }, () => {
      if (tabIndex === routes.finished.route) {
        self._refreshDeployments(defaultRefreshDeploymentsLength * 2);
      } else {
        self._refreshDeployments(minimalRefreshDeploymentsLength);
      }
    });
    self.props.setSnackbar('');
  }

  closeReport() {
    const self = this;
    self.setState({ reportDialog: false }, () => self.props.selectDeployment());
  }

  render() {
    const self = this;
    // tabs
    const { isEnterprise, onboardingComplete, past, pastCount, pending, pendingCount, progress, progressCount } = self.props;
    const { contentClass, createDialog, deploymentObject, doneLoading, pendPage, progPage, reportDialog, reportType, startDate, tabIndex } = self.state;
    let onboardingComponent = null;
    if (past.length || pastCount) {
      onboardingComponent = getOnboardingComponentFor('deployments-past', { anchor: { left: 240, top: 50 } });
    }

    return (
      <>
        <div className="margin-left margin-top" style={{ maxWidth: '80vw' }}>
          <div className="flexbox space-between">
            <Tabs value={tabIndex} onChange={(e, tabIndex) => self._changeTab(tabIndex)}>
              {Object.values(routes).map(route => (
                <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.route} />
              ))}
            </Tabs>
            <Button color="secondary" variant="contained" onClick={() => self.setState({ createDialog: true })} style={{ height: '100%' }}>
              Create a deployment
            </Button>
          </div>
          {tabIndex === routes.active.route && (
            <Progress
              abort={id => self._abortDeployment(id)}
              count={progressCount || progress.length}
              defaultPageSize={DEFAULT_PENDING_INPROGRESS_COUNT}
              doneLoading={doneLoading}
              isEnterprise={isEnterprise}
              onboardingComplete={onboardingComplete}
              openReport={(type, id) => self.showReport(type, id)}
              pastDeploymentsCount={pastCount}
              pending={pending}
              pendingCount={pendingCount}
              pendPage={pendPage}
              progress={progress}
              progPage={progPage}
              page={progPage}
              refreshItems={(...args) => self._refreshInProgress(...args)}
            />
          )}
          {tabIndex === routes.scheduled.route && (
            <Scheduled
              loading={!doneLoading}
              abort={id => self._abortDeployment(id)}
              count={pendingCount || pending.length}
              defaultPageSize={DEFAULT_PENDING_INPROGRESS_COUNT}
              items={pending}
              page={pendPage}
              refreshItems={(...args) => self._refreshPending(...args)}
              isEnterprise={isEnterprise}
              refreshDeployments={(...args) => self.refreshDeployments(...args)}
              showReport={(type, id) => self.showReport(type, id)}
            />
          )}
          {tabIndex === routes.finished.route && (
            <Past
              createClick={() => self.setState({ createDialog: true })}
              loading={!doneLoading}
              refreshDeployments={(...args) => self.refreshDeployments(...args)}
              showReport={(type, id) => self.showReport(type, id)}
              startDate={startDate}
            />
          )}
        </div>
        {reportDialog && (
          <Report
            abort={id => self._abortDeployment(id)}
            contentClass={contentClass}
            onClose={() => self.closeReport()}
            retry={(deployment, devices) => self.retryDeployment(deployment, devices)}
            type={reportType}
          />
        )}

        {createDialog && (
          <CreateDialog
            open={createDialog}
            onDismiss={() => self.setState({ createDialog: false, deploymentObject: {} })}
            onScheduleSubmit={deploymentObj => self.onScheduleSubmit(deploymentObj)}
            deploymentObject={deploymentObject}
          />
        )}
        {onboardingComponent}
      </>
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
  const progress = state.deployments.byStatus.inprogress.selectedDeploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const pending = state.deployments.byStatus.pending.selectedDeploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const groups = Object.keys(state.devices.groups.byId).filter(group => group !== DeviceConstants.UNGROUPED_GROUP.id);
  return {
    finishedCount: state.deployments.byStatus.finished.total,
    groups,
    hasDeployments: Object.keys(state.deployments.byId).length > 0,
    isEnterprise: state.app.features.isEnterprise || state.app.features.isHosted,
    onboardingComplete: state.users.onboarding.complete,
    past: state.deployments.byStatus.finished.deploymentIds,
    pastCount: state.deployments.byStatus.finished.total,
    pending,
    pendingCount: state.deployments.byStatus.pending.total,
    progress,
    progressCount: state.deployments.byStatus.inprogress.total,
    settings: state.users.globalSettings,
    showHelptips: state.users.showHelptips,
    user: state.users.byId[state.users.currentUser] || {}
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Deployments));
