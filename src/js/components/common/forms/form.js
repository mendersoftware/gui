import validator from 'validator';
import React from 'react';

var Form = React.createClass({
 
  componentWillMount: function () {
  
    // If we use the required prop we add a validation rule
    // that ensures there is a value. The input
    // should not be valid with empty value
    if (this.props.required) {
      this.props.validations = this.props.validations ? this.props.validations + ',' : '';
      this.props.validations += 'isValue';
    }
    
  },
  render: function () {
    return (
      <form>
        {this.props.children}
      </form>
    )
  }
});

module.exports = Form;

