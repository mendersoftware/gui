import React from 'react';
import pluralize from 'pluralize';
import Time from 'react-time';

import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/Add';

import { Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Input, InputAdornment, IconButton } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import { getRemainderPercent } from '../../../helpers';

export default class PhaseSettings extends React.Component {
  updateDelay(value, index) {
    let newPhases = this.props.phases;
    // value must be at least 1
    value = value > 0 ? value : 1;
    newPhases[index].delay = value;
    this.props.updatePhaseStarts(newPhases);
    // logic for updating time stamps should be in parent - only change delays here
  }

  updateBatchSize(value, index) {
    let newPhases = this.props.phases;

    if (value < 1) {
      value = 1;
    } else if (value > 100) {
      value = 100;
    }

    newPhases[index].batch_size = Number(value);
    // When phase's batch size changes, check for new 'remainder'
    const remainder = getRemainderPercent(newPhases);
    // if new remainder will be 0 or negative remove phase leave last phase to get remainder
    if (remainder < 1) {
      newPhases.pop();
      newPhases[newPhases.length - 1].batch_size = null;
    }
    this.props.deploymentSettings(newPhases, 'phases');
  }

  addPhase() {
    let phases = this.props.phases;
    let newPhase = {};

    // assign new batch size to *previous* last batch
    const remainder = getRemainderPercent(phases);
    // make it default 10, unless remainder is <=10 in which case make it half remainder
    let batch_size = remainder > 10 ? 10 : Math.floor(remainder / 2);
    phases[phases.length - 1].batch_size = batch_size;

    // check for previous phase delay or set 2hr default
    const delay = phases[phases.length - 1].delay || 2;
    phases[phases.length - 1].delay = delay;
    const delayUnit = phases[phases.length - 1].delayUnit || 'hours';
    phases[phases.length - 1].delayUnit = delayUnit;

    phases.push(newPhase);
    // use function to set new phases incl start time of new phase
    this.props.updatePhaseStarts(phases);
  }

  removePhase(index) {
    let phases = this.props.phases;
    phases.splice(index, 1);

    // remove batch size from new last phase, use remainder
    delete phases[phases.length - 1].batch_size;

    if (phases.length === 1) {
      delete phases[0].delay;
      this.props.deploymentSettings(phases, 'phases');
    } else {
      this.props.updatePhaseStarts(phases);
    }
  }

  handleDelayToggle(value, index) {
    let phases = this.props.phases;
    phases[index].delayUnit = value;
    this.props.updatePhaseStarts(phases);
  }

  render() {
    const self = this;
    const { disabled, numberDevices, phases = [] } = self.props;
    const remainder = getRemainderPercent(phases);

    // disable 'add phase' button if last phase/remainder has only 1 device left
    const disableAdd = (remainder / 100) * numberDevices <= 1;
    const mappedPhases = phases.length
      ? phases.map((phase, index) => {
          let max = index > 0 ? 100 - phases[index - 1].batch_size : 100;
          const deviceCount =
            index === phases.length - 1
              ? Math.ceil((numberDevices / 100) * (phase.batch_size || remainder))
              : Math.floor((numberDevices / 100) * phase.batch_size);

          const startTime = !(index || phase.start_ts) ? new Date().toISOString() : phase.start_ts;
          return (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                <Chip size="small" label={`Phase ${index + 1}`} />
              </TableCell>
              <TableCell>
                {phase.batch_size && phase.batch_size < 100 ? (
                  <Input
                    value={phase.batch_size}
                    margin="dense"
                    onChange={event => self.updateBatchSize(event.target.value, index)}
                    endAdornment={
                      <InputAdornment className={deviceCount < 1 ? 'warning' : ''} position="end">
                        %
                      </InputAdornment>
                    }
                    disabled={disabled && deviceCount >= 1 ? true : false}
                    inputProps={{
                      step: 1,
                      min: 1,
                      max: max,
                      type: 'number'
                    }}
                  />
                ) : (
                  phase.batch_size || remainder
                )}
                <span className={deviceCount < 1 ? 'warning info' : 'info'} style={{ marginLeft: '5px' }}>{`(${deviceCount} ${pluralize(
                  'device',
                  deviceCount
                )})`}</span>

                {deviceCount < 1 ? <div className="warning">Phases must have at least 1 device</div> : null}
              </TableCell>
              <TableCell>
                <Time value={startTime} format="YYYY-MM-DD HH:mm" />
              </TableCell>
              <TableCell>
                {phase.delay && index !== phases.length - 1 ? (
                  <div>
                    <Input
                      value={phase.delay}
                      margin="dense"
                      onChange={event => self.updateDelay(event.target.value, index)}
                      inputProps={{
                        step: 1,
                        min: 1,
                        max: 720,
                        type: 'number'
                      }}
                    />

                    <Select
                      onChange={event => this.handleDelayToggle(event.target.value, index)}
                      value={phase.delayUnit || 'hours'}
                      style={{ marginLeft: '5px' }}
                    >
                      <MenuItem value={'minutes'}>Minutes</MenuItem>
                      <MenuItem value={'hours'}>Hours</MenuItem>
                      <MenuItem value={'days'}>Days</MenuItem>
                    </Select>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {index >= 1 ? (
                  <IconButton onClick={() => self.removePhase(index)}>
                    <CancelIcon />
                  </IconButton>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })
      : null;

    return (
      <div>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Batch size</TableCell>
              <TableCell>Phase begins</TableCell>
              <TableCell>Delay before next phase</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{mappedPhases}</TableBody>
        </Table>

        {!disableAdd ? (
          <Chip className="margin-top-small" color="primary" clickable={!disableAdd} icon={<AddIcon />} label="Add a phase" onClick={() => this.addPhase()} />
        ) : null}
      </div>
    );
  }
}
