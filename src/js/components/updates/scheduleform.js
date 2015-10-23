var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var mui = require('material-ui');

var DatePicker = mui.DatePicker;
var TimePicker = mui.TimePicker;
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var RadioButtonGroup = mui.RadioButtonGroup;
var RadioButton = mui.RadioButton;
var Dialog = mui.Dialog;
var RaisedButton = mui.RaisedButton;

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
    if (this.props.imageVal) {
      imageVal = this.props.imageVal;
    }

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
    }
    return {
      minDate: getDate(),
      minDate1: addDate(getDate(),1),
      imageVal: imageVal,
      image: this.props.image,
      groupVal: null,
      images: AppStore.getSoftwareRepo(),
      disabled: disabled,
      group: group
    };
  },
  dialogDismiss: function(ref) {
    this.refs[ref].dismiss();
  },
  dialogOpen: function(ref) {
    this.refs[ref].show();
  },
  _handleGroupValueChange: function(e) {
    var image = this.state.image ? this.state.image.model : null;
    var group = this.props.groups[e.target.value-1];
    this.setState({
      group: group,
      groupVal: e.target.value,
      devices: getDevicesFromParams(group.name, image)
    });
  },
  _handleImageValueChange: function(e) {
    var image = this.state.images[e.target.value-1];
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
  },
  _onDialogSubmit: function() {
    var newUpdate = {};
    newUpdate.image = this.state.image;
    newUpdate.group = this.state.group;
    var start_time = this.refs['time'].getTime().getTime();
    var start_date = this.refs['date'].getDate().getTime();
    newUpdate.start_time = combineDateTime(start_date, start_time);

    var end_time = this.refs['endtime'].getTime().getTime();
    var end_date = this.refs['enddate'].getDate().getTime();
    newUpdate.end_time = combineDateTime(end_date, end_time);

    AppActions.saveSchedule(newUpdate, this.state.disabled);
    this.dialogDismiss('schedule');

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

    var actions = [
      { text: 'Cancel', onClick: this.dialogDismiss.bind(null, 'schedule')},
      { text: 'Schedule update', onClick: this._onDialogSubmit, ref: 'save' }
    ];
    var model = this.state.image ? this.state.image.model : '';
    return (
      <div>
        <RaisedButton primary={this.props.primary} secondary={this.props.secondary} label="Schedule an update" onClick={this.dialogOpen.bind(null, 'schedule')} />
        <Dialog
          ref="schedule"
          title="Schedule an update"
          actions={actions}
          actionFocus="submit"
          autoDetectWindowHeight={true} autoScrollBodyContent={true}

          >
          <div style={{height: '400px'}}>
            <form>
              <div>
                <h5 style={{margin:"0"}}>Start update</h5>
                <div style={{display:"inline-block"}}>
                  <DatePicker
                    floatingLabelText="Start date"
                    autoOk={true}
                    ref="date"
                    defaultDate={this.state.minDate}
                    minDate={this.state.minDate}
                    disabled={this.state.immediate}
                    mode="landscape"/>
                </div>
                <div style={{display:"inline-block", marginLeft:"30px"}}>
                  <TimePicker
                    format="24hr"
                    ref="time"
                    defaultTime={this.state.minDate}
                    disabled={this.state.immediate}
                    floatingLabelText="Start time" />
                </div>
              </div>

              <div style={{marginTop:"20"}}>
                <h5 style={{margin:"0"}}>End update</h5>
                <div style={{display:"inline-block"}}>
              
                  <DatePicker
                    floatingLabelText="End date"
                    autoOk={true}
                    ref="enddate"
                    defaultDate={this.state.minDate1}
                    minDate={this.state.minDate1}
                    disabled={this.state.immediate}
                    mode="landscape"/>
                </div>
                <div style={{display:"inline-block", marginLeft:"30px"}}>

                  <TimePicker
                    format="24hr"
                    ref="endtime"
                    defaultTime={this.state.minDate1}
                    disabled={this.state.immediate}
                    floatingLabelText="End time" />
                </div>
              </div>

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
                  style={{bottom:"-8"}}/>

                <div className={this.state.disabled ? 'hidden' : "block"}>
                  <SelectField
                    style={{display:"block"}}
                    value={this.state.groupVal}
                    ref="group"
                    onChange={this._handleGroupValueChange}
                    floatingLabelText="Select group"
                    menuItems={groupItems} />
                </div>

                <div className={this.state.disabled ? 'block' : "hidden"}>
                  <TextField
                    style={{display:"block"}}
                    value={groupItems[0].text}
                    ref="device"
                    floatingLabelText="Device"
                    disabled={this.state.disabled}
                    underlineDisabledStyle={{borderBottom:"none"}} />
                </div>

                <p className={this.state.devices ? null : 'hidden'}>{this.state.devices} devices will be updated <a href="#/devices" className="margin-left">View devices</a></p>
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    );
  }
});


module.exports = ScheduleForm;