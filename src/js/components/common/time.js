import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { Tooltip } from '@mui/material';

const defaultTimeFormat = 'YYYY-MM-DD HH:mm';

// based on react-time - https://github.com/andreypopp/react-time - which unfortunately is no longer maintained

export const Time = ({ value, relative, format = defaultTimeFormat, valueFormat, titleFormat = defaultTimeFormat, Component = 'time', ...remainingProps }) => {
  if (!value) {
    value = moment();
  }
  value = moment(value, valueFormat, true);

  const machineReadable = value.format('YYYY-MM-DDTHH:mm:ssZ');
  const humanReadable = relative ? value.fromNow() : value.format(format);
  return (
    <Component title={relative ? value.format(titleFormat) : null} {...remainingProps} dateTime={machineReadable}>
      {humanReadable}
    </Component>
  );
};

const cutoff = -5 * 60;
export const RelativeTime = ({ className, shouldCount = 'both', updateTime }) => {
  const [updatedTime, setUpdatedTime] = useState();

  useEffect(() => {
    if (updateTime !== updatedTime) {
      setUpdatedTime(moment(updateTime));
    }
  }, [updateTime]);

  let timeDisplay = updatedTime ? <Time className={className} value={updatedTime} /> : <div className={className}>-</div>;
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
    <Tooltip title={updatedTime ? updatedTime.toLocaleString() : ''} arrow enterDelay={500}>
      <span>{timeDisplay}</span>
    </Tooltip>
  );
};

export default Time;
