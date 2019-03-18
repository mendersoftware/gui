import React from 'react';
import { Link } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';

export default class HelpTopics extends React.Component {
  render() {
    var self = this;
    const helpSections = Object.entries(self.props.pages).map((pageItem, index) => {
      const section = pageItem[1];
      var Icon = section.icon;
      return (
        <Paper key={index} component={Link} className="help-section" to={`help/${pageItem[0]}`}>
          <Icon />
          <p>{section.title}</p>
        </Paper>
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
