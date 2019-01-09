import React from 'react';
import { Link } from 'react-router';
import SearchInput from 'react-search-input';
import ReactTooltip from 'react-tooltip';
import { CreateDeploymentForm } from '../helptips/helptooltips';
var createReactClass = require('create-react-class');

import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
var pluralize = require('pluralize');

var ScheduleForm = createReactClass({
  getInitialState: function() {
    /* if single device */
    var disabled = false;
    var group = null;
    if (this.props.device) {
      disabled = true;
    }

    return {
      disabled: disabled,
      group: group,
      showDevices: false
    };
  },

  _handleGroupValueChange: function(chosenRequest, index) {
    var group;
    if (index !== -1) {
      group = chosenRequest.text;
    } else {
      var result = this.props.groups.filter(function(o) {
        return o == chosenRequest;
      });
      group = result.length ? result[0] : null;
    }
    this.setState({ groupErrorText: group ? '' : 'Please select a group from the list' });
    this._sendUpToParent(group, 'group');
  },
  _handleGroupInputChange: function() {
    this.setState({ groupErrorText: 'Please select a group from the list' });
    this._sendUpToParent(null, 'group');
  },

  _handleArtifactValueChange: function(chosenRequest, index) {
    var artifact;
    if (index !== -1) {
      artifact = this.props.artifacts[index];
    } else {
      var result = this.props.artifacts.filter(function(o) {
        return o.name == chosenRequest;
      });
      artifact = result.length ? result[0] : null;
    }
    this.setState({ autoCompleteErrorText: artifact ? '' : 'Choose an Artifact to be deployed' });
    this._sendUpToParent(artifact, 'artifact');
  },
  _handleArtifactInputChange: function() {
    this.setState({ autoCompleteErrorText: 'Choose an Artifact to be deployed' });
    this._sendUpToParent(null, 'artifact');
  },
  _clearOnClick: function(ref) {
    this.refs[ref].setState({ searchText: '' });
    this.refs[ref].focus();
    this._sendUpToParent(null, ref);
  },

  _sendUpToParent: function(val, attr) {
    // send params to parent with dialog holder
    this.props.deploymentSettings(val, attr);
  },

  _showDevices: function() {
    this.setState({ showDevices: !this.state.showDevices });
  },

  searchUpdated: function(term) {
    this.setState({ searchTerm: term }); // needed to force re-render
  },

  render: function() {
    var artifactItems = [];

    for (var i = 0; i < this.props.artifacts.length; i++) {
      var tmp = { text: this.props.artifacts[i].name, value: <MenuItem value={this.props.artifacts[i]} key={i} primaryText={this.props.artifacts[i].name} /> };
      artifactItems.push(tmp);
    }

    var groupItems = [];
    if (this.props.device) {
      // If single device, don't show groups
      groupItems[0] = {
        text: this.props.device.id,
        value: <MenuItem value={this.props.device.id} key={this.props.device.id} primaryText={this.props.device.id} />
      };
    } else {
      groupItems[0] = { text: 'All devices', value: <MenuItem value="All devices" key="All" primaryText="All devices" /> };
      this.props.groups.reduce((accu, group, i) => {
        const tmp = {
          text: decodeURIComponent(group),
          value: <MenuItem value={group} key={i} primaryText={decodeURIComponent(group)} />
        };
        accu.push(tmp);
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

    var devices = <p>No devices</p>;

    if (tmpDevices) {
      devices = tmpDevices.map(function(item, index) {
        var idFilter = 'id=' + item.id;

        return (
          <div className="hint--bottom hint--medium" style={{ width: '100%' }} aria-label={item.id} key={index}>
            <p className="text-overflow">
              <Link to={`/devices/${idFilter}`}>{item.id}</Link>
            </p>
          </div>
        );
      }, this);
    }

    var group = this.props.group && this.props.group !== 'All devices' ? 'group=' + encodeURIComponent(this.props.group) : '';
    var deviceList = (
      <div className="slider">
        <IconButton
          className="closeSlider"
          iconStyle={{ fontSize: '16px' }}
          onClick={this._showDevices}
          style={{ borderRadius: '30px', width: '40px', height: '40px', position: 'absolute', left: '-18px', backgroundColor: 'rgba(255,255,255,1)' }}
        >
          <FontIcon className="material-icons">close</FontIcon>
        </IconButton>
        <SearchInput style={{ marginBottom: '8px' }} className="search" ref="search" onChange={this.searchUpdated} placeholder="Search devices" />
        {devices}
        <p className={tmpDevices.length ? 'hidden' : 'italic'}>No devices in this group match the device type or search term.</p>
        <Divider />
        <p>
          <Link to={`/devices/${group}`}>{group ? 'Go to group' : 'Go to devices'}></Link>
        </p>
      </div>
    );

    var devicesLength = this.props.deploymentDevices ? this.props.deploymentDevices.length : '0';

    return (
      <div style={{ overflow: 'visible', height: '400px' }}>
        <Drawer
          ref="devicesNav"
          docked={false}
          openSecondary={true}
          style={this.state.showDevices ? { overflow: 'visible' } : { overflow: 'hidden' }}
          open={this.state.showDevices}
          overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onRequestChange={this._showDevices}
          containerStyle={this.state.showDevices ? { overflow: 'visible' } : { overflow: 'hidden' }}
          width={320}
        >
          {deviceList}
        </Drawer>

        <form>
          <div style={{ display: 'block', marginBottom: '15px' }}>
            <AutoComplete
              ref="artifact"
              hintText="Select target artifact"
              dataSource={artifactItems}
              onNewRequest={this._handleArtifactValueChange}
              onUpdateInput={this._handleArtifactInputChange}
              floatingLabelText="Select target artifact"
              filter={AutoComplete.fuzzyFilter}
              openOnFocus={true}
              listStyle={{ overflow: 'auto', maxHeight: '360px' }}
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              errorText={this.state.autoCompleteErrorText}
              onClick={this._clearOnClick.bind(null, 'artifact')}
            />
            <TextField
              disabled={true}
              hintText="Device types"
              floatingLabelText="Device types"
              value={device_types}
              underlineDisabledStyle={{ borderBottom: 'none' }}
              style={{ verticalAlign: 'top', width: '400px' }}
              multiLine={true}
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              className={this.props.artifact ? 'margin-left' : 'hidden'}
            />

            <p className={artifactItems.length ? 'hidden' : 'info'} style={{ marginTop: '0' }}>
              <FontIcon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }}>
                error_outline
              </FontIcon>
              There are no artifacts available. <Link to={`/artifacts`}>Upload one to the repository</Link> to get started.
            </p>
          </div>

          <div style={{ display: 'block' }}>
            <div className={this.state.disabled ? 'hidden' : 'inline-block'}>
              <AutoComplete
                ref="group"
                hintText="Select target group"
                dataSource={groupItems}
                onNewRequest={this._handleGroupValueChange}
                onUpdateInput={this._handleGroupInputChange}
                floatingLabelText="Select target group"
                filter={AutoComplete.fuzzyFilter}
                openOnFocus={true}
                listStyle={{ overflow: 'auto', maxHeight: '360px' }}
                errorStyle={{ color: 'rgb(171, 16, 0)' }}
                errorText={this.state.groupErrorText}
                disabled={!this.props.hasDevices}
                onClick={this._clearOnClick.bind(null, 'group')}
              />

              <p className={this.props.hasDevices ? 'hidden' : 'info'} style={{ marginTop: '0' }}>
                <FontIcon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }}>
                  error_outline
                </FontIcon>
                There are no connected devices.{' '}
                <span className={this.props.hasPending ? null : 'hidden'}>
                  <Link to={`/devices/pending`}>Accept pending devices</Link> to get started.
                </span>
              </p>
            </div>

            <div style={{ width: '100%' }} className={this.state.disabled ? 'inline-block' : 'hidden'}>
              <TextField
                style={{ width: '100%' }}
                value={this.props.device ? this.props.device.device_id : ''}
                ref="device"
                floatingLabelText="Device"
                disabled={this.state.disabled}
                underlineDisabledStyle={{ borderBottom: 'none' }}
                errorStyle={{ color: 'rgb(171, 16, 0)' }}
              />
            </div>

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
                  <FontIcon className="material-icons">help</FontIcon>
                </div>
                <ReactTooltip id="create-deployment1-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                  <CreateDeploymentForm />
                </ReactTooltip>
              </div>
            ) : null}
          </div>

          <div className="margin-top">
            <p className={tmpDevices ? null : 'hidden'}>
              {this.props.filteredDevices ? this.props.filteredDevices.length : '0'} of {devicesLength} {pluralize('devices', devicesLength)} will be updated.{' '}
              <span onClick={this._showDevices} className={this.state.disabled ? 'hidden' : 'link'}>
                View the devices
              </span>
            </p>
            <p className={this.props.hasDevices && artifactItems.length ? 'info' : 'hidden'}>
              <FontIcon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px' }}>
                info_outline
              </FontIcon>
              The deployment will skip any devices that are already on the target artifact version, or that have a different device type.
            </p>
          </div>
        </form>
      </div>
    );
  }
});

module.exports = ScheduleForm;
