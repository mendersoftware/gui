import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText';

export default class LeftNav extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };
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
