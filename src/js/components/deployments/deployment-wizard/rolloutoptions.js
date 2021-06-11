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
  phases = [],
  previousRetries,
  retries,
  setDeploymentSettings
}) => {
  const currentRetries = retries ? retries : previousRetries;

  const onStepChangeClick = step => {
    const controlMap = deploymentObject.update_control_map || {};
    setDeploymentSettings({ ...deploymentObject, update_control_map: { ...controlMap, [step.state]: step } });
  };

  const onChangeRetries = ({ target: { value } }) => setDeploymentSettings({ ...deploymentObject, retries: value });

  const onSaveRetriesSettingClick = (_, checked) => onSaveRetriesSetting(checked);

  return (
    <form className="flexbox column margin margin-top-none" style={{ overflow: 'visible', minHeight: 300 }}>
      <h4 style={styles.selectionTitle}>Add pauses between update steps</h4>
      <RolloutSteps
        disabled={phases.length > 1}
        docsVersion={docsVersion}
        isEnterprise={isEnterprise}
        onStepChange={onStepChangeClick}
        steps={deploymentObject.update_control_map}
      />
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
