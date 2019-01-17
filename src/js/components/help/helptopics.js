import React from 'react';

import Paper from 'material-ui/Paper';

export default class HelpTopics extends React.Component {
  _clickLink(path) {
    this.props.changePage(path);
  }

  render() {
    var self = this;
    var sections = [];
    for (var k in self.props.pages) {
      sections.push({ title: self.props.pages[k].title, icon: self.props.pages[k].icon, path: `help/${k}` });
    }

    var helpSections = sections.map((section, index) => {
      var Icon = section.icon;
      return (
        <a key={index} onClick={() => self._clickLink(section.path)}>
          <Paper zDepth={1} key={index} className="help-section">
            <Icon />
            <p>{section.title}</p>
          </Paper>
        </a>
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
