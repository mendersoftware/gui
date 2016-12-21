import React from 'react';
import PasswordField from 'material-ui-password-field';

var PasswordInput = React.createClass({
  getInitialState: function () {
    return {
      value: this.props.value || '',
      errorText: null,
      isValid: true
    };
  },

  componentWillMount: function () {
    this.props.attachToForm(this); // Attaching the component to the form
  },
  componentWillUnmount: function () {
    this.props.detachFromForm(this); // Detaching if unmounting
  },
  setValue: function (event) {
    this.setState({
      value: event.currentTarget.value
    });
    this.props.validate(this, event.currentTarget.value);
  },
  render: function () {
    var className = this.props.required ? this.props.className + " required" : this.props.className;
    return (
      <div id={this.props.id+"-holder"}>
      <PasswordField
        id={this.props.id}
        name={this.props.id}
        defaultValue={this.props.defaultValue}
        value={this.state.value}
        hintText={this.props.hint}
        floatingLabelText={this.props.label} 
        onChange={this.setValue}
        className={className}
        errorStyle={{color: "rgb(171, 16, 0)"}}
        multiLine={this.props.multiLine}
        rows={this.props.rows}
        style={{display:"block", width:"400px", maxWidth:"100%", position:"relative"}}
        errorText={this.state.errorText}
        required={this.props.required}
        />
      </div>
    )
  }
});

module.exports = PasswordInput;

