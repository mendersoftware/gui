import React, { useEffect, useState } from 'react';
import { Fab, FormControl, FormHelperText, IconButton, Input } from '@material-ui/core';
import { Add as ContentAddIcon, Clear as ClearIcon } from '@material-ui/icons';

const emptyInput = { key: '', value: '' };

export const KeyValueEditor = ({ disabled, errortext, input = {}, onInputChange, reset }) => {
  const [inputs, setInputs] = useState([{ ...emptyInput }]);
  const [error, setError] = useState('');

  useEffect(() => {
    const newInputs = Object.keys(input).length ? Object.entries(input).map(([key, value]) => ({ key, value })) : [{ ...emptyInput }];
    setInputs(newInputs);
  }, [reset]);

  const updateInputs = (key, index, event) => {
    let changedInputs = [...inputs];
    changedInputs[index][key] = event.target.value;
    setInputs(changedInputs);
    const inputObject = reducePairs(changedInputs);
    if (changedInputs.every(item => item.key && item.value) && changedInputs.length !== Object.keys(inputObject).length) {
      setError('Duplicate keys exist, only the last set value will be submitted');
    } else {
      setError('');
    }
    onInputChange(inputObject);
  };

  const reducePairs = listOfPairs => listOfPairs.reduce((accu, item) => ({ ...accu, ...(item.value ? { [item.key]: item.value } : {}) }), {});

  const addKeyValue = () => {
    const changedInputs = [...inputs, { ...emptyInput }];
    setInputs(changedInputs);
    setError('');
  };

  const removeInput = index => {
    let changedInputs = [...inputs];
    changedInputs.splice(index, 1);
    setInputs(changedInputs);
    const inputObject = reducePairs(changedInputs);
    onInputChange(inputObject);
    setError('');
  };

  return (
    <div>
      {inputs.map((input, index) => {
        const hasError = Boolean(index === inputs.length - 1 && (errortext || error));
        const hasRemovalDisabled = !(inputs[index].key && inputs[index].value);
        return (
          <div className="key-value-container flexbox" key={index}>
            <FormControl disabled={disabled} error={hasError} style={{ marginRight: 15, marginTop: 10 }}>
              <Input value={input.key} placeholder="Key" onChange={e => updateInputs('key', index, e)} type="text" />
              {hasError && <FormHelperText>{errortext || error}</FormHelperText>}
            </FormControl>
            <FormControl disabled={disabled} error={hasError} style={{ marginTop: 10 }}>
              <Input value={`${input.value}`} placeholder="Value" onChange={e => updateInputs('value', index, e)} type="text" />
            </FormControl>
            {inputs.length > 1 && !hasRemovalDisabled ? (
              <IconButton disabled={disabled || hasRemovalDisabled} onClick={() => removeInput(index)}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : (
              <span style={{ minWidth: 44 }} />
            )}
          </div>
        );
      })}
      <Fab
        disabled={disabled || !inputs[inputs.length - 1].key || !inputs[inputs.length - 1].value}
        style={{ marginTop: 10, marginBottom: 10 }}
        color="secondary"
        size="small"
        onClick={addKeyValue}
      >
        <ContentAddIcon />
      </Fab>
    </div>
  );
};

export default KeyValueEditor;
