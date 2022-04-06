import React from 'react';
import { NavLink } from 'react-router-dom';

// material ui
import { List, ListItem, ListSubheader, ListItemText, ListItemIcon } from '@mui/material';
import { listItemTextClasses } from '@mui/material/ListItemText';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  list: {
    [`&.navLink .${listItemTextClasses.root}`]: {
      color: theme.palette.mode === 'light' ? theme.palette.grey[900] : theme.palette.text.primary
    },
    [`&.navLink.active .${listItemTextClasses.root}`]: {
      color: theme.palette.mode === 'light' ? theme.palette.text.primary : theme.palette.grey[900]
    },
    '&.active': {
      background: theme.palette.grey[400]
    }
  },
  listItem: {
    [`.${listItemTextClasses.primary}`]: {
      fontSize: '0.8rem',
      '&:hover': {
        color: theme.palette.primary.main
      }
    }
  }
}));

export const LeftNav = ({ sections }) => {
  const { classes } = useStyles();
  return (
    <List className="leftFixed">
      {sections.map(({ itemClass = '', items = [], title = '' }, index) => (
        <React.Fragment key={`${itemClass}-${index}`}>
          <ListSubheader disableSticky={true}>{title}</ListSubheader>
          {items.map(({ exact, path, secondaryAction = null, style = {}, title = '', url }) => (
            <ListItem
              className={`navLink ${itemClass} ${classes.list}`}
              component={url ? 'a' : NavLink}
              exact={exact}
              href={url}
              key={path}
              rel={url && 'noopener noreferrer'}
              secondaryAction={secondaryAction}
              style={style}
              target={url && '_blank'}
              to={url ? url : path}
            >
              <ListItemText className={classes.listItem} primary={title} url={url} />
              {url && (
                <ListItemIcon>
                  <LaunchIcon />
                </ListItemIcon>
              )}
            </ListItem>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
};

export default LeftNav;
