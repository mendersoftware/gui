import React from 'react';
import { NavLink } from 'react-router-dom';

// material ui
import { List, ListItem } from 'material-ui/List';

var listItems = [
  { route: '/', text: 'Dashboard' },
  { route: '/devices', text: 'Devices' },
  { route: '/artifacts', text: 'Artifacts' },
  { route: '/deployments', text: 'Deployments' }
];

export default class LeftNav extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentTab: this.props.currentTab,
      isHosted: window.location.hostname === 'hosted.mender.io'
    };
  }

  render() {
    var self = this;

    var docsVersion = '';
    if (!self.state.isHosted) {
      docsVersion = self.props.docsVersion ? `${self.props.docsVersion}/` : 'development/';
    }

    var list = listItems.map((item, index) => {
      return (
        <NavLink key={index} className="navLink leftNav" to={item.route} exact={item.route === '/'}>
          <ListItem primaryText={item.text} innerDivStyle={{ padding: '22px 16px 22px 42px', fontSize: '14px', textTransform: 'uppercase' }} />
        </NavLink>
      );
    });

    var licenseUrl = `https://docs.mender.io/${docsVersion}release-information/open-source-licenses`;
    var licenseLink = (
      <a target="_blank" rel="noopener noreferrer" href={licenseUrl} style={{ fontSize: '13px', position: 'relative', top: '6px', color: '#347A87' }}>
        License information
      </a>
    );

    return (
      <div>
        <List style={{ padding: '0' }}>{list}</List>

        <List style={{ padding: '0', position: 'absolute', bottom: '30px', left: '0px', right: '0px' }}>
          <NavLink className="navLink leftNav " to="/help">
            <ListItem primaryText="Help" innerDivStyle={{ padding: '16px 16px 16px 42px', fontSize: '14px' }} />
          </NavLink>
          <ListItem
            style={{ color: '#949495' }}
            primaryText={self.props.version ? `Version: ${self.props.version}` : ''}
            secondaryText={licenseLink}
            disabled={true}
            innerDivStyle={{ padding: '16px 16px 16px 42px', fontSize: '14px' }}
          />
        </List>
      </div>
    );
  }
}
