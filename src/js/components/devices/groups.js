import React from 'react';

// material ui
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

import { AddGroup } from '../helptips/helptooltips';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';

const styles = {
  subheader: { color: '#aaaaaa', height: 48 }
};

export const GroupsSubheader = ({ heading }) => (
  <ListSubheader classes={{ root: 'heading-lined' }} disableGutters disableSticky key="static-groups-sub" style={styles.subheader}>
    <span>{heading}</span>
    <div></div>
  </ListSubheader>
);

export const GroupItem = ({ changeGroup, groupname, selectedGroup, name }) => (
  <ListItem classes={{ root: 'grouplist' }} button selected={name === selectedGroup || groupname === selectedGroup} onClick={() => changeGroup(name)}>
    <ListItemText primary={decodeURIComponent(name)} />
  </ListItem>
);

export const Groups = ({ acceptedCount, changeGroup, groups, openGroupDialog, selectedGroup, showHelptips }) => {
  const {
    dynamic: dynamicGroups,
    static: staticGroups,
    ungrouped
  } = Object.entries(groups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (accu, [groupname, group], index) => {
        const name = groupname === UNGROUPED_GROUP.id ? UNGROUPED_GROUP.name : groupname;
        const groupItem = <GroupItem changeGroup={changeGroup} groupname={groupname} key={groupname + index} name={name} selectedGroup={selectedGroup} />;
        if (group.filters.length > 0) {
          if (groupname !== UNGROUPED_GROUP.id) {
            accu.dynamic.push(groupItem);
          } else {
            accu.ungrouped.push(groupItem);
          }
        } else {
          accu.static.push(groupItem);
        }
        return accu;
      },
      { dynamic: [], static: [], ungrouped: [] }
    );

  return (
    <>
      <div className="muted margin-bottom-small">Groups</div>
      <List>
        <ListItem classes={{ root: 'grouplist' }} button key="All" selected={!selectedGroup} onClick={() => changeGroup()}>
          <ListItemText primary="All devices" />
        </ListItem>
        {!!dynamicGroups.length && <GroupsSubheader heading="Dynamic" />}
        {dynamicGroups}
        {!!staticGroups.length && <GroupsSubheader heading="Static" />}
        {staticGroups}
        {!!staticGroups.length && ungrouped}
        <ListItem button classes={{ root: 'grouplist' }} style={{ marginTop: 30 }} onClick={openGroupDialog}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="Create a group" />
        </ListItem>
      </List>

      {showHelptips && acceptedCount && groups.length <= 1 ? <AddGroup /> : null}
    </>
  );
};

export default Groups;
