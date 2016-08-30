import React from 'react';
import SelectField from 'material-ui/SelectField';

var SelectInput = React.createClass({
  render: function () {
    return (
      <TextField
        id={this.props.id}
        name={this.props.id}
        defaultValue={this.props.default}
        hintText={this.props.hint}
        floatingLabelText={this.props.label} 
        onChange={this.props.onchange}
        errorStyle={{color: "rgb(171, 16, 0)"}}
        style={{display:"block"}} />
    )
  }
});

module.exports = SelectInput;

