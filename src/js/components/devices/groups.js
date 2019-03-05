import React from 'react';
import ReactTooltip from 'react-tooltip';
import { AddGroup } from '../helptips/helptooltips';

import AppConstants from '../../constants/app-constants';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import AddIcon from '@material-ui/icons/Add';
import HelpIcon from '@material-ui/icons/Help';

require('../common/prototype/Array.prototype.equals');

export default class Groups extends React.Component {
  dialogToggle() {
    this.props.acceptedCount ? this.props.openGroupDialog() : null;
  }

  render() {
    var allLabel = <span>All devices</span>;

    const groupItems = this.props.groups.reduce(
      (accu, group, index) => {
        var isSelected = group === this.props.selectedGroup ? { backgroundColor: '#e7e7e7' } : { backgroundColor: 'transparent' };
        const isUngroupedGroup = group === AppConstants.UNGROUPED_GROUP.id || group === AppConstants.UNGROUPED_GROUP.name;
        var numDevs;
        if (this.props.groupDevices) {
          numDevs = this.props.groupDevices[group] || null;
        }
        var boundClick = () => this.props.changeGroup(group, numDevs);
        if (isUngroupedGroup) {
          group = AppConstants.UNGROUPED_GROUP.name;
        }
        var groupLabel = <span>{decodeURIComponent(group)}</span>;
        const item = (
          <ListItem key={group + index} style={isSelected} onClick={boundClick}>
            <ListItemText primary={groupLabel} />
          </ListItem>
        );
        if (isUngroupedGroup) {
          accu.ungroupedsItem = item;
        } else {
          accu.groups.push(item);
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
            style={!this.props.selectedGroup ? { backgroundColor: '#e7e7e7' } : { backgroundColor: 'transparent' }}
            onClick={() => this.props.changeGroup('', this.props.allCount)}
          >
            <ListItemText primary={allLabel} />
          </ListItem>
          {groupItems.ungroupedsItem ? groupItems.ungroupedsItem : null}
          <Divider />
          {groupItems.groups}
          <ListItem
            button
            disabled={!this.props.acceptedCount}
            style={this.props.acceptedCount ? null : { color: '#d4e9e7' }}
            onClick={this.props.acceptedCount ? () => this.dialogToggle() : null}
          >
            <ListItemAvatar>
              <AddIcon style={this.props.allCount ? null : { color: '#d4e9e7' }} />
            </ListItemAvatar>
            <ListItemText primary="Create a group" />
          </ListItem>
        </List>

        {this.props.showHelptips && this.props.acceptedCount && !this.props.groups.length ? (
          <div>
            <div id="onboard-5" className="tooltip help" data-tip data-for="groups-tip" data-event="click focus" style={{ bottom: '-10px' }}>
              <HelpIcon />
            </div>
            <ReactTooltip id="groups-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <AddGroup />
            </ReactTooltip>
          </div>
        ) : null}
      </div>
    );
  }
}
