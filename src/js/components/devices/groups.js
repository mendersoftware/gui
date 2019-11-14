import React from 'react';
import ReactTooltip from 'react-tooltip';
import { AddGroup } from '../helptips/helptooltips';

import * as DeviceConstants from '../../constants/deviceConstants';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import AddIcon from '@material-ui/icons/Add';
import HelpIcon from '@material-ui/icons/Help';
import AppStore from '../../stores/app-store';

export default class Groups extends React.Component {
  dialogToggle() {
    this.props.acceptedCount ? this.props.openGroupDialog() : null;
  }

  render() {
    var allLabel = <span>All devices</span>;

    const groupItems = this.props.groups.reduce(
      (accu, group, index) => {
        var numDevs;
        if (this.props.groupDevices) {
          numDevs = this.props.groupDevices[group] || null;
        }
        var boundClick = () => this.props.changeGroup(group, numDevs);
        const isUngroupedGroup = group === DeviceConstants.UNGROUPED_GROUP.id || group === DeviceConstants.UNGROUPED_GROUP.name;
        if (isUngroupedGroup) {
          group = DeviceConstants.UNGROUPED_GROUP.name;
        }
        var isSelected = group === this.props.selectedGroup ? { backgroundColor: '#e7e7e7' } : {};
        var groupLabel = <span>{decodeURIComponent(group)}</span>;
        const item = (
          <ListItem classes={{ root: 'grouplist' }} button key={group + index} style={isSelected} onClick={boundClick}>
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
    const showHelptips = AppStore.showHelptips();

    return (
      <div>
        <div className="muted margin-bottom-small">Groups</div>
        <List>
          <ListItem
            classes={{ root: 'grouplist' }}
            button
            key="All"
            style={!this.props.selectedGroup ? { backgroundColor: '#e7e7e7' } : {}}
            onClick={() => this.props.changeGroup('', this.props.allCount)}
          >
            <ListItemText primary={allLabel} />
          </ListItem>
          {groupItems.ungroupedsItem ? groupItems.ungroupedsItem : null}
          <Divider />
          {groupItems.groups}
          <ListItem
            button
            classes={{ root: 'grouplist' }}
            disabled={!this.props.acceptedCount}
            style={this.props.acceptedCount ? null : { color: '#d4e9e7' }}
            onClick={this.props.acceptedCount ? () => this.dialogToggle() : null}
          >
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Create a group" />
          </ListItem>
        </List>

        {showHelptips && this.props.acceptedCount && !this.props.groups.length ? (
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
