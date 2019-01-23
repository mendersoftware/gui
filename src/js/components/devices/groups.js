import React from 'react';
import ReactTooltip from 'react-tooltip';
import { AddGroup } from '../helptips/helptooltips';
import createReactClass from 'create-react-class';

import { UNGROUPED_GROUP } from '../../constants/app-constants';

// material ui
import { List, ListItem } from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import Divider from 'material-ui/Divider';
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
      <FontIcon className="material-icons" style={this.props.allCount ? null : { color: '#d4e9e7' }}>
        add
      </FontIcon>
    );

    var allLabel = <span>All devices</span>;

    const groupItems = this.props.groups.reduce(
      (accu, group, index) => {
        var isSelected = group === this.props.selectedGroup ? { backgroundColor: '#e7e7e7' } : { backgroundColor: 'transparent' };
        const isUngroupedGroup = group === UNGROUPED_GROUP.id || group === UNGROUPED_GROUP.name;
        var numDevs;
        if (this.props.groupDevices) {
          numDevs = this.props.groupDevices[group] || null;
        }
        var boundClick = this._changeGroup.bind(null, group, numDevs);
        if (isUngroupedGroup) {
          group = UNGROUPED_GROUP.name;
        }
        var groupLabel = <span>{decodeURIComponent(group)}</span>;

        if (isUngroupedGroup) {
          accu.ungroupedsItem = <ListItem key={group + index} primaryText={groupLabel} style={isSelected} onClick={boundClick} />;
        } else {
          accu.groups.push(<ListItem key={group + index} primaryText={groupLabel} style={isSelected} onClick={boundClick} />);
        }
        return accu;
      },
      { groups: [], ungroupedsItem: null }
    );

    return (
      <div>
        <List>
          <ListItem
            key="All"
            primaryText={allLabel}
            style={!this.props.selectedGroup ? { backgroundColor: '#e7e7e7' } : { backgroundColor: 'transparent' }}
            onClick={this._changeGroup.bind(null, '', this.props.allCount)}
          />
          {groupItems.ungroupedsItem ? groupItems.ungroupedsItem : null}
          <Divider />
          {groupItems.groups}
          <ListItem
            leftIcon={createBtn}
            disabled={!this.props.acceptedCount}
            primaryText="Create a group"
            style={this.props.acceptedCount ? null : { color: '#d4e9e7' }}
            onClick={this.props.acceptedCount ? this.dialogToggle : null}
          />
        </List>

        {this.props.showHelptips && this.props.acceptedCount && !this.props.groups.length ? (
          <div>
            <div id="onboard-5" className="tooltip help" data-tip data-for="groups-tip" data-event="click focus" style={{ bottom: '-10px' }}>
              <FontIcon className="material-icons">help</FontIcon>
            </div>
            <ReactTooltip id="groups-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <AddGroup />
            </ReactTooltip>
          </div>
        ) : null}
      </div>
    );
  }
});

module.exports = Groups;
