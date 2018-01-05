import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route } from 'react-router';

// material ui
import { List, ListItem }  from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

var createReactClass = require('create-react-class');

var LeftNav =  createReactClass({
  getInitialState: function () {
    return {
      links: [] 
    };
  },

  componentDidMount: function () {
     // generate sidebar links
    this._setNavLinks();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.props.pages !== prevProps.pages) {
      this._setNavLinks();
    }
  },

  _clickLink: function (path) {
    this.props.changePage(path);
  },

  _setNavLinks: function () {
    var self = this;
    var links = [];

    // build array of link list components
    function eachRecursive(obj, path, level) {
        for (var k in obj) {
          if (typeof obj[k] == "object" && obj[k] !== null && k!=="component") {
              var this_path = path+"/"+k;
              links.push({title: obj[k].title, level:level, path:this_path});
              self.setState({links:links});
              eachRecursive(obj[k], this_path, level+1);
          }
        }
      }
      eachRecursive(self.props.pages, "/help", 0);
  },
 
  render: function () {
    var self = this;
    var nav = self.state.links.map(function(link, index) {
      var bgColor = self.context.router.isActive(link.path) ? "#E7E7E7" : "#FFFFFF";
      return (
        <ListItem primaryText={link.title} style={{paddingLeft: link.level*16, backgroundColor: bgColor}} onClick={self._clickLink.bind(null, link.path)} key={link.path} />
      )
    });
    return (
        <div>
          <List>
            <Subheader onClick={self._clickLink.bind(null, "/help")}><div style={{cursor: "pointer"}}>Help topics</div></Subheader>
            {nav}
          </List>
        </div>
    )
  }
});

LeftNav.contextTypes = {
  router: PropTypes.object
};

module.exports = LeftNav;