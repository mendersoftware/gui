import React from 'react';
import Time from 'react-time';
import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import ScheduleForm from '../updates/scheduleform';
import ReactDOM from 'react-dom';
var update = require('react-addons-update');


import SearchInput from 'react-search-input';

import UpdateButton from './updatebutton.js';
import SelectedImage from './selectedimage.js';

import { Router, Link } from 'react-router';

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
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var FontIcon = mui.FontIcon;

var newState = {model: "Acme Model 1", tags: []};
var tags = [];
var software = [];

var Repository = React.createClass({
  getInitialState: function() {
    return {
      image: {
        name: null,
        description: null
      },
      sortCol: "name",
      sortDown: true,
      searchTerm: null,
      upload: false,
      schedule: false,
      popupLabel: "Upload a new image",
      software: []
    };
  },

  componentWillReceiveProps: function(nextProps) {
    software = nextProps.software;
  },

  _handleFieldChange: function(field, e) {
    newState[field] = e.target.value;
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
    var newUpdate = {
      group: this.state.group,
      model: this.state.model,
      start_time: this.state.start_time,
      end_time: this.state.end_time,
      image: this.state.image
    }
    AppActions.saveSchedule(newUpdate, this.state.disabled);
    this.dialogDismiss('schedule');
  },
  _onUploadSubmit: function() {
    //update build date, upload date, checksum, size
   
    newState.build_date = new Date().getTime();
    newState.upload_date = new Date().getTime();
    newState.md5 = "ui2ehu2h3823";
    newState.checksum = "b411936863d0e245292bb81a60189c7ffd95dbd3723c718e2a1694f944bd91a3";
    newState.size = "12.6 MB";
    AppActions.uploadImage(newState);
    this.dialogDismiss('upload');
  },
  _uploadImage: function(image) {
    AppActions.uploadImage(image);
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
    this.setState({image:image});
  },
  _sortColumn: function(col) {
    var direction;
    console.log("sort!");
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
      newState = {model: "Acme Model 1", tags: []};
      this.setState({image: newState, popupLabel: "Upload a new image"});
    }
    tags = [];
    for (var i in newState.tags) {
      tags.push({id:i, text:newState.tags[i]});
    }
    this.dialogOpen('upload');
  },
  render: function() {
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
    
    var image = this.state.image;
    
    if (this.refs.search) {
      var filters = ['name', 'model', 'tags', 'description'];
      tmpSoftware = software.filter(this.refs.search.filter(filters));
    }
    var groups = this.props.groups;
    var items = tmpSoftware.map(function(pkg, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{pkg.name}</TableRowColumn>
          <TableRowColumn>{pkg.model}</TableRowColumn>
          <TableRowColumn>{pkg.tags || '-'}</TableRowColumn>
          <TableRowColumn><Time value={pkg.modified} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{pkg.devices || 0}</TableRowColumn>
        </TableRow>
      )
    }, this);
    var uploadActions = [
      <div key="cancelcontain" style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          key="cancel"
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'upload')} />
      </div>,
      <RaisedButton
        key="submit"
        label="Save image"
        primary={true}
        onClick={this._onUploadSubmit} />
    ];

    var scheduleActions = [
      <div key="cancelcontain2" style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          key="cancel-schedule"
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'schedule')} />
      </div>,
      <RaisedButton
        key="schedule-submit"
        label="Schedule update"
        primary={true}
        onClick={this._onScheduleSubmit} />
    ];

    var groupItems = [];
    for (var i=0; i<this.props.groups.length;i++) {
      var tmp = { payload:this.props.groups[i].id, text: this.props.groups[i].name };
      groupItems.push(tmp);
    }

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

    return (
      <div>
      
        <h3>Available images</h3>
        <SearchInput className="tableSearch" ref='search' onChange={this.searchUpdated} />
        <div className="maxTable">
          <Table
            onRowSelection={this._onRowSelection}
            className={items.length ? null : "hidden"}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false} >
              <TableRow>
                <TableHeaderColumn className="columnHeader" tooltip="Software">Software <FontIcon ref="name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "name")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Device type compatibility">Device type compatibility <FontIcon ref="model" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "model")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Tags">Tags</TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Upload date">Upload date <FontIcon style={styles.sortIcon} ref="modified" onClick={this._sortColumn.bind(null, "modified")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Installed on devices">Installed on devices <FontIcon style={styles.sortIcon} ref="devices" onClick={this._sortColumn.bind(null, "devices")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              showRowHover={true}
              className="clickable">
              {items}
            </TableBody>
          </Table>

          <p className={items.length ? 'hidden' : 'italic margin-left'}>
            No images found.
          </p>
        </div>

        <div>
          <div className="float-right">
            <RaisedButton key="file_upload" onClick={this._openUpload.bind(null,"upload", null)} label="Upload image file" labelPosition="after" secondary={true}>
              <FontIcon style={styles.buttonIcon} className="material-icons">file_upload</FontIcon>
            </RaisedButton>
          </div>

          <div style={{height:"16", marginTop:"10"}} />
 
          <SelectedImage uploadImage={this._uploadImage} editImage={this._openUpload} buttonStyle={styles.flatButtonIcon} image={this.state.image} openSchedule={this._openSchedule} />
        </div>
        <Dialog
          key="upload1"
          ref="upload"
          open={this.state.upload}
          title={this.state.popupLabel}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          actions={uploadActions}
          >
          <div style={{height: '400px'}}>
            <form>

              <TextField
                defaultValue={image.name}
                disabled={image.name ? true : false}
                hintText="Identifier"
                floatingLabelText="Identifier" 
                onChange={this._handleFieldChange.bind(null, 'name')}
                errorStyle={{color: "rgb(171, 16, 0)"}} />

              <p className={image.name ? "hidden" : null}><input type="file" /></p>

              <TextField
                value="Acme Model 1"
                disabled={true}
                style={{display:"block"}}
                floatingLabelText="Device type compatibility"
                onChange={this._handleFieldChange.bind(null, 'model')} 
                errorStyle={{color: "rgb(171, 16, 0)"}} />

              <TextField
                hintText="Description"
                floatingLabelText="Description" 
                multiLine={true}
                style={{display:"block"}}
                onChange={this._handleFieldChange.bind(null, 'description')}
                errorStyle={{color: "rgb(171, 16, 0)"}}
                defaultValue={image.description} />

              <div className="tagContainer">
                <span className="inputHeader">Tags</span>
                 <ReactTags tags={tags}
                    autofocus={false}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag} />
              </div>
            </form>
          </div>
        </Dialog>

        <Dialog
          key="schedule1"
          ref="schedule"
          open={this.state.schedule}
          title='Schedule an update'
          actions={scheduleActions}
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          bodyStyle={{paddingTop:"0"}}
          >
          <ScheduleForm updateSchedule={this._updateParams} images={software} image={this.state.image} imageVal={this.state.image} groups={this.props.groups} />
        </Dialog>
      </div>
    );
  }
});

module.exports = Repository;