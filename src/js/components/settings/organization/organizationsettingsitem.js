import React from 'react';

import { Divider, ListItem, ListItemText } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const defaultItemProps = { alignItems: 'flex-start' };
export const maxWidth = 500;

const useStyles = makeStyles()(theme => ({
  divider: { marginBottom: theme.spacing(), marginLeft: theme.spacing(-2), width: maxWidth },
  text: { display: 'grid', width: '100%', marginBottom: theme.spacing() },
  secondary: { display: 'grid', width: '100%', marginBottom: 0 }
}));

const OrganizationSettingsItem = ({ title, content: { action, description }, secondary, sideBarContent, notification }) => {
  const { classes } = useStyles();

  const secondaryContent = secondary ? (
    secondary
  ) : (
    <>
      <div>{description}</div>
      {action.internal ? (
        <a className="align-right" onClick={action.action}>
          {action.title}
        </a>
      ) : (
        <a className="align-right" href={action.target} target="_blank" rel="noopener noreferrer">
          {action.title}
        </a>
      )}
    </>
  );
  return (
    <li className="margin-top-small org-settings-item">
      <ListItem {...defaultItemProps} component="div" classes={{ root: 'flexbox column' }}>
        <ListItemText
          className={secondary ? classes.secondary : classes.text}
          classes={{ secondary: secondary ? '' : 'two-columns' }}
          primary={title}
          secondaryTypographyProps={{ component: 'div' }}
          secondary={<>{secondaryContent}</>}
        />
        <Divider className={classes.divider} />
        {notification}
      </ListItem>
      {sideBarContent}
    </li>
  );
};

export default OrganizationSettingsItem;
