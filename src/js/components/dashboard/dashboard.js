import React from 'react';
import Deployments from './deployments';
import Devices from './devices';

import { styles } from './widgets/baseWidget';

const rowBaseStyles = {
  container: {
    flexWrap: 'wrap',
    maxWidth: '85vw'
  }
};

export default class Dashboard extends React.Component {
  _handleClick(params) {
    switch (params.route) {
    case 'deployments':
      var tab = (params.tab || 'progress') + '/';
      var URIParams = 'open=' + params.open;
      URIParams = params.id ? URIParams + '&id=' + params.id : URIParams;
      URIParams = encodeURIComponent(URIParams);
      this.props.history.push('/deployments/' + tab + URIParams);
      break;
    case 'devices':
      var filters = params.status ? encodeURIComponent('status=' + params.status) : '';
      this.props.history.push('/devices/groups/' + filters);
      break;
    case 'devices/pending':
      this.props.history.push('/devices/pending');
      break;
    default:
      this.props.history.push(params.route);
    }
  }

  render() {
    const rowStyles = Object.assign({}, rowBaseStyles.container, styles.rowStyle);
    return (
      <div className="dashboard">
        <Devices styles={rowStyles} clickHandle={this._handleClick.bind(this)} />
        <Deployments styles={rowStyles} clickHandle={this._handleClick.bind(this)} />
      </div>
    );
  }
}
