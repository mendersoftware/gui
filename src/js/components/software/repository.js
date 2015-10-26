var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var ScheduleButton = require('../updates/schedulebutton');
var ScheduleForm = require('../updates/scheduleform');

var UpdateButton = require('./updatebutton.js');

var Router = require('react-router');
var Link = Router.Link;

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
var SelectField = mui.SelectField;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;

var newState = {model: "Acme Model 1"};

var Repository = React.createClass({
  getInitialState: function() {
    return {
      image:null 
    };
  },

  _handleFieldChange: function(field, e) {
    newState[field] = e.target.value;
    this.setState({newImage: newState});
  },
  _openSchedule: function(ref, image) {
    if (image) {
      this.setState({image: image, imageVal:image});
    }
    this.dialogOpen(ref);
  },
  dialogOpen: function (ref) {
    this.refs[ref].show();
  },
  dialogDismiss: function(ref) {
    this.refs[ref].dismiss();
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
    AppActions.uploadImage(this.state.newImage);
    this.refs['upload'].dismiss();
  },
  _updateParams: function(val, attr) {
    // updating params from child schedule form
    var tmp = {};
    tmp[attr] = val;
    this.setState(tmp);
  },
  render: function() {
    var software = this.props.software;
    var groups = this.props.groups;
    var items = this.props.software.map(function(pkg, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{pkg.name}</TableRowColumn>
          <TableRowColumn>{pkg.model}</TableRowColumn>
          <TableRowColumn>{pkg.description}</TableRowColumn>
          <TableRowColumn><ScheduleButton primary={false} secondary={true} openDialog={this._openSchedule} image={pkg} /></TableRowColumn>
        </TableRow>
      )
    }, this);
    var uploadActions = [
      { text: 'Cancel'},
      { text: 'Upload image', onClick: this._onUploadSubmit, ref: 'upload', primary: 'true' }
    ];

    var scheduleActions = [
      { text: 'Cancel', onClick: this.dialogDismiss.bind(null, 'schedule')},
      { text: 'Schedule update', onClick: this._onScheduleSubmit, ref: 'save' }
    ];

    var groupItems = [];
    for (var i=0; i<this.props.groups.length;i++) {
      var tmp = { payload:this.props.groups[i].id, text: this.props.groups[i].name };
      groupItems.push(tmp);
    }
    return (
      <div>
        <div style={{marginTop:"30px"}}> 
          <Table
            selectable={false}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Software">Software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Device type compatibility">Device type compatibility</TableHeaderColumn>
                <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
                <TableHeaderColumn tooltip=""></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}>
              {items}
            </TableBody>
          </Table>
        </div>
        <div className="margin-top">
          <RaisedButton onClick={this.dialogOpen.bind(null, 'upload')} label="Upload a new image" primary={true} />
        </div>

        <Dialog
          ref="upload"
          title="Upload a new image"
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          actions={uploadActions}
          >
          <div style={{height: '400px'}}>
            <form>

              <TextField
                hintText="Identifier"
                floatingLabelText="Identifier" 
                onChange={this._handleFieldChange.bind(null, 'name')} />

              <p><input type="file" /></p>

              <TextField
                value="Acme Model 1"
                floatingLabelText="Device type compatibility"
                onChange={this._handleFieldChange.bind(null, 'model')} />

              <TextField
                hintText="Description"
                floatingLabelText="Description" 
                multiLine={true}
                style={{display:"block"}}
                onChange={this._handleFieldChange.bind(null, 'description')} />
            </form>
          </div>
        </Dialog>

        <Dialog
          ref="schedule"
          title='Schedule an update'
          actions={scheduleActions}
          autoDetectWindowHeight={true} autoScrollBodyContent={true}
          >
          <ScheduleForm updateSchedule={this._updateParams} images={software} image={this.state.image} imageVal={this.state.image} groups={this.props.groups} />
        </Dialog>

      </div>
    );
  }
});

module.exports = Repository;