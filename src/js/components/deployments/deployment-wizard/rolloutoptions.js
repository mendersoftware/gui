import React, { useEffect, useState } from 'react';

import { Autocomplete, Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';

import RolloutSteps from './rolloutsteps';
import { useDebounce } from '../../../utils/debouncehook';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  defaultBox: { marginTop: 0, marginBottom: -15 },
  heading: { marginBottom: 0 },
  retryInput: { maxWidth: 150, minWidth: 130 },
  wrapper: { minHeight: 300, overflow: 'visible' }
}));

export const RolloutOptions = ({
  deploymentObject = {},
  docsVersion,
  hasNewRetryDefault = false,
  isEnterprise,
  onSaveRetriesSetting,
  previousRetries,
  setDeploymentSettings
}) => {
  const { phases = [], retries, release = {} } = deploymentObject;
  const [currentRetries, setCurrentRetries] = useState(retries !== undefined ? retries : previousRetries);
  const debouncedRetries = useDebounce(currentRetries, 300);

  const { classes } = useStyles();

  useEffect(() => {
    setDeploymentSettings({ ...deploymentObject, retries: Number(debouncedRetries) });
  }, [debouncedRetries]);

  const { states = {} } = deploymentObject.update_control_map || {};

  const onStepChangeClick = step => {
    const { action } = step;
    setDeploymentSettings({ ...deploymentObject, update_control_map: { states: { ...states, [step.state]: { action } } } });
  };

  const onInputChange = (e, value, reason) => {
    if (reason === 'clear') {
      return setDeploymentSettings({ ...deploymentObject, retries: 0 });
    } else if ((reason === 'reset' && !e) || reason === 'blur') {
      return;
    }
    setCurrentRetries(formatValue(value));
  };

  const onSaveRetriesSettingClick = (_, checked) => onSaveRetriesSetting(checked);

  const formatValue = value => {
    const newValue = Math.max(0, Math.min(value, 100));
    return newValue ? `${newValue}` : '';
  };

  return (
    <form className={`flexbox column margin margin-top-none ${classes.wrapper}`}>
      <h4 className={classes.heading}>Add pauses between update steps</h4>
      <RolloutSteps
        disabled={phases.length > 1 || !isEnterprise}
        docsVersion={docsVersion}
        isEnterprise={isEnterprise}
        onStepChange={onStepChangeClick}
        release={release}
        steps={states}
      />
      <h4 className={classes.heading}>Select the number of times each device will attempt to apply the update</h4>
      <FormControl className="margin-bottom">
        <FormGroup row>
          <Autocomplete
            autoHighlight
            className={`margin-right ${classes.retryInput}`}
            freeSolo
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
    </form>
  );
};

export default RolloutOptions;
