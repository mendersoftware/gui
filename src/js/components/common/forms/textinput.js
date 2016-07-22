import React from 'react';
// material ui
import mui from 'material-ui';
var TextField = mui.TextField;

var TextInput = React.createClass({
  getInitialState: function () {
    return {
      value: this.props.value || ''
    };
  },

  componentWillMount: function () {
    this.props.attachToForm(this); // Attaching the component to the form
    // If we use the required prop we add a validation rule
    // that ensures there is a value. The input
    // should not be valid with empty value
    var validations = this.props.validations;
    if (this.props.required) {
      validations = validations ? validations + ',' : '';
      validations += 'isValue';
    }
    this.setState({validations: validations});
  },
  componentWillUnmount: function () {
    this.props.detachFromForm(this); // Detaching if unmounting
  },
  setValue: function (event) {
    this.setState({
      value: event.currentTarget.value
    });
  },
  render: function () {
    return (
      <TextField
        id={this.props.id}
        name={this.props.id}
        defaultValue={this.props.defaultValue}
        value={this.state.value}
        hintText={this.props.hint}
        floatingLabelText={this.props.label} 
        onChange={this.setValue}
        errorStyle={{color: "rgb(171, 16, 0)"}}
        multiLine={this.props.multiLine}
        rows={this.props.rows}
        style={{display:"block"}} />
    )
  }
});

module.exports = TextInput;

