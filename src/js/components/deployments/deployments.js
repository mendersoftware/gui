import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Tab, Tabs } from '@mui/material';

import { getGroups, getDynamicGroups } from '../../actions/deviceActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, setDeploymentsState } from '../../actions/deploymentActions';
import { DEPLOYMENT_ROUTES, DEPLOYMENT_STATES, listDefaultsByState } from '../../constants/deploymentConstants';
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
import { useLocationParams } from '../../utils/liststatehook';

const routes = {
  [DEPLOYMENT_ROUTES.active.key]: {
    ...DEPLOYMENT_ROUTES.active,
    component: Progress
  },
  [DEPLOYMENT_ROUTES.scheduled.key]: {
    ...DEPLOYMENT_ROUTES.scheduled,
    component: Scheduled
  },
  [DEPLOYMENT_ROUTES.finished.key]: {
    ...DEPLOYMENT_ROUTES.finished,
    component: Past
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
  selectionState,
  setDeploymentsState,
  setSnackbar
}) => {
  const [deploymentObject, setDeploymentObject] = useState({});
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const tabsRef = useRef();
  const navigate = useNavigate();
  const { reportType, showCreationDialog: createDialog, showReportDialog: reportDialog, state } = selectionState.general;

  const [date] = useState({
    today: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    tonight: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  });
  const { today, tonight } = date;

  const [locationParams, setLocationParams] = useLocationParams('deployments', { today, tonight, defaults: listDefaultsByState });

  useEffect(() => {
    setLocationParams({ deploymentObject, pageState: selectionState });
  }, [
    selectionState.selectedId,
    selectionState.general.state,
    selectionState.general.showCreationDialog,
    selectionState.general.showReportDialog,
    selectionState.general.reportType,
    selectionState[DEPLOYMENT_STATES.finished].endDate,
    selectionState[DEPLOYMENT_STATES.finished].search,
    selectionState[DEPLOYMENT_STATES.finished].startDate,
    selectionState[DEPLOYMENT_STATES.finished].page,
    selectionState[DEPLOYMENT_STATES.finished].perPage,
    selectionState[DEPLOYMENT_STATES.finished].type,
    selectionState[DEPLOYMENT_STATES.inprogress].page,
    selectionState[DEPLOYMENT_STATES.inprogress].perPage,
    selectionState[DEPLOYMENT_STATES.pending].page,
    selectionState[DEPLOYMENT_STATES.pending].perPage
  ]);

  useEffect(() => {
    getGroups();
    if (isEnterprise) {
      getDynamicGroups();
    }
    const { deploymentObject = {}, id: selectedId, ...remainder } = locationParams;
    const { device: deviceId, release: releaseName } = deploymentObject;
    const release = releaseName ? { ...releases[releaseName] } : undefined;
    const device = deviceId ? { ...devicesById[deviceId] } : undefined;
    setDeploymentObject({ device, release });
    setDeploymentsState({ selectedId, ...remainder });
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
    if (routes.active.key !== state) {
      navigate(routes.active.route);
      changeTab(undefined, routes.active.key);
    }
  };

  const onAbortDeployment = id =>
    abortDeployment(id).then(() => {
      setDeploymentsState({ general: { showCreationDialog: false, showReportDialog: false } });
      return Promise.resolve();
    });

  const changeTab = (_, tabIndex) => {
    setDeploymentsState({ general: { state: tabIndex } });
    setSnackbar('');
    if (pastCount && !onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST);
    }
  };

  const showReport = (reportType, selectedId) => {
    if (!onboardingState.complete) {
      advanceOnboarding(onboardingSteps.DEPLOYMENTS_INPROGRESS);
    }
    setDeploymentsState({ general: { reportType, showCreationDialog: false, showReportDialog: true }, selectedId });
  };

  const closeReport = () => setDeploymentsState({ general: { reportType: undefined, showReportDialog: false }, selectedId: undefined });

  const onCreationDismiss = () => {
    setDeploymentsState({ general: { showCreationDialog: false } });
    setDeploymentObject({});
  };

  const onCreationShow = () => setDeploymentsState({ general: { showCreationDialog: true } });

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

  const ComponentToShow = routes[state].component;
  return (
    <>
      <div className="margin-left-small margin-top" style={{ maxWidth: '80vw' }}>
        <div className="flexbox space-between">
          <Tabs value={state} onChange={changeTab} ref={tabsRef}>
            {Object.values(routes).map(route => (
              <Tab component={Link} key={route.route} label={route.title} to={route.route} value={route.key} />
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
    selectionState: state.deployments.selectionState,
    settings: state.users.globalSettings
  };
};

export default connect(mapStateToProps, actionCreators)(Deployments);
