import React from 'react';
import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import { Router, Link } from 'react-router';
import DateTime from './datetime.js';
import SearchInput from 'react-search-input';

import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';


function getDate() {
  return new Date()
}

function addDate(date,days) {
  var newDate = new Date(date);
  newDate.setDate(newDate.getDate()+days);
  return newDate;
}

function combineDateTime(date, time) {

  var diffMs = (date - time); // milliseconds 
  var diffDays = Math.round(diffMs / 86400000); // days

  return addDate(time, diffDays);
}


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
    var imageVal = {
      payload: null,
      text: ''
    }
    if (this.props.imageVal) {
      imageVal.payload = this.props.imageVal.id;
      imageVal.text = this.props.imageVal.name;
    }

    /* if single device */
    var disabled = false;
    var group = null;
    if (this.props.device) {
      disabled = true;
    }

    // date times
    var start_date = this.props.start ? new Date(this.props.start) : getDate();
    var start_time = start_date;
    var end_date = this.props.end ? new Date(this.props.end) : addDate(getDate(),1);
    var end_time = end_date;

    return {
      start_time: start_time,
      start_date: start_date,
      end_time: end_time,
      end_date: end_date,
      minDate: getDate(),
      minDate1: addDate(getDate(),1),
      imageVal: imageVal,
      image: this.props.image,
      images: AppStore.getSoftwareRepo(),
      disabled: disabled,
      group: group,
      showDevices: false,
    };
  },
  componentDidMount: function() {
    this._deploymentTimes();
  },
  _handleGroupValueChange: function(e, index, value) {
    var device_type = this.state.image ? this.state.image.device_type : null;
    var group = value === "All devices" ?  null : this.props.groups[index-1];
    this.setState({
      group: value,
      devices: AppStore.getDevicesFromParams(group, device_type)
    });
    this._sendUpToParent(this.state.image, 'image');
    this._sendUpToParent(group, 'group');
  },
  _handleImageValueChange: function(e, index, value) {
    var image = this.state.images[index];
    var groupname = this.state.group;
    var devices = this.props.device ? [this.props.device] : AppStore.getDevicesFromParams(groupname, image.device_type);

    this.setState({
      image: image,
      imageVal: {
        payload: image.id,
        text: image.name
      },
      devices: devices
    });
    this._sendUpToParent(this.state.group, 'group');
    this._sendUpToParent(image, 'image');
  },

  _sendUpToParent: function(val, attr) {
    // send params to parent with dialog holder
    this.props.deploymentSchedule(val, attr);
  },
  _deploymentTimes: function() {
    var newDeployment = {};

    var start_time = this.state.start_time.getTime();
    var start_date = this.state.start_date.getTime();
   
    newDeployment.start_time = combineDateTime(start_date, start_time).getTime();

    var end_time = this.state.end_time.getTime();
    var end_date = this.state.end_date.getTime();

    newDeployment.end_time = combineDateTime(end_date, end_time).getTime();

    this._sendUpToParent(newDeployment.start_time, "start_time");
    this._sendUpToParent(newDeployment.end_time, "end_time");
  },

  _updatedDateTime: function(ref, date) {
    var set = {};
    set[ref] = date;
    this.setState(set, function() {
      this._deploymentTimes();
    });
  },

  _showDevices: function() {
    this.setState({showDevices: !this.state.showDevices});
  },

  searchUpdated: function(term) {
    this.setState({searchTerm: term}); // needed to force re-render
  },

  render: function() {
    var imageItems = [];

    for (var i=0; i<this.state.images.length;i++) {
      var tmp = <MenuItem value={this.state.images[i].id} key={i} primaryText={this.state.images[i].name} />
      imageItems.push(tmp);
    }
   

    var groupItems = [];
    if (this.props.device) {
      // If single device, don't show groups
      groupItems[0] = <MenuItem value={this.props.device.id} key={this.props.device.id} primaryText={this.props.device.id} />
    } else {
      groupItems[0] = <MenuItem value="All devices" key="All" primaryText="All devices" />;
      
      for (var i=0; i<this.props.groups.length;i++) {
        var tmp = <MenuItem value={this.props.groups[i]} key={i} primaryText={this.props.groups[i]} />;
        groupItems.push(tmp);
      }
    }

    
    var device_type = this.state.image ? this.state.image.device_type : '';
    var filters = "device_type="+device_type;
    if (this.props.device) {filters = "id="+this.props.device.id}
    filters = encodeURIComponent(filters);


    var defaultStartDate =  this.state.start_time;
    var defaultEndDate = this.state.end_time;
    var tmpDevices = [];

    if (this.refs.search && this.state.devices) {
      var namefilter = ['id'];
      tmpDevices = this.state.devices.filter(this.refs.search.filter(namefilter));
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
        <p className={this.state.group ? this.state.group : "hidden"}><Link to={`/devices/${this.state.group}/${filters}`}>Go to group ></Link></p>
      </div>
    );

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
              value={this.state.imageVal.payload}
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
              value={device_type} 
              underlineDisabledStyle={{borderBottom:"none"}}
              style={{verticalAlign:"top"}}
              errorStyle={{color: "rgb(171, 16, 0)"}}
              className={this.state.image ? "margin-left" : "hidden"} />

            <p className={imageItems.length ? "hidden" : "info"} style={{marginTop:"0"}}>
              <FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px", color:"rgb(171, 16, 0)"}}>error_outline</FontIcon>There are no images available. <Link to={`/software`}>Upload one to the repository</Link> to get started.
            </p>
          </div>

          <div style={{display:"block"}}>
            <div className={this.state.disabled ? 'hidden' : 'inline-block'}>
              <SelectField
                value={this.state.group}
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

            <div className={this.state.devices ? null : 'hidden'}>{this.state.devices ? this.state.devices.length : "0"} devices will be updated <span onClick={this._showDevices} className={this.state.disabled ? "hidden" : "margin-left link"}>View devices</span></div>
          </div>
            
          <p className={this.props.hasDevices && imageItems.length ? 'info': "hidden"}><FontIcon className="material-icons" style={{marginRight:"4px", fontSize:"18px", top: "4px"}}>info_outline</FontIcon>Any devices that are already on the target software version will be skipped.</p>

        </form>
      </div>
    );
  }
});


module.exports = ScheduleForm;