var React = require('react');
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');

var Groups = require('./groups');
var DeviceList = require('./devicelist');
var SelectedDevices = require('./selecteddevices');
var Filters = require('./filters');

function getState() {
  return {
    groups: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    devices: AppStore.getDevices(),
    selectedDevices: AppStore.getSelectedDevices(),
    filters: AppStore.getFilters(),
    attributes: AppStore.getAttributes()
  }
}

var Devices = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
    var filters = [];
    if (this.props.params) {
      if (this.props.params.groupId) {
        AppActions.selectGroup(Number(this.props.params.groupId));
      }
      if (this.props.params.filters) {
        var str = decodeURIComponent(this.props.params.filters);
        var obj = str.split("&");
        for (var i=0;i<obj.length;i++) {
          var f = obj[i].split("=");
          filters.push({key:f[0], value:f[1]});
        }
        this._updateFilters(filters);
      }
    }
  },
  _onChange: function() {
    this.setState(getState());
  },
  _updateFilters: function(filters) {
    AppActions.updateFilters(filters);
  },
  render: function() {
    return (
      <div className="margin-top">
       <div className="leftFixed">
          <Groups groups={this.state.groups} selectedGroup={this.state.selectedGroup} />
        </div>
        <div className="rightFluid padding-right">
          <h2 style={{marginLeft:"26"}}>{this.state.selectedGroup.name}</h2>
          <Filters attributes={this.state.attributes} filters={this.state.filters} onFilterChange={this._updateFilters} />
          <DeviceList devices={this.state.devices} />
          <SelectedDevices selected={this.state.selectedDevices} selectedGroup={this.state.selectedGroup} groups={this.state.groups} />
        </div>
      </div>
    );
  }
});

module.exports = Devices;