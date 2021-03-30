import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';

import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

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
    loading: 'Removing...',
    message: 'Remove this chart?'
  },
  decommissioning: {
    loading: 'Decommissioning...',
    message: 'Decommission this device and remove all of its data from the server. This cannot be undone. Are you sure?'
  }
};

export const Confirm = ({ action, cancel, classes = '', style, type }) => {
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

  return (
    <div className={`flexbox ${className} ${classes}`} style={{ marginRight: '12px', justifyContent: 'flex-end', alignItems: 'center', ...style }}>
      <span className="bold">{loading ? confirmationType[type].loading : confirmationType[type].message}</span>
      <IconButton id="confirmAbort" onClick={handleConfirm}>
        <CheckCircleIcon className="green" />
      </IconButton>
      <IconButton onClick={handleCancel}>
        <CancelIcon className="red" />
      </IconButton>
    </div>
  );
};

export default Confirm;
