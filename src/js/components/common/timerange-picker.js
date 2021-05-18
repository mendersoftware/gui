import React, { useEffect, useState } from 'react';

const timeranges = {
  today: { start: 0, end: 0, title: 'Today' },
  yesterday: { start: 1, end: 1, title: 'Yesterday' },
  week: { start: 6, end: 0, title: 'Last 7 days' },
  month: { start: 29, end: 0, title: 'Last 30 days' }
};

export const TimerangePicker = ({ classNames = '', onChange, reset, toggleActive }) => {
  const [active, setActive] = useState(Object.keys(timeranges)[0]);

  useEffect(() => {
    setActive(Object.keys(timeranges)[0]);
  }, [reset]);

  useEffect(() => {
    if (toggleActive === undefined) {
      return;
    }
    setActive();
  }, [toggleActive]);

  const setRange = (after, before, key) => {
    let newStartDate = new Date();
    newStartDate.setDate(newStartDate.getDate() - (after || 0));
    newStartDate.setHours(0, 0, 0, 0);
    let newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() - (before || 0));
    newEndDate.setHours(23, 59, 59, 999);
    setActive(key);
    onChange(newStartDate, newEndDate);
  };

  return (
    <div className={classNames}>
      <span>Filter by date</span>
      <ul className="unstyled link-list horizontal">
        {Object.entries(timeranges).map(([key, range]) => (
          <li key={`filter-by-${key}`}>
            <a className={active === key ? 'active' : ''} onClick={() => setRange(range.start, range.end, key)}>
              {range.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimerangePicker;
