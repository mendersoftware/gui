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

import { Button } from '@mui/material';

import validator from 'validator';

const getErrorMsg = (validateMethod, args) => {
  switch (validateMethod) {
    case 'isLength':
      if (args[0] === 1) {
        return 'This field is required';
      } else if (args[0] > 1) {
        return `Must be at least ${args[0]} characters long`;
      }
      break;
    case 'isAlpha':
      return 'This field must contain only letters';
    case 'isAlphanumeric':
      return 'This field must contain only letters or numbers';
    case 'isNumeric':
      return 'Please enter a valid code';
    case 'isEmail':
      return 'Please enter a valid email address';
    case 'isNot':
      if (args[0] === args[1]) {
        return `This field should have a value other than ${args[0]}`;
      }
      break;
    default:
      return 'There is an error with this field';
  }
};

const tryApplyValidations = (value, validations, initialValidationResult) =>
  validations.split(',').reduce((accu, validation) => {
    if (!accu.isValid) {
      return accu;
    }
    var args = validation.split(':');
    var validateMethod = args.shift();
    // We use JSON.parse to convert the string values passed to the
    // correct type. Ex. 'isLength:1' will make '1' actually a number
    args = args.map(arg => JSON.parse(JSON.stringify(arg)));

    var tmpArgs = args;
    // We then merge two arrays, ending up with the value
    // to pass first, then options, if any. ['valueFromInput', 5]
    args = [value].concat(args);
    try {
      // So the next line of code is actually:
      // validator.isLength('valueFromInput', 5)
      if (!validator[validateMethod].apply(validator, args)) {
        return { errortext: getErrorMsg(validateMethod, tmpArgs), isValid: false };
      }
    } catch {
      const errortext = getErrorMsg(validateMethod, args) || '';
      return { errortext, isValid: !errortext };
    }
    return accu;
  }, initialValidationResult);

const runPasswordValidations = ({ required, value, validations, isValid, errortext }) => {
  if (required && !value) {
    return { isValid: false, errortext: 'Password is required' };
  } else if (required || value) {
    isValid = tryApplyValidations(value, validations, { isValid, errortext }).isValid;
    return { isValid, errortext: !isValid ? 'Password too weak' : errortext };
  }
  return { isValid, errortext };
};

const runValidations = ({ file, required, value, id, validations }) => {
  let isValid = true;
  let errortext = '';
  if (file) {
    if (required && !value) {
      return { isValid: false, errortext: 'You must choose a file to upload' };
    }
  } else if (id && id.substr(0, 8) === 'password') {
    return runPasswordValidations({ required, value, validations, isValid, errortext });
  } else {
    if (value || required) {
      return tryApplyValidations(value, validations, { isValid, errortext });
    }
  }
  return { isValid, errortext };
};

export default class Form extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { children: {}, isValid: false };
    this.model = {};
    this.inputs = {}; // We create a map of traversed inputs
  }

  componentDidMount() {
    this.registerInputs(); // We register inputs from the children
  }

  componentDidUpdate(prevProps) {
    const self = this;
    // Use nextprops for registering components cwu
    if (prevProps.children !== self.props.children) {
      self.registerInputs();
    }
  }

  registerInputs() {
    const self = this;
    self.setState({ newChildren: React.Children.map(self.props.children, child => self._cloneChild(child, self)) });
  }

  // eslint-disable-next-line consistent-this
  _cloneChild(child, self) {
    // If we use the required prop we add a validation rule
    // that ensures there is a value. The input
    // should not be valid with empty value
    if (typeof child?.type === 'undefined') {
      return child;
    }
    var props = child.props || {};
    var validations = props.validations || '';
    if (props.required && validations.indexOf('isLength') == -1) {
      validations = validations ? `${validations}, ` : validations;
      validations += 'isLength:1';
    }
    return React.cloneElement(child, {
      validations: validations,
      attachToForm: self.attachToForm.bind(self),
      detachFromForm: self.detachFromForm.bind(self),
      updateModel: self.updateModel.bind(self),
      validate: self.validate.bind(self),
      hideHelp: self.props.hideHelp,
      handleKeyPress: self._handleKeyPress.bind(self)
    });
  }

  validate(component, value) {
    const { file, id, required, validations } = component.props;
    if (!validations) {
      return;
    }
    const { isValid, errortext } = runValidations({ file, id, required, validations, value });

    // Now we set the state of the input based on the validation
    component.setState(
      { isValid, errortext },
      // We use the callback of setState to wait for the state
      // change being propagated, then we validate the form itself
      this.validateForm.bind(this)
    );
  }

  validateForm() {
    // We set allIsValid to true and flip it if we find any
    // invalid input components
    var allIsValid = true;

    // Now we run through the inputs registered and flip our state
    // if we find an invalid input component
    var inputs = this.inputs;
    Object.keys(inputs).forEach(name => {
      if (!inputs[name].state.isValid || (inputs[name].props.required && !inputs[name].state.value)) {
        allIsValid = false;
      }
    });

    // And last, but not least, we set the valid state of the
    // form itself
    this.setState({ isValid: allIsValid });
  }

  // All methods defined are bound to the component by React JS, so it is safe to use "this"
  // even though we did not bind it. We add the input component to our inputs map
  attachToForm(component) {
    this.inputs[component.props.id] = component;
    this.model[component.props.id] = component.state.value || component.state.checked;

    // We have to validate the input when it is attached to put the
    // form in its correct state
    //this.validate(component);
  }

  // We want to remove the input component from the inputs map
  detachFromForm(component) {
    delete this.inputs[component.props.id];
    delete this.model[component.props.id];
  }
  updateModel() {
    Object.keys(this.inputs).forEach(name => {
      // re validate each input in case submit button pressed too soon
      this.validate(this.inputs[name], this.inputs[name].state.value);
    });

    this.validateForm();
    Object.keys(this.inputs).forEach(id => {
      this.model[id] = this.inputs[id].state.value || this.inputs[id].state.checked;
    });
    if (this.state.isValid) {
      this.props.onSubmit(this.model);
    }
  }
  _handleKeyPress(event) {
    event.stopPropagation();
    if (event.key === 'Enter' && this.state.isValid) {
      this.updateModel();
    }
  }

  onSubmit(event) {
    event.preventDefault();
  }

  render() {
    var uploadActions = !!this.props.showButtons && (
      <div
        className="flexbox"
        style={Object.assign({ justifyContent: 'flex-end', height: 'min-content' }, this.props.dialog ? { margin: '24px 0 -16px 0' } : { marginTop: '32px' })}
      >
        {!!this.props.handleCancel && (
          <Button key="cancel" onClick={this.props.handleCancel} style={{ marginRight: '10px', display: 'inline-block' }}>
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          key="submit"
          id={this.props.submitButtonId}
          color={this.props.buttonColor}
          onClick={() => this.updateModel()}
          disabled={!this.state.isValid}
        >
          {this.props.submitLabel}
        </Button>
      </div>
    );

    return (
      <form
        key={this.props.uniqueId}
        className={this.props.className || ''}
        autoComplete={this.props.autocomplete || undefined}
        onSubmit={e => this.onSubmit(e)}
      >
        {this.state.newChildren}
        {uploadActions}
      </form>
    );
  }
}
