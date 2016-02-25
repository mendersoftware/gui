import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var ScheduleForm = require('../updates/scheduleform');

var mui = require('material-ui');
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var Dialog = mui.Dialog;
var MenuItem = mui.MenuItem;
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var List = mui.List;
var ListItem = mui.ListItem;
var Divider = mui.Divider;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;

var ReactTags = require('react-tag-input').WithContext;
var tagslist = [];

var addSelection = {};

function getGroups() {
  var copy = AppStore.getGroups().slice();
  return copy
}

var SelectedDevices = React.createClass({
  getInitialState: function() {
    return {
      showInput: false,
      selectedGroup: {
        payload: '',
        text: ''
      },
      tagEdit: false,
      schedule: false,
      addGroup: false
    };
  },
  _handleSelectValueChange: function(event, index, value) {
    this.setState({showInput: false});
    var group = this.props.groups[index];

    this.setState({
      selectedGroup: {
        payload:value,
        text: group.name
      }
    });
    addSelection = {
      group: group,
      textFieldValue: group.name
    };
  },
  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
  },
  _showButton: function() {
    this.setState({
      selectedGroup: {
        payload:null,
        text: null
      },
      showInput: true
    });
    this.refs.customGroup.focus();
  },
  _addGroupHandler: function() {
    AppActions.addToGroup(addSelection.group, this.props.selected);
    this.dialogToggle('addGroup');
    AppActions.selectGroup(addSelection.group.id);
  },
  _removeGroupHandler: function() {
    AppActions.addToGroup(this.props.selectedGroup, this.props.selected);
  },
  _newGroupHandler: function() {
    var newGroup = this.refs['customGroup'].getValue();
    newGroup = {
      name: newGroup,
      devices: [],
      type: 'public'
    };
    addSelection = {
      group: newGroup,
      textFieldValue: null 
    };
 
    newGroup.id = this.props.groups.length+1;
    var groups = this.props.groups;
    groups.push(newGroup);
    this.setState({
      showInput: false,
      selectedGroup: {
        payload: newGroup.id,
        text: newGroup.name
      }
    });

  },
  _validateName: function(e) {
    var newName = e.target.value;
    var errorText = null;
    var invalid = false;
    for (var i=0;i<this.props.groups.length; i++) {
      if (this.props.groups[i].name === newName) {
        errorText = "A group with this name already exists";
        invalid = true;
      }
    }
    this.setState({errorText1: errorText, invalid: invalid});
  },
  _getGroupNames: function(list) {
    /* TODO - move or tidy */
    var nameList = [];
    for (var i=0; i<list.length; i++) {
      for(var x = 0; x<this.props.groups.length; x++) {
        if(list[i] === this.props.groups[x].id) {
          nameList.push(this.props.groups[x].name);
        }
      }
    }

    return nameList;
  },

  _updateParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  },

  _clickListItem: function() {
   this.dialogToggle('schedule');
  },

  _onScheduleSubmit: function() {
    var newUpdate = {
      group: this.state.group,
      model: this.state.model,
      start_time: this.state.start_time,
      end_time: this.state.end_time,
      image: this.state.image
    }
    AppActions.saveSchedule(newUpdate, this.props.selected.length === 1);
    this.dialogToggle('schedule');
  },

  handleDelete: function(i) {
    tagslist.splice(i, 1);
  },
  handleAddition: function(tag) {
    tagslist.push({
        id: tagslist.length + 1,
        text: tag
    });
  },
  handleDrag: function(tag, currPos, newPos) {

  },
  _clickedEdit: function() {
    if (this.state.tagEdit) {
      var noIds = [];
      for (var i in tagslist) {
        noIds.push(tagslist[i].text);
      }

      // save new tag data to device
      AppActions.updateDeviceTags(this.props.selected[0].id, noIds);
    }
    this.setState({tagEdit: !this.state.tagEdit});
  },

  render: function() {
    var hideInfo = {display: "none"};
    var deviceInfo ='';
    var disableAction = this.props.selected.length ? false : true;
   
    var styles = {
      buttonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6",
        color: "rgb(0, 188, 212)"
      },
      raisedButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6",
        color: "#fff"
      },
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "20" 
      }
    }

    var editButton = (
      <IconButton iconStyle={styles.editButton} style={{top:"auto", bottom: "0"}} onClick={this._clickedEdit} iconClassName="material-icons">
        {this.state.tagEdit ? "check" : "edit"}
      </IconButton>
    );


    if (this.props.selected.length === 1) {
      tagslist = [];
      for (var i in this.props.selected[0].tags) {
        tagslist.push({id:i, text:this.props.selected[0].tags[i]});
      }

      var tagInput = (
        <ReactTags tags={tagslist} 
          handleDelete={this.handleDelete}  
          handleAddition={this.handleAddition}
          handleDrag={this.handleDrag}
          delimeters={[9, 13, 188]} />
      );
     
      var tags = this.state.tagEdit ? tagInput : this.props.selected[0].tags.join(', ') || '-';
     
      hideInfo = {display: "block"};
      deviceInfo = (
        <div>
          <div className="report-list">
            <List>
              <ListItem disabled={true} primaryText="Name" secondaryText={this.props.selected[0].name} />
              <Divider />
              <ListItem disabled={true} primaryText="Status" secondaryText={this.props.selected[0].status} />
              <Divider />
              <ListItem disabled={true} primaryText="Device type" secondaryText={this.props.selected[0].model} />
              <Divider />
            </List>
          </div>
          <div className="report-list">
            <List>
              <ListItem disabled={true} primaryText="Software" secondaryText={this.props.selected[0].software_version} />
              <Divider />
              <ListItem disabled={true} primaryText="Architecture" secondaryText={this.props.selected[0].arch} />
              <Divider />
              <ListItem disabled={true} primaryText="Groups" secondaryText={this._getGroupNames(this.props.selected[0].groups).join(', ')} />
              <Divider />
            </List>
          </div>
          <div className="report-list">
            <List>
              <ListItem rightIconButton={editButton} disabled={true} primaryText="Tags" secondaryText={tags} />
              <Divider />
              <ListItem
                primaryText="Deploy update"
                secondaryText="Click to update this device"
                onClick={this._clickListItem}
                leftIcon={<FontIcon className="material-icons">schedule</FontIcon>} />
              <Divider />
            </List>
          </div>
        </div>
      )
    }
    var devices = this.props.selected.map(function(device) {
      return (
        <p>{device.name}</p>
      )
    })

    var addActions = [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogToggle.bind(null, 'addGroup')} />
      </div>,
      <RaisedButton
        label="Add to group"
        primary={true}
        onClick={this._addGroupHandler}
        ref="save" 
        disabled={this.state.invalid} />
    ];

    var groupList = this.props.groups.map(function(group, index) {
      if (group.id !== 1) {
        return <MenuItem value={group.id} key={index} primaryText={group.name} />
      } else {
        return <MenuItem value='' key={index} primaryText='' />
      }
    });
    var scheduleActions =  [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogToggle.bind(null, 'schedule')} />
      </div>,
      <RaisedButton
        label="Deploy update"
        primary={true}
        onClick={this._onScheduleSubmit}
        ref="save" />
    ];

    return (
      <div className={this.props.devices.length ? null : "hidden"}>
        <div className='float-right'>
          <RaisedButton disabled={disableAction} label="Add selected devices to a group" secondary={true} onClick={this.dialogToggle.bind(null, 'addGroup')}>
            <FontIcon style={styles.raisedButtonIcon} className="material-icons">add_circle</FontIcon>
          </RaisedButton>
          <FlatButton disabled={disableAction} style={{marginLeft: "4"}} className={this.props.selectedGroup.id === 1 ? 'hidden' : null} label="Remove selected devices from this group" secondary={true} onClick={this._removeGroupHandler}>
            <FontIcon style={styles.buttonIcon} className="material-icons">remove_circle_outline</FontIcon>
          </FlatButton>
        </div>
        <p>{devices.length} devices selected</p>
        <div id="deviceInfo" style={hideInfo}>
          <h3>Device details</h3>
          {deviceInfo}
        </div>

        <Dialog
          open={this.state.addGroup}
          title="Add selected devices to group"
          actions={addActions}
          autoDetectWindowHeight={true} autoScrollBodyContent={true}>  
          <div style={{height: '200px'}}>
            <div>
              <div className="float-left">
                <SelectField
                ref="groupSelect"
                onChange={this._handleSelectValueChange}
                floatingLabelText="Select group"
                value={this.state.selectedGroup.payload}
                >
                 {groupList}
                </SelectField>
              </div>
              
              <div className="float-left margin-left-small">
                <RaisedButton 
                  label="Create new"
                  style={{marginTop:"26"}}
                  onClick={this._showButton}/>
              </div>
            </div>

            <div className={this.state.showInput ? null : 'hidden'}>
              <TextField
                ref="customGroup"
                hintText="Group name"
                floatingLabelText="Group name"
                className="float-left clear"
                onChange={this._validateName}
                errorStyle={{color: "rgb(171, 16, 0)"}}
                errorText={this.state.errorText1} />
              <div className="float-left margin-left-small">
                <RaisedButton
                  style={{marginTop:"26"}}
                  secondary={true}
                  label="Save"
                  onClick={this._newGroupHandler}
                  disabled={this.state.invalid} />
              </div>
            </div>
          </div>
        </Dialog>

        <Dialog
          open={this.state.schedule}
          title='Deploy an update'
          actions={scheduleActions}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          bodyStyle={{paddingTop:"0"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          >
          <ScheduleForm images={this.props.images} device={this.props.selected[0]} updateSchedule={this._updateParams} groups={this.props.groups} />

        </Dialog>

      </div>
    );
  }
});

module.exports = SelectedDevices;