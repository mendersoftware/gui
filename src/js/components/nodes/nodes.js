var React = require('react');
var AppStore = require('../../stores/app-store');

var Groups = require('./groups');
var NodeList = require('./nodelist');
var SelectedNodes = require('./selectednodes');

function getState() {
  return {
    groups: AppStore.getGroups(),
    selectedGroup: AppStore.getSelectedGroup(),
    nodes: AppStore.getNodes()
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
          <div className="topSection">
            <NodeList nodes={this.state.nodes} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Nodes;