import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon, Payment } from '@material-ui/icons';
import pluralize from 'pluralize';
import { MenderTooltipClickable } from '../common/mendertooltip';

momentDurationFormatSetup(moment);

const today = new Date();

const TrialInformation = () => (
  <>
    <h3>Trial plan</h3>
    <p>You&apos;re using the trial version of Mender – it&apos;s free for up to 10 devices for 12 months.</p>
    <p>
      <Link to="/settings/upgrade">Upgrade to a plan</Link> to add more devices and continue using Mender after the trial expires.
    </p>
    <p>
      Or compare the plans at{' '}
      <a href={`https://mender.io/plans/pricing`} target="_blank" rel="noopener noreferrer">
        mender.io/plans/pricing
      </a>
      .
    </p>
  </>
);

const TrialNotification = ({ expiration }) => {
  const expirationDate = moment(expiration);
  const duration = moment.duration(expirationDate.diff(moment(today)));
  const daysLeft = Math.floor(duration.asDays());
  return (
    <div id="trialVersion" className="flexbox centered">
      <MenderTooltipClickable disableHoverListener={false} title={<TrialInformation />}>
        <div className="muted margin-right-small">
          <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
          Trial plan
        </div>
      </MenderTooltipClickable>
      <Button id="trial-upgrade-now" color="primary" component={Link} startIcon={<Payment />} to="/settings/upgrade">
        Upgrade now
      </Button>

      {expiration && daysLeft <= 100 && daysLeft >= 0 && (
        <div className="muted">
          You have {daysLeft} {pluralize('day', daysLeft)} remaining on the trial plan
        </div>
      )}
    </div>
  );
};

export default TrialNotification;
