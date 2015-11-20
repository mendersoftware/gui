var React = require('react');
var Time = require('react-time');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
var ScheduleForm = require('../updates/scheduleform');

var UpdateButton = require('./updatebutton.js');
var SelectedImage = require('./selectedimage.js');

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
var FontIcon = mui.FontIcon;

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
  _onRowSelection: function(rows) {
    var image = this.props.software[rows[0]];
    this.setState({image:image});
  },
  render: function() {
    var software = this.props.software;
    var groups = this.props.groups;
    var items = this.props.software.map(function(pkg, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>{pkg.name}</TableRowColumn>
          <TableRowColumn>{pkg.model}</TableRowColumn>
          <TableRowColumn>{pkg.tags.join(', ')}</TableRowColumn>
          <TableRowColumn><Time value={pkg.build_date} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
          <TableRowColumn>{pkg.devices}</TableRowColumn>
        </TableRow>
      )
    }, this);
    var uploadActions = [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'upload')} />
      </div>,
      <RaisedButton
        label="Upload image"
        primary={true}
        onClick={this._onUploadSubmit} />
    ];

    var scheduleActions = [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogDismiss.bind(null, 'schedule')} />
      </div>,
      <RaisedButton
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
      flatButtonIcon: {
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
    }
    return (
      <div>
        <h3>Available images</h3>
        <div className="maxTable"> 
          <Table
            onRowSelection={this._onRowSelection}>
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn tooltip="Software">Software</TableHeaderColumn>
                <TableHeaderColumn tooltip="Device type compatibility">Device type compatibility</TableHeaderColumn>
                <TableHeaderColumn tooltip="Tages">Tags</TableHeaderColumn>
                <TableHeaderColumn tooltip="Build time">Build time</TableHeaderColumn>
                <TableHeaderColumn tooltip="Installed on devices">Installed on devices</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              showRowHover={true}
              className="clickable">
              {items}
            </TableBody>
          </Table>
        </div>

        <div>
          <div className="float-right">
            <RaisedButton onClick={this.dialogOpen.bind(null, 'upload')} label="Upload new image" labelPosition="after" secondary={true}>
              <FontIcon style={styles.flatButtonIcon} className="material-icons">file_upload</FontIcon>
            </RaisedButton>
          </div>

          <div style={{height:"16", marginTop:"10"}} />
 
          <SelectedImage selected={this.state.image} openSchedule={this._openSchedule} />
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
                onChange={this._handleFieldChange.bind(null, 'name')}
                errorStyle={{color: "rgb(171, 16, 0)"}} />

              <p><input type="file" /></p>

              <TextField
                value="Acme Model 1"
                floatingLabelText="Device type compatibility"
                onChange={this._handleFieldChange.bind(null, 'model')} 
                errorStyle={{color: "rgb(171, 16, 0)"}} />

              <TextField
                hintText="Description"
                floatingLabelText="Description" 
                multiLine={true}
                style={{display:"block"}}
                onChange={this._handleFieldChange.bind(null, 'description')}
                errorStyle={{color: "rgb(171, 16, 0)"}} />
            </form>
          </div>
        </Dialog>

        <Dialog
          ref="schedule"
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