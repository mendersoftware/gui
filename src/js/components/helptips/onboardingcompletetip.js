import React, { useEffect, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import { Button } from '@material-ui/core';
import { CheckCircle as CheckCircleIcon } from '@material-ui/icons';

import { getDeviceById, getDevicesByStatus } from '../../actions/deviceActions';
import { setOnboardingComplete } from '../../actions/onboardingActions';
import DeviceConstants from '../../constants/deviceConstants';
import { getDemoDeviceAddress, getDocsVersion } from '../../selectors';
import Loader from '../common/loader';

export const OnboardingCompleteTip = ({ anchor, docsVersion, getDeviceById, getDevicesByStatus, setOnboardingComplete, url }) => {
  const tipRef = useRef(null);

  useEffect(() => {
    ReactTooltip.show(tipRef.current);
    getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted)
      .then(tasks => tasks[tasks.length - 1].deviceAccu.ids.map(getDeviceById))
      .finally(() => setTimeout(() => setOnboardingComplete(true), 120000));
    return () => {
      setOnboardingComplete(true);
    };
  }, []);

  return (
    <div className="onboard-tip" style={anchor}>
      <a className="tooltip onboard-icon" data-tip data-for="onboarding-complete-tip" data-event="click focus" data-event-off="dblclick" ref={tipRef}>
        <CheckCircleIcon />
      </a>
      <ReactTooltip id="onboarding-complete-tip" place="bottom" type="light" effect="solid" className="content" clickable={true}>
        <p>Great work! You updated your device with the new Release!</p>
        <p>
          Your device is now running the updated version of the software. At
          <div className="flexbox centered" style={{ margin: '5px 0' }}>
            {!url ? (
              <Loader show={true} />
            ) : (
              <Button
                className="button"
                variant="contained"
                href={`${url}/index.html?source=${encodeURIComponent(window.location)}`}
                target="_blank"
              >{`Go to ${url}`}</Button>
            )}
          </div>
          you should now see &quot;Hello world&quot; in place of the webpage you saw previously. If you continue to see the webpage you saw previously you might
          have to refresh the page.
        </p>
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
      </ReactTooltip>
    </div>
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
