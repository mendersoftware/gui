import validator from 'validator';
import React from 'react';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

var Form = React.createClass({
  getInitialState: function() {
    return {
      isSubmitting: false,
      isValid: false 
    };
  },
  componentWillMount: function () {
    this.model = {};
    this.newChildren = {};
    this.inputs = {}; // We create a map of traversed inputs
    this.registerInputs(); // We register inputs from the children
  },
  registerInputs: function() {
    this.newChildren = React.Children.map(this.props.children, function(child) {

       // If we use the required prop we add a validation rule
      // that ensures there is a value. The input
      // should not be valid with empty value
      var validations = child.props.validations || "";
      if (child.props.required && (validations.indexOf('isLength')==-1)) {
        validations = validations ? validations +", " : validations;
        validations += 'isLength:1';
      }
      return React.cloneElement(child, {validations: validations, attachToForm:this.attachToForm, detachFromForm:this.detachFromForm, updateModel:this.updateModel, validate:this.validate})
    }.bind(this));
  
  },

  validate: function (component, value) {
    if (!component.props.validations) {
      return;
    }
  
    var isValid = true;
    var errorText = '';

    if (component.props.file) {
      if (component.props.required && !value) {
        isValid = false;
        errorText = "You must choose a file to upload";
      }
    } else {

      if (value || component.props.required) {
        component.props.validations.split(',').forEach(function (validation) {
          var args = validation.split(':');
          var validateMethod = args.shift();
           // We use JSON.parse to convert the string values passed to the
          // correct type. Ex. 'isLength:1' will make '1' actually a number
          args = args.map(function (arg) { return JSON.parse(arg); });

          var tmpArgs = args;
          // We then merge two arrays, ending up with the value
          // to pass first, then options, if any. ['valueFromInput', 5]
          args = [value].concat(args);
          // So the next line of code is actually:
          // validator.isLength('valueFromInput', 5)
          if (!validator[validateMethod].apply(validator, args)) {
            errorText = this.getErrorMsg(validateMethod, tmpArgs);
            isValid = false;
          }
        }.bind(this));
      }
    }

     // Now we set the state of the input based on the validation
    component.setState({
      isValid: isValid,
      errorText: errorText,
      // We use the callback of setState to wait for the state
      // change being propagated, then we validate the form itself
    }, this.validateForm);

  },

  getErrorMsg: function (validateMethod, args) {
    switch (validateMethod) {
      case "isLength":
        if (args[0] === 1) {
          return "This field is required"
        } else if (args[0]>1) {
           return "Must be at least " + args[0] + " characters long"
        }
        break;
      case "isAlpha":
        return "This field must contain only letters"
        break;
      case "isAlphanumeric":
        return "This field must contain only letters or numbers"
        break;
      default:
         return "There is an error with this field"
        break;
    }
  },

  validateForm: function () {
    
    // We set allIsValid to true and flip it if we find any
    // invalid input components
    var allIsValid = true;
    
    // Now we run through the inputs registered and flip our state
    // if we find an invalid input component
    var inputs = this.inputs;
    Object.keys(inputs).forEach(function (name) {
      if (!inputs[name].state.isValid || (inputs[name].props.required && !inputs[name].state.value )) {
        allIsValid = false;
      }
    });
    
    // And last, but not least, we set the valid state of the
    // form itself
    this.setState({
      isValid: allIsValid
    });
  },



  // All methods defined are bound to the component by React JS, so it is safe to use "this"
  // even though we did not bind it. We add the input component to our inputs map
  attachToForm: function (component) {
    this.inputs[component.props.id] = component;
    this.model[component.props.id] = component.state.value;

    // We have to validate the input when it is attached to put the
    // form in its correct state
    //this.validate(component);
  },
  
  // We want to remove the input component from the inputs map
  detachFromForm: function (component) {
    delete this.inputs[component.props.id];
    delete this.model[component.props.id];
  },
  updateModel: function (component) {
    Object.keys(this.inputs).forEach(function (name) {
      // re validate each input in case submit button pressed too soon
      this.validate(this.inputs[name], this.inputs[name].state.value);
    }.bind(this));

    this.validateForm();
    Object.keys(this.inputs).forEach(function (id) {
      this.model[id] = this.inputs[id].state.value;
    }.bind(this));
    if (this.state.isValid) {
      this.props.onSubmit(this.model);
    }
  },
  render: function () {

    var uploadActions = (
      <div className="float-right">
        <div key="cancelcontain" style={{marginRight:"10px", display:"inline-block"}}>
          <FlatButton
            key="cancel"
            label="Cancel"
            onClick={this.props.dialogDismiss.bind(null, 'upload')} />
        </div>
        <RaisedButton
          key="submit"
          label="Save artifact"
          primary={true}
          onClick={this.updateModel}
          disabled={!this.state.isValid} />
      </div>
    );
    return (
      <form>
        {this.newChildren}
        {uploadActions}
      </form>
    )
  }
});

module.exports = Form;