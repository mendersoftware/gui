import React from 'react';

import { Divider, ListItem, ListItemText } from '@material-ui/core';

import theme from '../../themes/mender-theme';

const defaultItemProps = { alignItems: 'flex-start', disabled: true, divider: false };
const maxWidth = 500;
const padding = theme.spacing(2);

const OrganizationSettingsItem = ({ title, content: { action, description }, secondary, notification }) => {
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
        <a className="align-right" href={action.target} target="_blank">
          {action.title}
        </a>
      )}
    </>
  );
  const style = { display: 'grid', width: '100%', marginBottom: secondary ? 0 : theme.spacing() };
  return (
    <ListItem {...defaultItemProps} classes={{ root: 'flexbox column margin-top-small' }} style={{ maxWidth }}>
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
  );
};

export default OrganizationSettingsItem;
