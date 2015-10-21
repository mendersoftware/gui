var React = require('react');
var AppStore = require('../../stores/app-store');

var Groups = require('./groups');
var DeviceList = require('./devicelist');
var SelectedDevices = require('./selecteddevices');

function getState() {
  return {
    groups: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    devices: AppStore.getDevices(),
    selectedDevices: AppStore.getSelectedDevices(),
    filters: AppStore.getFilters()
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
  render: function() {
    return (
      <div>
       <div className="leftFixed">
          <Groups groups={this.state.groups} selectedGroup={this.state.selectedGroup} />
        </div>
        <div className="rightFluid">
          <h4>{this.state.selectedGroup.name}</h4>
          <DeviceList filters={this.state.filters} devices={this.state.devices} />
          <SelectedDevices selected={this.state.selectedDevices} selectedGroup={this.state.selectedGroup} groups={this.state.groups} />
        </div>
      </div>
    );
  }
});

module.exports = Devices;