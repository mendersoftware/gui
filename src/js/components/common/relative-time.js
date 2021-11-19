import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Time from 'react-time';
import { Tooltip } from '@material-ui/core';

const cutoff = -5 * 60;

export const RelativeTime = ({ className, shouldCount = 'both', updateTime }) => {
  const [updatedTime, setUpdatedTime] = useState();

  useEffect(() => {
    if (updateTime !== updatedTime) {
      setUpdatedTime(moment(updateTime));
    }
  }, [updateTime]);

  let timeDisplay = updatedTime ? <Time className={className} value={updatedTime} format="YYYY-MM-DD HH:mm" /> : <div className={className}>-</div>;
  const diffSeconds = updatedTime ? updatedTime.diff(moment(), 'seconds') : 0;
  if (
    updatedTime &&
    diffSeconds > cutoff &&
    (shouldCount === 'both' || (shouldCount === 'up' && diffSeconds > 0) || (shouldCount === 'down' && diffSeconds < 0))
  ) {
    timeDisplay = (
      <time className={className} dateTime={updatedTime}>
        {updatedTime.fromNow()}
      </time>
    );
  }
  return (
    <Tooltip title={updatedTime ? updatedTime.toLocaleString() : ''} arrow={true} enterDelay={500}>
      {timeDisplay}
    </Tooltip>
  );
};

export default RelativeTime;
