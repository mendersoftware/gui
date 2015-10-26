var React = require('react');
var Time = require('react-time');
var AppStore = require('../../stores/app-store');

// material ui
var mui = require('material-ui');
var Table = mui.Table;
var TableHeader = mui.TableHeader;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableBody = mui.TableBody;
var TableRow = mui.TableRow;
var TableRowColumn = mui.TableRowColumn;
var FlatButton = mui.FlatButton;
var List = mui.List;
var ListItem = mui.ListItem;
var ListDivider = mui.ListDivider;
var FontIcon = mui.FontIcon;
var Checkbox = mui.Checkbox;

var Report = React.createClass({
  getInitialState: function() {
    return {
      failsOnly: this.props.update.status !== "Complete"
    };
  },
  _getDeviceDetails: function (id) {
    // get device details not listed in schedule data
    return AppStore.getSingleDevice(id)
  },
  _handleCheckbox: function(e, checked) {
    this.setState({failsOnly:checked});
  },
  _retryUpdate: function() {
    // replace contents of dialog, also change size, return contents and size on 'cancel'?
    this.props.retryUpdate(this.props.update);
  },
  render: function() {
    var deviceList = this.props.update.devices.map(function(device, index) {
      var deviceDetails = this._getDeviceDetails(device.id);
      if ((device.status==="Failed")||(this.state.failsOnly===false)){
        return (
          <TableRow key={index}>
            <TableRowColumn>{device.name}</TableRowColumn>
            <TableRowColumn>{device.model}</TableRowColumn>
            <TableRowColumn>{device.last_software_version}</TableRowColumn>
            <TableRowColumn>{device.software_version}</TableRowColumn>
            <TableRowColumn><Time value={device.start_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn><Time value={device.end_time} format="YYYY/MM/DD HH:mm" /></TableRowColumn>
            <TableRowColumn>{device.status || "--"}</TableRowColumn>
            <TableRowColumn>{deviceDetails.status || "--"}</TableRowColumn>
            <TableRowColumn><FlatButton label="Export log" /></TableRowColumn>
          </TableRow>
        )
      }
    }, this);
    return (
      <div>
        <div className="report-list">
          <List>
            <ListItem disabled={true} primaryText="Group" secondaryText={this.props.update.group} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Device type" secondaryText={this.props.update.model} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Start time" secondaryText={<Time value={this.props.update.start_time} format="YYYY/MM/DD HH:mm" />} />
          </List>
        </div>
        <div className="report-list">
         <List>
            <ListItem disabled={true} primaryText="Number of devices" secondaryText={this.props.update.devices.length} />
            <ListDivider />
            <ListItem disabled={true} primaryText="Target software" secondaryText={this.props.update.software_version} />
            <ListDivider />
            <ListItem disabled={true} primaryText="End time" secondaryText={<Time value={this.props.update.end_time} format="YYYY/MM/DD HH:mm" />} />
          </List>
        </div>
        <div className="report-list">
         <List>
            <ListItem 
              disabled={this.props.update.status==='Complete'}
              primaryText="Status"
              secondaryText={<p>{this.props.update.status}{this.props.update.status==='Complete' ? '' : ' - Click to retry'}</p>}
              leftIcon={<FontIcon className="material-icons">{this.props.update.status==='Complete' ? 'check_circle' : 'error'}</FontIcon>} 
              onClick={this._retryUpdate} />
          </List>
        </div>
        <div className={this.props.update.status==='Complete' ? "hidden" : null} style={{display:"inline-block", width:"200px"}}>
          <Checkbox
            label="Show only failures"
            defaultChecked={this.props.update.status!=='Complete'}
            value={this.state.failsOnly}
            onCheck={this._handleCheckbox} />
        </div>

        <Table
          selectable={false}>
          <TableHeader
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn tooltip="Device name">Device name</TableHeaderColumn>
              <TableHeaderColumn tooltip="Device type">Device type</TableHeaderColumn>
              <TableHeaderColumn tooltip="Previous software">Updating from</TableHeaderColumn>
              <TableHeaderColumn tooltip="Target software">Updated to </TableHeaderColumn>
              <TableHeaderColumn tooltip="Update start time">Start time</TableHeaderColumn>
              <TableHeaderColumn tooltip="Update end time">End time</TableHeaderColumn>
              <TableHeaderColumn tooltip="Update status">Update status</TableHeaderColumn>
              <TableHeaderColumn tooltip="Device status">Device status</TableHeaderColumn>
              <TableHeaderColumn tooltip=""></TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}>
            {deviceList}
          </TableBody>
        </Table>
      </div>
    );
  }
});

module.exports = Report;