import React from 'react';
import PropTypes from 'prop-types';

import Paper from 'material-ui/Paper';

var createReactClass = require('create-react-class');

var HelpTopics = createReactClass({

  _clickLink: function (path) {
    this.props.changePage(path);
  },
 
  render: function() {
  	
  	var self = this;
  	var sections = [];
  	for (var k in self.props.pages) {
  		sections.push({title: self.props.pages[k].title, icon: self.props.pages[k].icon, path: "help/"+k});
  	};

  	var helpSections = sections.map(function(section, index) {
  		var Icon = section.icon;
  		return (
  			<Paper zDepth={1} key={index} className="help-section" onClick={self._clickLink.bind(null, section.path)}>
  				<Icon />
  				<p>{section.title}</p>
  			</Paper>
  		)
  	});
    return (
        <div>
         <h2>Help topics</h2>
         {helpSections}
        </div>
    )
  }
});

module.exports = HelpTopics;