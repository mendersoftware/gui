import React from 'react';
import Time from 'react-time';
import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import ScheduleForm from '../deployments/scheduleform';
import ReactDOM from 'react-dom';
var update = require('react-addons-update');
var Loader = require('../common/loader');
import SearchInput from 'react-search-input';
import Form from '../common/forms/form';
import FileInput from '../common/forms/fileinput';
import TextInput from '../common/forms/textinput';
import DeploymentButton from './deploymentbutton';
import SelectedImage from './selectedimage';
import { Router, Route, Link } from 'react-router';
import { Motion, spring } from 'react-motion';
import Collapse from 'react-collapse';
import ReactHeight from 'react-height';

// material ui
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Snackbar from 'material-ui/Snackbar';

var newState = {};
var software = [];

var Repository = React.createClass({
  getInitialState: function() {
    return {
      image: {
        name: null,
        description: null,
        yocto_id: null,
        device_type: null
      },
      sortCol: "name",
      sortDown: true,
      searchTerm: null,
      upload: false,
      schedule: false,
      popupLabel: "Upload a new image",
      software: [],
      tmpFile: null,
      snackMessage: "Deployment created",
      openSnack: false,
      autoHideDuration: 5000,
      divHeight: 148,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    software = nextProps.software;
    if (nextProps.selected) {
      this.setState({image: nextProps.selected});
    }
  },

  _resetImageState: function () {
    var image = {
      name: null,
      description: null,
      yocto_id: null,
      device_type: null
    };
    this.setState({image: image});
  },
  _openSchedule: function(ref, image) {
    this.dialogOpen(ref);
  },
  dialogOpen: function (ref) {
    var obj = {};
    obj[ref] = true;
    this.setState(obj);
  },
  dialogDismiss: function(ref) {
    var obj = {};
    obj[ref] = false;
    this.setState(obj);
  },
  _onScheduleSubmit: function() {
    // TODO more boilerplate, move to single source 
    var ids = [];
    for (var i=0; i<this.state.deploymentDevices.length; i++) {
      ids.push(this.state.deploymentDevices[i].id);
    }
    var newDeployment = {
      name: decodeURIComponent(this.state.group) || "All devices",
      artifact_name: this.state.image.name,
      devices: ids
    }
    var self = this;
    var callback = {
      success: function(data) {
        AppActions.setSnackbar("Deployment created successfully");
        setTimeout(function() {
          self.redirect();
        }, 1200);
      },
      error: function(err) {
        AppActions.setSnackbar("Error creating deployment. "+err);
      }
    };
    AppActions.createDeployment(newDeployment, callback);
    this.dialogDismiss('schedule');
  },
  redirect: function() {
    this.context.router.push('/deployments');
  },
  _onUploadSubmit: function(meta) {
    var self = this;
    var tmpFile = meta.imageFile;
    delete meta.imageFile;
    delete meta.verified;

    var callback = {
      success: function(result) {
        self.props.refreshImages();
      },
      error: function(err) {
        AppActions.setSnackbar("Image couldn't be uploaded. "+err);
        self.props.startLoader(false);
      }
    };

    AppActions.uploadImage(meta, tmpFile, callback);
    this.props.startLoader(true);
    this._resetImageState();
    this.dialogDismiss('upload');
  },
  _editImageData: function (image) {
    AppActions.editImage(image, function() {
      AppActions.getImages();
    });
    this.setState({image:image});
  },
  _deploymentParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
    var image = (attr==="image") ? val : this.state.image;
    var group = (attr==="group") ? val : this.state.group;
    this._getDeploymentDevices(group, image);
  },
  _getDeploymentDevices: function(group, image) {
    // TODO get rid of boilerplate, use from one common place
    var devices = [];
    var filteredDevices = [];
    // set the selected groups devices to state, to be sent down to the child schedule form
    if (image && group) {
      devices = (group!=="All devices") ? this.props.groupDevices[group] : this.props.allDevices;
      filteredDevices = AppStore.filterDevicesByType(devices, image.device_type);
    }
    this.setState({deploymentDevices: devices, filteredDevices: filteredDevices});
  },
  _onRowSelection: function(rows) {
    var image = software[rows[0]];
    this.setState({image:image});
  },
  _sortColumn: function(col) {
    var direction;
    if (this.state.sortCol !== col) {
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons";
      ReactDOM.findDOMNode(this.refs[col]).className = "sortIcon material-icons expand";
      this.setState({sortCol:col, sortDown: true});
      direction = true;
    } else {
      direction = !(this.state.sortDown);
      ReactDOM.findDOMNode(this.refs[this.state.sortCol]).className = "sortIcon material-icons expand " +direction;
      this.setState({sortDown: direction});
    }
    // sort table
    AppActions.sortTable("_softwareRepo", col, direction);
  },
  searchUpdated: function(term) {
    this.setState({searchTerm: term, image: {}}); // needed to force re-render
  },
  _openUpload: function(ref, image) {
    if (image) {
      this.setState({popupLabel: "Edit image details"});
      newState = image;
    } else {
      this._resetImageState();
      this.setState({popupLabel: "Upload a new image"});
    }
    this.dialogOpen('upload');
  },
  _onClick: function(event) {
    event.stopPropagation();
  },
  _formatTime: function(date) {
    if (date) {
      return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
    }
    return;
  },
  _adjustCellHeight: function(height) {
    this.setState({divHeight: height+30});
  },
  render: function() {

    var styles = {
      buttonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6px",
        color:"#ffffff",
        fontSize:'16px'
      },
      flatButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6px",
        color:"rgba(0,0,0,0.8)",
        fontSize:'16px'
      },
      sortIcon: {
        verticalAlign: 'middle',
        marginLeft: "10px",
        color: "#8c8c8d",
        cursor: "pointer",
      }
    }

    var tmpSoftware = [];
    if (this.refs.search) {
      var filters = ['name', 'device_type', 'description'];
      tmpSoftware = software.filter(this.refs.search.filter(filters));
    }
    var groups = this.props.groups;
    var items = tmpSoftware.map(function(pkg, index) {
      var expanded = '';
      if (this.state.image.name === pkg.name ) {
        expanded = <SelectedImage formatTime={this._formatTime} editImage={this._editImageData} buttonStyle={styles.flatButtonIcon} image={this.state.image} openSchedule={this._openSchedule} />
      }
      return (
        <TableRow hoverable={this.state.image.name !== pkg.name} className={this.state.image.name === pkg.name ? "expand" : null} key={index} >
          <TableRowColumn style={expanded ? {height: this.state.divHeight} : null}>{pkg.name}</TableRowColumn>
          <TableRowColumn>{pkg.device_type}</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(pkg.modified)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{width:"33px", paddingRight:"0", paddingLeft:"12px"}} className="expandButton">
            <IconButton className="float-right"><FontIcon className="material-icons">{ expanded ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", overflow:"visible"}}>
            <Collapse springConfig={{stiffness: 210, damping: 20}} onHeightReady={this._adjustCellHeight} className="expanded" isOpened={expanded ? true : false}>
              {expanded}
            </Collapse>
          </TableRowColumn>
        </TableRow>
      )
    }, this);

    var scheduleActions = [
      <div key="cancelcontain2" style={{marginRight:"10px", display:"inline-block"}}>
        <FlatButton
          key="cancel-schedule"
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'schedule')} />
      </div>,
      <RaisedButton
        key="schedule-submit"
        label="Create deployment"
        primary={true}
        onClick={this._onScheduleSubmit} />
    ];

    var groupItems = [];
    for (var i=0; i<this.props.groups.length;i++) {
      var tmp = { payload:this.props.groups[i].id, text: this.props.groups[i].name };
      groupItems.push(tmp);
    }

    return (
      <div>

        <div className="top-right-button">
          <RaisedButton key="file_upload" onClick={this._openUpload.bind(null,"upload", null)} label="Upload image file" labelPosition="after" secondary={true}>
            <FontIcon style={styles.buttonIcon} className="material-icons">file_upload</FontIcon>
          </RaisedButton>
        </div>
      
        <div>
          <h3 className="inline-block">Available images</h3>
          <SearchInput placeholder="Search images" className="search tableSearch" ref='search' onChange={this.searchUpdated} />
        </div>

        <Loader show={this.props.loading} />
        
        <div style={{position: "relative", marginTop:"10px"}}>
          <Table
            onRowSelection={this._onRowSelection}
            className={items.length ? null : "hidden"}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false} >
              <TableRow>
                <TableHeaderColumn className="columnHeader" tooltip="Name">Name <FontIcon ref="name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "name")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Device type compatibility">Device type compatibility <FontIcon ref="device_type" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "device_type")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Last modified">Last modified <FontIcon style={styles.sortIcon} ref="modified" onClick={this._sortColumn.bind(null, "modified")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn style={{width:"33px", paddingRight:"12px", paddingLeft:"0"}} className="columnHeader"></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              showRowHover={true}
              className="clickable">
              {items}
            </TableBody>
          </Table>

          <div className={(items.length || this.props.loading) ? "hidden" : "dashboard-placeholder" }>
            <p>No images found. <a onClick={this._openUpload.bind(null,"upload", null)}>Upload an image</a> to the repository</p>
            <img src="assets/img/images.png" alt="images" />
          </div>
        </div>

        <Dialog
          key="upload1"
          ref="upload"
          open={this.state.upload}
          title={this.state.popupLabel}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          bodyStyle={{padding:"0 10px 10px 24px"}}
          >
          <div>
            <Form dialogDismiss={this.dialogDismiss} onSubmit={this._onUploadSubmit}>

              <FileInput 
                id="imageFile"
                placeholder="Upload image"
                required={true}
                file={true} />

              <TextInput
                value={this.state.image.name}
                hint="Name"
                label="Name"
                id="name"
                required={true} />

              <TextInput
                id="description"
                hint="Description"
                label="Description"
                multiLine={true}
                className="margin-bottom-small"
                value={this.state.image.description} />

            </Form>
          </div>
        </Dialog>

        <Dialog
          key="schedule1"
          ref="schedule"
          open={this.state.schedule}
          title='Create a deployment'
          actions={scheduleActions}
          autoDetectWindowHeight={true}
          bodyStyle={{paddingTop:"0", fontSize:"13px"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          actionsContainerStyle={{marginBottom:"0"}}
          >
          <ScheduleForm hasPending={this.props.hasPending} hasDevices={this.props.hasDevices} deploymentDevices={this.state.deploymentDevices} filteredDevices={this.state.filteredDevices} deploymentSettings={this._deploymentParams} deploymentSettings={this._deploymentParams} image={this.state.image} group={this.state.group} groups={this.props.groups} />
        </Dialog>

        <Snackbar
          open={this.state.openSnack}
          message={this.state.snackMessage}
          action="Go to deployments"
          autoHideDuration={this.state.autoHideDuration}
          onActionTouchTap={this.redirect}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
});

Repository.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Repository;