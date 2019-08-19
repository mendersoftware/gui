import React from 'react';
import Deployments from './deployments';
import Devices from './devices';

import { styles } from './widgets/baseWidget';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import { WelcomeSnackTip } from '../helptips/onboardingtips';
import { getOnboardingStepCompleted } from '../../utils/onboardingmanager';

const rowBaseStyles = {
  container: {
    flexWrap: 'wrap',
    maxWidth: '85vw'
  }
};

export default class Dashboard extends React.Component {
  componentDidMount() {
    const self = this;
    setTimeout(() => {
      if (AppStore.getCurrentUser() && !AppStore.getOnboardingComplete() && !getOnboardingStepCompleted('devices-pending-accepting-onboarding')) {
        AppActions.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={1} />, () => {}, self.onCloseSnackbar);
      }
    }, 1000);
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    AppActions.setSnackbar('');
  };

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
