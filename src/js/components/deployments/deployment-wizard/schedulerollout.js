import React, { useState } from 'react';

import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, InputLabel, ListSubheader, MenuItem, Select, Tooltip } from '@material-ui/core';
import { InfoOutlined as InfoIcon } from '@material-ui/icons';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import PhaseSettings from './phasesettings';
import EnterpriseNotification from '../../common/enterpriseNotification';

const styles = {
  textField: {
    minWidth: 400
  },
  infoStyle: {
    minWidth: 400,
    borderBottom: 'none'
  }
};

export const ScheduleRollout = props => {
  const { setDeploymentSettings, deploymentObject = {}, disableSchedule, filterId, isEnterprise, plan, previousPhases = [] } = props;

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { deploymentDeviceCount = 0, deploymentDeviceIds = [], phases = [] } = deploymentObject;

  const handleStartTimeChange = value => {
    // if there is no existing phase, set phase and start time
    if (!phases.length) {
      setDeploymentSettings({ ...deploymentObject, phases: [{ batch_size: 100, start_ts: value, delay: 0 }] });
    } else {
      //if there are existing phases, set the first phases to the new start time and adjust later phases in different function
      let newPhases = phases;
      newPhases[0].start_ts = value;
      setDeploymentSettings({ ...deploymentObject, phases: newPhases });
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

  const handlePatternChange = ({ target: { value } }) => {
    let updatedPhases = [];
    // check if a start time already exists from props and if so, use it
    const phaseStart = phases.length ? { start_ts: phases[0].start_ts } : {};
    // if setting new custom pattern we use default 2 phases
    // for small groups get minimum batch size containing at least 1 device
    const minBatch = deploymentDeviceCount < 10 && !filterId ? Math.ceil((1 / deploymentDeviceCount) * 100) : 10;
    switch (value) {
      case 0:
        updatedPhases = [{ batch_size: 100, ...phaseStart }];
        break;
      case 1:
        updatedPhases = [{ batch_size: minBatch, delay: 2, delayUnit: 'hours', ...phaseStart }, {}];
        break;
      default:
        // have to create a deep copy of the array to prevent overwriting, due to nested objects in the array
        updatedPhases = JSON.parse(JSON.stringify(value));
        break;
    }
    setDeploymentSettings({ ...deploymentObject, phases: updatedPhases });
  };

  const numberDevices = deploymentDeviceCount ? deploymentDeviceCount : deploymentDeviceIds ? deploymentDeviceIds.length : 0;
  const start_time = phases && phases.length ? phases[0].start_ts : null;
  const customPattern = phases && phases.length > 1 ? 1 : 0;

  const previousPhaseOptions =
    previousPhases.length > 0
      ? previousPhases.map((previousPhaseSetting, index) => (
          <MenuItem key={`previousPhaseSetting-${index}`} value={previousPhaseSetting}>
            {previousPhaseSetting.reduce((accu, phase) => {
              const phaseDescription = phase.delay ? `${phase.batch_size}% > ${phase.delay} ${phase.delayUnit || 'hours'} >` : `${phase.batch_size}%`;
              return `${accu} ${phaseDescription}`;
            }, `${previousPhaseSetting.length} phases:`)}
          </MenuItem>
        ))
      : [
          <MenuItem key="noPreviousPhaseSetting" disabled={true} style={{ opacity: '0.4' }}>
            No recent patterns
          </MenuItem>
        ];

  const deploymentTimeNotification = (
    <Tooltip
      title="This time is relative to the server only – each device’s time zone will not be taken into account. Devices across different time zones will receive the update at the same time."
      placement="top"
    >
      <InfoIcon className="fadeIn" fontSize="small" />
    </Tooltip>
  );

  const canSchedule = isEnterprise || plan === 'professional';
  return (
    <form className="flexbox column margin-top-small" style={{ overflow: 'visible', minHeight: '300px' }}>
      <div className="deployment-scheduling-view">
        <FormControl style={{ width: 'min-content', marginBottom: isPickerOpen || start_time ? 0 : 30 }}>
          <InputLabel>Set a start time</InputLabel>
          <Select onChange={handleStartChange} value={start_time ? 'custom' : 0} style={styles.textField}>
            <MenuItem value={0}>Start immediately</MenuItem>
            <MenuItem value="custom">Schedule the start date &amp; time</MenuItem>
          </Select>
        </FormControl>
        <div />
        {isPickerOpen || start_time ? (
          <>
            <FormControl className="margin-bottom" style={{ width: 'min-content' }}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <DateTimePicker
                  ampm={false}
                  open={isPickerOpen}
                  onOpen={() => setIsPickerOpen(true)}
                  onClose={() => setIsPickerOpen(false)}
                  label={canSchedule ? 'Set the start time' : 'Starting at'}
                  value={start_time}
                  style={styles.textField}
                  minDate={new Date()}
                  disabled={!canSchedule}
                  onChange={date => handleStartTimeChange(date.toISOString())}
                />
              </MuiPickersUtilsProvider>
            </FormControl>
            {deploymentTimeNotification}
          </>
        ) : null}
        <FormControl className="margin-bottom" style={{ width: 400 }}>
          <FormGroup row>
            <InputLabel>Retries</InputLabel>
            <Select className="margin-right" onChange={e => setDeploymentSettings(e.target.value, 'retries')} value={currentRetries} style={{ width: 150 }}>
              <MenuItem value={0}>Don&apos;t retry</MenuItem>
              {[1, 2, 3].map(value => (
                <MenuItem key={`retries-option-${value}`} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={<Checkbox checked={hasNewRetryDefault} onChange={(e, checked) => onSaveRetriesSetting(checked)} />}
              label="Save as default"
              style={{ marginTop: 0, marginBottom: -15 }}
            />
          </FormGroup>
          <FormHelperText>Number of times a device will retry the update if it fails</FormHelperText>
        </FormControl>
        <div />
        <FormControl style={{ maxWidth: 515, width: 'min-content' }}>
          <InputLabel>Select a rollout pattern</InputLabel>
          <Select onChange={handlePatternChange} value={customPattern} style={styles.textField} disabled={!isEnterprise || plan !== 'enterprise'}>
            <MenuItem value={0}>Single phase: 100%</MenuItem>
            {(numberDevices > 1 || filterId) && [
              <MenuItem key="customPhaseSetting" divider={true} value={1}>
                Custom
              </MenuItem>,
              <ListSubheader key="phaseSettingsSubheader">Recent patterns</ListSubheader>,
              ...previousPhaseOptions
            ]}
          </Select>
        </FormControl>
        {customPattern ? deploymentTimeNotification : <div />}
      </div>
      <EnterpriseNotification isEnterprise={isEnterprise} benefit="choose to roll out deployments in multiple phases" />
      {customPattern ? <PhaseSettings classNames="margin-bottom-small" disabled={disableSchedule} numberDevices={numberDevices} {...props} /> : null}
    </form>
  );
};

export default ScheduleRollout;
