import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import { getDevicesByStatus } from '../../actions/deviceActions';
import { setOnboardingComplete } from '../../actions/userActions';
import * as DeviceConstants from '../../constants/deviceConstants';
import { getDemoDeviceAddress } from '../../helpers';
import Loader from '../common/loader';

export class OnboardingCompleteTip extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      targetUrl: ''
    };
  }

  componentDidMount() {
    const self = this;
    self.props
      .getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted)
      .then(() => getDemoDeviceAddress(self.props.acceptedDevices))
      .catch(e => console.log(e))
      .then(targetUrl => self.setState({ targetUrl, loading: false }, () => setTimeout(() => self.props.setOnboardingComplete(true), 120000)));
  }

  componentWillUnmount() {
    this.props.setOnboardingComplete(true);
  }

  componentDidUpdate() {
    ReactTooltip.show(this.tipRef);
  }

  render() {
    const { anchor, docsVersion, hasDeltaAccess, setOnboardingComplete } = this.props;
    const { loading, targetUrl } = this.state;
    const url = targetUrl ? targetUrl : this.props.targetUrl;

    return (
      <div className="onboard-tip" style={anchor}>
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
            you should now see &quot;Hello world&quot; in place of the webpage you saw previously. If you continue to see the webpage you saw previously you
            might have to refresh the page.
          </p>
          <p>You&apos;ve now got a good foundation in how to use Mender. Look for more help hints in the UI as you go along.</p>
          <p>{`If you used one of our pre-built images you can start using full-image${hasDeltaAccess ? ` and delta` : ''} updates right away.`}</p>
          What next?
          <div>
            <a href={`https://docs.mender.io/${docsVersion}artifacts/snapshots`} target="_blank">
              Learn about full-image updates
            </a>{' '}
            or{' '}
            <a href="https://hub.mender.io/c/update-modules" target="_blank">
              how to create other kinds of application updates.
            </a>
          </div>
          <div className="flexbox">
            <div style={{ flexGrow: 1 }} />
            <Button variant="contained" color="secondary" onClick={() => setOnboardingComplete(true)}>
              Close
            </Button>
          </div>
        </ReactTooltip>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ getDevicesByStatus, setOnboardingComplete }, dispatch);
};

const mapStateToProps = state => {
  const docsVersion = state.app.docsVersion ? `${state.app.docsVersion}/` : 'development/';
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    acceptedDevices: state.devices.byStatus.accepted.deviceIds.map(id => state.devices.byId[id]),
    docsVersion: state.app.features.isHosted ? '' : docsVersion,
    hasDeltaAccess: state.app.features.isHosted && plan !== 'os'
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingCompleteTip);
