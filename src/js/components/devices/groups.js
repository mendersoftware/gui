import React from 'react';
import ReactTooltip from 'react-tooltip';
import { AddGroup } from '../helptips/helptooltips';
var AppActions = require('../../actions/app-actions');
var createReactClass = require('create-react-class');

// material ui
import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';
require('../common/prototype/Array.prototype.equals');

var Groups = createReactClass({
  _changeGroup: function(group) {
    this.props.changeGroup(group);
  },

  dialogToggle: function() {
    this.props.openGroupDialog();
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
            if (this.props.groupDevices) {
              numDevs = this.props.groupDevices[group] || null;
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


        { this.props.showHelptips && this.props.totalDevices && !this.props.groupList.length ?
          <div>
            <div 
              id="onboard-5"
              className="tooltip help"
              data-tip
              data-for='groups-tip'
              data-event='click focus'
              style={{bottom:"-10px"}}>
              <FontIcon className="material-icons">help</FontIcon>
            </div>
            <ReactTooltip
              id="groups-tip"
              globalEventOff='click'
              place="bottom"
              type="light"
              effect="solid"
              className="react-tooltip">
              <AddGroup />
            </ReactTooltip>
          </div>
        : null }

      </div>
    );
  }
});


module.exports = Groups;