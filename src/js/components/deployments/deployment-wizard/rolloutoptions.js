import React, { useEffect, useState } from 'react';

import { Autocomplete, Checkbox, Collapse, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import RolloutSteps from './rolloutsteps';
import { TIMEOUTS } from '../../../constants/appConstants';
import { useDebounce } from '../../../utils/debouncehook';
import EnterpriseNotification from '../../common/enterpriseNotification';

const useStyles = makeStyles()(() => ({
  defaultBox: { marginTop: 0, marginBottom: -15 },
  heading: { marginBottom: 0 },
  retryInput: { maxWidth: 150, minWidth: 130 },
  wrapper: { minHeight: 300 }
}));

export const RolloutOptions = ({ deploymentObject, docsVersion, isEnterprise, setDeploymentSettings }) => {
  const { phases = [], release = {} } = deploymentObject;
  const { classes } = useStyles();

  const { states = {} } = deploymentObject.update_control_map || {};
  const [isPaused, setIsPaused] = useState(!!Object.keys(states).length);

  const onStepChangeClick = step => {
    const { action } = step;
    setDeploymentSettings({ update_control_map: { states: { ...states, [step.state]: { action } } } });
  };

  const onIsPausedClick = () => setIsPaused(current => !current);

  return (
    <>
      <FormControlLabel
        className={classes.heading}
        control={<Checkbox color="primary" checked={isPaused} disabled={!isEnterprise} onChange={onIsPausedClick} size="small" />}
        label={
          <>
            <b>Add pauses between update steps</b> (optional)
          </>
        }
      />
      <Collapse in={isPaused} className={classes.wrapper}>
        <RolloutSteps
          disabled={phases.length > 1 || !isEnterprise}
          docsVersion={docsVersion}
          isEnterprise={isEnterprise}
          onStepChange={onStepChangeClick}
          release={release}
          steps={states}
        />
      </Collapse>
      <EnterpriseNotification isEnterprise={isEnterprise} benefit="granular control about update rollout to allow synchronization across your fleet" />
    </>
  );
};

export const Retries = ({
  canRetry,
  commonClasses,
  deploymentObject,
  hasNewRetryDefault = false,
  onSaveRetriesSetting,
  previousRetries,
  setDeploymentSettings
}) => {
  const { retries } = deploymentObject;
  const { classes } = useStyles();

  const [currentAttempts, setCurrentAttempts] = useState(Number(retries ?? previousRetries ?? 0) + 1);
  const debouncedAttempts = useDebounce(currentAttempts, TIMEOUTS.debounceShort);

  useEffect(() => {
    setDeploymentSettings({ retries: Number(debouncedAttempts) - 1 });
  }, [debouncedAttempts]);

  const formatValue = value => {
    const newValue = Math.max(0, Math.min(value, 100));
    return newValue ? `${newValue}` : '';
  };

  const onInputChange = (e, value, reason) => {
    if (reason === 'clear') {
      return setDeploymentSettings({ retries: 0 });
    } else if ((reason === 'reset' && !e) || reason === 'blur') {
      return;
    }
    setCurrentAttempts(formatValue(value));
  };

  const onSaveRetriesSettingClick = (_, checked) => onSaveRetriesSetting(checked);

  return (
    <>
      <h4 className={`${classes.heading} ${canRetry ? '' : commonClasses.disabled}`}>
        Select the number of times each device will attempt to apply the update
      </h4>
      <FormControl className="margin-top-none" disabled={!canRetry}>
        <FormGroup row>
          <Autocomplete
            autoSelect
            autoHighlight
            className={`margin-right ${classes.retryInput}`}
            freeSolo
            disabled={!canRetry}
            getOptionLabel={formatValue}
            handleHomeEndKeys
            id="deployment-retries-selection"
            options={[1, 2, 3, 4]}
            onInputChange={onInputChange}
            renderInput={params => (
              <TextField
                {...params}
                className={classes.retryInput}
                inputProps={{ ...params.inputProps, value: formatValue(params.inputProps.value) }}
                InputProps={{ ...params.InputProps }}
                type="number"
              />
            )}
            value={currentAttempts}
          />
          <FormControlLabel
            className={classes.defaultBox}
            control={<Checkbox checked={hasNewRetryDefault} onChange={onSaveRetriesSettingClick} />}
            label="Save as default"
          />
        </FormGroup>
      </FormControl>
      <EnterpriseNotification isEnterprise={canRetry} benefit="optional retries for failed rollout attempts" />
    </>
  );
};
