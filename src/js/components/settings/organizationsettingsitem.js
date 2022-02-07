import React from 'react';

import { Divider, ListItem, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const defaultItemProps = { alignItems: 'flex-start' };
export const maxWidth = 500;

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
    <li className="margin-top-small org-settings-item">
      <ListItem {...defaultItemProps} component="div" classes={{ root: 'flexbox column' }}>
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
    </li>
  );
};

export default OrganizationSettingsItem;
