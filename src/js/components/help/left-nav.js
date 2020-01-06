import React from 'react';
import { NavLink } from 'react-router-dom';

// material ui
import { List, ListItem, ListSubheader, ListItemText } from '@material-ui/core';

export default class LeftNav extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      links: []
    };
  }

  componentDidMount() {
    // generate sidebar links
    this._setNavLinks();
  }

  componentDidUpdate(prevProps) {
    if (this.props.pages !== prevProps.pages) {
      this._setNavLinks();
    }
  }

  _setNavLinks() {
    var self = this;
    var links = [];

    // build array of link list components
    function eachRecursive(obj, path, level) {
      for (var k in obj) {
        if (typeof obj[k] == 'object' && obj[k] !== null && k !== 'component') {
          var this_path = `${path}/${k}`;
          links.push({ title: obj[k].title, level: level, path: this_path, hosted: obj[k].hosted });
          self.setState({ links: links });
          eachRecursive(obj[k], this_path, level + 1);
        }
      }
    }
    eachRecursive(self.props.pages, '/help', 1);
  }

  render() {
    var self = this;
    return (
      <List className="leftFixed">
        <ListSubheader disableSticky={true}>Help topics</ListSubheader>
        {self.state.links.map(link => {
          return !self.props.isHosted && link.hosted ? null : (
            <ListItem className="navLink helpNav" component={NavLink} exact={true} key={link.path} style={{ paddingLeft: link.level * 16 }} to={link.path}>
              <ListItemText primary={link.title} />
            </ListItem>
          );
        })}
      </List>
    );
  }
}
