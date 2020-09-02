import React from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Trans, useTranslation } from 'react-i18next';

// material ui
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';

const DeviceNotifications = ({ total, limit, pending }) => {
  const approaching = limit && total / limit > 0.8;
  const warning = limit && limit <= total;
  const { t } = useTranslation();
  return (
    <div>
      <div id="limit" data-tip data-for="limit-tip" data-offset="{'bottom': 0, 'right': 0}" data-tip-disable={!limit}>
        <ReactTooltip
          id="limit-tip"
          globalEventOff="click"
          place="bottom"
          type="light"
          effect="solid"
          delayHide={500}
          className="react-tooltip"
          disabled={!limit}
        >
          <Trans
            i18nKey="devices.limitNotification"
            delta={limit - total}
            limitStatus={approaching || warning ? { context: approaching ? 'approaching' : 'reached' } : {}}
            components={{ supportMailLink: <a href="mailto:support@mender.io" />, externalLink: <a href="https://mender.io/pricing" target="_blank" /> }}
          />
        </ReactTooltip>

        <div className="header-section">
          <Link to="/devices" className={warning ? 'warning inline' : approaching ? 'approaching inline' : 'inline'}>
            <span>{total.toLocaleString()}</span>
            {limit ? <span>/{limit.toLocaleString()}</span> : null}
            <DeveloperBoardIcon style={{ margin: '0 7px 0 10px', fontSize: '20px' }} />
          </Link>

          {pending ? (
            <Link to="/devices/pending" style={{ marginLeft: '7px' }} className={limit && limit < pending + total ? 'warning' : null}>
              {t('devices.pending.counter', { count: pending })}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default DeviceNotifications;
