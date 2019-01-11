import React from 'react';
import ReactTooltip from 'react-tooltip';
import { AddGroup } from '../helptips/helptooltips';
import createReactClass from 'create-react-class';

import { UNGROUPED_GROUP } from '../../constants/app-constants';

// material ui
import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
require('../common/prototype/Array.prototype.equals');

var Groups = createReactClass({

  _changeGroup: function(group, numDevs) {
    this.props.changeGroup(group, numDevs);
  },

  dialogToggle: function() {
    this.props.openGroupDialog();
  },

  render: function() {
    var createBtn = (
      <FontIcon className="material-icons" style={this.props.allCount ? null : {color:"#d4e9e7"}}>add</FontIcon>
    );
   
    var allLabel = (
      <span>All devices</span>
    );

    return (
      <div>
        <List>
          <ListItem 
            key="All" 
            primaryText={allLabel}
            style={!this.props.selectedGroup ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"}}
            onClick={this._changeGroup.bind(null, "", this.props.allCount)} />
           
          {this.props.groups.map(function(group, index) {
            var isSelected = group===this.props.selectedGroup ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"};
            var numDevs;
            if (this.props.groupDevices) {
              numDevs = this.props.groupDevices[group] || null;
            }
            var boundClick = this._changeGroup.bind(null, group, numDevs);
            if (group === UNGROUPED_GROUP.id) {
              group = UNGROUPED_GROUP.name;
            }
            var groupLabel = (
                <span>{decodeURIComponent(group)}</span>
            );
            return (
              <ListItem 
                key={group + index}
                primaryText={groupLabel}
                style={isSelected}
                onClick={boundClick} />
            )
          }, this)}

          <ListItem 
            leftIcon={createBtn}
            disabled={!this.props.acceptedCount}
            primaryText="Create a group"
            style={this.props.acceptedCount ? null : {color:"#d4e9e7"}}
            onClick={this.props.acceptedCount ? this.dialogToggle : null} />
        </List>


        { this.props.showHelptips && this.props.acceptedCount && !this.props.groups.length ?
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