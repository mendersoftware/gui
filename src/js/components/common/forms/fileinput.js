import React from 'react';
import mui from 'material-ui';
var FontIcon = mui.FontIcon;
var FileField = require('react-file-input');

var FileInput = React.createClass({
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
   if (event.target.files.length) {
      this.setState({file: event.target.files[0]});
    }
    this.props.validate(this, event.target.files[0]);
  },
  render: function () {
    return (
      <div>
        <FileField
          id={this.props.id}
          name={this.props.id}
          accept={this.props.accept}
          placeholder={this.props.placeholder}
          className={this.state.errorText ? "fileInput error" : "fileInput" }
          style={{zIndex: "2"}}
          onChange={this.setValue}
          />
        <span style={{color: "rgb(171, 16, 0)", fontSize:"12px", position:"relative", top:"-6"}}>
          {this.state.errorText}
        </span>
      </div>
    )
  }
});

module.exports = FileInput;

