var React = require('react');
var AppStore = require('../../stores/app-store');

var Installed = require('./installed.js');
var Repository = require('./repository.js');

var mui = require('material-ui');
var Tabs = mui.Tabs;
var Tab = mui.Tab;

var styles = {
  tabs: {
    backgroundColor: "#fff",
    color: "#414141",
  },
  inkbar: {
    backgroundColor: "#5d0f43",
  }
};

function getState() {
  return {
    installed: AppStore.getSoftwareInstalled(),
    repo: AppStore.getSoftwareRepo(),
    groups: AppStore.getGroups()
  }
}

var Software = React.createClass({
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
         <Tabs
          tabItemContainerStyle={{width: "33%"}}
          inkBarStyle={styles.inkbar}>
          <Tab key={1}
          style={styles.tabs}
          label={"Installed"}>
            <div className="tabContainer">
              <Installed software={this.state.installed} />
            </div>
          </Tab>

          <Tab key={2}
          style={styles.tabs}
          label={"Image repository"}>
            <div className="tabContainer">
              <Repository software={this.state.repo} groups={this.state.groups} />
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
});

module.exports = Software;