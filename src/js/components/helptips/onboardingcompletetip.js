import React from 'react';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import AppActions from '../../actions/app-actions';
import { collectAddressesFrom, probeAllAddresses } from '../../helpers';
import Loader from '../common/loader';

export default class OnboardingCompleteTip extends React.Component {
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

  componentDidUpdate() {
    ReactTooltip.show(this.tipRef);
  }

  render() {
    const { loading, targetUrl } = this.state;
    const url = targetUrl ? targetUrl : this.props.targetUrl;

    return (
      <div className="onboard-tip" style={{ left: '50%', top: '50%' }}>
        <a
          className="tooltip onboard-icon"
          data-tip
          data-for="pending-device-onboarding-tip"
          data-event="click focus"
          data-event-off="dblclick"
          ref={ref => (this.tipRef = ref)}
        >
          <CheckCircleIcon />
        </a>
        <ReactTooltip id="pending-device-onboarding-tip" place="bottom" type="light" effect="solid" className="content" clickable={true}>
          <p>Great work! You updated your device with the new Release!</p>
          <p>
            Your device is now running the updated version of the software. At
            <div className="flexbox centered">
              {loading ? <Loader show={loading} /> : <Button className="button" variant="contained" href={url} target="_blank">{`Go to ${url}`}</Button>}
            </div>
            you should see &apos;hello world&apos; in place of the webpage you saw previously.
          </p>
          <p>You&apos;ve now got a good foundation in how to use Mender. Look for more help hints in the UI as you go along.</p>
          What next?
          <div>
            <a href="https://docs.mender.io/2.0/getting-started/deploy-to-physical-devices#prepare-the-disk-image">Learn about full-image updates</a> or{' '}
            <a href="https://hub.mender.io/c/update-modules">how to create other kinds of application updates.</a>
          </div>
          <div className="flexbox">
            <div style={{ flexGrow: 1 }} />
            <Button variant="contained" color="secondary" onClick={() => AppActions.setOnboardingComplete(true)}>
              Close
            </Button>
          </div>
        </ReactTooltip>
      </div>
    );
  }
}
