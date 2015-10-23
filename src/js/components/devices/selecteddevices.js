var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var ScheduleForm = require('../updates/scheduleform');

var mui = require('material-ui');
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var Dialog = mui.Dialog;
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var Snackbar = mui.Snackbar;

var addSelection = {};

var SelectedDevices = React.createClass({
  getInitialState: function() {
    return {
      showInput: false,
      groups: this.props.groups,
      selectedGroup: {
        payload: '',
        text: ''
      }
    };
  },
  _onDismiss: function() {
    console.log("gone");
  },
  _handleSelectValueChange: function(e) {
    this.setState({showInput: false});

    var group = '';
    for (var i=0;i<this.props.groups.length;i++) {
      if (this.props.groups[i].id === e.target.value) {
        group = this.props.groups[i];
      }
    }
    this.setState({
      selectedGroup: {
        payload:e.target.value,
        text: group.name
      }
    });
    addSelection = {
      group: group,
      textFieldValue: e.target.value 
    };
  },
  dialogDismiss: function(ref) {
    this.refs[ref].dismiss();
  },
  dialogOpen: function(ref) {
    this.refs[ref].show();
  },
  _showButton: function() {
    this.setState({showInput: true});
  },
  _addGroupHandler: function() {
    AppActions.addToGroup(addSelection.group, this.props.selected);
    this.dialogDismiss('addGroup');
    AppActions.selectGroup(addSelection.textFieldValue);
  },
  _removeGroupHandler: function() {
    AppActions.addToGroup(this.props.selectedGroup, this.props.selected);
  },
  _newGroupHandler: function() {
    var newGroup = this.refs['customGroup'].getValue();
    newGroup = {
      name: newGroup,
      devices: []
    };
    addSelection = {
      group: newGroup,
      textFieldValue: null 
    };
    var groups = this.state.groups;
    newGroup.id = groups.length+1;
    groups.push(newGroup);
    
    this.setState({
      groups:groups,
      showInput: false,
      selectedGroup: {
        payload: newGroup.id,
        text: newGroup.name
      }
    });
  },
  _selectHandler: function(device) {
    var tmpGroup = {
      name: device.name,
      type: "private",
      devices: []
    }
    AppActions.addToGroup(tmpGroup, this.props.selected);
  },
  _validateName: function(e) {
    var newName = e.target.value;
    var errorText = null;
    for (var i=0;i<this.state.groups.length; i++) {
      if (this.props.groups[i].name === newName) {
        errorText = "A group with this name already exists";
      }
    }
    this.setState({errorText1: errorText});
  },

  render: function() {
    var hideInfo = {display: "none"};
    var deviceInfo ='';
    var hideRemove = this.props.selectedGroup.id === 1 ? {visibility: "hidden"} : {visibility: "visible"};
    var disableAction = this.props.selected.length ? false : true;
    var inputStyle = {
      display: "inline-block",
      marginRight: "30px"
    }

    if (this.props.selected.length === 1) {
      hideInfo = {display: "block"};
      deviceInfo = (
        <div>
          <ul>
            <li>Name: {this.props.selected[0].name}</li>
            <li>Status: {this.props.selected[0].status}</li>
            <li>Device type: {this.props.selected[0].model}</li>
            <li>Software: {this.props.selected[0].software_version}</li>
            <li>Architecture: {this.props.selected[0].arch}</li>
            <li>Groups: {this.props.selected[0].groups.join(',')}</li>
          </ul>
          <ScheduleForm groups={this.props.groups} device={this.props.selected[0]} label="Schedule update for this device" className="float-right" primary={true} />
        </div>
      )
    }
    var devices = this.props.selected.map(function(device) {
      return (
        <p>{device.name}</p>
      )
    })

    var addActions = [
      { text: 'Cancel', onClick: this.dialogDismiss.bind(null, 'addGroup')},
      { text: 'Add to group', onClick: this._addGroupHandler, ref: 'save' }
    ];

    var groupList = this.state.groups.map(function(group) {
      if (group.id === 1) {
        return {payload: '', text: ''}
      } else {
        return {payload: group.id, text: group.name}
      }
    });

    return (
      <div className="tableActions">
        <div>
          <span style={{marginRight:"30px"}}>{devices.length} devices selected</span>
          <FlatButton disabled={disableAction} label="Add selected devices to a group" secondary={true} onClick={this.dialogOpen.bind(null, 'addGroup')} />
          <FlatButton disabled={disableAction} style={hideRemove} label="Remove selected devices from this group" secondary={true} onClick={this._removeGroupHandler} />
        </div>
        <div className="deviceInfo" style={hideInfo}>
          {deviceInfo}
        </div>

        <Dialog
          ref="addGroup"
          title="Add devices to group"
          actions={addActions}
          actionFocus="submit"
          autoDetectWindowHeight={true} autoScrollBodyContent={true}>  
          <div style={{height: '200px'}}>
            <div>
              <SelectField
              ref="groupSelect"
              onChange={this._handleSelectValueChange}
              floatingLabelText="Select group"
              menuItems={groupList} 
              style={inputStyle}
              value={this.state.selectedGroup.payload} />
              
              <RaisedButton 
                label="Create new" 
                onClick={this._showButton}/>
            </div>

            <div className={this.state.showInput ? null : 'hidden'}>
              <TextField
                ref="customGroup"
                hintText="Group name"
                floatingLabelText="Group name"
                style={inputStyle}
                onChange={this._validateName}
                errorText={this.state.errorText1} />
            
              <RaisedButton label="Save" onClick={this._newGroupHandler} />
            </div>
          </div>
        </Dialog>

        <Snackbar 
          onDismiss={this._onDismiss}
          ref="snackbar"
          autoHideDuration={5000}
          action="undo"
          message="Devices added to group" />

          <Snackbar 
          onDismiss={this._onDismiss}
          ref="snackbarRemove"
          autoHideDuration={5000}
          action="undo"
          message="Devices were removed from the group"
          onActionTouchTap={this._undoRemove} />
      </div>
    );
  }
});

module.exports = SelectedDevices;