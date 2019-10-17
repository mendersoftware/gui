import React from 'react';
import moment from 'moment';

import { FormControl, Grid, InputLabel, ListSubheader, MenuItem, RootRef, Select } from '@material-ui/core';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import PhaseSettings from './phasesettings';
import AppStore from '../../../stores/app-store';

export default class ScheduleRollout extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: false,
      isPhasesOpen: false,
      isPickerOpen: false,
      pattern: '',
      previousPhases: AppStore.getGlobalSettings().previousPhases || []
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.start_time !== this.props.start_time) {
      this.setState({ start_time: this.props.start_time });
    }
  }

  deploymentSettingsUpdate(value, property) {
    this.setState({ [property]: value });
    this.props.deploymentSettings(value, property);
  }

  handleStartTimeChange(value) {
    const self = this;
    // if there is no existing phase, set phase and start time
    if (!self.props.phases) {
      self.props.deploymentSettings([{ batch_size: 100, start_ts: value, delay: 0 }], 'phases');
    } else {
      //if there are existing phases, set the first phases to the new start time and adjust later phases in different function
      let newPhases = this.props.phases;
      newPhases[0].start_ts = value;
      self.updatePhaseStarts(newPhases);
    }
  }

  updatePhaseStarts(phases) {
    const self = this;
    // Iterate through phases starting from 2nd ensuring start times are based on delay from previous phase
    for (let i = 1; i < phases.length; i++) {
      let delay = phases[i - 1].delay;
      let delayUnit = phases[i - 1].delayUnit;
      let prevTime = phases[i - 1].start_ts ? new Date(phases[i - 1].start_ts) : new Date();
      const newStartTime = moment(prevTime).add(delay, delayUnit);
      phases[i].start_ts = newStartTime.toISOString();
    }
    self.props.deploymentSettings(phases, 'phases');
  }

  handleStartChange(value) {
    // To be used with updated datetimepicker to open programmatically
    if (value) {
      this.setPickerOpen(true);
    }
  }

  handlePatternChange(value) {
    let phases = [];
    // check if a start time already exists from props and if so, use it
    const phaseStart = this.props.phases ? { start_ts: this.props.phases[0].start_ts } : {};
    // if setting new custom pattern we use default 2 phases
    // for small groups get minimum batch size containing at least 1 device
    const minBatch = this.props.deploymentDeviceIds.length < 10 ? Math.ceil(1/this.props.deploymentDeviceIds.length*100) : 10;
    switch (value) {
    case 0:
      phases = [{ batch_size: 100, ...phaseStart }];
      return this.props.deploymentSettings(phases, 'phases');
    case 1:
      phases = [{ batch_size: minBatch, delay: 2, delayUnit: 'hours', ...phaseStart }, {}];
      break;
    default:
      // have to create a deep copy of the array to prevent overwriting, due to nested objects in the array
      phases = JSON.parse(JSON.stringify(value));
      break;
    }
    this.updatePhaseStarts(phases);
  }

  setPickerOpen(value) {
    this.setState({ isPickerOpen: value });
  }

  render() {
    const self = this;
    const { deploymentDeviceIds = [], phases = [] } = self.props;
    const { previousPhases } = self.state;
    const numberDevices = deploymentDeviceIds ? deploymentDeviceIds.length : 0;
    const start_time = phases && phases.length ? phases[0].start_ts : null;
    const customPattern = phases && phases.length > 1 ? 1 : 0;

    const styles = {
      textField: {
        minWidth: '400px'
      },
      infoStyle: {
        minWidth: '400px',
        borderBottom: 'none'
      }
    };

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

    return (
      <div style={{ overflow: 'visible', minHeight: '300px', marginTop: '15px' }}>
        <form>
          <RootRef rootRef={ref => (this.scheduleRef = ref)}>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <div style={{ width: 'min-content', minHeight: '105px' }}>
                  {self.state.isPickerOpen || start_time ? (
                    <FormControl>
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <DateTimePicker
                          open={self.state.isPickerOpen}
                          onOpen={() => self.setPickerOpen(true)}
                          onClose={() => self.setPickerOpen(false)}
                          label="Set the start time"
                          value={start_time}
                          style={styles.textField}
                          minDate={new Date()}
                          onChange={date => self.handleStartTimeChange(date.toISOString())}
                        />
                      </MuiPickersUtilsProvider>
                    </FormControl>
                  ) : (
                    <FormControl>
                      <InputLabel>Set a start time</InputLabel>
                      <Select onChange={event => this.handleStartChange(event.target.value)} value={0} style={styles.textField}>
                        <MenuItem value={0}>Start immediately</MenuItem>
                        <MenuItem value="custom">Schedule a start date & time</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </div>
              </Grid>
            </Grid>
          </RootRef>

          <div>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <div style={{ width: 'min-content' }}>
                  <FormControl style={{ maxWidth: 515 }}>
                    <InputLabel>Select a rollout pattern</InputLabel>
                    <Select onChange={event => self.handlePatternChange(event.target.value)} value={customPattern} style={styles.textField}>
                      <MenuItem value={0}>Single phase: 100%</MenuItem>
                      {numberDevices > 1 && [
                        <MenuItem key="customPhaseSetting" divider={true} value={1}>
                          Custom
                        </MenuItem>,
                        <ListSubheader key="phaseSettingsSubheader">Recent patterns</ListSubheader>,
                        ...previousPhaseOptions
                      ]}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
            </Grid>

            {customPattern ? (
              <Grid style={{ marginBottom: '15px' }} container justify="center" alignItems="center">
                <Grid item>
                  <PhaseSettings disabled={self.props.disableSchedule} numberDevices={numberDevices} {...self.props} updatePhaseStarts={(...args) => self.updatePhaseStarts(...args)} />
                </Grid>
              </Grid>
            ) : null}
          </div>
        </form>
      </div>
    );
  }
}
