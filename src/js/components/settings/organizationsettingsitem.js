import React from 'react';

import { Divider, ListItem, ListItemText } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

const defaultItemProps = { alignItems: 'flex-start', disabled: true, divider: false };
export const maxWidth = 500;
/**
 * @deprecated should be using `theme.spacing(2)` directly
 */
export const padding = 16;

const OrganizationSettingsItem = ({ title, content: { action, description }, secondary, sideBarContent, notification }) => {
  const theme = useTheme();
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
        <Divider style={{ margin: theme.spacing('inherit', 'inherit', 1, -2), width: maxWidth }} />
        {notification}
      </ListItem>
      {sideBarContent}
    </div>
  );
};

export default OrganizationSettingsItem;
