import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import AutoSelect from '../common/forms/autoselect';
import { RootRef } from '@material-ui/core';
import { getOnboardingComponentFor } from '../../utils/onboardingmanager';
import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import { customSort } from '../../helpers';

export default class ScheduleForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    var disabled = false;
    var group = null;
    /* if single device */
    if (this.props.device) {
      disabled = true;
    }
    this.state = {
      disabled: disabled,
      group: group,
      showDevices: false
    };
  }

  componentDidMount() {
    const release = AppStore.getDeploymentRelease();
    if (release) {
      this.props.deploymentSettings(release.Artifacts[0], 'artifact');
    }
    const group = AppStore.getSelectedGroup();
    if (group) {
      this.props.deploymentSettings(group, 'group');
    }
  }

  componentWillUnmount() {
    AppActions.setDeploymentRelease(null);
    AppActions.selectGroup(null);
    AppActions.selectDevice(null);
  }

  deploymentSettingsUpdate(value, property) {
    if (property === 'group') {
      AppActions.selectGroup(value);
    }
    this.props.deploymentSettings(value, property);
  }

  _showDevices() {
    this.setState({ showDevices: !this.state.showDevices });
  }

  handleClick = event => {
    const { currentTarget } = event;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open
    }));
  };

  render() {
    const self = this;
    const { artifact, device, deploymentAnchor, deploymentDevices, filteredDevices, groups, hasDevices, hasPending, showDevices } = self.props;
    const artifacts = this.props.releaseArtifacts ? this.props.releaseArtifacts : this.props.artifacts;

    var artifactItems = artifacts.sort(customSort(1, 'modified')).map(art => ({
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
      groupItems = groups.sort().reduce((accu, group) => {
        accu.push({
          title: group,
          value: group
        });
        return accu;
      }, groupItems);
    }

    const release = AppStore.getDeploymentRelease();
    const releaseDeviceTypes = release
      ? release.Artifacts.reduce((accu, item) => {
        accu.push(item.device_types_compatible);
        return accu;
      }, [])
      : [];
    const deviceTypeList = artifact ? artifact.device_types_compatible : releaseDeviceTypes;
    const device_types = deviceTypeList.join(', ');

    var tmpDevices = deploymentDevices || [];
    if (self.search && filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = filteredDevices.filter(self.search.filter(namefilter));
    }

    var devicesLength = deploymentDevices ? deploymentDevices.length : 0;

    const infoStyle = { borderBottom: 'none' };

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
      <div style={{ overflow: 'visible', height: '300px' }}>
        {!artifactItems.length ? (
          <p className="info" style={{ marginTop: '0' }}>
            <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
            There are no artifacts available. <Link to="/artifacts">Upload one to the repository</Link> to get started.
          </p>
        ) : (
          <form>
            <RootRef rootRef={ref => (this.releaseRef = ref)}>
              <Grid container spacing={2}>
                <Grid item>
                  {release ? (
                    <TextField value={release.Name} label="Release" disabled={true} style={infoStyle} />
                  ) : (
                    <AutoSelect
                      className="margin-right"
                      label="Select target Release"
                      errorText="Choose a Release to be deployed"
                      items={artifactItems}
                      onChange={item => self.deploymentSettingsUpdate(item, 'artifact')}
                    />
                  )}
                </Grid>
                {device_types ? (
                  <Grid item>
                    <TextField disabled={true} placeholder="Device types" label="Device types" value={device_types} style={infoStyle} />
                  </Grid>
                ) : null}
              </Grid>
            </RootRef>

            <div ref={ref => (this.groupRef = ref)}>
              {self.state.disabled ? (
                <TextField value={device ? device.id : ''} label="Device" disabled={self.state.disabled} style={infoStyle} />
              ) : (
                <div>
                  <AutoSelect
                    label="Select target group"
                    errorText="Please select a group from the list"
                    items={groupItems}
                    disabled={!hasDevices}
                    onChange={item => self.deploymentSettingsUpdate(item, 'group')}
                  />
                  {hasDevices ? null : (
                    <p className="info" style={{ marginTop: '0' }}>
                      <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
                      There are no connected devices.{' '}
                      {hasPending ? (
                        <span>
                          <Link to="/devices/pending">Accept pending devices</Link> to get started.
                        </span>
                      ) : null}
                    </p>
                  )}
                </div>
              )}
              {onboardingComponent}
            </div>
            <div className="margin-top">
              {tmpDevices ? (
                <p>
                  {devicesLength < AppStore.getDeploymentDeviceLimit()
                    ? `${filteredDevices ? filteredDevices.length : '0'} of ${devicesLength} ${pluralize('devices', devicesLength)} will be updated. `
                    : `${devicesLength} devices will be targeted `}
                  <span onClick={() => showDevices()} className={this.state.disabled ? 'hidden' : 'link'}>
                    View the devices
                  </span>
                </p>
              ) : null}
              {hasDevices && artifactItems.length ? (
                <p className="info">
                  <InfoOutlinedIcon fontSize="small" style={{ verticalAlign: 'middle', margin: '0 6px 4px 0' }} />
                  The deployment will skip any devices that are already on the target Release version, or that have a different device type.
                </p>
              ) : null}
            </div>
          </form>
        )}
      </div>
    );
  }
}
