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
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { withStyles } from 'tss-react/mui';

import { getDevicesByStatus } from '../../actions/deviceActions';
import { advanceOnboarding, setOnboardingComplete, setShowCreateArtifactDialog } from '../../actions/onboardingActions';
import { selectRelease } from '../../actions/releaseActions';
import * as DeviceConstants from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getDemoDeviceAddress } from '../../selectors';
import Tracking from '../../tracking';
import Loader from '../common/loader';
import { MenderTooltipClickable } from '../common/mendertooltip';

export const CompletionButton = withStyles(Button, ({ palette }) => ({
  root: {
    backgroundColor: palette.background.default,
    '&:hover': {
      backgroundColor: palette.background.default
    }
  }
}));

export const DeploymentCompleteTip = ({ anchor, targetUrl }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const url = useSelector(getDemoDeviceAddress) || targetUrl;

  useEffect(() => {
    dispatch(getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted));
    Tracking.event({ category: 'onboarding', action: onboardingSteps.DEPLOYMENTS_PAST_COMPLETED });
  }, [dispatch]);

  const onClick = () => {
    const parametrizedAddress = `${url}/index.html?source=${encodeURIComponent(window.location)}`;
    window.open(parametrizedAddress, '_blank');
    dispatch(selectRelease());
    dispatch(advanceOnboarding(onboardingSteps.DEPLOYMENTS_PAST_COMPLETED_FAILURE));
    dispatch(setOnboardingComplete(false));
    dispatch(setShowCreateArtifactDialog(true));
    navigate('/releases');
  };

  return (
    <MenderTooltipClickable
      className="tooltip onboard-icon onboard-tip"
      id={onboardingSteps.DEPLOYMENTS_PAST_COMPLETED}
      onboarding
      startOpen
      style={anchor}
      PopperProps={{ style: { marginLeft: -30, marginTop: -20 } }}
      title={
        <div className="content">
          <p>Fantastic! You completed your first deployment!</p>
          <p>Your deployment is finished and your device is now running the updated software!</p>
          <div className="flexbox centered">
            {!url ? <Loader show={true} /> : <CompletionButton variant="text" onClick={onClick}>{`Go to ${url}`}</CompletionButton>}
          </div>
          <p>and you should see the demo web application actually being run on the device.</p>
          <p>NOTE: if you have local network restrictions, you may need to check them if you have difficulty loading the page.</p>
          <a onClick={onClick}>Visit the web app running your device</a>
        </div>
      }
    >
      <CheckCircleIcon />
    </MenderTooltipClickable>
  );
};

export default DeploymentCompleteTip;
