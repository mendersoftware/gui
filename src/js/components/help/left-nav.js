import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

// material ui
import { List, ListItem, ListSubheader, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const LeftNav = ({ isHosted, pages }) => {
  const theme = useTheme();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    // generate sidebar links
    setLinks(eachRecursive(pages, '/help', 1, []));
  }, [pages]);

  // build array of link list components
  const eachRecursive = (obj, path, level, accu) => {
    for (var k in obj) {
      if (typeof obj[k] == 'object' && obj[k] !== null && k !== 'component') {
        var this_path = `${path}/${k}`;
        accu.push({ title: obj[k].title, level: level, path: this_path, hosted: obj[k].hosted });
        accu = eachRecursive(obj[k], this_path, level + 1, accu);
      }
    }
    return accu;
  };

  return (
    <List className="leftFixed">
      <ListSubheader disableSticky={true}>Help topics</ListSubheader>
      {links.map(link =>
        !isHosted && link.hosted ? null : (
          <ListItem
            className="navLink helpNav"
            component={NavLink}
            exact={true}
            key={link.path}
            style={{ paddingLeft: link.level * theme.spacing(2) }}
            to={link.path}
          >
            <ListItemText primary={link.title} />
          </ListItem>
        )
      )}
    </List>
  );
};

export default LeftNav;
