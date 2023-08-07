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

export const TimeframePicker = ({ onChange, ...props }) => {
  const [tonight] = useState(moment().endOf('day'));
  const [endDate, setEndDate] = useState(moment(props.endDate) > tonight ? tonight : moment(props.endDate));
  const [startDate, setStartDate] = useState(moment(props.startDate));

  useEffect(() => {
    setEndDate(moment(props.endDate) > tonight ? tonight : moment(props.endDate));
    setStartDate(moment(props.startDate));
  }, [props.tonight, props.endDate, props.startDate, tonight]);

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
      <DatePicker onChange={handleChangeStartDate} label="From" format="MMMM Do" value={startDate} maxDate={props.endDate ? endDate : tonight} />
      <DatePicker className="margin-left-small" onChange={handleChangeEndDate} label="To" format="MMMM Do" value={endDate} maxDate={tonight} />
    </>
  );
};

const areEqual = (prevProps, nextProps) => {
  return !(prevProps.endDate != nextProps.endDate || prevProps.startDate != nextProps.startDate);
};

export default memo(TimeframePicker, areEqual);
