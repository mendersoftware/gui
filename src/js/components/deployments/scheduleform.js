import React from 'react';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import AutoSelect from '../common/forms/autoselect';
import BaseOnboardingTip from '../helptips/baseonboardingtip';
import { RootRef } from '@material-ui/core';

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

  componentDidUpdate() {
    if (this.onboardingRef) {
      this.onboardingRef.show();
    }
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
    const {
      artifact,
      device,
      deploymentAnchor,
      deploymentDevices,
      deploymentSettings,
      filteredDevices,
      group,
      groups,
      hasDevices,
      hasPending,
      showDevices,
      showHelptips
    } = self.props;
    const artifacts = this.props.releaseArtifacts ? this.props.releaseArtifacts : this.props.artifacts;
    var artifactItems = artifacts.map(artifact => ({
      title: artifact.name,
      value: artifact
    }));

    let groupItems = [{ title: 'All devices', value: 'All devices' }];
    if (device) {
      // If single device, don't show groups
      groupItems[0] = {
        title: device.id,
        value: device
      };
      artifactItems = artifactItems.filter(artifact =>
        artifact.value.device_types_compatible.some(type => type === device.attributes.find(attr => attr.name === 'device_type').value)
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

    var device_types = artifact ? artifact.device_types_compatible : [];
    device_types = device_types.join(', ');

    var tmpDevices = deploymentDevices || [];
    if (self.search && filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = filteredDevices.filter(self.search.filter(namefilter));
    }

    var devicesLength = deploymentDevices ? deploymentDevices.length : 0;

    const infoStyle = { borderBottom: 'none' };

    let onboarding = {
      component: null,
      place: 'right',
      progress: 2,
      progressTotal: 3,
      anchor: { left: 0, top: 0 }
    };
    if (hasDevices && artifacts.length && this.releaseRef && !artifact) {
      onboarding.component = <div>{`Select the ${artifacts[0].name} release we included.`}</div>;
      onboarding.anchor.top = this.releaseRef.offsetTop + (this.releaseRef.offsetHeight / 3) * 2;
      onboarding.anchor.left = this.releaseRef.offsetWidth / 2;
    } else if (artifact && this.groupRef && !group) {
      let content = (
        <>
          Select &apos;All devices&apos; for now.<p>You can learn how to create device groups later.</p>
        </>
      );
      if (groups.length) {
        content = `Select the ${groups[0]} device group you just made.`;
      }
      onboarding.component = <div>{content}</div>;
      onboarding.anchor.top = this.groupRef.offsetTop + (this.groupRef.offsetHeight / 3) * 2;
      onboarding.anchor.left = this.groupRef.offsetWidth / 2;
    } else if (devicesLength && (artifacts || []).length && group && deploymentAnchor) {
      onboarding.component = (
        <div>{`Create the deployment! This will deploy the ${artifacts[0].name} Artifact to ${device ? device.id : groups[0] || 'All devices'}`}</div>
      );
      onboarding.place = 'bottom';
      onboarding.anchor.top = deploymentAnchor.offsetTop - deploymentAnchor.offsetHeight;
      onboarding.anchor.left = deploymentAnchor.offsetLeft + deploymentAnchor.offsetWidth / 2;
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
              <Grid container spacing={16}>
                <Grid item>
                  <AutoSelect
                    className="margin-right"
                    label="Select target Release"
                    errorText="Choose a Release to be deployed"
                    items={artifactItems}
                    onChange={item => deploymentSettings(item, 'artifact')}
                  />
                </Grid>
                {artifact ? (
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
                    onChange={item => deploymentSettings(item, 'group')}
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
              {showHelptips && onboarding.component ? <BaseOnboardingTip id={3} {...onboarding} ref={ref => (this.onboardingRef = ref)} /> : null}
            </div>
            <div className="margin-top">
              {tmpDevices ? (
                <p>
                  {filteredDevices ? filteredDevices.length : '0'} of {devicesLength} {pluralize('devices', devicesLength)} will be updated.{' '}
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
