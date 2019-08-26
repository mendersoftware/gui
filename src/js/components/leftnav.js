import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import copy from 'copy-to-clipboard';

// material ui
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import AppStore from '../stores/app-store';

var listItems = [
  { route: '/', text: 'Dashboard' },
  { route: '/devices', text: 'Devices' },
  { route: '/releases', text: 'Releases' },
  { route: '/deployments', text: 'Deployments' }
];

export default class LeftNav extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isHosted: AppStore.getIsHosted()
    };
  }

  render() {
    var self = this;

    var docsVersion = '';
    if (!self.state.isHosted) {
      docsVersion = self.props.docsVersion ? `${self.props.docsVersion}/` : 'development/';
    }
    const listItemStyle = {
      container: { padding: '16px 16px 16px 42px' }
    };

    var list = listItems.map((item, index) => (
      <ListItem
        className="navLink leftNav"
        component={NavLink}
        exact={item.route === '/'}
        key={index}
        style={{ padding: '22px 16px 22px 42px' }}
        to={item.route}
      >
        <ListItemText primary={item.text} style={Object.assign({ textTransform: 'uppercase' })} />
      </ListItem>
    ));

    var licenseUrl = `https://docs.mender.io/${docsVersion}release-information/open-source-licenses`;
    var licenseLink = (
      <a target="_blank" rel="noopener noreferrer" href={licenseUrl} style={{ fontSize: '13px', position: 'relative', top: '6px', color: '#347A87' }}>
        License information
      </a>
    );

    const versionInformation = AppStore.getVersionInformation();

    const versions = (
      <ul className="unstyled" style={{ minWidth: 120 }}>
        {Object.entries(versionInformation).reduce((accu, [key, version]) => {
          if (version) {
            accu.push(
              <li key={key} className="flexbox space-between">
                <div>{key}</div>
                <div>{version}</div>
              </li>
            );
          }
          return accu;
        }, [])}
      </ul>
    );
    const versionInfo = (
      <Tooltip title={versions} placement="top">
        <div onClick={() => copy(JSON.stringify(versionInformation))}>{self.props.version ? `Version: ${self.props.version}` : ''}</div>
      </Tooltip>
    );

    return (
      <div className={self.props.className}>
        <List style={{ padding: '0' }}>{list}</List>

        <List style={{ padding: '0', position: 'absolute', bottom: '30px', left: '0px', right: '0px' }}>
          <ListItem className="navLink leftNav" component={Link} style={listItemStyle.container} to="/help">
            <ListItemText primary="Help" style={listItemStyle.font} />
          </ListItem>
          <ListItem style={Object.assign({ color: '#949495' }, listItemStyle.container)} disabled={true}>
            <ListItemText primary={versionInfo} secondary={licenseLink} style={listItemStyle.font} />
          </ListItem>
        </List>
      </div>
    );
  }
}
