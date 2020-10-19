import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import pluralize from 'pluralize';

import { TextField, Tooltip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { ErrorOutline as ErrorOutlineIcon, InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import { getAllDevicesByStatus, getAllGroupDevices, selectDevices } from '../../../actions/deviceActions';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../../constants/deviceConstants';
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
  constructor(props, context) {
    super(props, context);

    this.props.getAllDevicesByStatus(DEVICE_STATES.accepted);
    this.state = {
      deploymentDeviceIds: []
    };
  }

  deploymentSettingsUpdate(value, property) {
    const self = this;
    let state = { [property]: value };
    self.props.deploymentSettings(value, property);

    if (property === 'group' && value === allDevices) {
      self.props.selectDevices(self.props.acceptedDevices);
    }
    const currentState = { ...self.state, ...state };
    if (!currentState.release && property !== 'release') {
      self.props.deploymentSettings(self.props.release, 'release');
      currentState.release = state.release = self.props.release;
    }
    if ((self.props.device || currentState.group) && currentState.release) {
      state.deploymentDeviceIds = currentState.group === allDevices ? self.props.acceptedDevices : [];
      state.deploymentDeviceCount = state.deploymentDeviceIds.length;
      if (self.props.device) {
        state.deploymentDeviceIds = [self.props.device.id];
      } else if (currentState.group !== allDevices) {
        state.deploymentDeviceCount = self.props.groups[currentState.group].total;
      }
    } else {
      state.deploymentDeviceIds = [];
    }
    self.props.deploymentSettings(state.deploymentDeviceIds, 'deploymentDeviceIds');
    self.props.deploymentSettings(state.deploymentDeviceCount, 'deploymentDeviceCount');
    self.setState(state);
  }

  render() {
    const self = this;
    const { device, deploymentAnchor, deploymentObject, group, groups, hasDevices, hasDynamicGroups, hasPending, release, releases } = self.props;
    const { deploymentDeviceIds } = self.state;

    const selectedRelease = deploymentObject.release ? deploymentObject.release : release;
    const releaseDeviceTypes = selectedRelease ? selectedRelease.device_types_compatible : [];
    const devicetypesInfo = (
      <Tooltip title={<p>{releaseDeviceTypes.join(', ')}</p>} placement="bottom">
        <span className="link">
          {releaseDeviceTypes.length} device {pluralize('types', releaseDeviceTypes.length)}
        </span>
      </Tooltip>
    );

    let releaseItems = releases.map(rel => ({
      title: rel.Name,
      value: rel
    }));

    let groupItems = [];
    if (device && device.attributes) {
      // If single device, don't show groups
      releaseItems = releaseItems.filter(rel => rel.value.device_types_compatible.some(type => type === device.attributes.device_type));
    } else {
      groupItems = [allDevices, ...Object.keys(groups)];
    }

    const groupLink = group ? `/devices?group=${group}` : '/devices/';

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
        {!releaseItems.length ? (
          <p className="info" style={{ marginTop: '0' }}>
            <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
            There are no artifacts available. <Link to="/artifacts">Upload one to the repository</Link> to get started.
          </p>
        ) : (
          <form className="flexbox centered column">
            <div ref={ref => (this.releaseRef = ref)} style={{ minWidth: 'min-content', minHeight: '105px' }}>
              {selectedRelease ? (
                <TextField value={selectedRelease.Name} label="Release" disabled={true} style={styles.infoStyle} />
              ) : (
                <Autocomplete
                  id="deployment-release-selection"
                  autoSelect
                  autoHighlight
                  filterSelectedOptions
                  getOptionLabel={option => option.title || option}
                  handleHomeEndKeys
                  options={releaseItems}
                  onChange={(e, item) => self.deploymentSettingsUpdate(item.value, 'release')}
                  renderInput={params => (
                    <TextField {...params} label="Select a Release to deploy" InputProps={{ ...params.InputProps }} style={styles.textField} />
                  )}
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
                  will be targeted. <Link to={groupLink}>View the devices</Link>
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

const actionCreators = { getAllDevicesByStatus, getAllGroupDevices, selectDevices };

const mapStateToProps = state => {
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    acceptedDevices: state.devices.byStatus.accepted.deviceIds,
    device: state.devices.selectedDevice ? state.devices.byId[state.devices.selectedDevice] : null,
    groups,
    hasDevices: state.devices.byStatus.accepted.total,
    hasDynamicGroups: Object.values(groups).some(group => !!group.id),
    hasPending: state.devices.byStatus.pending.total,
    releases: Object.values(state.releases.byId)
  };
};

export default connect(mapStateToProps, actionCreators)(SoftwareDevices);
