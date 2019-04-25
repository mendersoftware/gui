import React from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import HelpIcon from '@material-ui/icons/Help';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { CreateDeploymentForm } from '../helptips/helptooltips';
import AutoSelect from '../common/forms/autoselect';

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
    var artifactItems = this.props.artifacts.map(artifact => ({
      title: artifact.name,
      value: artifact
    }));

    let groupItems = [{ title: 'All devices', value: 'All devices' }];
    if (self.props.device) {
      // If single device, don't show groups
      groupItems[0] = {
        title: self.props.device.id,
        value: self.props.device
      };
      artifactItems = artifactItems.filter(artifact =>
        artifact.value.device_types_compatible.some(type => type === self.props.device.attributes.find(attr => attr.name === 'device_type').value)
      );
    } else {
      groupItems = self.props.groups.reduce((accu, group) => {
        accu.push({
          title: group,
          value: group
        });
        return accu;
      }, groupItems);
    }

    var device_types = this.props.artifact ? this.props.artifact.device_types_compatible : [];
    device_types = device_types.join(', ');

    var tmpDevices = this.props.deploymentDevices || [];
    if (self.search && this.props.filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = this.props.filteredDevices.filter(self.search.filter(namefilter));
    }

    var devicesLength = this.props.deploymentDevices ? this.props.deploymentDevices.length : '0';

    const infoStyle = { borderBottom: 'none' };

    return (
      <div style={{ overflow: 'visible', height: '300px' }}>
        {!artifactItems.length ? (
          <p className="info" style={{ marginTop: '0' }}>
            <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
            There are no artifacts available. <Link to="/artifacts">Upload one to the repository</Link> to get started.
          </p>
        ) : (
          <form>
            <Grid container spacing={16}>
              <Grid item>
                <AutoSelect
                  className="margin-right"
                  label="Select target Release"
                  errorText="Choose a Release to be deployed"
                  items={artifactItems}
                  onChange={item => self.props.deploymentSettings(item, 'artifact')}
                />
              </Grid>
              {this.props.artifact ? (
                <Grid item>
                  <TextField disabled={true} placeholder="Device types" label="Device types" value={device_types} style={infoStyle} />
                </Grid>
              ) : null}
            </Grid>

            <div>
              {self.state.disabled ? (
                <TextField value={self.props.device ? self.props.device.id : ''} label="Device" disabled={self.state.disabled} style={infoStyle} />
              ) : (
                <div>
                  <AutoSelect
                    label="Select target group"
                    errorText="Please select a group from the list"
                    items={groupItems}
                    disabled={!self.props.hasDevices}
                    onChange={item => self.props.deploymentSettings(item, 'group')}
                  />
                  {this.props.hasDevices ? null : (
                    <p className="info" style={{ marginTop: '0' }}>
                      <ErrorOutlineIcon style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }} />
                      There are no connected devices.{' '}
                      {this.props.hasPending ? (
                        <span>
                          <Link to="/devices/pending">Accept pending devices</Link> to get started.
                        </span>
                      ) : null}
                    </p>
                  )}
                </div>
              )}

              {this.props.showHelptips && (this.props.hasDevices && (this.props.artifacts || []).length) ? (
                <div style={{ position: 'relative' }}>
                  <div
                    id="onboard-13"
                    className={this.props.hasDeployments ? 'tooltip help' : 'tooltip help highlight'}
                    data-tip
                    data-for="create-deployment1-tip"
                    data-event="click focus"
                    style={{ top: '-50px', left: '50%' }}
                  >
                    <HelpIcon />
                  </div>
                  <ReactTooltip id="create-deployment1-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                    <CreateDeploymentForm />
                  </ReactTooltip>
                </div>
              ) : null}
            </div>

            <div className="margin-top">
              {tmpDevices ? (
                <p>
                  {this.props.filteredDevices ? this.props.filteredDevices.length : '0'} of {devicesLength} {pluralize('devices', devicesLength)} will be
                  updated.{' '}
                  <span onClick={() => this.props.showDevices()} className={this.state.disabled ? 'hidden' : 'link'}>
                    View the devices
                  </span>
                </p>
              ) : null}
              {this.props.hasDevices && artifactItems.length ? (
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
