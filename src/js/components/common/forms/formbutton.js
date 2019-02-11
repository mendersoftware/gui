import React from 'react';

import Button from '@material-ui/core/Button';

export default class FormButton extends React.Component {
  render() {
    var className = this.props.buttonHolder ? `button-holder ${this.props.className}` : this.props.className;

    return (
      <div className={className}>
        <Button id={this.props.id} onClick={this.props.handleClick} style={this.props.style} primary={this.props.primary} secondary={this.props.secondary}>
          {this.props.label}
        </Button>
      </div>
    );
  }
}
