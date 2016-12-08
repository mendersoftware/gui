import React from 'react';
import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import { Router, Link } from 'react-router';
import SearchInput from 'react-search-input';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
var pluralize = require('pluralize');

function getGroupDevices(group) {
  return AppActions.getGroupDevices(group, {
    success: function (devices) {
      return devices;
    },
    error: function(err) {
      console.log("Error: " + err);
      return;
    }
  });
}

var ScheduleForm = React.createClass({
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
      showDevices: false,
    };
  },

  _handleGroupValueChange: function(e, index, value) {
    var group = value;
    this._sendUpToParent(group, 'group');
  },
  _handleImageValueChange: function(e, index, value) {
    var image = this.props.images[index];
    this._sendUpToParent(image, 'image');
  },

  _sendUpToParent: function(val, attr) {
    // send params to parent with dialog holder
    this.props.deploymentSettings(val, attr);
  },

  _showDevices: function() {
    this.setState({showDevices: !this.state.showDevices});
  },

  searchUpdated: function(term) {
    this.setState({searchTerm: term}); // needed to force re-render
  },

  render: function() {
    var imageItems = [];

    for (var i=0; i<this.props.images.length;i++) {
      var tmp = <MenuItem value={this.props.images[i].name} key={i} primaryText={this.props.images[i].name} />
      imageItems.push(tmp);
    }
   

    var groupItems = [];
    if (this.props.device) {
      // If single device, don't show groups
      groupItems[0] = <MenuItem value={this.props.device.id} key={this.props.device.id} primaryText={this.props.device.id} />
    } else {
      groupItems[0] = <MenuItem value="All devices" key="All" primaryText="All devices" />;
      
      for (var i=0; i<this.props.groups.length;i++) {
        var tmp = <MenuItem value={this.props.groups[i]} key={i} primaryText={decodeURIComponent(this.props.groups[i])} />;
        groupItems.push(tmp);
      }
    }

    
    var device_types = this.props.image ? this.props.image.device_types_compatible : [];
    device_types = device_types.join(', ');
    var filters = "";
    if (this.props.device) {filters = "id="+this.props.device.id}
    filters = encodeURIComponent(filters);

    var tmpDevices = [];
    if (this.refs.search && this.props.filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = this.props.filteredDevices.filter(this.refs.search.filter(namefilter));
    }

    var devices = (
        <p>No devices</p>
    );
    if (tmpDevices) {
      devices = tmpDevices.map(function(item, index) {
        var singleFilter = "id="+item.id;
        singleFilter = encodeURIComponent(singleFilter);
        return (
          <div className="hint--bottom hint--medium" style={{width:"100%"}} aria-label={item.id} key={index}>
            <p className="text-overflow"><Link to={`/devices/${this.state.group}/${singleFilter}`}>{item.id}</Link></p>
          </div>
        )
      }, this);
    }
    var deviceList = (
      <div className="slider">
        <IconButton className="closeSlider" iconStyle={{fontSize:"16px"}} onClick={this._showDevices} style={{borderRadius:"30px", width:"40px", height:"40px", position:"absolute", left:"-18px", backgroundColor:"rgba(255,255,255,1)"}}>
          <FontIcon className="material-icons">close</FontIcon>
        </IconButton>
        <SearchInput style={{marginBottom:"8px"}} className="search" ref='search' onChange={this.searchUpdated} placeholder="Search devices" />
        {devices}
        <p className={tmpDevices.length ? "hidden" : "italic" }>No devices in this group match the device type or search term.</p>
        <Divider />
        <p className={this.props.group ? this.props.group : "hidden"}><Link to={`/devices/${this.props.group}/${filters}`}>Go to group ></Link></p>
      </div>
    );

    var devicesLength = this.props.deploymentDevices ? this.props.deploymentDevices.length : "0"; 

    return (
      <div style={{overflow:"visible", height: '440px'}}>
        <Drawer 
          ref="devicesNav"
          docked={false}
          openSecondary={true}
          style={this.state.showDevices ? {overflow:"visible"} : {overflow:"hidden"}}
          open={this.state.showDevices}
          overlayStyle={{backgroundColor:"rgba(0, 0, 0, 0.3)"}}
          onRequestChange={this._showDevices}
          containerStyle={this.state.showDevices ? {overflow:"visible"} : {overflow:"hidden"}}
          width={320}
        >
          {deviceList}
        </Drawer>
          
        <form>
          <div style={{display:"block"}}>
            <SelectField
              ref="image"
              value={this.props.image ? this.props.image.name : null}
              onChange={this._handleImageValueChange}
              floatingLabelText="Select target software"
              disabled={!imageItems.length}
            >
              {imageItems}
            </SelectField>

            <TextField
              disabled={true}
              hintText="Device type"
              floatingLabelText="Device type"
              value={device_types} 
              underlineDisabledStyle={{borderBottom:"none"}}
              style={{verticalAlign:"top"}}
              errorStyle={{color: "rgb(171, 16, 0)"}}
              className={this.props.image ? "margin-left" : "hidden"} />

            <p className={imageItems.length ? "hidden" : "info"} style={{marginTop:"0"}}>
              <FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px", color:"rgb(171, 16, 0)"}}>error_outline</FontIcon>There are no images available. <Link to={`/software`}>Upload one to the repository</Link> to get started.
            </p>
          </div>

          <div style={{display:"block"}}>
            <div className={this.state.disabled ? 'hidden' : 'inline-block'}>
              <SelectField
                value={this.props.group}
                ref="group"
                onChange={this._handleGroupValueChange}
                floatingLabelText="Select group"
                style={{marginBottom:"10px"}}
                disabled={!this.props.hasDevices} 
              >
                {groupItems}
              </SelectField>

              <p className={this.props.hasDevices ? "hidden" : "info"} style={{marginTop:"0"}}>
                <FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px", color:"rgb(171, 16, 0)"}}>error_outline</FontIcon>There are no connected devices. <span className={this.props.hasPending ? null : "hidden"}><Link to={`/devices`}>Accept pending devices</Link> to get started.</span>
              </p>
            </div>

            <div style={{width:"100%"}} className={this.state.disabled ? 'inline-block' : 'hidden'}>
              <TextField
                style={{width:"100%"}}
                value={this.props.device ? this.props.device.id : ""}
                ref="device"
                floatingLabelText="Device"
                disabled={this.state.disabled}
                underlineDisabledStyle={{borderBottom:"none"}}
                errorStyle={{color: "rgb(171, 16, 0)"}} />  
            </div>

            <div className={tmpDevices ? null : 'hidden'}>{this.props.filteredDevices ? this.props.filteredDevices.length : "0"} of {devicesLength} {pluralize("devices",devicesLength)} will be updated <span onClick={this._showDevices} className={this.state.disabled ? "hidden" : "margin-left link"}>View devices</span></div>
          </div>
            
          <p className={this.props.hasDevices && imageItems.length ? 'info': "hidden"}><FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px"}}>info_outline</FontIcon>the deployment will skip any devices that are already on the target software version, or that have a different device type.</p>

        </form>
      </div>
    );
  }
});


module.exports = ScheduleForm;