import React from 'react';

import { Divider, ListItem, ListItemText } from '@material-ui/core';

import theme from '../../themes/mender-theme';

const defaultItemProps = { alignItems: 'flex-start', disabled: true, divider: false };
export const maxWidth = 500;
export const padding = theme.spacing(2);

const OrganizationSettingsItem = ({ title, content: { action, description }, secondary, sideBarContent, notification }) => {
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
  const style = { display: 'grid', width: '100%', marginBottom: secondary ? 0 : theme.spacing() };
  return (
    <div className="margin-top-small org-settings-item">
      <ListItem {...defaultItemProps} classes={{ root: 'flexbox column' }}>
        <ListItemText
          classes={{ secondary: secondary ? '' : 'two-columns' }}
          primary={title}
          secondaryTypographyProps={{ component: 'div', style }}
          secondary={<>{secondaryContent}</>}
          style={style}
        />
        <Divider style={{ marginBottom: theme.spacing(), marginLeft: -1 * padding, width: maxWidth }} />
        {notification}
      </ListItem>
      {sideBarContent}
    </div>
  );
};

export default OrganizationSettingsItem;
