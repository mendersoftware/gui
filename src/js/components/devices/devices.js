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
  },
  _onChange: function() {
    this.setState(getState());
  },
  _updateFilters: function(filters) {
    AppActions.updateFilters(filters);
  },
  render: function() {
    return (
      <div>
       <div className="leftFixed">
          <Groups groups={this.state.groups} selectedGroup={this.state.selectedGroup} />
        </div>
        <div className="rightFluid">
          <h3>{this.state.selectedGroup.name}</h3>
          <Filters attributes={this.state.attributes} filters={this.state.filters} onFilterChange={this._updateFilters} />
          <DeviceList devices={this.state.devices} />
          <SelectedDevices selected={this.state.selectedDevices} selectedGroup={this.state.selectedGroup} groups={this.state.groups} />
        </div>
      </div>
    );
  }
});

module.exports = Devices;