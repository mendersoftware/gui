import React from 'react';
var createReactClass = require('create-react-class');
import FlatButton from 'material-ui/FlatButton';

var FormButton = createReactClass({
  render: function () {
    var className = this.props.buttonHolder ? "button-holder " + this.props.className : this.props.className;

    return (  
      <div className={className}>
        <FlatButton
          id={this.props.id}
          label={this.props.label}
          onClick={this.props.handleClick}
          style={this.props.style}
          primary={this.props.primary}
          secondary={this.props.secondary}
        />
      </div>
    )
  }
});

module.exports = FormButton;

