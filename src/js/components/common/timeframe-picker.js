import React, { memo } from 'react';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import MomentUtils from '@date-io/moment';

const pickerStyle = { width: 160, margin: 7.5, marginTop: 0 };

export const TimeframePicker = ({ classNames, endDate, onChange, startDate, tonight }) => {
  const handleChangeStartDate = date => {
    let currentEndDate = moment(endDate);
    if (date > currentEndDate) {
      currentEndDate = date;
      currentEndDate.endOf('day');
    }
    date.startOf('day');
    onChange(date.toISOString(), currentEndDate.toISOString());
  };

  const handleChangeEndDate = date => {
    let currentStartDate = moment(startDate);
    if (date < currentStartDate) {
      currentStartDate = date;
      currentStartDate.startOf('day');
    }
    date.endOf('day');
    onChange(currentStartDate.toISOString(), date.toISOString());
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
