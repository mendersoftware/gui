import React from 'react';
import { Link } from 'react-router-dom';

import pluralize from 'pluralize';

import { TextField, Tooltip } from '@material-ui/core';
import { ErrorOutline as ErrorOutlineIcon, InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';

import AutoSelect from '../../common/forms/autoselect';
import AppActions from '../../../actions/app-actions';
import AppStore from '../../../stores/app-store';
import AppConstants from '../../../constants/app-constants';

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

export default class SoftwareDevices extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      artifacts: AppStore.getCollatedArtifacts(AppStore.getArtifactsRepo()),
      disabled: false,
      groups: AppStore.getGroups().filter(item => item !== AppConstants.UNGROUPED_GROUP.id),
      release: null
    };
  }

  deploymentSettingsUpdate(value, property) {
    const self = this;
    let state = { [property]: value };
    self.props.deploymentSettings(value, property);

    if (property === 'group') {
      if (value) {
        let promise = value === allDevices ? Promise.resolve(AppStore.getTotalAcceptedDevices()) : AppActions.getNumberOfDevicesInGroup(value);
        promise.then(devicesLength => self.setState({ devicesLength }));
      } else {
        state.devicesLength = 0;
      }
    }
    const currentState = Object.assign({}, self.state, state);
    if (!currentState.release && property !== 'release') {
      self.props.deploymentSettings(self.props.deploymentRelease, 'release');
      currentState.release = state.release = self.props.deploymentRelease;
    }
    if (currentState.group && currentState.release) {
      self
        .filterDeploymentDeviceIds(currentState.group, currentState.release, self.props.device)
        .then(devices => self.props.deploymentSettings(devices, 'deploymentDeviceIds'));
    }
    self.setState(state);
  }

  filterDeploymentDeviceIds(group, release, device) {
    // check that device type matches
    let promisedDevices;
    if (group === allDevices) {
      promisedDevices = AppActions.getAllDevices();
    } else if (device) {
      promisedDevices = Promise.resolve([device]);
    } else {
      promisedDevices = AppActions.getAllDevicesInGroup(group);
    }
    return promisedDevices.then(devices =>
      devices.reduce((accu, item) => {
        const deviceType = item.attributes ? item.attributes.find(attribute => attribute.name === 'device_type').value : null;
        if (release.device_types_compatible.includes(deviceType)) {
          accu.push(item.id);
        }
        return accu;
      }, [])
    );
  }

  render() {
    const self = this;
    const { device, deploymentAnchor, deploymentRelease, hasPending, release, group, hasDevices } = self.props;
    const { artifacts, devicesLength, groups } = self.state;

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
      groupItems = groups.reduce((accu, group) => {
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
      const groupAnchor = { top: this.groupRef.offsetTop + (this.groupRef.offsetHeight / 3) * 2, left: this.groupRef.offsetWidth / 2 };
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
              {self.state.disabled ? (
                <TextField value={device ? device.id : ''} label="Device" disabled={self.state.disabled} style={styles.infoStyle} />
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
                      {hasPending ? 
                        <span>
                          <Link to="/devices/pending">Accept pending devices</Link> to get started.
                        </span>
                        :
                        <span>
                          <Link to="/help/getting-started">Read the help pages</Link> for help with connecting devices.
                        </span>
                      }
                    </p>
                  )}
                </div>
              )}
              {devicesLength > 0 && (
                <p className="info">
                  {devicesLength} {pluralize('devices', devicesLength)} will be targeted. <Link to={groupLink}>View the devices</Link>
                </p>
              )}
              {onboardingComponent}
              {devicesLength > 0 && release && (
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
