import React from 'react';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';

import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon, Payment } from '@material-ui/icons';

const TrialNotification = () => (
  <div id="trialVersion" className="flexbox centered">
    <a id="trial-info" data-tip data-for="trial-version" data-event="click focus" data-offset="{'bottom': 15, 'right': 60}">
      <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
      Trial version
    </a>

    <ReactTooltip id="trial-version" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <h3>Trial version</h3>
      <p>You&apos;re using the trial version of Mender – it&apos;s free for up to 10 devices for 12 months.</p>
      <p>
        <Link to="/settings/upgrade">Upgrade to a plan</Link> to add more devices and continue using Mender after the trial expires.
      </p>
      <p>
        Or compare the plans at{' '}
        <a href={`https://mender.io/plans/pricing`} target="_blank">
          mender.io/plans/pricing
        </a>
        .
      </p>
    </ReactTooltip>

    <Button id="trial-upgrade-now" color="primary" component={Link} startIcon={<Payment />} to="/settings/upgrade">
      Upgrade now
    </Button>
  </div>
);

export default TrialNotification;
