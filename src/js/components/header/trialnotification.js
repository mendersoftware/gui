import React from 'react';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon, Payment } from '@material-ui/icons';

const TrialNotification = () => {
  const { t } = useTranslation();
  return (
    <div id="trialVersion" className="flexbox centered">
      <a id="trial-info" data-tip data-for="trial-version" data-event="click focus" data-offset="{'bottom': 15, 'right': 60}">
        <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
        {t('trial.title')}
      </a>

      <ReactTooltip id="trial-version" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
        <h3>{t('trial.title')}</h3>
        <Trans
          i18nKey="trial.notification"
          components={{ internalLink: <Link to="/settings/upgrade" />, externalLink: <a href="https://mender.io/plans/pricing" target="_blank" /> }}
        />
      </ReactTooltip>

      <Button id="trial-upgrade-now" color="primary" component={Link} startIcon={<Payment />} to="/settings/upgrade">
        {t('help.upgrade.title')}
      </Button>
    </div>
  );
};

export default TrialNotification;
