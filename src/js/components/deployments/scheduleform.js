import React from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

import Icon from '@material-ui/core/Icon';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import HelpIcon from '@material-ui/icons/Help';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import Autosuggest, { defaultProps } from '@plan-three/material-ui-autosuggest';

import { CreateDeploymentForm } from '../helptips/helptooltips';

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

  _handleGroupValueChange(chosenRequest, index) {
    var group;
    if (index !== -1) {
      group = chosenRequest.text;
    } else {
      var result = this.props.groups.filter(o => {
        return o == chosenRequest;
      });
      group = result.length ? result[0] : null;
    }
    this.setState({ groupErrorText: group ? '' : 'Please select a group from the list' });
    this._sendUpToParent(group, 'group');
  }
  _handleGroupInputChange() {
    this.setState({ groupErrorText: 'Please select a group from the list' });
    this._sendUpToParent(null, 'group');
  }

  _handleArtifactValueChange(chosenRequest, index) {
    var artifact;
    if (index !== -1) {
      artifact = this.props.artifacts[index];
    } else {
      var result = this.props.artifacts.filter(o => {
        return o.name == chosenRequest;
      });
      artifact = result.length ? result[0] : null;
    }
    this.setState({ autoCompleteErrorText: artifact ? '' : 'Choose an Artifact to be deployed' });
    this._sendUpToParent(artifact, 'artifact');
  }
  _handleArtifactInputChange() {
    this.setState({ autoCompleteErrorText: 'Choose an Artifact to be deployed' });
    this._sendUpToParent(null, 'artifact');
  }
  _clearOnClick(ref) {
    this.setState({ searchText: '' });
    this[ref].focus();
    this._sendUpToParent(null, ref);
  }

  _sendUpToParent(val, attr) {
    // send params to parent with dialog holder
    this.props.deploymentSettings(val, attr);
  }

  _showDevices() {
    this.setState({ showDevices: !this.state.showDevices });
  }

  searchUpdated(term) {
    // this.setState({ searchTerm: term }); // needed to force re-render
  }

  render() {
    var artifactItems = this.props.artifacts.reduce((accu, artifact, i) => {
      accu.push({
        text: artifact.name,
        value: (
          <MenuItem component={Link} to={artifact} key={i}>
            {artifact.name}
          </MenuItem>
        )
      });
      return accu;
    }, []);

    var groupItems = [];
    if (this.props.device) {
      // If single device, don't show groups
      groupItems[0] = {
        text: this.props.device.id,
        value: (
          <MenuItem component={Link} to={this.props.device.id} key={this.props.device.id}>
            {this.props.device.id}
          </MenuItem>
        )
      };
    } else {
      groupItems[0] = {
        text: 'All devices',
        value: (
          <MenuItem component={Link} to="All devices" key="All">
            All devices
          </MenuItem>
        )
      };
      groupItems = this.props.groups.reduce((accu, group, i) => {
        accu.push({
          text: decodeURIComponent(group),
          value: (
            <MenuItem component={Link} to={group} key={i}>
              {decodeURIComponent(group)}
            </MenuItem>
          )
        });
        return accu;
      }, groupItems);
    }

    var device_types = this.props.artifact ? this.props.artifact.device_types_compatible : [];
    device_types = device_types.join(', ');

    var tmpDevices = [];
    if (this.refs.search && this.props.filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = this.props.filteredDevices.filter(this.refs.search.filter(namefilter));
    }

    var devicesLength = this.props.deploymentDevices ? this.props.deploymentDevices.length : '0';

    return (
      <div style={{ overflow: 'visible', height: '400px' }}>
        <form>
          <div style={{ display: 'inline-block', marginBottom: '15px' }}>
            <Autosuggest
              helperText="Select target artifact"
              ref={input => (this.artifact = input)}
              suggestions={artifactItems}
              onNewRequest={(request, index) => this._handleArtifactValueChange(request, index)}
              onChange={() => this._handleArtifactInputChange()}
              label="Select target artifact"
              fuzzySearchOpts={{
                ...defaultProps.fuzzySearchOpts,
                keys: ['text']
              }}
              openOnFocus={true}
              listStyle={{ overflow: 'auto', maxHeight: '360px' }}
              errorstyle={{ color: 'rgb(171, 16, 0)' }}
              errortext={this.state.autoCompleteErrorText}
              onClick={() => this._clearOnClick('artifact')}
            />
            <TextField
              disabled={true}
              placeholder="Device types"
              label="Device types"
              value={device_types}
              underlineDisabledStyle={{ borderBottom: 'none' }}
              style={{ verticalAlign: 'top', width: '400px' }}
              errorstyle={{ color: 'rgb(171, 16, 0)' }}
              className={this.props.artifact ? 'margin-left' : 'hidden'}
            />

            <p className={artifactItems.length ? 'hidden' : 'info'} style={{ marginTop: '0' }}>
              <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }}>
                error_outline
              </Icon>
              There are no artifacts available. <Link to="/artifacts">Upload one to the repository</Link> to get started.
            </p>
          </div>

          <div style={{ display: 'inline-block' }}>
            <div className={this.state.disabled ? 'hidden' : 'inline-block'}>
              <Autosuggest
                helperText="Select target group"
                ref={input => (this.group = input)}
                suggestions={groupItems}
                onNewRequest={(...args) => this._handleGroupValueChange(...args)}
                onUpdateInput={() => this._handleGroupInputChange()}
                label="Select target group"
                fuzzySearchOpts={{
                  ...defaultProps.fuzzySearchOpts,
                  keys: ['text']
                }}
                openOnFocus={true}
                listStyle={{ overflow: 'auto', maxHeight: '360px' }}
                errorstyle={{ color: 'rgb(171, 16, 0)' }}
                errortext={this.state.groupErrorText}
                disabled={!this.props.hasDevices}
                onClick={() => this._clearOnClick('group')}
              />

              <p className={this.props.hasDevices ? 'hidden' : 'info'} style={{ marginTop: '0' }}>
                <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }}>
                  error_outline
                </Icon>
                There are no connected devices.{' '}
                {this.props.hasPending ? (
                  <span>
                    <Link to="/devices/pending">Accept pending devices</Link> to get started.
                  </span>
                ) : null}
              </p>
            </div>

            {this.state.disabled ? (
              <TextField
                style={{ width: '100%' }}
                value={this.props.device ? this.props.device.device_id : ''}
                label="Device"
                disabled={this.state.disabled}
                underlineDisabledStyle={{ borderBottom: 'none' }}
                errorstyle={{ color: 'rgb(171, 16, 0)' }}
              />
            ) : null}

            {this.props.showHelptips && (this.props.hasDevices && (this.props.artifacts || []).length) ? (
              <div style={{ position: 'relative' }}>
                <div
                  id="onboard-13"
                  className={this.props.hasDeployments ? 'tooltip help' : 'tooltip help highlight'}
                  data-tip
                  data-for="create-deployment1-tip"
                  data-event="click focus"
                  style={{ top: '-75px', left: '45%' }}
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
                {this.props.filteredDevices ? this.props.filteredDevices.length : '0'} of {devicesLength} {pluralize('devices', devicesLength)} will be updated.{' '}
                <span onClick={() => this.props.showDevices()} className={this.state.disabled ? 'hidden' : 'link'}>
                  View the devices
                </span>
              </p>
            ) : null}
            {this.props.hasDevices && artifactItems.length ? (
              <p className="info">
                <InfoOutlinedIcon />
                The deployment will skip any devices that are already on the target artifact version, or that have a different device type.
              </p>
            ) : null}
          </div>
        </form>
      </div>
    );
  }
}
