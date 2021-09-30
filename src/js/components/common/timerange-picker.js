import React, { useEffect, useState } from 'react';

const timeranges = {
  today: { start: 0, end: 0, title: 'Today' },
  yesterday: { start: 1, end: 1, title: 'Yesterday' },
  week: { start: 6, end: 0, title: 'Last 7 days' },
  month: { start: 29, end: 0, title: 'Last 30 days' }
};

export const TimerangePicker = ({ classNames = '', endDate, onChange, startDate }) => {
  const [active, setActive] = useState();

  useEffect(() => {
    if (!(endDate || startDate)) {
      setActive();
      return;
    }
    const currentRange = Object.entries(timeranges).reduce((accu, [key, range]) => {
      let rangeEndDate = new Date();
      rangeEndDate.setDate(rangeEndDate.getDate() - (range.end || 0));
      rangeEndDate.setHours(23, 59, 59, 999);
      let rangeStartDate = new Date();
      rangeStartDate.setDate(rangeStartDate.getDate() - (range.start || 0));
      rangeStartDate.setHours(0, 0, 0, 0);
      if (startDate == rangeStartDate.toISOString() && endDate == rangeEndDate.toISOString()) {
        return key;
      }
      return accu;
    }, undefined);
    setActive(currentRange);
  }, [endDate, startDate]);

  useEffect(() => {
    if (!(endDate && startDate)) {
      setActive(Object.keys(timeranges)[0]);
    }
  }, []);

  const setRange = (after, before) => {
    let newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() - (after || 0));
    newStartDate.setHours(0, 0, 0, 0);
    let newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() - (before || 0));
    newEndDate.setHours(23, 59, 59, 999);
    onChange(newStartDate.toISOString(), newEndDate.toISOString());
  };

  return (
    <div className={classNames}>
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
  );
};

export default TimerangePicker;
