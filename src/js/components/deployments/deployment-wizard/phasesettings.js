import React from 'react';
import pluralize from 'pluralize';

import { Add as AddIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Input, InputAdornment, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { getPhaseDeviceCount, getRemainderPercent } from '../../../helpers';
import Time from '../../common/time';
import { getPhaseStartTime } from '../createdeployment';

export const PhaseSettings = ({ classNames, deploymentObject = {}, disabled, numberDevices, setDeploymentSettings }) => {
  const theme = useTheme();
  const { filterId, phases = [] } = deploymentObject;
  const updateDelay = (value, index) => {
    let newPhases = phases;
    // value must be at least 1
    value = Math.max(1, value);
    newPhases[index].delay = value;

    setDeploymentSettings({ ...deploymentObject, phases: newPhases });
    // logic for updating time stamps should be in parent - only change delays here
  };

  const updateBatchSize = (value, index) => {
    let newPhases = [...phases];
    value = Math.min(100, Math.max(1, value));
    newPhases[index].batch_size = value;
    // When phase's batch size changes, check for new 'remainder'
    const remainder = getRemainderPercent(newPhases);
    // if new remainder will be 0 or negative remove phase leave last phase to get remainder
    if (remainder < 1) {
      newPhases.pop();
      newPhases[newPhases.length - 1].batch_size = null;
    }
    setDeploymentSettings({ ...deploymentObject, phases: newPhases });
  };

  const addPhase = () => {
    let newPhases = [...phases];
    let newPhase = {};

    // assign new batch size to *previous* last batch
    const remainder = getRemainderPercent(newPhases);
    // make it default 10, unless remainder is <=10 in which case make it half remainder
    let batch_size = remainder > 10 ? 10 : Math.floor(remainder / 2);
    newPhases[newPhases.length - 1].batch_size = batch_size;

    // check for previous phase delay or set 2hr default
    const delay = newPhases[newPhases.length - 1].delay || 2;
    newPhases[newPhases.length - 1].delay = delay;
    const delayUnit = newPhases[newPhases.length - 1].delayUnit || 'hours';
    newPhases[newPhases.length - 1].delayUnit = delayUnit;

    newPhases.push(newPhase);
    // use function to set new phases incl start time of new phase
    setDeploymentSettings({ ...deploymentObject, phases: newPhases });
  };

  const removePhase = index => {
    let newPhases = phases;
    newPhases.splice(index, 1);

    // remove batch size from new last phase, use remainder
    delete newPhases[newPhases.length - 1].batch_size;

    if (newPhases.length === 1) {
      delete newPhases[0].delay;
    }
    setDeploymentSettings({ ...deploymentObject, phases: newPhases });
  };

  const handleDelayToggle = (value, index) => {
    let newPhases = phases;
    newPhases[index].delayUnit = value;
    setDeploymentSettings({ ...deploymentObject, phases: newPhases });
  };

  const remainder = getRemainderPercent(phases);

  // disable 'add phase' button if last phase/remainder has only 1 device left
  const disableAdd = !filterId && (remainder / 100) * numberDevices <= 1;
  const startTime = phases.length ? phases[0].start_ts || new Date() : new Date();
  const mappedPhases = phases.map((phase, index) => {
    let max = index > 0 ? 100 - phases[index - 1].batch_size : 100;
    const deviceCount = getPhaseDeviceCount(numberDevices, phase.batch_size, remainder, index === phases.length - 1);
    return (
      <TableRow key={index}>
        <TableCell component="th" scope="row">
          <Chip size="small" label={`Phase ${index + 1}`} />
        </TableCell>
        <TableCell>
          {phase.batch_size && phase.batch_size < 100 ? (
            <Input
              value={phase.batch_size}
              onChange={event => updateBatchSize(event.target.value, index)}
              endAdornment={
                <InputAdornment className={deviceCount < 1 ? 'warning' : ''} position="end">
                  %
                </InputAdornment>
              }
              disabled={disabled && deviceCount >= 1}
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
          {!filterId && (
            <span className={deviceCount < 1 ? 'warning info' : 'info'} style={{ marginLeft: '5px' }}>{`(${deviceCount} ${pluralize(
              'device',
              deviceCount
            )})`}</span>
          )}

          {!filterId && deviceCount < 1 && <div className="warning">Phases must have at least 1 device</div>}
        </TableCell>
        <TableCell>
          <Time value={getPhaseStartTime(phases, index, startTime)} />
        </TableCell>
        <TableCell>
          {phase.delay && index !== phases.length - 1 ? (
            <div>
              <Input
                value={phase.delay}
                onChange={event => updateDelay(event.target.value, index)}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 720,
                  type: 'number'
                }}
              />

              <Select onChange={event => handleDelayToggle(event.target.value, index)} value={phase.delayUnit || 'hours'} style={{ marginLeft: '5px' }}>
                <MenuItem value="minutes">Minutes</MenuItem>
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
              </Select>
            </div>
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell>
          {index >= 1 ? (
            <IconButton onClick={() => removePhase(index)} size="large">
              <CancelIcon />
            </IconButton>
          ) : null}
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div className={classNames}>
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
        <Chip color="primary" clickable={!disableAdd} icon={<AddIcon />} label="Add a phase" onClick={addPhase} style={{ marginTop: theme.spacing(2) }} />
      ) : null}
    </div>
  );
};

export default PhaseSettings;
