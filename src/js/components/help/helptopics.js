import React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';

export default class HelpTopics extends React.Component {
  render() {
    var self = this;
    var sections = [];
    for (var k in self.props.pages) {
      sections.push({ title: self.props.pages[k].title, icon: self.props.pages[k].icon, path: `help/${k}` });
    }

    var helpSections = sections.map((section, index) => {
      var Icon = section.icon;
      return (
        <Link key={index} to={section.path}>
          <Paper zDepth={1} key={index} className="help-section">
            <Icon />
            <p>{section.title}</p>
          </Paper>
        </Link>
      );
    });
    return (
      <div>
        <h2>Help topics</h2>
        {helpSections}
      </div>
    );
  }
}
