import React from 'react';
import ReactDOM from 'react-dom';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var SelectedDevices = require('./selecteddevices');
var Filters = require('./filters');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var RaisedButton = mui.RaisedButton;
var Dialog = mui.Dialog;
var MenuItem = mui.MenuItem;

var SelectField = mui.SelectField;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;

import Snackbar from 'material-ui/lib/snackbar';

var addSelection = {};

var DeviceList = React.createClass({
  getInitialState: function() {
    return {
      errorText1: null,
      selectedGroup: {
        payload: '',
        text: ''
      },
      sortCol: "status",
      sortDown: true,
      addGroup: false,
      autoHideDuration: 5000,
      snackMessage: 'Group has been removed',
      openSnack: false,
      nameEdit: false,
      editValue: null,
      groupName: this.props.selectedGroup.name,
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.selectedGroup !== this.props.selectedGroup) {
      this.setState({
        expanded: null,
        groupName: this.props.selectedGroup.name,
        nameEdit: false
      });
    }
    if (this.state.nameEdit) {
       this.refs.editGroupName.focus();
    }
  },
  
  _onRowSelection: function(rows) {
    if (rows === "all") {
      rows = [];
      for (var i=0; i<this.props.devices.length;i++) {
        rows.push(i);
      }
    } else if (rows === "none") {
      rows = [];
    }
    AppActions.selectDevices(rows);
  },
  _selectAll: function(rows) {
    console.log("select all", rows);
  },
  _handleGroupNameSave: function(event) {
    if (!event || event['keyCode'] === 13) {
      if (!this.state.errorCode1) {
        var group = this.props.selectedGroup;
        group.name = this.state.groupName;
        AppActions.addToGroup(group, []);
      } else {
        this.setState({groupName: this.props.selectedGroup});
      }
    }
    if (event && event['keyCode'] === 13) {
      this.setState({
        nameEdit: false,
        errorText1:null
      });
    }
  },
  _handleGroupNameChange: function(event) {
   this.setState({groupName: event.target.value});
   this._validateName(event.target.value);
  },
  _validateName: function(name) {
    var errorText = null;
    if (name) {
      for (var i=0;i<this.props.groups.length; i++) {
        if (this.props.groups[i].name === name) {
          errorText = "A group with this name already exists";
        }
      }
    } else {
      errorText = "Name cannot be left blank.";
    }
    this.setState({errorText1: errorText});
  },
  _onChange: function(event) {
    this._validateName(event.target.value);
  },
  _expandRow: function(rowNumber, columnId) {
    if (columnId < 0) {
      this.setState({expanded: null});
    } else {
      var newIndex = rowNumber;
      if (rowNumber == this.state.expanded) {
        newIndex = null;
      }
      this.setState({expanded: newIndex});
    }
  },
  _ifSelected: function(name) {
    var value = false;
    for (var i=0;i<this.props.selectedDevices.length;i++) {
      if (name === this.props.selectedDevices[i].name) {
        value = true;
        break;
      }
    }
    return value;
  },
  _addGroupHandler: function() {
    AppActions.addToGroup(addSelection.group, this.props.selectedDevices);
    this.dialogToggle('addGroup');
    AppActions.selectGroup(addSelection.group.id);
  },
  _removeGroupHandler: function() {
    AppActions.addToGroup(this.props.selectedGroup, this.props.selectedDevices);
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
  _validateName: function(name) {
    var newName = name;
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
  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
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
  _onClick: function(event) {
    event.stopPropagation();
  },

  _sortColumn: function(col) {
    var direction;
    if (this.state.sortCol !== col) {
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons";
      ReactDOM.findDOMNode(this.refs[col]).className = "sortIcon material-icons selected";
      this.setState({sortCol:col, sortDown: true});
      direction = true;
    } else {
      direction = !(this.state.sortDown);
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons selected " +direction;
      this.setState({sortDown: direction});
    }
    // sort table
    AppActions.sortTable("_currentDevices", col, direction);
  },

  _removeCurrentGroup: function() {
    var tmp;
    for (var i=0; i<this.props.groups.length; i++) {
      if (this.props.groups[i].id === this.props.selectedGroup.id) {
        tmp = i;
      }
    }
    this.setState({
      tempGroup: this.props.selectedGroup,
      tempIdx: tmp,
      openSnack: true,
    });
    AppActions.removeGroup(this.props.selectedGroup.id);
  },

  handleRequestClose: function() {
    this.setState({
      openSnack: false,
    });
  },

  handleUndoAction: function() {
    AppActions.addGroup(this.state.tempGroup, this.state.tempIdx);
    this.handleRequestClose();
  },

  _nameEdit: function() {
    if (this.state.nameEdit) {
      this._handleGroupNameSave();
    }
    this.setState({
      nameEdit: !this.state.nameEdit,
      errorText1: null
    });
  },

  render: function() {
    var styles = {
      exampleFlatButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6",
        color:"#679BA5",
        fontSize:'16'
      },
      exampleFlatButton: {
        fontSize:'12',
        marginLeft:"10",
        float:"right",
        marginRight:"130"
      },
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "20" 
      },
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
      sortIcon: {
        verticalAlign: 'middle',
        marginLeft: "10",
        color: "#8c8c8d",
        cursor: "pointer",
      }
    }

    var groupList = this.props.groups.map(function(group, index) {
      if (group.id !== 1) {
        return <MenuItem value={group.id} key={index} primaryText={group.name} />
      } else {
        return <MenuItem value='' key={index} primaryText='' />
      }
    });


    var devices = this.props.devices.map(function(device, index) {
      var expanded = '';
      if ( this.state.expanded === index ) {
        expanded = <SelectedDevices images={this.props.images} devices={this.props.devices} selected={[device]} selectedGroup={this.props.selectedGroup} groups={this.props.groups} />
      }
      return (
        <TableRow selected={this._ifSelected(device.name)} hoverable={!expanded} className={expanded ? "expand devices" : null}  key={index}>
          <TableRowColumn>{device.name}</TableRowColumn>
          <TableRowColumn>{device.model}</TableRowColumn>
          <TableRowColumn>{device.software_version}</TableRowColumn>
          <TableRowColumn>{device.status}</TableRowColumn>
          <TableRowColumn style={{width:"33", paddingRight:"0", paddingLeft:"12"}} className="expandButton">
            <IconButton className="float-right" onClick={this._expandRow.bind(this, index)}><FontIcon className="material-icons">{ expanded ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", overflow:"visible"}}>
            <div onClick={this._onClick} className={expanded ? "expanded" : null}>
              {expanded}
            </div>
          </TableRowColumn>
        </TableRow>
      )
    }, this);

    var disableAction = this.props.selectedDevices.length ? false : true;
    
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

    var groupNameInputs = (
      <TextField 
        id="groupNameInput"
        ref="editGroupName"
        value={this.state.groupName}
        onChange={this._handleGroupNameChange}
        onKeyDown={this._handleGroupNameSave}
        className={this.state.nameEdit ? "hoverText" : "hidden"}
        underlineStyle={{borderBottom:"none"}}
        underlineFocusStyle={{borderColor:"#e0e0e0"}}
        errorStyle={{color: "rgb(171, 16, 0)"}}
        errorText={this.state.errorText1} />
    );

    var correctIcon = this.state.nameEdit ? "check" : "edit";
    if (this.state.errorText1) {
      correctIcon = "close";
    }

    return (
      <div>
        <Filters attributes={this.props.attributes} filters={this.props.filters} onFilterChange={this.props.onFilterChange} />
        <div style={{marginLeft:"26"}}>
          <h2 className="hoverEdit" tooltip="Rename">
           
              {groupNameInputs}
              <span className={this.state.nameEdit ? "hidden" : null}>{this.props.selectedGroup.name}</span>
              <span className={this.props.selectedGroup.id === 1 ? 'transparent' : null}>
               <IconButton iconStyle={styles.editButton} onClick={this._nameEdit} iconClassName="material-icons" className={this.state.errorText1 ? "align-top" : null}>
                {correctIcon}
              </IconButton>
              </span>

              <FlatButton onClick={this._removeCurrentGroup} style={styles.exampleFlatButton} className={this.props.selectedGroup.id === 1 ? 'hidden' : null} secondary={true} label="Remove group" labelPosition="after">
                <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">delete</FontIcon>
              </FlatButton>
          </h2>
        </div>
        <div className="margin-bottom">
          <Table
            onCellClick={this._expandRow}
            onRowSelection={this._onRowSelection}
            multiSelectable={true}
            className={devices.length ? null : 'hidden'} >
            <TableHeader
            enableSelectAll={true}>
              <TableRow>
                <TableHeaderColumn className="columnHeader" tooltip="Name">Name<FontIcon ref="name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "name")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Device type">Device type<FontIcon ref="model" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "model")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Current software">Current software<FontIcon ref="software_version" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "software_version")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Status">Status<FontIcon ref="status" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "status")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" style={{width:"33", paddingRight:"12", paddingLeft:"12"}}></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              deselectOnClickaway={false}
              showRowHover={true}
              className="clickable">
              {devices}
            </TableBody>
          </Table>
          <p className={devices.length ? 'hidden' : 'italic muted margin-left'}>
            No devices found
          </p>
        </div>

        <div className={this.props.selectedDevices.length ? "fixedButtons" : "hidden"}>
          <span className="margin-right">{this.props.selectedDevices.length} device<span className={this.props.selectedDevices.length>1 ? null : "hidden"}>s</span> selected</span>
          <RaisedButton disabled={disableAction} label="Add selected devices to a group" secondary={true} onClick={this.dialogToggle.bind(null, 'addGroup')}>
            <FontIcon style={styles.raisedButtonIcon} className="material-icons">add_circle</FontIcon>
          </RaisedButton>
          <FlatButton disabled={disableAction} style={{marginLeft: "4"}} className={this.props.selectedGroup.id === 1 ? 'hidden' : null} label="Remove selected devices from this group" secondary={true} onClick={this._removeGroupHandler}>
            <FontIcon style={styles.buttonIcon} className="material-icons">remove_circle_outline</FontIcon>
          </FlatButton>
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

        <Snackbar
          open={this.state.openSnack}
          message={this.state.snackMessage}
          action="undo"
          autoHideDuration={this.state.autoHideDuration}
          onActionTouchTap={this.handleUndoAction}
          onRequestClose={this.handleRequestClose}
        />

      </div>
    );
  }
});

module.exports = DeviceList;