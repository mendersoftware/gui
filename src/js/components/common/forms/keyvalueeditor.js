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
import React, { createRef, useEffect, useRef, useState } from 'react';

import { Clear as ClearIcon, Add as ContentAddIcon } from '@mui/icons-material';
import { Fab, FormControl, FormHelperText, IconButton, Input } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const emptyInput = { helptip: null, key: '', value: '' };

export const KeyValueEditor = ({ disabled, errortext, input = {}, inputHelpTipsMap = {}, onInputChange, reset, showHelptips }) => {
  const theme = useTheme();
  const [inputs, setInputs] = useState([{ ...emptyInput }]);
  const [error, setError] = useState('');
  // need to useRef here to get positioning of
  let inputRefs = useRef([]);

  useEffect(() => {
    const newInputs = Object.keys(input).length
      ? Object.entries(input).map(([key, value]) => ({ helptip: inputHelpTipsMap[key.toLowerCase()], key, ref: createRef(), value }))
      : [{ ...emptyInput, ref: createRef() }];
    inputRefs.current = newInputs.map((_, i) => inputRefs.current[i] ?? createRef());
    setInputs(newInputs);
  }, [reset]);

  const onClearClick = () => {
    const changedInputs = [{ ...emptyInput }];
    setInputs(changedInputs);
    const inputObject = reducePairs(changedInputs);
    onInputChange(inputObject);
  };

  const updateInputs = (key, index, event) => {
    let changedInputs = [...inputs];
    const {
      target: { value }
    } = event;
    changedInputs[index][key] = value;
    changedInputs[index].helptip = null;
    const normalizedKey = changedInputs[index].key.toLowerCase();
    if (inputHelpTipsMap[normalizedKey]) {
      changedInputs[index].helptip = inputHelpTipsMap[normalizedKey];
    }
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
    const changedInputs = [...inputs, { ...emptyInput, ref: createRef() }];
    inputRefs.current = changedInputs.map((_, i) => inputRefs.current[i] ?? createRef());
    setInputs(changedInputs);
    setError('');
  };

  const removeInput = index => {
    let changedInputs = [...inputs];
    changedInputs.splice(index, 1);
    inputRefs.current = changedInputs.map((_, i) => inputRefs.current[i] ?? createRef());
    setInputs(changedInputs);
    const inputObject = reducePairs(changedInputs);
    onInputChange(inputObject);
    setError('');
  };

  const getHelptipPosition = ref => {
    const { offsetHeight, offsetLeft, offsetTop } = ref.current.closest('.key-value-container');
    const top = offsetTop + offsetHeight / 3;
    const left = offsetLeft - 15;
    return { left, top };
  };

  return (
    <div>
      {inputs.map((input, index) => {
        const hasError = Boolean(index === inputs.length - 1 && (errortext || error));
        const hasRemovalDisabled = !(inputs[index].key && inputs[index].value);
        const Helptip = inputs[index].helptip?.component;
        const ref = inputRefs.current[index];
        return (
          <div className="key-value-container relative" key={index}>
            <FormControl>
              <Input value={input.key} placeholder="Key" inputRef={ref} onChange={e => updateInputs('key', index, e)} type="text" />
              {hasError && <FormHelperText>{errortext || error}</FormHelperText>}
            </FormControl>
            <FormControl>
              <Input value={`${input.value}`} placeholder="Value" onChange={e => updateInputs('value', index, e)} type="text" />
            </FormControl>
            {inputs.length > 1 && !hasRemovalDisabled ? (
              <IconButton disabled={disabled || hasRemovalDisabled} onClick={() => removeInput(index)} size="large">
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : (
              <span />
            )}
            {showHelptips && Helptip && ref.current && <Helptip anchor={getHelptipPosition(ref)} {...inputs[index].helptip.props} />}
          </div>
        );
      })}
      <div className="key-value-container">
        <div style={{ minWidth: theme.spacing(30) }}>
          <Fab
            disabled={disabled || !inputs[inputs.length - 1].key || !inputs[inputs.length - 1].value}
            style={{ marginBottom: 10 }}
            color="secondary"
            size="small"
            onClick={addKeyValue}
          >
            <ContentAddIcon />
          </Fab>
        </div>
        <div style={{ minWidth: theme.spacing(30) }} />
        {inputs.length > 1 ? (
          <a className="margin-left-small" onClick={onClearClick}>
            clear all
          </a>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default KeyValueEditor;
