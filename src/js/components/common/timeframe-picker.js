import React, { memo } from 'react';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

const pickerStyle = { width: 160, margin: 7.5, marginTop: 0 };

export const TimeframePicker = ({ classNames, endDate, onChange, startDate, tonight }) => {
  const handleChangeStartDate = date => {
    let currentEndDate = endDate;
    if (date > currentEndDate) {
      currentEndDate = date;
      currentEndDate._isAMomentObject ? currentEndDate.endOf('day') : currentEndDate.setHours(23, 59, 59);
    }
    date._isAMomentObject ? date.startOf('day') : date.setHours(0, 0, 0, 0);
    onChange(date, currentEndDate);
  };

  const handleChangeEndDate = date => {
    let currentStartDate = startDate;
    if (date < currentStartDate) {
      currentStartDate = date;
      currentStartDate._isAMomentObject ? currentStartDate.startOf('day') : currentStartDate.setHours(0, 0, 0, 0);
    }
    date._isAMomentObject ? date.endOf('day') : date.setHours(23, 59, 59);
    onChange(currentStartDate, date);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils} className={classNames}>
      <DatePicker
        variant="inline"
        onChange={handleChangeStartDate}
        autoOk={true}
        label="From"
        value={startDate}
        maxDate={endDate || tonight}
        style={pickerStyle}
      />
      <DatePicker variant="inline" onChange={handleChangeEndDate} autoOk={true} label="To" value={endDate} maxDate={tonight} style={pickerStyle} />
    </MuiPickersUtilsProvider>
  );
};

const areEqual = (prevProps, nextProps) => {
  return !(prevProps.classNames != nextProps.classNames || prevProps.endDate != nextProps.endDate || prevProps.startDate != nextProps.startDate);
};

export default memo(TimeframePicker, areEqual);
