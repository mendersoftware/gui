import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Close as CloseIcon, ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Button, Divider, Drawer, IconButton, Typography, accordionClasses } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import moment from 'moment';
import pluralize from 'pluralize';

import { createDeployment } from '../../actions/deploymentActions';
import { getGroupDevices } from '../../actions/deviceActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { getReleases } from '../../actions/releaseActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { ALL_DEVICES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { deepCompare, standardizePhases, toggle, validatePhases } from '../../helpers';
import { getDocsVersion, getIdAttribute, getIsEnterprise, getOnboardingState, getTenantCapabilities } from '../../selectors';
import Tracking from '../../tracking';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Confirm from '../common/confirm';
import { RolloutPatternSelection } from './deployment-wizard/phasesettings';
import { Retries, RolloutOptions } from './deployment-wizard/rolloutoptions';
import { ScheduleRollout } from './deployment-wizard/schedulerollout';
import { Devices, ReleasesWarning, Software } from './deployment-wizard/softwaredevices';

const MAX_PREVIOUS_PHASES_COUNT = 5;

const useStyles = makeStyles()(theme => ({
  accordion: {
    backgroundColor: theme.palette.grey[400],
    marginTop: theme.spacing(4),
    '&:before': {
      display: 'none'
    },
    [`&.${accordionClasses.expanded}`]: {
      margin: 'auto',
      marginTop: theme.spacing(4)
    }
  },
  columns: {
    alignItems: 'start',
    columnGap: 30,
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    '&>p': {
      marginTop: theme.spacing(3)
    }
  },
  disabled: { color: theme.palette.text.disabled }
}));

const getAnchor = (element, heightAdjustment = 3) => ({
  top: element.offsetTop + element.offsetHeight / heightAdjustment,
  left: element.offsetLeft + element.offsetWidth
});

export const getPhaseStartTime = (phases, index, startDate) => {
  if (index < 1) {
    return startDate?.toISOString ? startDate.toISOString() : startDate;
  }
  // since we don't want to get stale phase start times when the creation dialog is open for a long time
  // we have to ensure start times are based on delay from previous phases
  // since there likely won't be 1000s of phases this should still be fine to recalculate
  const newStartTime = phases.slice(0, index).reduce((accu, phase) => moment(accu).add(phase.delay, phase.delayUnit), startDate);
  return newStartTime.toISOString();
};

export const CreateDeployment = props => {
  const {
    acceptedDeviceCount,
    advanceOnboarding,
    canRetry,
    createdGroup,
    createDeployment,
    deploymentObject = {},
    getGroupDevices,
    getReleases,
    groups,
    hasDevices,
    isOnboardingComplete,
    onboardingState,
    onDismiss,
    onScheduleSubmit,
    open = true,
    needsCheck,
    previousPhases,
    previousRetries,
    releases,
    releasesById,
    saveGlobalSettings,
    setDeploymentObject
  } = props;

  const isCreating = useRef(false);
  const [releaseSelectionLocked] = useState(Boolean(deploymentObject.release));
  const [hasNewRetryDefault, setHasNewRetryDefault] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const releaseRef = useRef();
  const groupRef = useRef();
  const deploymentAnchor = useRef();
  const { classes } = useStyles();

  useEffect(() => {
    const searchConfig = deploymentObject.device?.attributes.device_type
      ? { searchAttribute: 'device_type', searchTerm: deploymentObject.device.attributes.device_type[0] }
      : {};
    getReleases({ page: 1, perPage: 100, searchOnly: true, ...searchConfig });
  }, []);

  useEffect(() => {
    if (deploymentObject.release) {
      advanceOnboarding(onboardingSteps.SCHEDULING_ARTIFACT_SELECTION);
    }
    if (!deploymentObject.group) {
      setDeploymentObject({ ...deploymentObject, deploymentDeviceCount: deploymentObject.device ? 1 : 0 });
      return;
    }
    advanceOnboarding(onboardingSteps.SCHEDULING_GROUP_SELECTION);
    if (deploymentObject.group === ALL_DEVICES) {
      advanceOnboarding(onboardingSteps.SCHEDULING_ALL_DEVICES_SELECTION);
      setDeploymentObject({ ...deploymentObject, deploymentDeviceCount: acceptedDeviceCount });
      return;
    }
    if (!groups[deploymentObject.group]) {
      setDeploymentObject({ ...deploymentObject, deploymentDeviceCount: deploymentObject.device ? 1 : 0 });
      return;
    }
    getGroupDevices(deploymentObject.group, { perPage: 1 }).then(({ group: { total: deploymentDeviceCount } }) =>
      setDeploymentObject(deploymentObject => ({ ...deploymentObject, deploymentDeviceCount }))
    );
  }, [deploymentObject.group, deploymentObject.release]);

  useEffect(() => {
    let deviceIds = deploymentObject.deploymentDeviceIds || [];
    let deviceCount = deploymentObject.deploymentDeviceCount;
    if (deploymentObject.device) {
      deviceIds = [deploymentObject.device.id];
      deviceCount = deviceIds.length;
    } else if (deploymentObject.group === ALL_DEVICES) {
      deviceCount = acceptedDeviceCount;
    }
    setDeploymentObject({ ...deploymentObject, deploymentDeviceIds: deviceIds, deploymentDeviceCount: deviceCount });
  }, [JSON.stringify(deploymentObject)]);

  const cleanUpDeploymentsStatus = () => {
    if (!window.location.search) {
      return;
    }
    const location = window.location.pathname.slice('/ui'.length);
    navigate(location); // lgtm [js/client-side-unvalidated-url-redirection]
  };

  const onSaveRetriesSetting = hasNewRetryDefault => setHasNewRetryDefault(hasNewRetryDefault);

  const setDeploymentSettings = useCallback(
    change => {
      setDeploymentObject({ ...deploymentObject, ...change });
    },
    [JSON.stringify(deploymentObject)]
  );

  const closeWizard = () => {
    cleanUpDeploymentsStatus();
    onDismiss();
  };

  const onScheduleSubmitClick = settings => {
    if (needsCheck && !isChecking) {
      return setIsChecking(true);
    }
    isCreating.current = true;
    const { deploymentDeviceIds, device, filterId, group, phases, release, retries, update_control_map } = settings;
    const startTime = phases?.length ? phases[0].start_ts : undefined;
    const retrySetting = canRetry && retries ? { retries } : {};
    const newDeployment = {
      artifact_name: release.Name,
      devices: (filterId || group) && !device ? undefined : deploymentDeviceIds,
      filter_id: filterId,
      all_devices: !filterId && group === ALL_DEVICES,
      group: group === ALL_DEVICES || device ? undefined : group,
      name: device?.id || (group ? decodeURIComponent(group) : ALL_DEVICES),
      phases: phases
        ? phases.map((phase, i, origPhases) => {
            phase.start_ts = getPhaseStartTime(origPhases, i, startTime);
            return phase;
          })
        : phases,
      ...retrySetting,
      update_control_map
    };
    if (!isOnboardingComplete) {
      advanceOnboarding(onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES);
    }
    return createDeployment(newDeployment)
      .then(() => {
        let newSettings = { retries: hasNewRetryDefault ? retries : previousRetries };
        if (phases) {
          const standardPhases = standardizePhases(phases);
          let prevPhases = previousPhases.map(standardizePhases);
          if (!prevPhases.find(previousPhaseList => previousPhaseList.every(oldPhase => standardPhases.find(phase => deepCompare(phase, oldPhase))))) {
            prevPhases.push(standardPhases);
          }
          newSettings.previousPhases = prevPhases.slice(-1 * MAX_PREVIOUS_PHASES_COUNT);
        }
        saveGlobalSettings(newSettings);
        // track in GA
        Tracking.event({ category: 'deployments', action: 'create' });
        // successfully retrieved new deployment
        cleanUpDeploymentsStatus();
        onScheduleSubmit();
      })
      .finally(() => {
        isCreating.current = false;
        setIsChecking(false);
      });
  };

  const { deploymentDeviceCount, device, group, phases, release: deploymentRelease = null } = deploymentObject;

  let onboardingComponent = null;
  if (releaseRef.current && groupRef.current && deploymentAnchor.current) {
    const anchor = getAnchor(releaseRef.current);
    const groupAnchor = getAnchor(groupRef.current);
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.SCHEDULING_ALL_DEVICES_SELECTION, onboardingState, { anchor: groupAnchor, place: 'right' });
    if (createdGroup) {
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_GROUP_SELECTION,
        { ...onboardingState, createdGroup },
        { anchor: groupAnchor, place: 'right' },
        onboardingComponent
      );
    }
    if (deploymentDeviceCount && !deploymentRelease) {
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_ARTIFACT_SELECTION,
        { ...onboardingState, selectedRelease: releasesById[releases[0]] || {} },
        { anchor, place: 'right' },
        onboardingComponent
      );
    }
    if (hasDevices && deploymentDeviceCount && deploymentRelease) {
      const buttonAnchor = getAnchor(deploymentAnchor.current, 2);
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES,
        { ...onboardingState, selectedDevice: device, selectedGroup: group, selectedRelease: deploymentRelease },
        { anchor: buttonAnchor, place: 'right' },
        onboardingComponent
      );
    }
  }

  const deploymentSettings = {
    ...deploymentObject,
    filterId: groups[group] ? groups[group].id : undefined
  };
  const disabled =
    isCreating.current ||
    !(deploymentSettings.release && (deploymentSettings.deploymentDeviceCount || deploymentSettings.filterId || deploymentSettings.group)) ||
    !validatePhases(phases, deploymentSettings.deploymentDeviceCount, deploymentSettings.filterId);

  const sharedProps = {
    ...props,
    commonClasses: classes,
    deploymentObject: deploymentSettings,
    hasNewRetryDefault,
    onSaveRetriesSetting,
    open: false,
    releaseSelectionLocked,
    setDeploymentSettings
  };
  const hasReleases = !!Object.keys(releasesById).length;
  return (
    <Drawer anchor="right" open={open} onClose={closeWizard} PaperProps={{ style: { minWidth: '50vw' } }}>
      <div className="flexbox space-between center-aligned">
        <h3>Create a deployment</h3>
        <IconButton onClick={closeWizard} aria-label="close" size="large">
          <CloseIcon />
        </IconButton>
      </div>
      <Divider className="margin-bottom" />
      <form>
        {!hasReleases ? (
          <ReleasesWarning />
        ) : (
          <>
            <Devices {...sharedProps} groupRef={groupRef} />
            <Software {...sharedProps} releaseRef={releaseRef} />
          </>
        )}
        <ScheduleRollout {...sharedProps} />
        <Accordion className={classes.accordion} square expanded={isExpanded} onChange={() => setIsExpanded(toggle)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography className={classes.disabled} variant="subtitle2">
              {isExpanded ? 'Hide' : 'Show'} advanced options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RolloutPatternSelection {...sharedProps} />
            <RolloutOptions {...sharedProps} />
            <Retries {...sharedProps} />
          </AccordionDetails>
        </Accordion>
      </form>
      <div className="margin-top">
        {isChecking && (
          <Confirm
            classes="confirmation-overlay"
            cancel={() => setIsChecking(false)}
            action={() => onScheduleSubmitClick(deploymentSettings)}
            message={`This will deploy ${deploymentSettings.release?.Name} to ${deploymentDeviceCount} ${pluralize(
              'device',
              deploymentDeviceCount
            )}. Are you sure?`}
            style={{ paddingLeft: 12, justifyContent: 'flex-start', maxHeight: 44 }}
          />
        )}
        <Button onClick={closeWizard} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" ref={deploymentAnchor} disabled={disabled} onClick={() => onScheduleSubmitClick(deploymentSettings)}>
          Create deployment
        </Button>
      </div>
      {onboardingComponent}
    </Drawer>
  );
};

const actionCreators = { advanceOnboarding, createDeployment, getGroupDevices, getReleases, saveGlobalSettings };

export const mapStateToProps = state => {
  const { canRetry, canSchedule } = getTenantCapabilities(state);
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    acceptedDeviceCount: state.devices.byStatus.accepted.total,
    canRetry,
    canSchedule,
    createdGroup: Object.keys(groups).length ? Object.keys(groups)[0] : undefined,
    docsVersion: getDocsVersion(state),
    groups,
    hasDevices: state.devices.byStatus.accepted.total || state.devices.byStatus.accepted.deviceIds.length > 0,
    hasDynamicGroups: Object.values(groups).some(group => !!group.id),
    hasPending: state.devices.byStatus.pending.total,
    idAttribute: getIdAttribute(state).attribute,
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    isOnboardingComplete: state.onboarding.complete,
    needsCheck: state.users.globalSettings.needsDeploymentConfirmation,
    onboardingState: getOnboardingState(state),
    previousPhases: state.users.globalSettings.previousPhases || [],
    previousRetries: state.users.globalSettings.retries || 0,
    releases: state.releases.releasesList.searchedIds,
    releasesById: state.releases.byId
  };
};

export default connect(mapStateToProps, actionCreators)(CreateDeployment);
