import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const defaultRemoving = 'Removing...';

const confirmationType = {
  retry: {
    loading: 'Creating new deployment...',
    message: 'Confirm retry?'
  },
  abort: {
    loading: 'Aborting...',
    message: 'Confirm abort?'
  },
  chartRemoval: {
    loading: defaultRemoving,
    message: 'Remove this chart?'
  },
  decommissioning: {
    loading: 'Decommissioning...',
    message: 'Decommission this device and remove all of its data from the server. This cannot be undone. Are you sure?'
  },
  deploymentContinuation: {
    loading: 'Continuing...',
    message: 'All devices with no errors will continue to the next step of the updates. Confirm continue?'
  },
  deploymentAbort: {
    loading: 'Aborting...',
    message: 'This will abort the deployment and attempt to roll back all devices. Confirm abort?'
  },
  integrationRemoval: {
    loading: defaultRemoving,
    message: 'Remove the ingration. Are you sure?'
  },
  webhooksRemoval: {
    loading: defaultRemoving,
    message: 'Delete all webhooks?'
  }
};

export const Confirm = ({ action, cancel, classes = '', message = '', style = {}, type }) => {
  const [className, setClassName] = useState('fadeIn');
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setClassName('fadeOut');
    cancel();
  };
  const handleConfirm = () => {
    setLoading(true);
    action();
  };

  let notification = message;
  if (confirmationType[type]) {
    notification = loading ? confirmationType[type].loading : confirmationType[type].message;
  }
  return (
    <div className={`flexbox center-aligned ${className} ${classes}`} style={{ marginRight: '12px', justifyContent: 'flex-end', ...style }}>
      <span className="bold">{notification}</span>
      <IconButton id="confirmAbort" onClick={handleConfirm} size="large">
        <CheckCircleIcon className="green" />
      </IconButton>
      <IconButton onClick={handleCancel} size="large">
        <CancelIcon className="red" />
      </IconButton>
    </div>
  );
};

export default Confirm;
