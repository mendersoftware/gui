import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';

import { getDevicesByStatus } from '../../actions/deviceActions';
import { setOnboardingComplete, setShowOnboardingHelp, setShowCreateArtifactDialog } from '../../actions/userActions';
import * as DeviceConstants from '../../constants/deviceConstants';
import { getDemoDeviceAddress } from '../../helpers';
import { advanceOnboarding } from '../../utils/onboardingmanager';
import Loader from '../common/loader';

export class DeploymentCompleteTip extends React.Component {
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
      .then(targetUrl => self.setState({ targetUrl, loading: false }));
  }

  onClose() {
    this.props.setShowOnboardingHelp(false);
    this.props.setOnboardingComplete(false);
  }

  onClick() {
    this.props.setOnboardingComplete(false);
    const url = this.state.targetUrl ? this.state.targetUrl : this.props.targetUrl;
    const parametrizedAddress = `${url}/index.html?source=${encodeURIComponent(window.location)}`;
    advanceOnboarding('deployments-past-completed');
    window.open(parametrizedAddress, '_blank');
    this.props.setShowCreateArtifactDialog(true);
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

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ getDevicesByStatus, setOnboardingComplete, setShowOnboardingHelp, setShowCreateArtifactDialog }, dispatch);
};

const mapStateToProps = state => {
  return {
    acceptedDevices: state.devices.byStatus.accepted.deviceIds.map(id => state.devices.byId[id])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentCompleteTip);
