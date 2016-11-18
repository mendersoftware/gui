import React from 'react';
var AppActions = require('../../actions/app-actions');

// material ui
import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';
require('../common/prototype/Array.prototype.equals');

var Groups = React.createClass({
  getInitialState: function() {
    return {
      groupDevs:{} 
    };
  },

  componentDidMount: function() {
     this._setNumDevices(this.props.groupList);
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (!prevProps.groupList.equals(this.props.groupList)) {
      this._setNumDevices(this.props.groupList);
    }
  },
  
  _changeGroup: function(group) {
    this.props.changeGroup(group);
  },

  dialogToggle: function() {
    this.props.openGroupDialog();
  },

  _setNumDevices: function(groupList) {
    var self = this;
    var groups = {};

    for (var i=0;i<groupList.length;i++) {
      setGroupDevs(i);
    }

    function setGroupDevs(idx) {
      AppActions.getNumberOfDevices(function(noDevs) {
        groups[groupList[idx]] = {numDevices: noDevs};
        if (idx===groupList.length-1) { self.setState({groupDevs: groups}) }
      }, groupList[idx]);
    }
  },

  render: function() {
    var createBtn = (
      <FontIcon className="material-icons">add</FontIcon>
    );
   
    var allLabel = (
      <span>All devices<span className='float-right length'>{this.props.totalDevices}</span></span>
    );

    return (
      <div>
        <List>
          <Subheader>Groups</Subheader>
            <ListItem 
              key="All" 
              primaryText={allLabel}
              style={!this.props.selectedGroup ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"}}
              onClick={this._changeGroup.bind(null, "")} />
   
          {this.props.groupList.map(function(group, index) {
            var isSelected = group===this.props.selectedGroup ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"};
            var boundClick = this._changeGroup.bind(null, group);
            var numDevs;
            if (this.state.groupDevs) {
              numDevs = this.state.groupDevs[group] ? this.state.groupDevs[group].numDevices : null;
            }
            var groupLabel = (
                <span>{decodeURIComponent(group)}<span className='float-right length'>{numDevs}</span></span>
            );
            return (
              <ListItem 
                key={group} 
                primaryText={groupLabel}
                style={isSelected}
                onClick={boundClick} />
            )
          }, this)}
          <ListItem 
            leftIcon={createBtn}
            primaryText="Create a group"
            onClick={this.dialogToggle} />
        </List>

      </div>
    );
  }
});


module.exports = Groups;