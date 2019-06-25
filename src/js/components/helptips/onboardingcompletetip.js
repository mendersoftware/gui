import React from 'react';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import { getDemoDeviceAddress } from '../../helpers';
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
    AppActions.getDevicesByStatus('accepted')
      .then(getDemoDeviceAddress)
      .catch(e => console.log(e))
      .then(targetUrl => self.setState({ targetUrl, loading: false }, () => setTimeout(() => AppActions.setOnboardingComplete(true), 120000)));
  }

  componentWillUnmount() {
    AppActions.setOnboardingComplete(true);
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
            <div className="flexbox centered" style={{ margin: '5px 0' }}>
              {loading ? (
                <Loader show={loading} />
              ) : (
                <Button
                  className="button"
                  variant="contained"
                  href={`${url}/index.html?source=${encodeURIComponent(window.location)}`}
                  target="_blank"
                >{`Go to ${url}`}</Button>
              )}
            </div>
            you should now see &quot;Hello world&quot; in place of the webpage you saw previously.
          </p>
          <p>You&apos;ve now got a good foundation in how to use Mender. Look for more help hints in the UI as you go along.</p>
          What next?
          <div>
            <a href={`https://docs.mender.io/${AppStore.getDocsVersion()}/getting-started/deploy-to-physical-devices#prepare-the-disk-image`} target="_blank">
              Learn about full-image updates
            </a>{' '}
            or{' '}
            <a href="https://hub.mender.io/c/update-modules" target="_blank">
              how to create other kinds of application updates.
            </a>
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
