// Copyright 2017 Northern.tech AS
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

import { Checkbox, FormControlLabel } from '@mui/material';

export default class FormCheckbox extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      checked: this.props.checked,
      // the following is needed for the form validation to work if the field is not required
      isValid: true, // lgtm [js/react/unused-or-undefined-state-property]
      value: this.props.checked ? this.props.value : ''
    };
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

  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }

  updateCheck(checked) {
    const value = checked ? this.props.value : '';
    this.setState({ checked, value });
    this.props.validate(this, value);
  }

  render() {
    return (
      <FormControlLabel
        className={this.props.className}
        control={
          <Checkbox
            id={this.props.id}
            name={this.props.id}
            ref={this.props.id}
            onChange={(e, checked) => this.updateCheck(checked)}
            onClick={this.props.handleClick}
            style={this.props.style}
            color="primary"
            checked={this.state.checked}
          />
        }
        label={this.props.label}
      />
    );
  }
}
