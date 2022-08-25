import React, { useEffect, useState } from 'react';

import { Autocomplete, Checkbox, Collapse, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';

import RolloutSteps from './rolloutsteps';
import { useDebounce } from '../../../utils/debouncehook';
import { makeStyles } from 'tss-react/mui';
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

  const [currentRetries, setCurrentRetries] = useState(retries !== undefined ? retries : previousRetries);
  const debouncedRetries = useDebounce(currentRetries, 300);

  useEffect(() => {
    setDeploymentSettings({ retries: Number(debouncedRetries) });
  }, [debouncedRetries]);

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
    setCurrentRetries(formatValue(value));
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
            autoHighlight
            className={`margin-right ${classes.retryInput}`}
            freeSolo
            disabled={!canRetry}
            getOptionLabel={formatValue}
            handleHomeEndKeys
            id="deployment-retries-selection"
            options={[1, 2, 3]}
            onInputChange={onInputChange}
            renderInput={params => (
              <TextField
                {...params}
                className={classes.retryInput}
                placeholder="Don't retry"
                inputProps={{ ...params.inputProps, value: formatValue(params.inputProps.value) }}
                InputProps={{ ...params.InputProps }}
                type="number"
              />
            )}
            value={currentRetries}
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
