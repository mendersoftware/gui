import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

import { getDeviceById, getDevicesByStatus } from '../../actions/deviceActions';
import { setOnboardingComplete } from '../../actions/onboardingActions';
import Loader from '../common/loader';
import { MenderTooltipClickable } from '../common/mendertooltip';
import DeviceConstants from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDemoDeviceAddress, getDocsVersion } from '../../selectors';
import { CompletionButton } from './deploymentcompletetip';

export const OnboardingCompleteTip = ({ anchor, docsVersion, getDeviceById, getDevicesByStatus, setOnboardingComplete, url }) => {
  useEffect(() => {
    getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted)
      .then(tasks => tasks[tasks.length - 1].deviceAccu.ids.map(getDeviceById))
      .finally(() => setTimeout(() => setOnboardingComplete(true), 120000));
    return () => {
      setOnboardingComplete(true);
    };
  }, []);

  return (
    <MenderTooltipClickable
      className="tooltip onboard-icon onboard-tip"
      id={onboardingSteps.ONBOARDING_FINISHED}
      onboarding
      startOpen
      style={anchor}
      PopperProps={{ style: { marginLeft: -30, marginTop: -20 } }}
      title={
        <div className="content">
          <p>Great work! You updated your device with the new Release!</p>
          <div className="margin-bottom-small margin-top-small">
            Your device is now running the updated version of the software. At
            <div className="flexbox centered" style={{ margin: '5px 0' }}>
              {!url ? (
                <Loader show={true} />
              ) : (
                <CompletionButton
                  className="button"
                  variant="text"
                  href={`${url}/index.html?source=${encodeURIComponent(window.location)}`}
                  target="_blank"
                >{`Go to ${url}`}</CompletionButton>
              )}
            </div>
            you should now see &quot;Hello world&quot; in place of the webpage you saw previously. If you continue to see the webpage you saw previously you
            might have to refresh the page.
          </div>
          <p>You&apos;ve now got a good foundation in how to use Mender. Look for more help hints in the UI as you go along.</p>
          What next?
          <div>
            Proceed to one of the following tutorials (listed in recommended order):
            <ol>
              <li key="deploy-a-system-update">
                <a href={`https://docs.mender.io/${docsVersion}get-started/deploy-a-system-update`} target="_blank" rel="noopener noreferrer">
                  Deploy a system update
                </a>
              </li>
              <li key="deploy-a-container-update">
                <a href={`https://docs.mender.io/${docsVersion}get-started/deploy-a-container-update`} target="_blank" rel="noopener noreferrer">
                  Deploy a container update
                </a>
              </li>
            </ol>
          </div>
          <div className="flexbox">
            <div style={{ flexGrow: 1 }} />
            <Button variant="contained" color="secondary" onClick={() => setOnboardingComplete(true)}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <CheckCircleIcon />
    </MenderTooltipClickable>
  );
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ getDeviceById, getDevicesByStatus, setOnboardingComplete }, dispatch);
};

const mapStateToProps = (state, ownProps) => {
  return {
    docsVersion: getDocsVersion(state),
    url: getDemoDeviceAddress(state) || ownProps.targetUrl
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingCompleteTip);
