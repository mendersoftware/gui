// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';

import { Autocomplete, Checkbox, Collapse, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { TIMEOUTS } from '../../../constants/appConstants';
import { toggle } from '../../../helpers';
import { useDebounce } from '../../../utils/debouncehook';
import EnterpriseNotification from '../../common/enterpriseNotification';
import MenderTooltip from '../../common/mendertooltip';
import RolloutSteps from './rolloutsteps';

const useStyles = makeStyles()(() => ({
  defaultBox: { marginTop: 0, marginBottom: -15 },
  heading: { marginBottom: 0 },
  retryInput: { maxWidth: 150, minWidth: 130 },
  wrapper: { minHeight: 300 }
}));

export const ForceDeploy = ({ deploymentObject, setDeploymentSettings }) => {
  const [forceDeploy, setForceDeploy] = useState(deploymentObject.forceDeploy ?? false);
  const { classes } = useStyles();

  useEffect(() => {
    setDeploymentSettings({ forceDeploy });
  }, [forceDeploy]);

  return (
    <div>
      <MenderTooltip
        title={
          <div style={{ whiteSpace: 'normal' }}>
            <h3>Force update</h3>
            <p>This will make the Mender client install the update even if the selected release is already installed.</p>
          </div>
        }
      >
        <FormControlLabel
          className={classes.heading}
          control={<Checkbox color="primary" checked={forceDeploy} onChange={() => setForceDeploy(toggle)} size="small" />}
          label={
            <>
              <b>Force update</b> (optional)
            </>
          }
        />
      </MenderTooltip>
    </div>
  );
};

export const RolloutOptions = ({ deploymentObject, docsVersion, isEnterprise, setDeploymentSettings }) => {
  const { phases = [], release = {} } = deploymentObject;
  const { classes } = useStyles();

  const { states = {} } = deploymentObject.update_control_map || {};
  const [isPaused, setIsPaused] = useState(!!Object.keys(states).length);

  const onStepChangeClick = step => {
    const { action } = step;
    setDeploymentSettings({ update_control_map: { states: { ...states, [step.state]: { action } } } });
  };

  const onIsPausedClick = () => setIsPaused(toggle);

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
