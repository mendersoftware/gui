import React from 'react';
import ReactTooltip from 'react-tooltip';

// material ui
import { Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Add as AddIcon, Help as HelpIcon } from '@material-ui/icons';

import { AddGroup } from '../helptips/helptooltips';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { isUngroupedGroup as ungroupedGroupCheck } from '../../helpers';

export const Groups = ({ acceptedCount, allCount, changeGroup, groups, openGroupDialog, selectedGroup, showHelptips }) => {
  const groupItems = groups.reduce(
    (accu, group, index) => {
      const isUngroupedGroup = ungroupedGroupCheck(group);
      if (isUngroupedGroup) {
        group = UNGROUPED_GROUP.name;
      }
      const isSelected = group === selectedGroup ? { backgroundColor: '#e7e7e7' } : {};
      const item = (
        <ListItem classes={{ root: 'grouplist' }} button key={group + index} style={isSelected} onClick={() => changeGroup(group)}>
          <ListItemText primary={<span>{decodeURIComponent(group)}</span>} />
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
      <div className="muted margin-bottom-small">Groups</div>
      <List>
        <ListItem
          classes={{ root: 'grouplist' }}
          button
          key="All"
          style={!selectedGroup ? { backgroundColor: '#e7e7e7' } : {}}
          onClick={() => changeGroup('', allCount)}
        >
          <ListItemText primary={<span>All devices</span>} />
        </ListItem>
        {groupItems.ungroupedsItem ? groupItems.ungroupedsItem : null}
        <Divider />
        {groupItems.groups}
        <ListItem
          button
          classes={{ root: 'grouplist' }}
          disabled={!acceptedCount}
          style={acceptedCount ? null : { color: '#d4e9e7' }}
          onClick={acceptedCount ? () => openGroupDialog() : null}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Create a group" />
        </ListItem>
      </List>

      {showHelptips && acceptedCount && groups.length <= 1 ? (
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
};
export default Groups;
