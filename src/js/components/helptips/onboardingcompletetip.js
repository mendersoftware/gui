// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Button } from '@mui/material';

import { bindActionCreators } from 'redux';

import { getDeviceById, getDevicesByStatus } from '../../actions/deviceActions';
import { setOnboardingComplete } from '../../actions/onboardingActions';
import * as DeviceConstants from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDemoDeviceAddress, getDocsVersion } from '../../selectors';
import Loader from '../common/loader';
import { MenderTooltipClickable } from '../common/mendertooltip';
import { CompletionButton } from './deploymentcompletetip';

export const OnboardingCompleteTip = ({ anchor, docsVersion, getDeviceById, getDevicesByStatus, setOnboardingComplete, url }) => {
  const timer = useRef();
  useEffect(() => {
    getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted)
      .then(tasks => {
        return Promise.all(tasks[tasks.length - 1].deviceAccu.ids.map(getDeviceById));
      })
      .finally(() => {
        timer.current = setTimeout(() => setOnboardingComplete(true), 120000);
      });
    return () => {
      setOnboardingComplete(true);
      clearTimeout(timer.current);
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
                <a href={`https://docs.mender.io/${docsVersion}get-started/deploy-an-operating-system-update`} target="_blank" rel="noopener noreferrer">
                  Deploy an operating system update
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
