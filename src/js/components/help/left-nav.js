import React from 'react';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';

// material ui
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

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

  _clickLink(path) {
    this.props.changePage(path);
  }

  _setNavLinks() {
    var self = this;
    var links = [];

    // build array of link list components
    function eachRecursive(obj, path, level) {
      for (var k in obj) {
        if (typeof obj[k] == 'object' && obj[k] !== null && k !== 'component') {
          var this_path = `${path}/${k}`;
          links.push({ title: obj[k].title, level: level, path: this_path });
          self.setState({ links: links });
          eachRecursive(obj[k], this_path, level + 1);
        }
      }
    }
    eachRecursive(self.props.pages, '/help', 0);
  }

  render() {
    var self = this;
    var nav = self.state.links.map(link => {
      var bgColor = matchPath(link.path) ? '#E7E7E7' : '#FFFFFF';
      return (
        <ListItem
          primaryText={link.title}
          style={{ paddingLeft: link.level * 16, backgroundColor: bgColor }}
          onClick={() => self._clickLink(link.path)}
          key={link.path}
        />
      );
    });
    return (
      <div>
        <List>
          <Subheader onClick={() => self._clickLink('/help')}>
            <div style={{ cursor: 'pointer' }}>Help topics</div>
          </Subheader>
          {nav}
        </List>
      </div>
    );
  }
}
