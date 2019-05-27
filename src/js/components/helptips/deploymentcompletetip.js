import React from 'react';

import Button from '@material-ui/core/Button';

import AppActions from '../../actions/app-actions';
import { collectAddressesFrom, probeAllAddresses } from '../../helpers';
import { advanceOnboarding } from '../../utils/onboardingmanager';
import Loader from '../common/loader';

export default class DeploymentCompleteTip extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      targetUrl: ''
    };
  }
  componentDidMount() {
    const self = this;
    let state = { targetUrl: '', loading: false };
    AppActions.getDevicesByStatus('accepted')
      .then(AppActions.getDevicesWithInventory)
      .then(devices => {
        const addresses = collectAddressesFrom(devices);
        state.targetUrl = `http://${addresses.find(item => !item.includes(':'))}`;
        return probeAllAddresses(addresses);
      })
      .then(responses => {
        const reachableAddress = responses.find(address => address);
        state.targetUrl = reachableAddress ? reachableAddress : state.targetUrl;
      })
      .catch(e => console.log(e))
      .finally(() => self.setState(state));
  }

  onClose() {
    AppActions.setShowOnboardingHelp(false);
    AppActions.setOnboardingComplete(false);
  }

  onClick() {
    AppActions.setOnboardingComplete(false);
    const url = this.state.targetUrl ? this.state.targetUrl : this.props.targetUrl;
    window.open(url, '_blank');
    advanceOnboarding('deployments-past-completed');
    AppActions.setShowCreateArtifactDialog(true);
    this.onClose();
  }

  render() {
    const { loading, targetUrl } = this.state;
    const url = targetUrl ? targetUrl : this.props.targetUrl;

    return (
      <div>
        <p>Fantastic! You completed your first deployment!</p>
        <p>Your deployment is finished and your device is now running the updated software!</p>
        <div className="flexbox centered">
          {loading ? <Loader show={loading} /> : <Button variant="contained" onClick={() => this.onClick()}>{`Go to ${url}`}</Button>}
        </div>
        <p>and you should see the demo web application actually being run on the device.</p>
        <p>NOTE: if you have local network restrictions, you may need to check them if you have difficulty loading the page.</p>
        {loading ? <Loader show={loading} /> : <a onClick={() => this.onClick()}>Visit the web app running your device</a>}
      </div>
    );
  }
}
