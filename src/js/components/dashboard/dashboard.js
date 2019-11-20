import React from 'react';
import { connect } from 'react-redux';
import Deployments from './deployments';
import Devices from './devices';

import { styles } from './widgets/baseWidget';
import { setSnackbar } from '../../actions/appActions';

import { WelcomeSnackTip } from '../helptips/onboardingtips';
import { getOnboardingStepCompleted } from '../../utils/onboardingmanager';

const rowBaseStyles = {
  container: {
    flexWrap: 'wrap',
    maxWidth: '85vw'
  }
};

export class Dashboard extends React.Component {
  componentDidMount() {
    const self = this;
    setTimeout(() => {
      if (
        self.props.currentUser &&
        self.props.showOnboardingTips &&
        !self.props.onboardingComplete &&
        !getOnboardingStepCompleted('devices-pending-accepting-onboarding')
      ) {
        self.props.setSnackbar('open', 10000, '', <WelcomeSnackTip progress={1} />, () => {}, self.onCloseSnackbar);
      }
    }, 1000);
  }

  onCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.props.setSnackbar('');
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

const actionCreators = { setSnackbar };

const mapStateToProps = state => {
  return {
    currentUser: state.users.byId[state.users.currentUser] || {},
    onboardingComplete: state.users.onboarding.complete,
    showHelptips: state.users.showHelptips,
    showOnboardingTips: state.users.onboarding.showTips
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(Dashboard);
