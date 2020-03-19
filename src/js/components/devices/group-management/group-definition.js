import React from 'react';
import validator from 'validator';
import { FormHelperText, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import * as DeviceConstants from '../../../constants/deviceConstants';

import { fullyDecodeURI } from '../../../helpers';

export default class GroupDefinition extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { errortext: '' };
  }

  validateName(encodedName) {
    const name = fullyDecodeURI(encodedName);
    let invalid = false;
    let errortext = null;
    const isModification = name.length && this.props.groups.some(group => decodeURIComponent(group) === name);
    if (!name && !isModification) {
      invalid = true;
      errortext = 'Name cannot be left blank';
    } else if (!validator.isWhitelisted(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')) {
      invalid = true;
      errortext = 'Valid characters are a-z, A-Z, 0-9, _ and -';
    } else if (validator.contains(name.toLowerCase(), DeviceConstants.UNGROUPED_GROUP.name.toLowerCase())) {
      invalid = true;
      errortext = `${name} is a reserved group name`;
    }
    this.setState({ errortext });
    this.props.onInputChange(invalid, name, isModification);
  }

  render() {
    const self = this;
    const { isModification, groups, newGroup } = self.props;
    const { errortext } = self.state;
    return (
      <>
        <Autocomplete
          id="group-creation-selection"
          disableClearable
          freeSolo
          value={newGroup}
          options={groups}
          onInputChange={(e, newValue) => self.validateName(newValue)}
          renderInput={params => (
            <TextField {...params} label={!isModification ? 'Name your group' : 'Select a group'} InputProps={{ ...params.InputProps, type: 'search' }} />
          )}
        />
        <FormHelperText>{errortext}</FormHelperText>
      </>
    );
  }
}
