import React from 'react';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

// material ui
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';

const DeviceNotifications = ({ total, limit, pending }) => {
  const approaching = limit && total / limit > 0.8;
  const warning = limit && limit <= total;
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
          <h3>Device limit</h3>
          {approaching || warning ? (
            <p>You {approaching ? <span>have reached</span> : <span>are nearing</span>} your device limit.</p>
          ) : (
            <p>
              You can still connect another {(limit - total).toLocaleString()} {pluralize('devices', limit - total)}.
            </p>
          )}
          <p>
            Contact us by email at <a href="mailto:support@mender.io">support@mender.io</a> to request a higher limit.
          </p>
          <p>There is no fee for a higher limit; the purpose of the limit is to allow us to plan capacity for scaling Hosted Mender.</p>
          <p>
            Billing is based on your usage only. See{' '}
            <a href="https://mender.io/pricing" target="_blank">
              pricing
            </a>{' '}
            for an overview.
          </p>
        </ReactTooltip>

        <div className="header-section">
          <Link to="/devices" className={warning ? 'warning inline' : approaching ? 'approaching inline' : 'inline'}>
            <span>{total.toLocaleString()}</span>
            {limit ? <span>/{limit.toLocaleString()}</span> : null}

            <DeveloperBoardIcon style={{ margin: '0 7px 0 10px', fontSize: '20px' }} />
          </Link>

          {pending ? (
            <Link to="/devices/pending" style={{ marginLeft: '7px' }} className={limit && limit < pending + total ? 'warning' : null}>
              {pending.toLocaleString()} pending
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default DeviceNotifications;
