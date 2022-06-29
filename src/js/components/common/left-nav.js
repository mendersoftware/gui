import React from 'react';
import { NavLink } from 'react-router-dom';

// material ui
import { List, ListItem, ListSubheader, ListItemText } from '@mui/material';
import { listItemTextClasses } from '@mui/material/ListItemText';
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
          {items.map(({ exact, path, secondaryAction = null, style = {}, title = '', url }) => {
            const props = url
              ? { component: 'a', exact: `${exact}`, href: url, rel: 'noopener noreferrer', target: '_blank', to: url }
              : { component: NavLink, end: exact, to: path };
            return (
              <ListItem className={`navLink ${itemClass} ${classes.list}`} key={path} secondaryAction={secondaryAction} style={style} {...props}>
                <ListItemText className={classes.listItem} primary={title} url={url} />
              </ListItem>
            );
          })}
        </React.Fragment>
      ))}
    </List>
  );
};

export default LeftNav;
