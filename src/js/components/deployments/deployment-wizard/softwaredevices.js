import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import pluralize from 'pluralize';

import { TextField, Tooltip } from '@material-ui/core';
import { ErrorOutline as ErrorOutlineIcon, InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import AutoSelect from '../../common/forms/autoselect';
import { getAllDevicesByStatus, getAllGroupDevices, selectDevice } from '../../../actions/deviceActions';
import AppStore from '../../../stores/app-store';
import AppConstants from '../../../constants/app-constants';
import { DEVICE_STATES } from '../../../constants/deviceConstants';

import { getOnboardingComponentFor } from '../../../utils/onboardingmanager';

const allDevices = 'All devices';
const styles = {
  textField: {
    minWidth: '400px'
  },
  infoStyle: {
    minWidth: '400px',
    borderBottom: 'none'
  }
};

class SoftwareDevices extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.props.getAllDevicesByStatus(DEVICE_STATES.accepted);
    this.state = {
      artifacts: AppStore.getCollatedArtifacts(AppStore.getArtifactsRepo()),
      deploymentDeviceIds: []
    };
  }

  deploymentSettingsUpdate(value, property) {
    const self = this;
    let state = { [property]: value };
    self.props.deploymentSettings(value, property);

    if (property === 'group' && value && value !== allDevices) {
      self.props.getAllGroupDevices(value);
    }
    const currentState = Object.assign({}, self.state, state);
    if (!currentState.release && property !== 'release') {
      self.props.deploymentSettings(self.props.deploymentRelease, 'release');
      currentState.release = state.release = self.props.deploymentRelease;
    }
    if (currentState.group && currentState.release) {
      state.deploymentDeviceIds = self.props.acceptedDevices;
      if (self.props.groups[currentState.group]) {
        state.deploymentDeviceIds = self.props.groups[currentState.group].deviceIds;
      } else if (self.props.device) {
        state.deploymentDeviceIds = [self.props.device];
      }
      self.props.deploymentSettings(state.deploymentDeviceIds, 'deploymentDeviceIds');
    } else {
      state.deploymentDeviceIds = [];
    }
    self.setState(state);
  }

  render() {
    const self = this;
    const { device, deploymentAnchor, deploymentRelease, group, groups, hasDevices, hasPending, release } = self.props;
    const { artifacts, deploymentDeviceIds } = self.state;

    const selectedRelease = deploymentRelease ? deploymentRelease : release;

    const releaseDeviceTypes = selectedRelease ? selectedRelease.device_types_compatible : [];
    const devicetypesInfo = (
      <Tooltip title={<p>{releaseDeviceTypes.join(', ')}</p>} placement="bottom">
        <span className="link">
          {releaseDeviceTypes.length} device {pluralize('types', releaseDeviceTypes.length)}
        </span>
      </Tooltip>
    );

    let artifactItems = artifacts.map(art => ({
      title: art.name,
      value: art
    }));

    let groupItems = [{ title: 'All devices', value: 'All devices' }];
    if (device) {
      // If single device, don't show groups
      groupItems[0] = {
        title: device.id,
        value: device
      };
      artifactItems = artifactItems.filter(art =>
        art.value.device_types_compatible.some(type => type === device.attributes.find(attr => attr.name === 'device_type').value)
      );
    } else {
      groupItems = Object.keys(groups).reduce((accu, group) => {
        accu.push({
          title: group,
          value: group
        });
        return accu;
      }, groupItems);
    }

    const groupLink = group ? `/devices/group=${group}` : '/devices/';

    let onboardingComponent = null;
    if (this.releaseRef && this.groupRef && deploymentAnchor) {
      const anchor = { top: this.releaseRef.offsetTop + (this.releaseRef.offsetHeight / 3) * 2, left: this.releaseRef.offsetWidth / 2 };
      onboardingComponent = getOnboardingComponentFor('scheduling-artifact-selection', { anchor, place: 'right' });
      const groupAnchor = { top: this.groupRef.offsetTop + (this.groupRef.offsetHeight / 3) * 2, left: this.groupRef.offsetWidth };
      onboardingComponent = getOnboardingComponentFor('scheduling-all-devices-selection', { anchor: groupAnchor, place: 'right' }, onboardingComponent);
      onboardingComponent = getOnboardingComponentFor('scheduling-group-selection', { anchor: groupAnchor, place: 'right' }, onboardingComponent);
      const buttonAnchor = {
        top: deploymentAnchor.offsetTop - deploymentAnchor.offsetHeight,
        left: deploymentAnchor.offsetLeft + deploymentAnchor.offsetWidth / 2
      };
      onboardingComponent = getOnboardingComponentFor('scheduling-release-to-devices', { anchor: buttonAnchor, place: 'bottom' }, onboardingComponent);
    }

    return (
      <div style={{ overflow: 'visible', minHeight: '300px', marginTop: '15px' }}>
        {!artifactItems.length ? (
          <p className="info" style={{ marginTop: '0' }}>
            <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
            There are no artifacts available. <Link to="/artifacts">Upload one to the repository</Link> to get started.
          </p>
        ) : (
          <form className="flexbox centered column">
            <div ref={ref => (this.releaseRef = ref)} style={{ minWidth: 'min-content', minHeight: '105px' }}>
              {deploymentRelease ? (
                <TextField value={deploymentRelease.name} label="Release" disabled={true} style={styles.infoStyle} />
              ) : (
                <AutoSelect
                  label="Select a Release to deploy"
                  errorText="Select a Release to deploy"
                  items={artifactItems}
                  onChange={item => self.deploymentSettingsUpdate(item, 'release')}
                  style={styles.textField}
                  value={release ? release.name : null}
                />
              )}
              {releaseDeviceTypes.length ? (
                <p className="info" style={{ marginBottom: 0 }}>
                  This Release is compatible with {devicetypesInfo}.
                </p>
              ) : null}
            </div>
            <div ref={ref => (this.groupRef = ref)} style={{ width: 'min-content' }}>
              {device ? (
                <TextField value={device ? device.id : ''} label="Device" disabled={true} style={styles.infoStyle} />
              ) : (
                <div>
                  <AutoSelect
                    label="Select a device group to deploy to"
                    errorText="Please select a group from the list"
                    value={group}
                    items={groupItems}
                    disabled={!hasDevices}
                    onChange={item => self.deploymentSettingsUpdate(item, 'group')}
                    style={styles.textField}
                  />
                  {hasDevices ? null : (
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
              {deploymentDeviceIds.length > 0 && (
                <p className="info">
                  {deploymentDeviceIds.length} {pluralize('devices', deploymentDeviceIds.length)} will be targeted. <Link to={groupLink}>View the devices</Link>
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

const actionCreators = { getAllDevicesByStatus, getAllGroupDevices, selectDevice };

const mapStateToProps = state => {
  const { [AppConstants.UNGROUPED_GROUP.id]: ungroupedGroup, ...groups } = state.devices.groups.byId;
  return {
    acceptedDevices: state.devices.byStatus.accepted.deviceIds,
    device: state.devices.selectedDevice,
    groups,
    ungroupedGroup,
    hasDevices: state.devices.byStatus.accepted.total || state.devices.byStatus.accepted.deviceIds.length > 0,
    hasPending: state.devices.byStatus.pending.total || state.devices.byStatus.pending.deviceIds.length > 0
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(SoftwareDevices);
