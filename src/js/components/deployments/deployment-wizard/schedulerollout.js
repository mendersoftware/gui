import React from 'react';

import { FormControl, Grid, InputLabel, MenuItem, RootRef, Select } from '@material-ui/core';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import PhaseSettings from './phasesettings';

export default class ScheduleRollout extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: false,
      pattern: '',
      isPickerOpen: false,
      isPhasesOpen: false,
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
      self.props.deploymentSettings([{ batch_size: 100, start_ts: value, delay: 0}], 'phases');
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
    for (let i=1; i<phases.length; i++) {
      let dateObj = new Date(phases[i-1].start_ts);
      dateObj = dateObj.setHours(dateObj.getHours()+(phases[i-1].delay));
      phases[i].start_ts = new Date(dateObj).toISOString();
      if (i>=phases.length-1) {
        self.props.deploymentSettings(phases, 'phases');
      }
    }
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
    let start_ts = this.props.phases ? this.props.phases[0].start_ts : new Date().toISOString();
    // if setting new custom pattern we use default 2 phases
    if (value !== 0) {
      phases = [{batch_size:10, start_ts:start_ts, delay:2},{}];
      this.updatePhaseStarts(phases) ;
    } else {
      phases = [{batch_size:100, start_ts:start_ts}];
      this.props.deploymentSettings(phases, 'phases')
    }
    
  }

  setPickerOpen(value) {
    this.setState({ isPickerOpen: value });
  }

  render() {
    const self = this;
    const props = self.props;
    const numberDevices = props.deploymentDeviceIds ? props.deploymentDeviceIds.length : null;
    const start_time = props.phases ? props.phases[0].start_ts : null;
    const customPattern = props.phases && props.phases.length>1 ? 1 : 0;

    const styles = {
      textField: {
        minWidth: '400px'
      },
      infoStyle: {
        minWidth: '400px',
        borderBottom: 'none'
      }
    };

    return (
      <div style={{ overflow: 'visible', minHeight: '300px', marginTop: '15px' }}>
        <form>
          <RootRef rootRef={ref => (this.scheduleRef = ref)}>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <div style={{width:'min-content', minHeight:'105px'}}>

                  { (self.state.isPickerOpen || start_time) ?

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
                    :
                    <FormControl>
                      <InputLabel>Set a start time</InputLabel>
                      <Select
                        onChange={event => this.handleStartChange(event.target.value)}
                        value={0}
                        style={styles.textField}
                      >
                        <MenuItem value={0}>Start immediately</MenuItem>
                        <MenuItem value="custom">Schedule a start date & time</MenuItem>
                      </Select>
                    </FormControl>
                  }
                 
                </div>
              </Grid>
            </Grid>
          </RootRef>

          <div>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <div style={{ width:'min-content' }}>
                  <FormControl>
                    <InputLabel>Select a rollout pattern</InputLabel>
                    <Select onChange={event => self.handlePatternChange(event.target.value)} value={customPattern} style={styles.textField}>
                      <MenuItem value={0}>Single phase: 100%</MenuItem>
                      {numberDevices>1 ? <MenuItem value={1}>Custom</MenuItem> : null }
                    </Select>
                  </FormControl>
                </div>
              </Grid>
            </Grid>

            {customPattern ? 
              <Grid style={{ marginBottom: '15px' }} container justify="center" alignItems="center">
                <Grid item>
                  <PhaseSettings numberDevices={numberDevices} {...props} updatePhaseStarts={(...args) => self.updatePhaseStarts(...args)} />
                </Grid>
              </Grid>
              : null
            }
            
          </div>
        </form>
      </div>
    );
  }
}
