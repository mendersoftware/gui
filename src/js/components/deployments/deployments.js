import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { Button, Tab, Tabs } from '@material-ui/core';

import { getGroups, getDynamicGroups, initializeGroupsDevices, selectDevice } from '../../actions/deviceActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { selectRelease } from '../../actions/releaseActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, selectDeployment } from '../../actions/deploymentActions';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getIsEnterprise, getOnboardingState } from '../../selectors';

import CreateDialog from './createdeployment';
import Progress from './inprogressdeployments';
import Past from './pastdeployments';
import Report from './report';
import Scheduled from './scheduleddeployments';

import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import useWindowSize from '../../utils/resizehook';

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

const today = new Date(new Date().setHours(0, 0, 0));

export const Deployments = ({
  abortDeployment,
  advanceOnboarding,
  getDynamicGroups,
  getGroups,
  history,
  initializeGroupsDevices,
  isEnterprise,
  location,
  match,
  onboardingState,
  pastCount,
  selectDeployment,
  selectDevice,
  selectRelease,
  setSnackbar
}) => {
  const [deploymentObject, setDeploymentObject] = useState({});
  const [createDialog, setCreateDialog] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportType, setReportType] = useState();
  const [startDate, setStartDate] = useState();
  const [tabIndex, setTabIndex] = useState(routes.active.route);
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const tabsRef = useRef();

  useEffect(() => {
    let tasks = [getGroups(), selectRelease(), selectDevice()];
    if (isEnterprise) {
      tasks.push(getDynamicGroups());
    }
    Promise.all(tasks).then(initializeGroupsDevices).catch(console.log);
    let startDate = today;
    const params = new URLSearchParams(location.search);
    let reportType = 'active';
    if (match) {
      reportType = match.params.tab;
      if (params.get('open')) {
        if (params.get('id')) {
          showReport(reportType, params.get('id'));
        } else if (params.get('release')) {
          selectRelease(params.get('release'));
        } else if (params.get('deviceId')) {
          selectDevice(params.get('deviceId'));
        } else {
          setTimeout(() => setCreateDialog(true), 400);
        }
      } else if (params.get('from')) {
        startDate = new Date(params.get('from'));
        startDate.setHours(0, 0, 0);
      }
    }
    setCreateDialog(Boolean(params.get('open')) && !params.get('id'));
    setReportType(reportType);
    setStartDate(startDate);
    setTabIndex(updateActive());
  }, []);

  const retryDeployment = (deployment, devices) => {
    const { artifact_name, device_types_compatible = [], name, update_control_map = {} } = deployment;
    const release = { Name: artifact_name, device_types_compatible };
    const updateControlMap = isEnterprise ? { update_control_map: { states: update_control_map.states || {} } } : {};
    const deploymentObject = {
      group: name,
      deploymentDeviceIds: devices.map(item => item.id),
      phases: [{ batch_size: 100, start_ts: undefined, delay: 0 }],
      release,
      ...updateControlMap
    };
    setDeploymentObject(deploymentObject);
    setCreateDialog(true);
    setReportDialog(false);
  };

  const onScheduleSubmit = () => {
    setCreateDialog(false);
    setReportDialog(false);
    setDeploymentObject({});
    // successfully retrieved new deployment
    if (getCurrentRoute().title !== routes.active.title) {
      history.push(routes.active.route);
      changeTab(routes.active.route);
    }
  };

  const onAbortDeployment = id =>
    abortDeployment(id).then(() => {
      setCreateDialog(false);
      setReportDialog(false);
      return Promise.resolve();
    });

  const updateActive = (tab = match.params.tab) => {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.active.route;
  };

  const getCurrentRoute = (tab = match.params.tab) => {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab];
    }
    return routes.active;
  };

  const changeTab = tabIndex => {
    setTabIndex(tabIndex);
    setSnackbar('');
    if (pastCount && !onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST);
    }
  };

  const showReport = (reportType, deploymentId) => {
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEPLOYMENTS_INPROGRESS);
    }
    selectDeployment(deploymentId).then(() => {
      setCreateDialog(false);
      setReportType(reportType);
      setReportDialog(true);
    });
  };

  const closeReport = () => {
    setReportDialog(false);
    selectDeployment();
  };

  const onCreationDismiss = () => {
    setCreateDialog(false);
    setDeploymentObject({});
  };

  let onboardingComponent = null;
  // the pastCount prop is needed to trigger the rerender as the change in past deployments would otherwise not be noticed on this view
  if (pastCount && tabsRef.current) {
    const tabs = tabsRef.current.getElementsByClassName('MuiTab-root');
    const finishedTab = tabs[tabs.length - 1];
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST, onboardingState, {
      anchor: {
        left: tabsRef.current.offsetLeft + tabsRef.current.offsetWidth - finishedTab.offsetWidth / 2,
        top: tabsRef.current.parentElement.offsetTop + finishedTab.offsetHeight
      }
    });
  }
  const ComponentToShow = getCurrentRoute().component;
  return (
    <>
      <div className="margin-left-small margin-top" style={{ maxWidth: '80vw' }}>
        <div className="flexbox space-between">
          <Tabs value={tabIndex} onChange={(e, newTabIndex) => changeTab(newTabIndex)} ref={tabsRef}>
            {Object.values(routes).map(route => (
              <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.route} />
            ))}
          </Tabs>
          <Button color="secondary" variant="contained" onClick={() => setCreateDialog(true)} style={{ height: '100%' }}>
            Create a deployment
          </Button>
        </div>
        <ComponentToShow abort={onAbortDeployment} createClick={() => setCreateDialog(true)} openReport={showReport} startDate={startDate} />
      </div>
      <Report abort={onAbortDeployment} onClose={closeReport} open={reportDialog} retry={retryDeployment} type={reportType} />
      {createDialog && <CreateDialog onDismiss={onCreationDismiss} deploymentObject={deploymentObject} onScheduleSubmit={onScheduleSubmit} />}
      {onboardingComponent}
    </>
  );
};

const actionCreators = {
  abortDeployment,
  advanceOnboarding,
  getGroups,
  getDynamicGroups,
  initializeGroupsDevices,
  selectDevice,
  selectDeployment,
  selectRelease,
  setSnackbar
};

const mapStateToProps = state => {
  return {
    isEnterprise: getIsEnterprise(state),
    onboardingState: getOnboardingState(state),
    pastCount: state.deployments.byStatus.finished.total,
    settings: state.users.globalSettings
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Deployments));
