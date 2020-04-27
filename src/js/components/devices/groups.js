import React from 'react';
import ReactTooltip from 'react-tooltip';
import { AddGroup } from '../helptips/helptooltips';

// material ui
import { Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Add as AddIcon, Help as HelpIcon } from '@material-ui/icons';

export const Groups = ({ acceptedCount, changeGroup, groups, openGroupDialog, selectedGroup, showHelptips }) => {
  const groupItems = groups.map((group, index) => {
    const isSelected = group === selectedGroup ? { backgroundColor: '#e7e7e7' } : {};
    return (
      <ListItem classes={{ root: 'grouplist' }} button key={group + index} style={isSelected} onClick={() => changeGroup(group)}>
        <ListItemText primary={decodeURIComponent(group)} />
      </ListItem>
    );
  });

  return (
    <div>
      <div className="muted margin-bottom-small">Groups</div>
      <List>
        <ListItem classes={{ root: 'grouplist' }} button key="All" style={!selectedGroup ? { backgroundColor: '#e7e7e7' } : {}} onClick={() => changeGroup('')}>
          <ListItemText primary="All devices" />
        </ListItem>
        <Divider />
        {groupItems}
        <ListItem
          button
          classes={{ root: 'grouplist' }}
          disabled={!acceptedCount}
          style={acceptedCount ? null : { color: '#d4e9e7' }}
          onClick={openGroupDialog}
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
