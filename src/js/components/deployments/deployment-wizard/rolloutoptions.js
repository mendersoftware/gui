import React from 'react';

import { Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, Select } from '@material-ui/core';

import RolloutSteps from './rolloutsteps';
import { styles } from './softwaredevices';

export const RolloutOptions = ({
  deploymentObject = {},
  docsVersion,
  hasNewRetryDefault = false,
  isEnterprise,
  onSaveRetriesSetting,
  previousRetries,
  setDeploymentSettings
}) => {
  const { phases = [], retries } = deploymentObject;
  const currentRetries = retries !== undefined ? retries : previousRetries;

  const { states = {} } = deploymentObject.update_control_map || {};

  const onStepChangeClick = step => {
    const { action } = step;
    setDeploymentSettings({ ...deploymentObject, update_control_map: { states: { ...states, [step.state]: { action } } } });
  };

  const onChangeRetries = ({ target: { value } }) => setDeploymentSettings({ ...deploymentObject, retries: value });

  const onSaveRetriesSettingClick = (_, checked) => onSaveRetriesSetting(checked);

  return (
    <form className="flexbox column margin margin-top-none" style={{ overflow: 'visible', minHeight: 300 }}>
      <h4 style={styles.selectionTitle}>Add pauses between update steps</h4>
      <RolloutSteps disabled={phases.length > 1} docsVersion={docsVersion} isEnterprise={isEnterprise} onStepChange={onStepChangeClick} steps={states} />
      <h4>Select the number of times each device will attempt to apply the update</h4>
      <FormControl className="margin-bottom" style={{ width: 400 }}>
        <FormGroup row>
          <Select className="margin-right" onChange={onChangeRetries} value={currentRetries} style={{ width: 150 }}>
            <MenuItem value={0}>Don&apos;t retry</MenuItem>
            {[1, 2, 3].map(value => (
              <MenuItem key={`retries-option-${value}`} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
          <FormControlLabel
            control={<Checkbox checked={hasNewRetryDefault} onChange={onSaveRetriesSettingClick} />}
            label="Save as default"
            style={{ marginTop: 0, marginBottom: -15 }}
          />
        </FormGroup>
      </FormControl>
    </form>
  );
};

export default RolloutOptions;
