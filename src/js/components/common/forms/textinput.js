import React from 'react';
// material ui
import mui from 'material-ui';
var TextField = mui.TextField;

var TextInput = React.createClass({

  componentWillMount: function () {
  
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
  render: function () {
    return (
      <TextField
        id={this.props.id}
        defaultValue={this.props.defaultValue}
        hintText={this.props.hint}
        floatingLabelText={this.props.label} 
        onChange={this.props.onchange}
        errorStyle={{color: "rgb(171, 16, 0)"}}
        multiLine={this.props.multiLine}
        rows={this.props.rows}
        style={{display:"block"}} />
    )
  }
});

module.exports = TextInput;

