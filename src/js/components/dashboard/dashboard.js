import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Deployments from './deployments';
import Devices from './devices';
import SoftwareDistribution from './software-distribution';

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
const rowStyles = { ...rowBaseStyles.container, ...styles.rowStyle };

export class Dashboard extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      redirect: null
    };
  }

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
    let redirect;
    switch (params.route) {
      case 'deployments': {
        let URIParams = params.open;
        URIParams = params.id ? `${URIParams}&id=${params.id}` : URIParams;
        redirect = `/deployments/${params.tab || 'progress'}/open=${encodeURIComponent(URIParams)}`;
        break;
      }
      case 'devices':
        redirect = `/devices/${params.status ? encodeURIComponent('status=' + params.status) : ''}`;
        break;
      case 'devices/pending':
        redirect = '/devices/pending';
        break;
      default:
        redirect = params.route;
    }
    this.setState({ redirect });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }
    return (
      <div className="dashboard">
        <Devices styles={rowStyles} clickHandle={this._handleClick.bind(this)} />
        <div className="two-column" style={{ gridTemplateColumns: '4fr 5fr' }}>
          <Deployments styles={rowStyles} clickHandle={this._handleClick.bind(this)} />
          <SoftwareDistribution />
        </div>
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

export default connect(mapStateToProps, actionCreators)(Dashboard);
