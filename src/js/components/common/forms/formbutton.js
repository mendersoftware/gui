import React from 'react';
var createReactClass = require('create-react-class');
import FlatButton from 'material-ui/FlatButton';

var FormButton = createReactClass({
  render: function () {
    return (
      <div className={this.props.buttonHolder ? "button-holder" : ""}>
        <FlatButton
          id={this.props.id}
          label={this.props.label}
          onClick={this.props.handleClick}
          className={this.props.className}
          style={this.props.style}
          primary={this.props.primary}
          secondary={this.props.secondary}
        />
      </div>
    )
  }
});

module.exports = FormButton;

