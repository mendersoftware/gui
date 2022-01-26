import React from 'react';
import Time from 'react-time';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

import { ArrowRightAlt as ArrowRightAltIcon } from '@mui/icons-material';
import preauthImage from '../../../assets/img/preauthorize.png';

import DeviceStatus from './device-status';
import RelativeTime from '../common/relative-time';

export const RelativeDeviceTime = device => <RelativeTime updateTime={device.updated_ts} />;
export const DeviceStatusHeading = device => <DeviceStatus device={device} />;
export const DeviceCreationTime = device => (device.created_ts ? <Time value={device.created_ts} format="YYYY-MM-DD HH:mm" /> : '-');
export const DeviceExpansion = () => (
  <div className="bold flexbox center-aligned link-color margin-right-small uppercased" style={{ whiteSpace: 'nowrap' }}>
    view details <ArrowRightAltIcon />
  </div>
);

export const AcceptedEmptyState = ({ allCount }) => (
  <div className="dashboard-placeholder">
    <p>No devices found</p>
    {!allCount && (
      <>
        <p>No devices have been authorized to connect to the Mender server yet.</p>
        <p>
          Visit the <Link to="/help/get-started">Help section</Link> to learn how to connect devices to the Mender server.
        </p>
      </>
    )}
  </div>
);

export const PreauthorizedEmptyState = ({ limitMaxed, onClick }) => (
  <div className="dashboard-placeholder">
    <p>There are no preauthorized devices.</p>
    <p>
      {limitMaxed ? 'Preauthorize devices' : <a onClick={onClick}>Preauthorize devices</a>} so that when they come online, they will connect to the server
      immediately
    </p>
    <img src={preauthImage} alt="preauthorize" />
  </div>
);

export const PendingEmptyState = ({ filters, highlightHelp }) => (
  <div className="dashboard-placeholder">
    <p>
      {filters.length
        ? `There are no pending devices matching the selected ${pluralize('filters', filters.length)}`
        : 'There are no devices pending authorization'}
    </p>
    {highlightHelp ? (
      <p>
        Visit the <Link to="/help/get-started">Help section</Link> to learn how to connect devices to the Mender server.
      </p>
    ) : null}
  </div>
);

export const RejectedEmptyState = ({ filters }) => (
  <div className="dashboard-placeholder">
    <p>{filters.length ? `There are no rejected devices matching the selected ${pluralize('filters', filters.length)}` : 'There are no rejected devices'}</p>
  </div>
);
