import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, InputLabel, ListSubheader, MenuItem, Select } from '@material-ui/core';
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

export class ScheduleRollout extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: false,
      isPhasesOpen: false,
      isPickerOpen: false,
      pattern: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.start_time !== this.props.start_time) {
      this.setState({ start_time: this.props.start_time });
    }
  }

  handleStartTimeChange(value) {
    const self = this;
    // if there is no existing phase, set phase and start time
    if (!self.props.phases || value === null) {
      self.props.deploymentSettings([{ batch_size: 100, start_ts: value, delay: 0 }], 'phases');
    } else {
      //if there are existing phases, set the first phases to the new start time and adjust later phases in different function
      let newPhases = this.props.phases;
      newPhases[0].start_ts = value;
      self.updatePhaseStarts(newPhases);
    }
  }

  handleRetriesChange(value) {
    this.props.deploymentSettings(value, 'retries');
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
    } else {
      this.handleStartTimeChange(null);
    }
  }

  handlePatternChange(value) {
    let phases = [];
    // check if a start time already exists from props and if so, use it
    const phaseStart = this.props.phases ? { start_ts: this.props.phases[0].start_ts } : {};
    // if setting new custom pattern we use default 2 phases
    // for small groups get minimum batch size containing at least 1 device
    const minBatch = this.props.deploymentDeviceCount < 10 ? Math.ceil((1 / this.props.deploymentDeviceCount) * 100) : 10;
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
    const {
      deploymentDeviceIds = [],
      deploymentDeviceCount = 0,
      hasNewRetryDefault,
      isEnterprise,
      onSaveRetriesSetting,
      phases = [],
      plan,
      previousPhases = [],
      previousRetries
    } = self.props;
    const retries = self.props.retries ? self.props.retries : previousRetries;
    const numberDevices = deploymentDeviceCount ? deploymentDeviceCount : deploymentDeviceIds ? deploymentDeviceIds.length : 0;
    let start_time = phases && phases.length ? phases[0].start_ts : null;
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

    return (
      <form style={{ overflow: 'visible', minHeight: '300px', marginTop: '15px' }}>
        <Grid container alignItems="center" direction="column">
          <Grid item style={{ width: 'min-content', marginBottom: self.state.isPickerOpen || start_time ? 0 : 30 }}>
            <FormControl>
              <InputLabel>Set a start time</InputLabel>
              <Select onChange={event => this.handleStartChange(event.target.value)} value={start_time ? 'custom' : 0} style={styles.textField}>
                <MenuItem value={0}>Start immediately</MenuItem>
                <MenuItem value="custom">Schedule the start date &amp; time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {self.state.isPickerOpen || start_time ? (
            <Grid item style={{ width: 'min-content', marginBottom: 30 }}>
              <FormControl>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <DateTimePicker
                    ampm={false}
                    open={self.state.isPickerOpen}
                    onOpen={() => self.setPickerOpen(true)}
                    onClose={() => self.setPickerOpen(false)}
                    label={isEnterprise ? 'Set the start time' : 'Starting at'}
                    value={start_time}
                    style={styles.textField}
                    minDate={new Date()}
                    disabled={!isEnterprise}
                    onChange={date => self.handleStartTimeChange(date.toISOString())}
                  />
                </MuiPickersUtilsProvider>
              </FormControl>
            </Grid>
          ) : null}
          <Grid item>
            <FormControl style={{ width: 400, marginBottom: 30 }}>
              <FormGroup row>
                <InputLabel>Retries</InputLabel>
                <Select onChange={event => self.handleRetriesChange(event.target.value)} value={retries} style={{ width: 150, marginRight: 30 }}>
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
          </Grid>
          <Grid item style={{ width: 'min-content' }}>
            <FormControl style={{ maxWidth: 515 }}>
              <InputLabel>Select a rollout pattern</InputLabel>
              <Select
                onChange={event => self.handlePatternChange(event.target.value)}
                value={customPattern}
                style={styles.textField}
                disabled={!isEnterprise || plan !== 'enterprise'}
              >
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
            <EnterpriseNotification isEnterprise={isEnterprise} benefit="choose to roll out deployments in multiple phases" />
          </Grid>
          {customPattern ? (
            <Grid item style={{ marginBottom: '15px' }}>
              <PhaseSettings
                disabled={self.props.disableSchedule}
                numberDevices={numberDevices}
                {...self.props}
                updatePhaseStarts={(...args) => self.updatePhaseStarts(...args)}
              />
            </Grid>
          ) : null}
        </Grid>
      </form>
    );
  }
}

const mapStateToProps = state => {
  return {
    previousPhases: state.users.globalSettings.previousPhases,
    previousRetries: state.users.globalSettings.previousRetries || 0
  };
};

export default connect(mapStateToProps)(ScheduleRollout);
