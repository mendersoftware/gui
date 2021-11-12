import React, { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import pluralize from 'pluralize';

import { TextField, Tooltip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { ErrorOutline as ErrorOutlineIcon, InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';
import useWindowSize from '../../../utils/resizehook';
import { allDevices } from '../createdeployment';
import theme from '../../../themes/mender-theme';
import AsyncAutocomplete from '../../common/asyncautocomplete';

export const styles = {
  infoStyle: {
    minWidth: 400,
    borderBottom: 'none'
  },
  selection: { minWidth: 'min-content', maxWidth: theme.spacing(50), minHeight: 105 },
  selectionTitle: {
    marginBottom: 0
  },
  textField: {
    minWidth: 400
  }
};

const ReleasesWarning = ({ lacksReleases }) => (
  <div className={`flexbox ${lacksReleases ? 'center-aligned' : 'centered'}`}>
    <ErrorOutlineIcon fontSize="small" style={{ marginRight: 4, top: 4, color: 'rgb(171, 16, 0)' }} />
    <p className="info">
      There are no {lacksReleases ? 'compatible ' : ''}artifacts available.{lacksReleases ? <br /> : ' '}
      <Link to="/artifacts">Upload one to the repository</Link> to get started.
    </p>
  </div>
);

export const SoftwareDevices = ({
  acceptedDeviceCount,
  advanceOnboarding,
  createdGroup,
  deploymentAnchor,
  deploymentObject = {},
  getReleases,
  groups,
  hasDevices,
  hasDynamicGroups,
  hasPending,
  onboardingState,
  releases,
  releasesById,
  releaseSelectionLocked,
  setDeploymentSettings
}) => {
  // eslint-disable-next-line no-unused-vars
  const size = useWindowSize();
  const groupRef = useRef();
  const releaseRef = useRef();
  const [isLoadingReleases, setIsLoadingReleases] = useState(!releases.length);

  const deploymentSettingsUpdate = (value, property) => {
    const state = { ...deploymentObject, [property]: value };
    let deviceIds = state.deploymentDeviceIds || [];
    let deviceCount = state.deploymentDeviceCount;
    if (state.release) {
      advanceOnboarding(onboardingSteps.SCHEDULING_ARTIFACT_SELECTION);
    }
    if (state.device || state.group) {
      if (state.device) {
        deviceIds = [state.device.id];
        deviceCount = deviceIds.length;
      } else if (state.group === allDevices) {
        deviceCount = acceptedDeviceCount;
        advanceOnboarding(onboardingSteps.SCHEDULING_ALL_DEVICES_SELECTION);
      }
      advanceOnboarding(onboardingSteps.SCHEDULING_GROUP_SELECTION);
    }
    setDeploymentSettings({ ...deploymentObject, [property]: value, deploymentDeviceIds: deviceIds, deploymentDeviceCount: deviceCount });
  };

  const onReleaseSelectionChange = release => {
    if (release !== deploymentObject.release) {
      deploymentSettingsUpdate(release, 'release');
    }
  };

  const onReleaseInputChange = inputValue => {
    setIsLoadingReleases(!releases.length);
    return getReleases({ page: 1, perPage: 100, searchTerm: inputValue, searchOnly: true }).finally(() => setIsLoadingReleases(false));
  };

  const { deploymentDeviceCount, deploymentDeviceIds = [], device, group = null, release: deploymentRelease = null } = deploymentObject;
  const releaseDeviceTypes = (deploymentRelease && deploymentRelease.device_types_compatible) ?? [];
  const devicetypesInfo = (
    <Tooltip title={<p>{releaseDeviceTypes.join(', ')}</p>} placement="bottom">
      <span className="link">
        {releaseDeviceTypes.length} device {pluralize('types', releaseDeviceTypes.length)}
      </span>
    </Tooltip>
  );

  const groupItems = [allDevices, ...Object.keys(groups)];
  let { groupLink, releaseItems } = useMemo(() => {
    let groupLink = '/devices';
    let releaseItems = releases.map(rel => releasesById[rel]);
    if (device && device.attributes) {
      // If single device, don't show incompatible releases
      releaseItems = releaseItems.filter(rel => rel.device_types_compatible.some(type => device.attributes.device_type.includes(type)));
      groupLink = `${groupLink}?id=${device.id}`;
    } else {
      groupLink = group && group !== allDevices ? `${groupLink}?group=${group}` : groupLink;
    }
    return { groupLink, releaseItems };
  }, [releases, device, group]);

  let onboardingComponent = null;
  if (releaseRef.current && groupRef.current && deploymentAnchor.current) {
    const anchor = { top: releaseRef.current.offsetTop + releaseRef.current.offsetHeight / 3, left: releaseRef.current.offsetWidth };
    const groupAnchor = { top: groupRef.current.offsetTop + groupRef.current.offsetHeight / 3, left: groupRef.current.offsetWidth };
    onboardingComponent = getOnboardingComponentFor(onboardingSteps.SCHEDULING_ALL_DEVICES_SELECTION, onboardingState, { anchor: groupAnchor, place: 'right' });
    if (createdGroup) {
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_GROUP_SELECTION,
        { ...onboardingState, createdGroup },
        { anchor: groupAnchor, place: 'right' },
        onboardingComponent
      );
    }
    if (!deploymentRelease) {
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_ARTIFACT_SELECTION,
        { ...onboardingState, selectedRelease: releasesById[releases[0]] || {} },
        { anchor, place: 'right' },
        onboardingComponent
      );
    }
    if (hasDevices && deploymentDeviceCount && deploymentRelease) {
      const buttonAnchor = {
        top: deploymentAnchor.current.offsetTop - deploymentAnchor.current.offsetHeight,
        left: deploymentAnchor.current.offsetLeft + deploymentAnchor.current.offsetWidth / 2
      };
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES,
        { ...onboardingState, selectedDevice: device, selectedGroup: group, selectedRelease: deploymentRelease },
        { anchor: buttonAnchor, place: 'bottom' },
        onboardingComponent
      );
    }
  }
  const hasReleases = !!Object.keys(releasesById).length;
  return (
    <div style={{ overflow: 'visible', minHeight: '300px', marginTop: '15px' }}>
      {!hasReleases ? (
        <ReleasesWarning />
      ) : (
        <form className="flexbox column margin margin-top-none">
          <h4 style={styles.selectionTitle}>Select a device group to target</h4>
          <div ref={groupRef} style={styles.selection}>
            {device ? (
              <TextField value={device.id} label="Device" disabled={true} style={styles.infoStyle} />
            ) : (
              <div>
                <Autocomplete
                  id="deployment-device-group-selection"
                  autoSelect
                  autoHighlight
                  filterSelectedOptions
                  handleHomeEndKeys
                  disabled={!(hasDevices || hasDynamicGroups)}
                  options={groupItems}
                  onChange={(e, item) => deploymentSettingsUpdate(item, 'group')}
                  renderInput={params => (
                    <TextField {...params} placeholder="Select a device group" InputProps={{ ...params.InputProps }} style={styles.textField} />
                  )}
                  value={group}
                />
                {!(hasDevices || hasDynamicGroups) && (
                  <p className="info" style={{ marginTop: '10px' }}>
                    <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)', position: 'relative' }} />
                    There are no connected devices.{' '}
                    {hasPending ? (
                      <span>
                        <Link to="/devices/pending">Accept pending devices</Link> to get started.
                      </span>
                    ) : (
                      <span>
                        <Link to="/help/get-started">Read the help pages</Link> for help with connecting devices.
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
            {(deploymentDeviceIds.length > 0 || group) && (
              <p className="info">
                {group ? (
                  <>All devices{group !== allDevices ? ' in this group' : null}</>
                ) : (
                  <>
                    {deploymentDeviceIds.length} {pluralize('devices', deploymentDeviceIds.length)}
                  </>
                )}{' '}
                will be targeted. <Link to={groupLink}>View the {pluralize('devices', group === allDevices ? 2 : deploymentDeviceIds.length)}</Link>
              </p>
            )}
            {onboardingComponent}
          </div>
          <h4 style={styles.selectionTitle}>Select a Release to deploy</h4>
          <div ref={releaseRef} style={styles.selection}>
            {releaseSelectionLocked ? (
              <TextField value={deploymentRelease?.Name} label="Release" disabled={true} style={styles.infoStyle} />
            ) : (
              <AsyncAutocomplete
                id="deployment-release-selection"
                initialValue={deploymentRelease?.Name}
                labelAttribute="Name"
                placeholder="Select a Release"
                selectionAttribute="Name"
                options={releaseItems}
                onChange={onReleaseInputChange}
                onChangeSelection={onReleaseSelectionChange}
                isLoading={isLoadingReleases}
                styles={styles}
              />
            )}
            {!releaseItems.length && hasReleases ? (
              <ReleasesWarning lacksReleases />
            ) : (
              !!releaseDeviceTypes.length && (
                <p className="info" style={{ marginBottom: 0 }}>
                  This Release is compatible with {devicetypesInfo}.
                </p>
              )
            )}
          </div>
          <p className="info icon">
            <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
            The deployment will skip any devices in the group that are already on the target Release version, or that have an incompatible device type.
          </p>
        </form>
      )}
    </div>
  );
};

export default SoftwareDevices;
