import React from 'react';
import ReactDOM from 'react-dom';
var AppActions = require('../../actions/app-actions');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var IconButton = mui.IconButton;
var FontIcon = mui.FontIcon;

var Authorized =  React.createClass({
  getInitialState: function() {
    return {
       sortCol: "name",
       sortDown: true,
    }
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
    AppActions.sortTable("_unauthorized", col, direction);
  },
  _authorizeDevices: function(devices) {
    // array of device objects
    AppActions.authorizeDevices(devices);
  },
  render: function() {
    var styles = {
      sortIcon: {
        verticalAlign: 'middle',
        marginLeft: "10",
        color: "#8c8c8d",
        cursor: "pointer",
      }
    }
    var devices = this.props.unauthorized.map(function(device, index) {
      return (
        <TableRow style={{"backgroundColor": "#e9f4f3"}} hoverable={true} key={index}>
          <TableRowColumn>{device.name}</TableRowColumn>
          <TableRowColumn>{device.model}</TableRowColumn>
          <TableRowColumn>{device.software_version}</TableRowColumn>
          <TableRowColumn>{device.status}</TableRowColumn>
          <TableRowColumn>
            <IconButton onClick={this._authorizeDevices.bind(null, [device])} style={{"paddingLeft": "0"}}>
              <FontIcon className="material-icons green">check_circle</FontIcon>
            </IconButton>
            <IconButton>
              <FontIcon className="material-icons red">cancel</FontIcon>
            </IconButton>
          </TableRowColumn>
        </TableRow>
      )
    }, this);
    return (
      <div className="margin-top margin-bottom onboard">
        <h3>//TODO Devices pending authorization</h3>
        <Table
          selectable={false}
          className="unauthorized"
        >
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false} 
            >
              <TableRow>
                <TableHeaderColumn className="columnHeader" tooltip="Name">Name<FontIcon ref="name" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "name")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Device type">Device type<FontIcon ref="model" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "model")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Current software">Current software<FontIcon ref="software_version" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "software_version")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Status">Status<FontIcon ref="status" style={styles.sortIcon} onClick={this._sortColumn.bind(null, "status")} className="sortIcon material-icons">sort</FontIcon></TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Authorize device?">Authorize?</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              showRowHover={true}
              className="clickable">
              {devices}
            </TableBody>
          </Table>
      </div>
    );
  }
});


module.exports = Authorized;