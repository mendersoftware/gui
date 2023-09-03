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

import { getISOStringBoundaries } from '../../helpers';
import ClickFilter from './forms/clickfilter';

const timeranges = {
  today: { start: 0, end: 0, title: 'Today' },
  yesterday: { start: 1, end: 1, title: 'Yesterday' },
  week: { start: 6, end: 0, title: 'Last 7 days' },
  month: { start: 29, end: 0, title: 'Last 30 days' }
};

export const TimerangePicker = ({ classNames = '', disabled = false, endDate, onChange, startDate }) => {
  const [active, setActive] = useState();

  useEffect(() => {
    if (!(endDate && startDate)) {
      setActive(Object.keys(timeranges)[0]);
      return;
    }
    if (!(endDate || startDate)) {
      setActive();
      return;
    }
    const currentRange = Object.entries(timeranges).reduce((accu, [key, range]) => {
      let rangeEndDate = new Date();
      rangeEndDate.setDate(rangeEndDate.getDate() - (range.end || 0));
      const { end } = getISOStringBoundaries(rangeEndDate);
      let rangeStartDate = new Date();
      rangeStartDate.setDate(rangeStartDate.getDate() - (range.start || 0));
      const { start } = getISOStringBoundaries(rangeStartDate);
      if (startDate == start && endDate == end) {
        return key;
      }
      return accu;
    }, undefined);
    setActive(currentRange);
  }, [endDate, startDate]);

  const setRange = (after, before) => {
    let newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() - (after || 0));
    const { start } = getISOStringBoundaries(newStartDate);
    let newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() - (before || 0));
    const { end } = getISOStringBoundaries(newEndDate);
    onChange(start, end);
  };

  return (
    <ClickFilter disabled={disabled}>
      <div className={`${classNames} ${disabled ? 'muted' : ''}`}>
        <span>Filter by date</span>
        <ul className="unstyled link-list horizontal">
          {Object.entries(timeranges).map(([key, range]) => (
            <li key={`filter-by-${key}`}>
              <a className={active === key ? 'active' : ''} onClick={() => setRange(range.start, range.end)}>
                {range.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ClickFilter>
  );
};

export default TimerangePicker;
