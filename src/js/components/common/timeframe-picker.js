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
import React, { memo, useEffect, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import moment from 'moment';

export const TimeframePicker = ({ onChange, disabled = false, endDate: propsEndDate, startDate: propsStartDate, tonight: propsTonight }) => {
  const [tonight] = useState(moment().endOf('day'));
  const [endDate, setEndDate] = useState(moment(propsEndDate) > tonight ? tonight : moment(propsEndDate));
  const [startDate, setStartDate] = useState(moment(propsStartDate));

  useEffect(() => {
    setEndDate(moment(propsEndDate) > tonight ? tonight : moment(propsEndDate));
    setStartDate(moment(propsStartDate));
  }, [propsTonight, propsEndDate, propsStartDate, tonight]);

  const handleChangeStartDate = date => {
    let currentEndDate = endDate.clone();
    if (date > currentEndDate) {
      currentEndDate = date;
      currentEndDate.endOf('day');
    }
    date.startOf('day');
    onChange(date.toISOString(), currentEndDate.toISOString());
  };

  const handleChangeEndDate = date => {
    let currentStartDate = startDate.clone();
    if (date < currentStartDate) {
      currentStartDate = date;
      currentStartDate.startOf('day');
    }
    date.endOf('day');
    onChange(currentStartDate.toISOString(), date.toISOString());
  };

  return (
    <>
      <DatePicker
        disabled={disabled}
        format="MMMM Do"
        label="From"
        maxDate={propsEndDate ? endDate : tonight}
        onChange={handleChangeStartDate}
        value={startDate}
      />
      <DatePicker
        className="margin-left-small"
        disabled={disabled}
        format="MMMM Do"
        label="To"
        maxDate={tonight}
        onChange={handleChangeEndDate}
        value={endDate}
      />
    </>
  );
};

const areEqual = (prevProps, nextProps) => {
  return !(prevProps.endDate != nextProps.endDate || prevProps.startDate != nextProps.startDate);
};

export default memo(TimeframePicker, areEqual);
