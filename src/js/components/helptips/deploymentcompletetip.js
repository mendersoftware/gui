import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import { advanceOnboarding, setOnboardingComplete, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDemoDeviceAddress } from '../../selectors';
import Loader from '../common/loader';

export class DeploymentCompleteTip extends React.PureComponent {
  componentDidUpdate() {
    ReactTooltip.show(this.tipRef);
  }

  onClick() {
    const { advanceOnboarding, setShowCreateArtifactDialog, setOnboardingComplete, url } = this.props;
    const parametrizedAddress = `${url}/index.html?source=${encodeURIComponent(window.location)}`;
    window.open(parametrizedAddress, '_blank');
    advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE);
    setOnboardingComplete(false);
    setShowCreateArtifactDialog(true);
    window.location.replace('#/releases');
  }

  render() {
    const self = this;
    const { anchor, url } = self.props;
    return (
      <div className="onboard-tip" style={anchor}>
        <a
          className="tooltip onboard-icon"
          data-tip
          data-for="deployment-complete-tip"
          data-event="click focus"
          data-event-off="dblclick"
          ref={ref => (self.tipRef = ref)}
        >
          <CheckCircleIcon />
        </a>
        <ReactTooltip id="deployment-complete-tip" place="bottom" type="light" effect="solid" className="content" clickable={true}>
          <p>Fantastic! You completed your first deployment!</p>
          <p>Your deployment is finished and your device is now running the updated software!</p>
          <div className="flexbox centered">
            {!url ? <Loader show={true} /> : <Button variant="contained" onClick={() => self.onClick()}>{`Go to ${url}`}</Button>}
          </div>
          <p>and you should see the demo web application actually being run on the device.</p>
          <p>NOTE: if you have local network restrictions, you may need to check them if you have difficulty loading the page.</p>
          <a onClick={() => self.onClick()}>Visit the web app running your device</a>
        </ReactTooltip>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ advanceOnboarding, setOnboardingComplete, setShowCreateArtifactDialog }, dispatch);
};

const mapStateToProps = (state, ownProps) => {
  return {
    url: getDemoDeviceAddress(state) || ownProps.targetUrl
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentCompleteTip);
