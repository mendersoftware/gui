// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';

import { Tooltip } from '@mui/material';

import moment from 'moment';
import pluralize from 'pluralize';

const defaultDateFormat = 'YYYY-MM-DD';
const defaultTimeFormat = `${defaultDateFormat} HH:mm`;

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

export const MaybeTime = ({ className = '', value, ...remainingProps }) =>
  value ? <Time value={value} {...remainingProps} /> : <div className={className}>-</div>;

const cutoff = -5 * 60;
export const RelativeTime = ({ className, shouldCount = 'both', updateTime }) => {
  const [updatedTime, setUpdatedTime] = useState();

  useEffect(() => {
    if (updateTime !== updatedTime) {
      setUpdatedTime(moment(updateTime));
    }
  }, [updateTime]);

  let timeDisplay = <MaybeTime className={className} value={updatedTime} />;
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

const cutoffDays = 14;
export const ApproximateRelativeDate = ({ className, updateTime }) => {
  const [updatedTime, setUpdatedTime] = useState();

  useEffect(() => {
    if (updateTime !== updatedTime) {
      setUpdatedTime(moment(updateTime, defaultDateFormat));
    }
  }, [updateTime]);

  const diff = updatedTime ? Math.abs(updatedTime.diff(moment(), 'days')) : 0;
  if (updatedTime && diff <= cutoffDays) {
    return (
      <time className={className} dateTime={updatedTime.format(defaultDateFormat)}>
        {diff !== 0 ? `${diff} ${pluralize('day', diff)} ago` : 'today'}
      </time>
    );
  }
  return <MaybeTime className={className} value={updatedTime} format={defaultDateFormat} titleFormat={defaultDateFormat} />;
};

export default Time;
