import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@material-ui/core';

import { getAllGroupDevices, selectDevice } from '../../actions/deviceActions';
import { selectRelease } from '../../actions/releaseActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, createDeployment, getDeploymentCount, getDeploymentsByStatus, selectDeployment } from '../../actions/deploymentActions';
import * as DeviceConstants from '../../constants/deviceConstants';

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

const deploymentStatusMap = {
  finished: 'past',
  inprogress: 'prog',
  pending: 'pend'
};

export class Deployments extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
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
        clearInterval(self.timer);
        self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
        self._refreshDeployments();
      }
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
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
        setRetryTimer(err, 'deployments', `Couldn't load deployments. ${errormsg}`, refreshDeploymentsLength, self.props.setSnackbar);
      })
      .finally(() => {
        const mappedDeploymentStatus = deploymentStatusMap[deploymentStatus];
        self.setState({
          doneLoading: true,
          [`${mappedDeploymentStatus}Page`]: page
        });
      });
  }

  _refreshDeployments() {
    this._refreshInProgress();
    this._refreshPending();
    if (!this.props.onboardingComplete && this._getCurrentLabel() === routes.finished.title) {
      this.refreshDeployments(1, DEFAULT_PENDING_INPROGRESS_COUNT, 'finished');
    }
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

  _retryDeployment(deployment, devices) {
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
        self.setState({ doneLoading: true, deploymentObject: {} });
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
    clearInterval(self.timer);
    if (this._getCurrentLabel() !== routes.finished.title) {
      self.timer = setInterval(() => self._refreshDeployments(), refreshDeploymentsLength);
    }
    self.setState({ tabIndex, pendPage: 1, progPage: 1 }, () => self._refreshDeployments());
    self.props.setSnackbar('');
  }

  closeReport() {
    const self = this;
    self.setState({ reportDialog: false }, () => self.props.selectDeployment());
  }

  render() {
    const self = this;
    let dialogContent = <Report retry={(deployment, devices) => this._retryDeployment(deployment, devices)} past={true} />;
    if (this.state.reportType === 'active') {
      dialogContent = <Report abort={id => this._abortDeployment(id)} />;
    }

    // tabs
    const { groups, isEnterprise, onboardingComplete, past, pastCount, pending, pendingCount, progress, progressCount } = self.props;
    const { contentClass, createDialog, deploymentObject, doneLoading, pendPage, progPage, reportDialog, reportType, startDate, tabIndex } = self.state;
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
          onClick={() => self.setState({ createDialog: true })}
          style={{ position: 'absolute' }}
        >
          Create a deployment
        </Button>
        <Tabs value={tabIndex} onChange={(e, tabIndex) => self._changeTab(tabIndex)} style={{ display: 'inline-block' }}>
          {Object.values(routes).map(route => (
            <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.route} />
          ))}
        </Tabs>

        {tabIndex === routes.active.route && (
          <>
            {doneLoading ? (
              <div className="margin-top">
                <DeploymentsList
                  abort={id => self._abortDeployment(id)}
                  count={pendingCount || pending.length}
                  defaultPageSize={DEFAULT_PENDING_INPROGRESS_COUNT}
                  items={pending}
                  page={pendPage}
                  refreshItems={(...args) => self._refreshPending(...args)}
                  isEnterprise={isEnterprise}
                  isActiveTab={self._getCurrentLabel() === routes.active.title}
                  title="pending"
                  type="pending"
                />
                <Progress
                  abort={id => self._abortDeployment(id)}
                  count={progressCount || progress.length}
                  defaultPageSize={DEFAULT_PENDING_INPROGRESS_COUNT}
                  isActiveTab={self._getCurrentLabel() === routes.active.title}
                  items={progress}
                  onboardingComplete={onboardingComplete}
                  openReport={rowNum => self._showProgress(rowNum)}
                  page={progPage}
                  pastDeploymentsCount={pastCount}
                  refreshItems={(...args) => self._refreshInProgress(...args)}
                  title="In progress"
                  type="progress"
                />
                {!(progressCount || progress.length || pendingCount || pending.length) && (
                  <div className={progress.length || !doneLoading ? 'hidden' : 'dashboard-placeholder'}>
                    <p>Pending and ongoing deployments will appear here. </p>
                    <p>
                      <a onClick={() => self.setState({ createDialog: true })}>Create a deployment</a> to get started
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
              createClick={() => self.setState({ createDialog: true })}
              groups={groups}
              isActiveTab={self._getCurrentLabel() === routes.finished.title}
              loading={!doneLoading}
              refreshDeployments={(...args) => self.refreshDeployments(...args)}
              showReport={type => self._showReport(type)}
              startDate={startDate}
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
            onDismiss={() => self.setState({ createDialog: false, deploymentObject: {} })}
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
  const progress = state.deployments.byStatus.inprogress.selectedDeploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const pending = state.deployments.byStatus.pending.selectedDeploymentIds.reduce(tryMapDeployments, { state, deployments: [] }).deployments;
  const groups = Object.keys(state.devices.groups.byId).reduce((accu, group) => {
    if (group !== DeviceConstants.UNGROUPED_GROUP.id) {
      accu.push(group);
    }
    return accu;
  }, []);
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
