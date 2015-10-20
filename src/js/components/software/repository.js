var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

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
      groups: AppStore.getGroups(),
    };
  },
  _handleFieldChange: function(field, e) {
    newState[field] = e.target.value;
    this.setState({newImage: newState});
  },
  dialogOpen: function (ref) {
    this.refs[ref].show();
  },
  _onUploadSubmit: function() {
    AppActions.uploadImage(this.state.newImage);
    this.refs['upload'].dismiss();
  },
  render: function() {
    var software = this.props.software;
    var groups = this.state.groups;
    var items = this.props.software.map(function(pkg, index) {
      // needed to prepopulate
    var image = {
      payload:pkg.id, 
      text: pkg.name
    };
      return (
        <TableRow key={index}>
          <TableRowColumn>{pkg.name}</TableRowColumn>
          <TableRowColumn>{pkg.model}</TableRowColumn>
          <TableRowColumn>{pkg.description}</TableRowColumn>
          <TableRowColumn><ScheduleForm images={software} image={pkg} imageVal={image} groups={groups} /></TableRowColumn>
        </TableRow>
      )
    });
    var uploadActions = [
      { text: 'Cancel'},
      { text: 'Upload image', onClick: this._onUploadSubmit, ref: 'upload', primary: 'true' }
    ];

    var groupItems = [];
    for (var i=0; i<this.state.groups.length;i++) {
      var tmp = { payload:this.state.groups[i].id, text: this.state.groups[i].name };
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

      </div>
    );
  }
});

module.exports = Repository;