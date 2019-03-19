import React from 'react';
var createReactClass = require('create-react-class');
import Checkbox from 'material-ui/Checkbox';

var FormCheckbox = createReactClass({
  getInitialState: function () {
    return {
      checked: this.props.checked,
      isValid: true
    };
  },

  componentWillMount: function () {
    this.props.attachToForm(this); // Attaching the component to the form
  },
  componentWillUnmount: function () {
    this.props.detachFromForm(this); // Detaching if unmounting
  },

  updateCheck: function () {
    this.setState({
      checked: !this.state.checked
    });
    this.props.validate(this, !this.state.checked);
  },
  render: function () {
    return (  
      <div className={this.props.className}>
        <Checkbox
          id={this.props.id}
          name={this.props.id}
          ref={this.props.id}
          onCheck={this.updateCheck}
          label={this.props.label}
          onClick={this.props.handleClick}
          style={this.props.style}
          checked={this.state.checked}
        />
      </div>
    )
  }
});

module.exports = FormCheckbox;

