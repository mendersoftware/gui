var React = require('react');
var AppStore = require('../../stores/app-store');

var Groups = require('./groups');
var NodeList = require('./nodelist');
var SelectedNodes = require('./selectednodes');

function getState() {
  return {
    groups: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    nodes: AppStore.getNodes(),
    selectedNodes: AppStore.getSelectedNodes()
  }
}

var Nodes = React.createClass({
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
          <NodeList nodes={this.state.nodes} />
          <SelectedNodes selected={this.state.selectedNodes} selectedGroup={this.state.selectedGroup} groups={this.state.groups} />
        </div>
      </div>
    );
  }
});

module.exports = Nodes;