import React, { useState } from 'react';
import moment from 'moment';

import { FormControl, MenuItem, Select, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { makeStyles } from 'tss-react/mui';

import InfoHint from '../../common/info-hint';
import EnterpriseNotification from '../../common/enterpriseNotification';

const useStyles = makeStyles()(() => ({
  textField: { minWidth: 400 },
  infoStyle: { minWidth: 400, borderBottom: 'none' },
  pickerStyle: { marginBottom: 15, width: 'min-content' }
}));

const renderInput = params => <TextField {...params} style={{ minWidth: 400 }} />;

export const ScheduleRollout = ({ canSchedule, commonClasses, setDeploymentSettings, deploymentObject, open = false }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(open);
  const { classes } = useStyles();

  const { phases = [] } = deploymentObject;

  const handleStartTimeChange = value => {
    // if there is no existing phase, set phase and start time
    if (!phases.length) {
      setDeploymentSettings({ phases: [{ batch_size: 100, start_ts: value, delay: 0 }] });
    } else {
      //if there are existing phases, set the first phases to the new start time and adjust later phases in different function
      let newPhases = phases;
      newPhases[0].start_ts = value;
      setDeploymentSettings({ phases: newPhases });
    }
  };

  const handleStartChange = event => {
    // To be used with updated datetimepicker to open programmatically
    if (event.target.value) {
      setIsPickerOpen(true);
    } else {
      handleStartTimeChange();
    }
  };

  const start_time = phases.length ? phases[0].start_ts : undefined;

  const startTime = moment(start_time);
  return (
    <>
      <h4 className={`margin-bottom-none margin-top-none ${canSchedule ? '' : commonClasses.disabled}`}>Select a start time</h4>
      <div className={commonClasses.columns}>
        <FormControl className={classes.pickerStyle} disabled={!canSchedule}>
          <Select className={classes.textField} onChange={handleStartChange} value={start_time ? 'custom' : 0}>
            <MenuItem value={0}>Start immediately</MenuItem>
            <MenuItem value="custom">Schedule the start date &amp; time</MenuItem>
          </Select>
        </FormControl>
        <InfoHint content="This time is relative to the server only – each device’s time zone will not be taken into account. Devices across different time zones will receive the update at the same time." />
      </div>
      {Boolean(isPickerOpen || start_time) && (
        <FormControl className={`margin-top-none ${classes.pickerStyle}`} disabled={!canSchedule}>
          <DateTimePicker
            ampm={false}
            open={isPickerOpen}
            onOpen={() => setIsPickerOpen(true)}
            onClose={() => setIsPickerOpen(false)}
            label="Starting at"
            minDateTime={moment()}
            disabled={!canSchedule}
            onChange={date => handleStartTimeChange(date.toISOString())}
            renderInput={renderInput}
            value={startTime}
          />
        </FormControl>
      )}
      <EnterpriseNotification isEnterprise={canSchedule} benefit="scheduled deployments to steer the distribution of your updates" />
    </>
  );
};
