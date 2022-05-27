import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button, Tab, Tabs } from '@mui/material';

import { getGroups, getDynamicGroups } from '../../actions/deviceActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, selectDeployment, setDeploymentsState } from '../../actions/deploymentActions';
import { DEPLOYMENT_STATES } from '../../constants/deploymentConstants';
import { ALL_DEVICES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getIsEnterprise, getOnboardingState, getUserCapabilities } from '../../selectors';

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

export const Deployments = ({
  abortDeployment,
  advanceOnboarding,
  canDeploy,
  devicesById,
  getDynamicGroups,
  getGroups,
  groupsById,
  isEnterprise,
  onboardingState,
  pastCount,
  releases,
  selectDeployment,
  selectionState,
  setDeploymentsState,
  setSnackbar
}) => {
  const [deploymentObject, setDeploymentObject] = useState({});
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const tabsRef = useRef();
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();

  useEffect(() => {
    getGroups();
    if (isEnterprise) {
      getDynamicGroups();
    }

    let finishedState = {};
    const params = new URLSearchParams(location.search);
    let deploymentObject = {};
    if (tabParam) {
      if (params.get('open')) {
        if (params.get('id')) {
          showReport(tabParam, params.get('id'));
        } else if (params.get('release')) {
          deploymentObject.release = { ...releases[params.get('release')] };
        } else if (params.get('deviceId')) {
          deploymentObject.device = { ...devicesById[params.get('deviceId')] };
        } else {
          setTimeout(() => setDeploymentsState({ general: { dialogOpen: true } }), 400);
        }
      } else if (params.get('from')) {
        const startDate = new Date(params.get('from'));
        startDate.setHours(0, 0, 0);
        finishedState = { startDate: startDate.toISOString() };
      }
    }
    setDeploymentObject(deploymentObject);
    const dialogOpen = Boolean(params.get('open')) && !params.get('id');
    let state = selectionState.state;
    if (tabParam) {
      state = updateActive(tabParam);
    } else {
      navigate(state, { replace: true });
    }
    setDeploymentsState({ general: { state, showCreationDialog: dialogOpen }, [DEPLOYMENT_STATES.finished]: finishedState });
  }, []);

  const retryDeployment = (deployment, deploymentDeviceIds) => {
    const { artifact_name, name, update_control_map = {} } = deployment;
    const release = releases[artifact_name];
    const updateControlMap = isEnterprise ? { update_control_map: { states: update_control_map.states || {} } } : {};
    const targetDevicesConfig = name === ALL_DEVICES || groupsById[name] ? { group: name } : { device: devicesById[name] };
    const deploymentObject = {
      deploymentDeviceIds,
      phases: [{ batch_size: 100, start_ts: undefined, delay: 0 }],
      release,
      deploymentDeviceCount: deploymentDeviceIds.length,
      ...targetDevicesConfig,
      ...updateControlMap
    };
    setDeploymentObject(deploymentObject);
    setDeploymentsState({ general: { showCreationDialog: true, showReportDialog: false } });
  };

  const onScheduleSubmit = () => {
    setDeploymentsState({ general: { showCreationDialog: false, showReportDialog: false } });
    setDeploymentObject({});
    // successfully retrieved new deployment
    if (getCurrentRoute().title !== routes.active.title) {
      history.push(routes.active.route);
      changeTab(undefined, routes.active.route);
    }
  };

  const onAbortDeployment = id =>
    abortDeployment(id).then(() => {
      setDeploymentsState({ general: { showCreationDialog: false, showReportDialog: false } });
      return Promise.resolve();
    });

  const updateActive = (tab = tabParam) => {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.active.route;
  };

  const getCurrentRoute = (tab = tabParam) => {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab];
    }
    return routes.active;
  };

  const changeTab = (_, tabIndex) => {
    setDeploymentsState({ general: { state: tabIndex } });
    setSnackbar('');
    if (pastCount && !onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST);
    }
  };

  const showReport = (reportType, deploymentId) => {
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEPLOYMENTS_INPROGRESS);
    }
    selectDeployment(deploymentId).then(() => setDeploymentsState({ general: { reportType, showCreationDialog: false, showReportDialog: true } }));
  };

  const closeReport = () => selectDeployment().then(() => setDeploymentsState({ general: { reportType: undefined, showReportDialog: false } }));

  const onCreationDismiss = () => {
    setDeploymentsState({ general: { showCreationDialog: false } });
    setDeploymentObject({});
  };

  const onCreationShow = () => setDeploymentsState({ general: { showCreationDialog: true } });

  const { reportType, showCreationDialog: createDialog, showReportDialog: reportDialog, state } = selectionState;
  let onboardingComponent = null;
  // the pastCount prop is needed to trigger the rerender as the change in past deployments would otherwise not be noticed on this view
  if (pastCount && tabsRef.current && !reportDialog) {
    const tabs = tabsRef.current.getElementsByClassName('MuiTab-root');
    const finishedTab = tabs[tabs.length - 1];
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.DEPLOYMENTS_PAST, onboardingState, {
      anchor: {
        left: tabsRef.current.offsetLeft + tabsRef.current.offsetWidth - finishedTab.offsetWidth / 2,
        top: tabsRef.current.parentElement.offsetTop + finishedTab.offsetHeight
      }
    });
  }

  const ComponentToShow = Object.values(routes).find(route => route.route === state).component;
  return (
    <>
      <div className="margin-left-small margin-top" style={{ maxWidth: '80vw' }}>
        <div className="flexbox space-between">
          <Tabs value={state} onChange={changeTab} ref={tabsRef}>
            {Object.values(routes).map(route => (
              <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.route} />
            ))}
          </Tabs>
          {canDeploy && (
            <Button color="secondary" variant="contained" onClick={onCreationShow} style={{ height: '100%' }}>
              Create a deployment
            </Button>
          )}
        </div>
        <ComponentToShow abort={onAbortDeployment} createClick={onCreationShow} openReport={showReport} isShowingDetails={reportDialog} />
      </div>
      <Report abort={onAbortDeployment} onClose={closeReport} open={reportDialog} retry={retryDeployment} type={reportType} />
      {createDialog && (
        <CreateDialog
          onDismiss={onCreationDismiss}
          deploymentObject={deploymentObject}
          onScheduleSubmit={onScheduleSubmit}
          setDeploymentObject={setDeploymentObject}
        />
      )}
      {!reportDialog && onboardingComponent}
    </>
  );
};

const actionCreators = {
  abortDeployment,
  advanceOnboarding,
  getGroups,
  getDynamicGroups,
  selectDeployment,
  setDeploymentsState,
  setSnackbar
};

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  const { canDeploy } = getUserCapabilities(state);
  return {
    canDeploy,
    devicesById: state.devices.byId,
    groupsById: groups,
    isEnterprise: getIsEnterprise(state),
    onboardingState: getOnboardingState(state),
    pastCount: state.deployments.byStatus.finished.total,
    releases: state.releases.byId,
    selectionState: state.deployments.selectionState.general,
    settings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(Deployments);
