import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var SelectedDevices = require('./selecteddevices');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;

var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;

var DeviceList = React.createClass({
  getInitialState: function() {
    return {
      errorText1: null,

    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextProps.selectedGroup.name !== this.props.selectedGroup.name) {
      //this.refs['input'].setValue(nextProps.selectedGroup.name); 
      return true;
    } if (nextProps.devices !== this.props.devices) {
      return true;
    } if (nextState.expanded !== this.state.expanded) {
      return true;
    } else {
      return false;
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
  _handleGroupNameChange: function(event) {
    if (!this.state.errorText1) {
      var group = this.props.selectedGroup;
      group.name = event.target.value;
      AppActions.addToGroup(group, []);
    }
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
  _expandRow: function(index, event) {
    event.stopPropagation();
    var newIndex = index;
    if (index == this.state.expanded) {
      newIndex = null;
    }
    this.setState({expanded: newIndex});
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
        opacity:"0.5",
        float:"right",
        marginRight:"160"
      }
    }
    var devices = this.props.devices.map(function(device, index) {
      var selected = '';
      if ( this.state.expanded === index ) {
        selected = <SelectedDevices images={this.props.images} devices={this.props.devices} selected={this.props.selectedDevices} selectedGroup={this.props.selectedGroup} groups={this.props.groups} />
      }
      return (
        <TableRow hoverable={!selected} className={selected ? "expand" : null}  key={index}>
          <TableRowColumn>{device.name}</TableRowColumn>
          <TableRowColumn>{device.model}</TableRowColumn>
          <TableRowColumn>{device.software_version}</TableRowColumn>
          <TableRowColumn>{device.status}</TableRowColumn>
          <TableRowColumn className="expandButton">
            <IconButton onClick={this._expandRow.bind(this, index)}><FontIcon className="material-icons">{ selected ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", overflow:"visible"}}>
            <div className={selected ? "expanded" : null}>
              {selected}
            </div>
          </TableRowColumn>
        </TableRow>
      )
    }, this);
    var selectedName = this.props.selectedGroup.name;
    return (
      <div>
        <div style={{marginLeft:"26"}}>
          <h2 className="hoverEdit" tooltip="Rename">
            <TextField 
              ref="input"
              defaultValue={selectedName}
              underlineStyle={{borderBottom:"none"}}
              underlineFocusStyle={{borderColor:"#e0e0e0"}}
              onEnterKeyDown={this._handleGroupNameChange}
              onBlur={this._handleGroupNameChange}
              errorStyle={{color: "rgb(171, 16, 0)"}}
              errorText={this.state.errorText1}
              className="hoverText"
              onChange={this._onChange} />
              <FlatButton style={styles.exampleFlatButton} className="opacityButton" secondary={true} label="Remove group" labelPosition="after">
                <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">delete</FontIcon>
              </FlatButton>
          </h2>
        </div>
        <div>
          <Table
            onRowSelection={this._onRowSelection}
            multiSelectable={true}
            className={devices.length ? null : 'hidden'} >
            <TableHeader
            enableSelectAll={true}>
              <TableRow>
                <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                <TableHeaderColumn tooltip="Device type">Device type</TableHeaderColumn>
                <TableHeaderColumn tooltip="Current software">Current software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Status">Status</TableHeaderColumn>
                <TableHeaderColumn tooltip="Show details">Show details</TableHeaderColumn>
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
            No devices found. Add devices to this group by making a selection within 'All devices' and choosing 'Add selected devices to a group'.
          </p>
        </div>
      </div>
    );
  }
});

module.exports = DeviceList;