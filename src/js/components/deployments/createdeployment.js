// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Close as CloseIcon, ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  Typography,
  accordionClasses
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import moment from 'moment';
import pluralize from 'pluralize';

import DeltaIcon from '../../../assets/img/deltaicon.svg';
import { createDeployment, getDeploymentsConfig } from '../../actions/deploymentActions';
import { getGroupDevices, getSystemDevices } from '../../actions/deviceActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { getReleases } from '../../actions/releaseActions';
import { ALL_DEVICES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { toggle, validatePhases } from '../../helpers';
import { getDocsVersion, getIdAttribute, getIsEnterprise, getOnboardingState, getTenantCapabilities } from '../../selectors';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import Confirm from '../common/confirm';
import { RolloutPatternSelection } from './deployment-wizard/phasesettings';
import { ForceDeploy, Retries, RolloutOptions } from './deployment-wizard/rolloutoptions';
import { ScheduleRollout } from './deployment-wizard/schedulerollout';
import { Devices, ReleasesWarning, Software } from './deployment-wizard/softwaredevices';

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
    devicesById,
    getDeploymentsConfig,
    getGroupDevices,
    getReleases,
    groups,
    hasDeltaEnabled,
    hasDevices,
    isOnboardingComplete,
    onboardingState,
    onDismiss,
    onScheduleSubmit,
    open = true,
    needsCheck,
    releases,
    releasesById,
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
    getReleases({ page: 1, perPage: 100, searchOnly: true });
    getDeploymentsConfig();
  }, []);

  useEffect(() => {
    const { devices = [], group, release } = deploymentObject;
    if (release) {
      advanceOnboarding(onboardingSteps.SCHEDULING_ARTIFACT_SELECTION);
    }
    if (!group) {
      setDeploymentObject({ ...deploymentObject, deploymentDeviceCount: devices.length ? devices.length : 0 });
      return;
    }
    advanceOnboarding(onboardingSteps.SCHEDULING_GROUP_SELECTION);
    if (group === ALL_DEVICES) {
      advanceOnboarding(onboardingSteps.SCHEDULING_ALL_DEVICES_SELECTION);
      setDeploymentObject({ ...deploymentObject, deploymentDeviceCount: acceptedDeviceCount });
      return;
    }
    if (!groups[group]) {
      setDeploymentObject({ ...deploymentObject, deploymentDeviceCount: devices.length ? devices.length : 0 });
      return;
    }
    getGroupDevices(group, { perPage: 1 }).then(({ group: { total: deploymentDeviceCount } }) =>
      setDeploymentObject(deploymentObject => ({ ...deploymentObject, deploymentDeviceCount }))
    );
  }, [deploymentObject.group, deploymentObject.release]);

  useEffect(() => {
    let { deploymentDeviceCount: deviceCount, deploymentDeviceIds: deviceIds = [], devices = [] } = deploymentObject;
    if (devices.length) {
      deviceIds = devices.map(({ id }) => id);
      deviceCount = deviceIds.length;
      devices = devices.map(({ id }) => ({ id, ...(devicesById[id] ?? {}) }));
    } else if (deploymentObject.group === ALL_DEVICES) {
      deviceCount = acceptedDeviceCount;
    }
    setDeploymentObject({ ...deploymentObject, deploymentDeviceIds: deviceIds, deploymentDeviceCount: deviceCount, devices });
  }, [JSON.stringify(deploymentObject), devicesById]);

  const cleanUpDeploymentsStatus = () => {
    if (!window.location.search) {
      return;
    }
    const location = window.location.pathname.slice('/ui'.length);
    navigate(location); // lgtm [js/client-side-unvalidated-url-redirection]
  };

  const onSaveRetriesSetting = hasNewRetryDefault => setHasNewRetryDefault(hasNewRetryDefault);

  const setDeploymentSettings = change => setDeploymentObject(current => ({ ...current, ...change }));

  const closeWizard = () => {
    cleanUpDeploymentsStatus();
    onDismiss();
  };

  const onDeltaToggle = ({ target: { checked } }) => setDeploymentSettings({ delta: checked });

  const onScheduleSubmitClick = settings => {
    if (needsCheck && !isChecking) {
      return setIsChecking(true);
    }
    isCreating.current = true;
    const { delta, deploymentDeviceIds, devices, filterId, forceDeploy = false, group, phases, release, retries, update_control_map } = settings;
    const startTime = phases?.length ? phases[0].start_ts : undefined;
    const retrySetting = canRetry && retries ? { retries } : {};
    const newDeployment = {
      artifact_name: release.Name,
      autogenerate_delta: delta,
      devices: (filterId || group) && !devices.length ? undefined : deploymentDeviceIds,
      filter_id: filterId,
      all_devices: !filterId && group === ALL_DEVICES,
      group: group === ALL_DEVICES || devices.length ? undefined : group,
      name: devices[0]?.id || (group ? decodeURIComponent(group) : ALL_DEVICES),
      phases: phases
        ? phases.map((phase, i, origPhases) => {
            phase.start_ts = getPhaseStartTime(origPhases, i, startTime);
            return phase;
          })
        : phases,
      ...retrySetting,
      force_installation: forceDeploy,
      update_control_map
    };
    if (!isOnboardingComplete) {
      advanceOnboarding(onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES);
    }
    return createDeployment(newDeployment, hasNewRetryDefault)
      .then(() => {
        // successfully retrieved new deployment
        cleanUpDeploymentsStatus();
        onScheduleSubmit();
      })
      .finally(() => {
        isCreating.current = false;
        setIsChecking(false);
      });
  };

  const { delta, deploymentDeviceCount, group, phases } = deploymentObject;

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
      <FormGroup>
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
            <ForceDeploy {...sharedProps} />
            {hasDeltaEnabled && (
              <FormControlLabel
                control={<Checkbox color="primary" checked={delta} onChange={onDeltaToggle} size="small" />}
                label={
                  <>
                    Generate and deploy Delta Artifacts (where available) <DeltaIcon />
                  </>
                }
              />
            )}
          </AccordionDetails>
        </Accordion>
      </FormGroup>
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
      <OnboardingComponent
        releaseRef={releaseRef}
        groupRef={groupRef}
        deploymentObject={deploymentObject}
        deploymentAnchor={deploymentAnchor}
        onboardingState={onboardingState}
        createdGroup={createdGroup}
        releasesById={releasesById}
        releases={releases}
        hasDevices={hasDevices}
      />
    </Drawer>
  );
};

const actionCreators = { advanceOnboarding, createDeployment, getDeploymentsConfig, getGroupDevices, getReleases, getSystemDevices };

export const mapStateToProps = state => {
  const { canRetry, canSchedule, hasFullFiltering } = getTenantCapabilities(state);
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  const { hasDelta } = state.deployments.config ?? {};
  return {
    acceptedDeviceCount: state.devices.byStatus.accepted.total,
    canRetry,
    canSchedule,
    createdGroup: Object.keys(groups).length ? Object.keys(groups)[0] : undefined,
    devicesById: state.devices.byId,
    docsVersion: getDocsVersion(state),
    groups,
    hasDevices: state.devices.byStatus.accepted.total || state.devices.byStatus.accepted.deviceIds.length > 0,
    hasDeltaEnabled: hasDelta,
    hasDynamicGroups: Object.values(groups).some(group => !!group.id),
    hasFullFiltering,
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

const OnboardingComponent = ({
  releaseRef,
  groupRef,
  deploymentAnchor,
  deploymentObject,
  onboardingState,
  createdGroup,
  releasesById,
  releases,
  hasDevices
}) => {
  const { deploymentDeviceCount, devices, group, release: deploymentRelease = null } = deploymentObject;

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
    if (hasDevices && (deploymentDeviceCount || devices?.length) && deploymentRelease) {
      const buttonAnchor = getAnchor(deploymentAnchor.current, 2);
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES,
        { ...onboardingState, selectedDevice: devices.length ? devices[0] : undefined, selectedGroup: group, selectedRelease: deploymentRelease },
        { anchor: buttonAnchor, place: 'right' },
        onboardingComponent
      );
    }
  }
  return onboardingComponent;
};
