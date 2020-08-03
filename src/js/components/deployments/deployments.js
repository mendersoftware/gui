import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Button, Tab, Tabs } from '@material-ui/core';

import { getGroups, getDynamicGroups, initializeGroupsDevices, selectDevice } from '../../actions/deviceActions';
import { selectRelease } from '../../actions/releaseActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, createDeployment, selectDeployment } from '../../actions/deploymentActions';

import CreateDialog from './createdeployment';
import Progress from './inprogressdeployments';
import Past from './pastdeployments';
import Report from './report';
import Scheduled from './scheduleddeployments';

import { deepCompare, preformatWithRequestID, standardizePhases } from '../../helpers';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Tracking from '../../tracking';

const MAX_PREVIOUS_PHASES_COUNT = 5;

const routes = {
  active: {
    component: Progress,
    route: '/deployments/active',
    title: 'Active'
  },
  scheduled: {
    component: Scheduled,
    route: '/deployments/scheduled',
    title: 'Scheduled'
  },
  finished: {
    component: Past,
    route: '/deployments/finished',
    title: 'Finished'
  }
};

export const defaultRefreshDeploymentsLength = 30000;

export class Deployments extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentRefreshDeploymentLength: defaultRefreshDeploymentsLength,
      deploymentObject: {},
      createDialog: false,
      reportDialog: false,
      startDate: null,
      tabIndex: this._updateActive()
    };
  }

  componentDidMount() {
    const self = this;
    let tasks = [self.props.getGroups(), self.props.selectRelease(), self.props.selectDevice()];
    if (self.props.isEnterprise) {
      tasks.push(self.props.getDynamicGroups());
    }
    Promise.all(tasks)
      .then(() => self.props.initializeGroupsDevices())
      .catch(err => console.log(err));
    let startDate = self.state.startDate;
    const params = new URLSearchParams(this.props.location.search);
    if (this.props.match) {
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
    self.setState({
      createDialog: Boolean(params.get('open')),
      reportType: this.props.match ? this.props.match.params.tab : 'active',
      startDate,
      tabIndex: this._updateActive()
    });
  }

  retryDeployment(deployment, devices) {
    const self = this;
    const release = { Name: deployment.artifact_name, device_types_compatible: deployment.device_types_compatible || [] };
    const deploymentObject = {
      group: deployment.name,
      deploymentDeviceIds: devices.map(item => item.id),
      release,
      phases: [{ batch_size: 100, start_ts: new Date().toISOString(), delay: 0 }]
    };
    self.setState({ deploymentObject, createDialog: true, reportDialog: false });
  }

  onScheduleSubmit(deploymentObject) {
    const self = this;
    const { deploymentDeviceIds, filterId, group, phases, release, retries } = deploymentObject;
    const newDeployment = {
      artifact_name: release.Name,
      devices: filterId ? undefined : deploymentDeviceIds,
      filter_id: filterId,
      group,
      name: decodeURIComponent(group) || 'All devices',
      phases,
      retries
    };
    self.setState({ doneLoading: false, createDialog: false, reportDialog: false });

    return self.props.createDeployment(newDeployment).then(() => {
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
      // track in GA
      Tracking.event({ category: 'deployments', action: 'create' });
      // successfully retrieved new deployment
      if (self._getCurrentRoute().title !== routes.active.title) {
        self.props.history.push(routes.active.route);
        self._changeTab(routes.active.route);
      }
    });
  }

  _abortDeployment(id) {
    var self = this;
    return self.props
      .abortDeployment(id)
      .then(() => {
        self.setState({ createDialog: false, reportDialog: false, doneLoading: false });
        self.props.setSnackbar('The deployment was successfully aborted');
        return Promise.resolve();
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

  _getCurrentRoute(tab = this.props.match.params.tab) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab];
    }
    return routes.active;
  }

  _changeTab(tabIndex) {
    var self = this;
    self.setState({ tabIndex });
    self.props.setSnackbar('');
  }

  showReport(reportType, deploymentId) {
    const self = this;
    self.props.selectDeployment(deploymentId).then(() => self.setState({ createDialog: false, reportType, reportDialog: true }));
  }

  closeReport() {
    const self = this;
    self.setState({ reportDialog: false }, () => self.props.selectDeployment());
  }

  render() {
    const self = this;
    const { pastCount } = self.props;
    // tabs
    const { createDialog, deploymentObject, reportDialog, reportType, startDate, tabIndex } = self.state;
    let onboardingComponent = null;
    // the pastCount prop is needed to trigger the rerender as the change in past deployments would otherwise not be noticed on this view
    if (pastCount && self.tabsRef) {
      const tabs = self.tabsRef.getElementsByClassName('MuiTab-root');
      const finishedTab = tabs[tabs.length - 1];
      onboardingComponent = getOnboardingComponentFor('deployments-past', {
        anchor: {
          left: self.tabsRef.offsetLeft + self.tabsRef.offsetWidth - finishedTab.offsetWidth / 2,
          top: self.tabsRef.offsetHeight + finishedTab.offsetHeight
        }
      });
    }
    const ComponentToShow = self._getCurrentRoute().component;
    return (
      <>
        <div className="margin-left-small margin-top" style={{ maxWidth: '80vw' }}>
          <div className="flexbox space-between">
            <Tabs value={tabIndex} onChange={(e, newTabIndex) => self._changeTab(newTabIndex)} ref={ref => (self.tabsRef = ref)}>
              {Object.values(routes).map(route => (
                <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.route} />
              ))}
            </Tabs>
            <Button color="secondary" variant="contained" onClick={() => self.setState({ createDialog: true })} style={{ height: '100%' }}>
              Create a deployment
            </Button>
          </div>
          <ComponentToShow
            abort={id => self._abortDeployment(id)}
            createClick={() => self.setState({ createDialog: true })}
            openReport={(type, id) => self.showReport(type, id)}
            startDate={startDate}
          />
        </div>
        {reportDialog && (
          <Report
            abort={id => self._abortDeployment(id)}
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
  getGroups,
  getDynamicGroups,
  initializeGroupsDevices,
  saveGlobalSettings,
  selectDevice,
  selectDeployment,
  selectRelease,
  setSnackbar
};

const mapStateToProps = state => {
  const { plan = 'os' } = state.users.organization;
  return {
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    pastCount: state.deployments.byStatus.finished.total,
    settings: state.users.globalSettings
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Deployments));
