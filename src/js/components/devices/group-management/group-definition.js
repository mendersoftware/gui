import React from 'react';
import { Link } from 'react-router-dom';
import validator from 'validator';

import { FormHelperText, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

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
    } else if (this.props.selectedGroup && name === this.props.selectedGroup) {
      invalid = true;
      errortext = `${name} is the same group the selected devices are already in`;
    }
    this.setState({ errortext });
    this.props.onInputChange(invalid, name, isModification);
  }

  render() {
    const self = this;
    const { isCreationDynamic, isModification, groups, newGroup, selectedGroup } = self.props;
    const filteredGroups = groups.filter(group => group !== selectedGroup);
    const { errortext } = self.state;
    return (
      <>
        <Autocomplete
          id="group-creation-selection"
          disableClearable
          freeSolo
          inputValue={newGroup}
          options={filteredGroups}
          onInputChange={(e, newValue) => self.validateName(newValue)}
          renderInput={params => (
            <TextField {...params} label={!isModification ? 'Name your group' : 'Select a group'} InputProps={{ ...params.InputProps, type: 'search' }} />
          )}
        />
        <FormHelperText>{errortext}</FormHelperText>
        {isCreationDynamic && (
          <p className="info">
            Note: individual devices can&apos;t be added to dynamic groups. <Link to="/help/devices">Learn more about static vs. dynamic groups</Link>
          </p>
        )}
      </>
    );
  }
}
