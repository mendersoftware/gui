import React from 'react';
import { Router, Link } from 'react-router';
import Time from 'react-time';
import Collapse from 'react-collapse';

var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var ScheduleForm = require('../deployments/scheduleform');

import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';

var ReactTags = require('react-tag-input').WithContext;
var tagslist = [];

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
    };
  },
  dialogToggle: function (ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
  },

  _getGroupNames: function(list) {
   
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
    var newDeployment = {
      devices: [this.props.selected[0].id],
      name: this.props.selected[0].name,
      artifact_name: this.state.image.name
    }
    AppActions.createDeployment(newDeployment, function(uri) {
      console.log(uri);
    });
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
  _clickedEdit: function(event) {
    event.stopPropagation();
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
  _handleAccept: function () {
    this.props.accept(this.props.selected);
  },
  _handleBlock: function () {
    this.props.block(this.props.selected);
  },
  render: function() {
   
    var styles = {
      editButton: {
        color: "rgba(0, 0, 0, 0.54)",
        fontSize: "20" 
      },
      listStyle: {
        fontSize: "12px",
        paddingTop: "10px",
        paddingBottom: "10px"
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

      //var tags = this.state.tagEdit ? tagInput : this.props.selected[0].tags.join(', ') || '-';
      var encodedSoftware = encodeURIComponent(this.props.selected[0].artifact_name); 
      var softwareLink = (
        <div>
          <Link style={{fontWeight:"500"}} to={`/software/${encodedSoftware}`}>{this.props.selected[0].artifact_name}</Link>
        </div>
      )

      var deviceIdentity = [];
      for (var k in this.props.selected[0].attributes) {
        deviceIdentity.push(
          <div key={k}>
            <ListItem style={styles.listStyle} disabled={true} primaryText={k} secondaryText={ this.props.selected[0].attributes[k]} />
            <Divider />
          </div>
        );
      };

      var deviceInfo;

      //if (this.props.unauthorized) {
        deviceInfo = (
          <div>
            <div className="report-list">
              <List>
                {deviceIdentity}
              </List>
            </div>

            <div className={this.props.unauthorized ? "report-list" : "hidden"}>
              <List>
                <ListItem
                  style={styles.listStyle}
                  onClick={this._handleAccept}
                  primaryText="Authorize device"
                  leftIcon={<FontIcon className="material-icons green auth" style={{marginTop:6, marginBottom:6}}>check_circle</FontIcon>} />
                <Divider />
                <ListItem
                  style={styles.listStyle}
                  primaryText="Block device"
                  onClick={this._handleBlock}
                  leftIcon={<FontIcon className="material-icons red auth" style={{marginTop:6, marginBottom:6}}>cancel</FontIcon>} />
                <Divider />
              </List>
            </div>
          </div>
        )

     /* } else {

        deviceInfo = (
          <div>
            <div className="report-list">
              <List>
                <ListItem style={styles.listStyle} disabled={true} primaryText="Name" secondaryText={this.props.selected[0].name} />
                <Divider />
                <ListItem style={styles.listStyle} disabled={true} primaryText="Device type" secondaryText={this.props.selected[0].device_type} />
                <Divider />
                <ListItem style={styles.listStyle} disabled={true} primaryText="Device serial no." secondaryText={this.props.selected[0].device_serial} />
                <Divider />
                <ListItem style={styles.listStyle} disabled={true} primaryText="Architecture" secondaryText={this.props.selected[0].arch} />
                <Divider />
              </List>
            </div>
            <div className="report-list">
              <List>
                <ListItem style={styles.listStyle} disabled={true} primaryText="Status" secondaryText={this.props.selected[0].status} />
                <Divider />
                <ListItem style={styles.listStyle}  disabled={true} primaryText="Last heartbeat" secondaryText={<Time value={this.props.selected[0].last_heartbeat} format="YYYY-MM-DD HH:mm" />} />
                <Divider />
                <ListItem style={styles.listStyle} disabled={true} primaryText="IP address" secondaryText={this.props.selected[0].ip_address} />
                <Divider />
                <ListItem style={styles.listStyle} disabled={true} primaryText="MAC address" secondaryText={this.props.selected[0].mac_address} />
                <Divider />
              </List>
            </div>
            <div className="report-list">
              <List>
                <ListItem style={styles.listStyle} disabled={true} primaryText="Current software" secondaryText={softwareLink} />
                <Divider />
                <ListItem style={styles.listStyle} disabled={true} primaryText="Groups" secondaryText={this.props.selected[0].group} />
                <Divider />
                <ListItem
                  style={styles.listStyle}
                  primaryText="Create a deployment"
                  secondaryText="Deploy an update to this device only"
                  onClick={this._clickListItem}
                  leftIcon={<FontIcon style={{marginTop:6, marginBottom:6}} className="material-icons">update</FontIcon>} />
                <Divider />
              </List>
            </div>
          </div>
        )
      } */
    }
    
    var devices = this.props.selected.map(function(device) {
      return (
        <p>{device.name}</p>
      )
    })


    var scheduleActions =  [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogToggle.bind(null, 'schedule')} />
      </div>,
      <RaisedButton
        label="Create deployment"
        primary={true}
        onClick={this._onScheduleSubmit}
        ref="save" />
    ];

    return (
      <div className="device-info">
     
        <h4 className="margin-bottom-none">{this.props.unauthorized ? "Device identity" : "Device details"}</h4>
        {deviceInfo}
   
        <Dialog
          open={this.state.schedule}
          title='Create a deployment'
          actions={scheduleActions}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          bodyStyle={{paddingTop:"0"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          >
          <ScheduleForm images={this.props.images} device={this.props.selected[0]} deploymentSchedule={this._updateParams} groups={this.props.groups} />

        </Dialog>

      </div>
    );
  }
});

module.exports = SelectedDevices;