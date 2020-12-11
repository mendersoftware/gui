import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import pluralize from 'pluralize';

import { TextField, Tooltip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { ErrorOutline as ErrorOutlineIcon, InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import { getAllDevicesByStatus } from '../../../actions/deviceActions';
import { advanceOnboarding } from '../../../actions/onboardingActions';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../../constants/deviceConstants';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getOnboardingState } from '../../../selectors';
import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';
import { allDevices } from '../createdeployment';

const styles = {
  textField: {
    minWidth: '400px'
  },
  infoStyle: {
    minWidth: '400px',
    borderBottom: 'none'
  }
};

export class SoftwareDevices extends React.Component {
  componentDidMount() {
    this.props.getAllDevicesByStatus(DEVICE_STATES.accepted);
  }

  deploymentSettingsUpdate(value, property) {
    const {
      acceptedDevices,
      advanceOnboarding,
      deploymentDeviceCount,
      deploymentDeviceIds = [],
      setDeploymentSettings,
      device,
      group,
      groups,
      release
    } = this.props;
    setDeploymentSettings(value, property);
    let state = { group, release, [property]: value };
    let deviceIds = deploymentDeviceIds;
    let deviceCount = deploymentDeviceCount;
    if ((device || state.group) && state.release) {
      deviceIds = state.group === allDevices ? acceptedDevices : [];
      deviceCount = deviceIds.length;
      if (device) {
        deviceIds = [device.id];
        deviceCount = deviceIds.length;
      } else if (state.group !== allDevices) {
        deviceCount = groups[state.group].total;
      }
      advanceOnboarding(onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES);
    }
    setDeploymentSettings(deviceIds, 'deploymentDeviceIds');
    setDeploymentSettings(deviceCount, 'deploymentDeviceCount');
  }

  render() {
    const self = this;
    const {
      createdGroup,
      device,
      deploymentAnchor,
      deploymentDeviceIds,
      deploymentObject = {},
      group = null,
      groups,
      hasDevices,
      hasDynamicGroups,
      hasPending,
      hasSelectedDevices,
      onboardingState,
      release = null,
      releases,
      selectedDevice,
      selectedGroup,
      selectedRelease
    } = self.props;
    const deploymentRelease = deploymentObject.release ? deploymentObject.release : release;
    const releaseDeviceTypes = deploymentRelease ? deploymentRelease.device_types_compatible : [];
    const devicetypesInfo = (
      <Tooltip title={<p>{releaseDeviceTypes.join(', ')}</p>} placement="bottom">
        <span className="link">
          {releaseDeviceTypes.length} device {pluralize('types', releaseDeviceTypes.length)}
        </span>
      </Tooltip>
    );

    const groupItems = [allDevices, ...Object.keys(groups)];
    let releaseItems = releases;
    let groupLink = '/devices';
    if (device && device.attributes) {
      // If single device, don't show incompatible releases
      releaseItems = releaseItems.filter(rel => rel.device_types_compatible.some(type => type === device.attributes.device_type));
      groupLink = `${groupLink}?id=${device.id}`;
    } else {
      groupLink = group && group !== allDevices ? `${groupLink}?group=${group}` : groupLink;
    }

    let onboardingComponent = null;
    if (self.releaseRef && self.groupRef && deploymentAnchor) {
      const anchor = { top: self.releaseRef.offsetTop + (self.releaseRef.offsetHeight / 3) * 2, left: self.releaseRef.offsetWidth / 2 };
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_ARTIFACT_SELECTION,
        { ...onboardingState, selectedRelease: deploymentRelease },
        { anchor, place: 'right' }
      );
      const groupAnchor = { top: self.groupRef.offsetTop + (self.groupRef.offsetHeight / 3) * 2, left: self.groupRef.offsetWidth };
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_ALL_DEVICES_SELECTION,
        onboardingState,
        { anchor: groupAnchor, place: 'right' },
        onboardingComponent
      );
      onboardingComponent = getOnboardingComponentFor(
        onboardingSteps.SCHEDULING_GROUP_SELECTION,
        { ...onboardingState, createdGroup },
        { anchor: groupAnchor, place: 'right' },
        onboardingComponent
      );
      const buttonAnchor = {
        top: deploymentAnchor.offsetTop - deploymentAnchor.offsetHeight,
        left: deploymentAnchor.offsetLeft + deploymentAnchor.offsetWidth / 2
      };
      if (hasDevices && hasSelectedDevices && deploymentRelease) {
        onboardingComponent = getOnboardingComponentFor(
          onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES,
          { ...onboardingState, selectedDevice, selectedGroup, selectedRelease: deploymentRelease },
          { anchor: buttonAnchor, place: 'bottom' },
          onboardingComponent
        );
      }
    }
    return (
      <div style={{ overflow: 'visible', minHeight: '300px', marginTop: '15px' }}>
        {!releaseItems.length ? (
          <p className="info" style={{ marginTop: '0' }}>
            <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
            There are no {releases.length ? 'compatible ' : ''}artifacts available. <Link to="/artifacts">Upload one to the repository</Link> to get started.
          </p>
        ) : (
          <form className="flexbox centered column">
            <div ref={ref => (self.releaseRef = ref)} style={{ minWidth: 'min-content', minHeight: '105px' }}>
              {selectedRelease ? (
                <TextField value={selectedRelease} label="Release" disabled={true} style={styles.infoStyle} />
              ) : (
                <Autocomplete
                  id="deployment-release-selection"
                  autoSelect
                  autoHighlight
                  filterSelectedOptions
                  getOptionLabel={option => (typeof option === 'string' ? option : option.Name)}
                  handleHomeEndKeys
                  options={releaseItems}
                  onChange={(e, item) => self.deploymentSettingsUpdate(item, 'release')}
                  renderInput={params => (
                    <TextField {...params} label="Select a Release to deploy" InputProps={{ ...params.InputProps }} style={styles.textField} />
                  )}
                  value={deploymentRelease}
                />
              )}
              {releaseDeviceTypes.length ? (
                <p className="info" style={{ marginBottom: 0 }}>
                  This Release is compatible with {devicetypesInfo}.
                </p>
              ) : null}
            </div>
            <div ref={ref => (self.groupRef = ref)} style={{ width: 'min-content' }}>
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
                    onChange={(e, item) => self.deploymentSettingsUpdate(item, 'group')}
                    renderInput={params => (
                      <TextField {...params} label="Select a device group to deploy to" InputProps={{ ...params.InputProps }} style={styles.textField} />
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
                          <Link to="/help/getting-started">Read the help pages</Link> for help with connecting devices.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
              {(deploymentDeviceIds.length > 0 || group) && (
                <p className="info">
                  {group ? (
                    <>All devices in this group</>
                  ) : (
                    <>
                      {deploymentDeviceIds.length} {pluralize('devices', deploymentDeviceIds.length)}
                    </>
                  )}{' '}
                  will be targeted. <Link to={groupLink}>View the {pluralize('devices', group === allDevices ? 2 : deploymentDeviceIds.length)}</Link>
                </p>
              )}
              {onboardingComponent}
              {deploymentDeviceIds.length > 0 && release && (
                <p className="info icon">
                  <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
                  The deployment will skip any devices in the group that are already on the target Release version, or that have an incompatible device type.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    );
  }
}

const actionCreators = { advanceOnboarding, getAllDevicesByStatus };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    acceptedDevices: state.devices.byStatus.accepted.deviceIds,
    createdGroup: Object.values(state.devices.groups.byId)[1],
    device: state.devices.selectedDevice ? state.devices.byId[state.devices.selectedDevice] : null,
    groups,
    hasDevices: state.devices.byStatus.accepted.total,
    hasDynamicGroups: Object.values(groups).some(group => !!group.id),
    hasPending: state.devices.byStatus.pending.total,
    hasSelectedDevices: !!(state.devices.groups.selectedGroup || state.devices.selectedDevice || state.devices.selectedDeviceList.length),
    onboardingState: getOnboardingState(state),
    releases: Object.values(state.releases.byId),
    selectedDevice: state.devices.selectedDevice,
    selectedGroup: state.devices.groups.selectedGroup,
    selectedRelease: state.releases.selectedRelease
  };
};

export default connect(mapStateToProps, actionCreators)(SoftwareDevices);
