import React, { memo, useEffect, useState } from 'react';
import moment from 'moment';

import { TextField } from '@mui/material';
import { DatePicker } from '@mui/lab';

const pickerStyle = { width: 160, margin: 7.5, marginTop: 0 };

const renderInput = params => <TextField {...params} />;

export const TimeframePicker = ({ classNames, onChange, ...props }) => {
  const [tonight, setTonight] = useState(moment(props.tonight));
  const [endDate, setEndDate] = useState(moment(props.endDate));
  const [startDate, setStartDate] = useState(moment(props.startDate));

  useEffect(() => {
    setTonight(moment(props.tonight));
    setEndDate(moment(props.endDate));
    setStartDate(moment(props.startDate));
  }, [props.tonight, props.endDate, props.startDate]);

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
    <div className={classNames}>
      <DatePicker
        onChange={handleChangeStartDate}
        label="From"
        value={startDate}
        maxDate={props.endDate ? endDate : tonight}
        renderInput={renderInput}
        style={pickerStyle}
      />
      <DatePicker onChange={handleChangeEndDate} label="To" value={endDate} maxDate={tonight} renderInput={renderInput} style={pickerStyle} />
    </div>
  );
};

const areEqual = (prevProps, nextProps) => {
  return !(prevProps.classNames != nextProps.classNames || prevProps.endDate != nextProps.endDate || prevProps.startDate != nextProps.startDate);
};

export default memo(TimeframePicker, areEqual);
