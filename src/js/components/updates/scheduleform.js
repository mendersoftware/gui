import React from 'react';
import AppStore from '../../stores/app-store';
import { Router, Link } from 'react-router';
import DateTime from './datetime.js';

import mui from 'material-ui';

var DatePicker = mui.DatePicker;
var TimePicker = mui.TimePicker;
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var FontIcon = mui.FontIcon;


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

function getDevicesFromParams(group, model) {
  var devices = [];
  if (model && group) {
    devices = AppStore.getDevicesFromParams(group, model);
  }
  return devices.length;
}

var ScheduleForm = React.createClass({
  getInitialState: function() {
    var imageVal = {
      payload: null,
      text: ''
    }
    var groupVal = {
      payload: null,
      text: ''
    }
    if (this.props.imageVal) {
      imageVal.payload = this.props.imageVal.id;
      imageVal.text = this.props.imageVal.name;
    }
    if (this.props.groupVal) {
      groupVal.payload = this.props.groupVal.id;
      groupVal.text = this.props.groupVal.name;
    }
    this._sendUpToParent(this.props.id, 'id');

    /* if single device */
    var disabled = false;
    var group = null;

    if (this.props.device) {
      disabled = true;
      group = {
        id: null,
        name: this.props.device.name,
        type: 'private',
        devices: [this.props.device]
      }
      this._sendUpToParent(group, 'group');
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
      groupVal: groupVal,
      images: AppStore.getSoftwareRepo(),
      disabled: disabled,
      group: group
    };
  },
  componentDidMount: function() {
    this._updateTimes();
  },

  _handleGroupValueChange: function(e) {
    var image = this.state.image ? this.state.image.model : null;
    var group = this.props.groups[e.target.value-1];
    this.setState({
      group: group,
      groupVal: {
        payload: e.target.value,
        text: group.name,
      },
      devices: getDevicesFromParams(group.name, image)
    });
    this._sendUpToParent(group, 'group');
  },
  _handleImageValueChange: function(e) {
    var elementPos = this.state.images.map(function(x) {return x.id;}).indexOf(e.target.value);
    var image = this.state.images[elementPos];

    var groupname = this.state.group ? this.state.group.name : null;
    var devices = this.props.device ? 1 : getDevicesFromParams(groupname, image.model);
    this.setState({
      image: image,
      imageVal: {
        payload: e.target.value,
        text: image.name
      },
      devices: devices
    });
    this._sendUpToParent(image, 'image');
  },

  _sendUpToParent: function(val, attr) {
    // send params to parent with dialog holder
    this.props.updateSchedule(val, attr);
  },
  _updateTimes: function() {
    var newUpdate = {};

    var start_time = this.state.start_time.getTime();
    var start_date = this.state.start_date.getTime();
   
    newUpdate.start_time = combineDateTime(start_date, start_time).getTime();

    var end_time = this.state.end_time.getTime();
    var end_date = this.state.end_date.getTime();

    newUpdate.end_time = combineDateTime(end_date, end_time).getTime();

    this._sendUpToParent(newUpdate.start_time, "start_time");
    this._sendUpToParent(newUpdate.end_time, "end_time");
  },

  _updatedDateTime: function(ref, date) {
    var set = {};
    set[ref] = date;
    this.setState(set, function() {
      this._updateTimes();
    });
  },

  render: function() {
    var imageItems = [];
    for (var i=0; i<this.state.images.length;i++) {
      var tmp = { payload:this.state.images[i].id, text: this.state.images[i].name };
      imageItems.push(tmp);
    }

    var groupItems = [];
    if (this.props.device) {
      groupItems[0] = { payload:0, text: this.props.device.name }
    }

    for (var i=0; i<this.props.groups.length;i++) {
      var tmp = { payload:this.props.groups[i].id, text: this.props.groups[i].name };
      groupItems.push(tmp);
    }

    var model = this.state.image ? this.state.image.model : '';
    var filters = "model="+model;
    if (this.props.device) {filters = "name="+this.props.device.name}
    filters = encodeURIComponent(filters);


    var defaultStartDate =  this.state.start_time;
    var defaultEndDate = this.state.end_time;
    return (
      <div style={{height: '440px'}}>
        <form>
          <div style={{display:"block"}}>
            <SelectField
              ref="image"
              value={this.state.imageVal.payload}
              onChange={this._handleImageValueChange}
              floatingLabelText="Select target software"
              menuItems={imageItems} />

            <TextField
              className="margin-left"
              disabled={true}
              hintText="Device type"
              floatingLabelText="Device type"
              value={model} 
              underlineDisabledStyle={{borderBottom:"none"}}
              style={{verticalAlign:"top"}}
              errorStyle={{color: "rgb(171, 16, 0)"}} />
          </div>

          <div style={{display:"block"}}>
            <div className={this.state.disabled ? 'hidden' : 'inline-block'}>
              <SelectField
                value={this.state.groupVal.payload}
                ref="group"
                onChange={this._handleGroupValueChange}
                floatingLabelText="Select group"
                menuItems={groupItems} />
            </div>

            <div className={this.state.disabled ? 'inline-block' : 'hidden'}>
              <TextField
                value={groupItems[0].text}
                ref="device"
                floatingLabelText="Device"
                disabled={this.state.disabled}
                underlineDisabledStyle={{borderBottom:"none"}}
                errorStyle={{color: "rgb(171, 16, 0)"}} />  
            </div>

            <div className={this.state.devices ? null : 'hidden'}>{this.state.devices} devices will be updated <Link to="devices" params={{groupId: this.state.groupVal.payload, filters:filters }} className={this.state.disabled ? "hidden" : "margin-left"}>View devices</Link></div>
            
          </div>
            
          <p className='info'><FontIcon className="material-icons" style={{marginRight:"4", fontSize:"18", top: "4"}}>info_outline</FontIcon>Any devices that are already on the target software version will be skipped.</p>

        </form>
      </div>
    );
  }
});


module.exports = ScheduleForm;