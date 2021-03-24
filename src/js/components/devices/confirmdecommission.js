import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { Cancel as CancelIcon, CheckCircle as CheckCircleIcon } from '@material-ui/icons';

import Loader from '../common/loader';

export const ConfirmDecommission = ({ cancel, decommission }) => {
  const [className, setClassName] = useState('fadeIn');
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setClassName('fadeOut');
    cancel();
  };
  const handleDecommission = () => {
    setLoading(true);
    decommission();
  };

  return (
    <div className={className} style={{ marginRight: '12px' }}>
      <div className="float-right">
        <span className="bold">
          {loading ? 'Decommissioning ' : 'Decommission this device and remove all of its data from the server. This cannot be undone. Are you sure?'}
        </span>

        {loading ? (
          <Loader table={true} waiting={true} show={true} style={{ height: '4px', marginLeft: '20px' }} />
        ) : (
          <div className="inline-block">
            <IconButton id="ConfirmDecommission" onClick={handleDecommission}>
              <CheckCircleIcon className="green" />
            </IconButton>
            <IconButton id="cancelDecommission" onClick={handleCancel}>
              <CancelIcon className="red" />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmDecommission;
