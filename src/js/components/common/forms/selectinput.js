import React from 'react';
// material ui
import mui from 'material-ui';
var SelectField = mui.SelectField;

var SelectInput = React.createClass({
  render: function () {
    return (
      <TextField
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

