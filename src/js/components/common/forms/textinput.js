// Copyright 2016 Northern.tech AS
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
import React from 'react';

import { FormControl, FormHelperText, Input, InputLabel } from '@mui/material';

export default class TextInput extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      errortext: null,
      // the following is needed for the form validation to work if the field is not required
      isValid: true, // lgtm [js/react/unused-or-undefined-state-property]
      value: this.props.value || ''
    };
  }

  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }
  componentDidMount() {
    this.props.attachToForm(this); // Attaching the component to the form
    if (this.props.value) {
      this.props.validate(this, this.props.value);
    }
    if (this.props.setControlRef) {
      this.props.setControlRef(this.input);
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.focus) {
      this.input.focus();
    }
    var self = this;
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value }, self.props.validate(self, self.props.value));
    }
  }

  setValue(event) {
    this.setState({
      value: event.currentTarget.value
    });
    this.props.validate(this, event.currentTarget.value);
  }
  render() {
    let { className = '' } = this.props;
    className = this.props.required ? `${className} required` : className;
    return (
      <FormControl className={className} error={Boolean(this.state.errortext)}>
        <InputLabel htmlFor={this.props.id} {...this.props.InputLabelProps}>
          {this.props.label}
        </InputLabel>
        <Input
          id={this.props.id}
          name={this.props.id}
          disabled={this.props.disabled}
          inputRef={input => (this.input = input)}
          value={this.state.value}
          onKeyPress={this.props.handleKeyPress}
          onChange={e => this.setValue(e)}
          placeholder={this.props.hint}
          required={this.props.required}
          style={{ width: '400px', maxWidth: '100%' }}
          type={this.props.type}
        />
        <FormHelperText id="component-error-text">{this.state.errortext}</FormHelperText>
      </FormControl>
    );
  }
}
