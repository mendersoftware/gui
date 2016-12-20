import React from 'react';
import TextField from 'material-ui/TextField';

var TextInput = React.createClass({
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
    var className = this.props.required ? "required" : "";
    return (
      <TextField
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
        style={{display:"block"}}
        errorText={this.state.errorText}
        required={this.props.required}
        />
    )
  }
});

module.exports = TextInput;

