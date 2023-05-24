import React from 'react';

// material ui
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  header: {
    color: theme.palette.grey[800],
    height: theme.spacing(6)
  },
  groupBorder: {
    background: theme.palette.grey[50]
  },
  groupHeading: {
    background: theme.palette.background.default
  }
}));

export const GroupsSubheader = ({ heading }) => {
  const { classes } = useStyles();
  return (
    <ListSubheader classes={{ root: 'heading-lined' }} className={classes.header} disableGutters disableSticky key="static-groups-sub">
      <span className={classes.groupHeading}>{heading}</span>
      <div className={classes.groupBorder}></div>
    </ListSubheader>
  );
};

export const GroupItem = ({ changeGroup, groupname, selectedGroup, name }) => (
  <ListItem classes={{ root: 'grouplist' }} button selected={name === selectedGroup || groupname === selectedGroup} onClick={() => changeGroup(name)}>
    <ListItemText primary={decodeURIComponent(name)} />
  </ListItem>
);

export const Groups = ({ changeGroup, className, groups, openGroupDialog, selectedGroup }) => {
  const { dynamic: dynamicGroups, static: staticGroups, ungrouped } = groups;
  return (
    <div className={className}>
      <div className="muted margin-bottom-small">Groups</div>
      <List>
        <ListItem classes={{ root: 'grouplist' }} button key="All" selected={!selectedGroup} onClick={() => changeGroup()}>
          <ListItemText primary="All devices" />
        </ListItem>
        {!!dynamicGroups.length && <GroupsSubheader heading="Dynamic" />}
        {dynamicGroups.map(({ groupId, name }, index) => (
          <GroupItem changeGroup={changeGroup} groupname={name} key={name + index} name={groupId} selectedGroup={selectedGroup} />
        ))}
        {!!staticGroups.length && <GroupsSubheader heading="Static" />}
        {staticGroups.map(({ groupId, name }, index) => (
          <GroupItem changeGroup={changeGroup} groupname={name} key={name + index} name={groupId} selectedGroup={selectedGroup} />
        ))}
        {!!staticGroups.length &&
          ungrouped.map(({ groupId, name }, index) => (
            <GroupItem changeGroup={changeGroup} groupname={name} key={name + index} name={groupId} selectedGroup={selectedGroup} />
          ))}
        <ListItem button classes={{ root: 'grouplist' }} style={{ marginTop: 30 }} onClick={openGroupDialog}>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="Create a group" />
        </ListItem>
      </List>
    </div>
  );
};

export default Groups;
