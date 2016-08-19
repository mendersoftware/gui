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
var ReactTags = require('react-tag-input').WithContext;

// material ui
import mui from 'material-ui';
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var RaisedButton = mui.RaisedButton;
var Dialog = mui.Dialog;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var FontIcon = mui.FontIcon;
var IconButton = mui.IconButton;

import Snackbar from 'material-ui/lib/snackbar';

var newState = {};
var tags = [];
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
    var newDeployment = {
      devices: this.state.group.devices,
      artifact_name: this.state.image.name,
      name: this.state.group.name
    }
    AppActions.createDeployment(newDeployment, function (uri) {
      this.setState({openSnack: true});
    }.bind(this));
    this.dialogDismiss('schedule');
  },
  redirect: function() {
    this.context.router.push('/deployments');
  },
  _onUploadSubmit: function(image) {
    var tmpFile = image.imageFile;
    delete image.imageFile;
    delete image.verified;

    AppActions.uploadImage(image, function(id_uri) {
      this.props.startLoader();
      AppActions.getUploadUri(id_uri, function(uri) {
        AppActions.doFileUpload(uri, tmpFile, function() {
          this.props.refreshImages();
        }.bind(this));
      }.bind(this));
    }.bind(this));
    this.props.setStorage("uploaded04", true);
    this.dialogDismiss('upload');
    this._resetImageState();
  },
  _editImageData: function (image) {
    AppActions.editImage(image, function() {
      AppActions.getImages();
    });
    this.setState({image:image});
  },
  _updateParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  },
  _onRowSelection: function(rows) {

    var imageId = software[rows[0]].id;
    var image = AppStore.getSoftwareImage("id", imageId);
    if (image === this.state.image) {
      image = {name:null, description: null};
    }
    this.setState({image:image});
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
    AppActions.sortTable("_softwareRepo", col, direction);
  },
  searchUpdated: function(term) {
    this.setState({searchTerm: term, image: {}}); // needed to force re-render
  },
  handleDelete: function(i) {
    tags.splice(i, 1);
    newState.tags = [];
    for (var i in tags) {
      newState.tags.push(tags[i].text);
    }
  },
  handleAddition: function(tag) {
    tags.push({
        id: tags.length + 1,
        text: tag
    });

    newState.tags = [];
    for (var i in tags) {
      newState.tags.push(tags[i].text);
    }
  },
  handleDrag: function(tag, currPos, newPos) {

  },
  _openUpload: function(ref, image) {
    if (image) {
      this.setState({popupLabel: "Edit image details"});
      newState = image;
    } else {
      this._resetImageState();
      this.setState({popupLabel: "Upload a new image"});
    }
    tags = [];
    for (var i in newState.tags) {
      tags.push({id:i, text:newState.tags[i]});
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
  render: function() {

    var styles = {
      buttonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6",
        color:"#ffffff",
        fontSize:'16'
      },
      flatButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: "-6",
        color:"rgba(0,0,0,0.8)",
        fontSize:'16'
      },
      sortIcon: {
        verticalAlign: 'middle',
        marginLeft: "10",
        color: "#8c8c8d",
        cursor: "pointer",
      }
    }


    // copy array so as not to alter props
    var tmpSoftware = [];
    for (var i in software) {
      var replace = '';
      if (software[i].tags) {
        replace = software[i].tags.join(', ');
      }
      tmpSoftware[i] = update(software[i], {
        'tags': {
          $set: replace
        }
      });
    }
    
    if (this.refs.search) {
      var filters = ['name', 'device_type', 'tags', 'description'];
      tmpSoftware = software.filter(this.refs.search.filter(filters));
    }
    var groups = this.props.groups;
    var items = tmpSoftware.map(function(pkg, index) {
      var selected = '';
      if (this.state.image.name === pkg.name ) {
        selected = <SelectedImage formatTime={this._formatTime} editImage={this._editImageData} buttonStyle={styles.flatButtonIcon} image={this.state.image} openSchedule={this._openSchedule} />
      }
      return (
        <TableRow hoverable={this.state.image.name !== pkg.name} className={this.state.image.name === pkg.name ? "expand" : null} key={index} >
          <TableRowColumn>{pkg.name}</TableRowColumn>
          <TableRowColumn>{pkg.device_type}</TableRowColumn>
          <TableRowColumn>{pkg.tags || '-'}</TableRowColumn>
          <TableRowColumn><Time value={this._formatTime(pkg.modified)} format="YYYY-MM-DD HH:mm" /></TableRowColumn>
          <TableRowColumn style={{textAlign:"right"}}>{pkg.devices || 0}</TableRowColumn>
          <TableRowColumn style={{width:"33", paddingRight:"0", paddingLeft:"12"}} className="expandButton">
            <IconButton className="float-right"><FontIcon className="material-icons">{ selected ? "arrow_drop_up" : "arrow_drop_down"}</FontIcon></IconButton>
          </TableRowColumn>
          <TableRowColumn style={{width:"0", overflow:"visible"}}>
            <div onClick={this._onClick} className={this.state.image.name === pkg.name ? "expanded" : null}>
              {selected}
            </div>
          </TableRowColumn>
        </TableRow>
      )
    }, this);

    var scheduleActions = [
      <div key="cancelcontain2" style={{marginRight:"10", display:"inline-block"}}>
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
            className={(!items.length || this.props.loading) ? "hidden" : null}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false} >
              <TableRow>
                <TableHeaderColumn className="columnHeader" tooltip="Name">Name <FontIcon ref="name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "name")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Device type compatibility">Device type compatibility <FontIcon ref="device_type" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "device_type")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Tags">Tags</TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Last modified">Last modified <FontIcon style={styles.sortIcon} ref="modified" onClick={this._sortColumn.bind(null, "modified")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn style={{textAlign:"right", paddingRight:"12px"}} className="columnHeader align-right" tooltip="Installed on devices">Installed on devices <FontIcon style={styles.sortIcon} ref="devices" onClick={this._sortColumn.bind(null, "devices")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn style={{width:"33", paddingRight:"12", paddingLeft:"0"}} className="columnHeader"></TableHeaderColumn>
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
   
          >
          <div style={{height: '400px'}}>
            <Form dialogDismiss={this.dialogDismiss} onSubmit={this._onUploadSubmit}>

              <FileInput 
                id="imageFile"
                accept=".tar,.gz,.zip"
                placeholder="Upload image"
                required={true}
                file={true} />

              <TextInput
                value={this.state.image.name}
                hint="Name"
                label="Name"
                id="name"
                required={true}
                validations="isAlphanumeric" />

              <TextInput
                id="yocto_id"
                value={this.state.image.yocto_id}
                hint="Yocto ID"
                label="Yocto ID"
                required={true}
                validations="isLength:4,isAlphanumeric" />

               <TextInput
                id="checksum"
                value={this.state.image.checksum}
                hint="Checksum"
                label="Checksum"
                required={true}
                validations="isLength:32,isAlphanumeric" />

              <TextInput
                id="device_type"
                hint="Device type compatibility"
                label="Device type compatibility"
                required={true}
                value={this.state.image.device_type} />

              <TextInput
                id="description"
                hint="Description"
                label="Description"
                multiLine={true}
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
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          bodyStyle={{paddingTop:"0"}}
          contentStyle={{overflow:"hidden", boxShadow:"0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)"}}
          actionsContainerStyle={{marginBottom:"0"}}
          >
          <ScheduleForm deploymentSchedule={this._updateParams} images={software} image={this.state.image} imageVal={this.state.image} groups={this.props.groups} />
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