import React from 'react';

import Button from '@material-ui/core/Button';

export default class FormButton extends React.Component {
  render() {
    var className = this.props.buttonHolder ? `button-holder ${this.props.className}` : this.props.className;

    return (
      <Button className={className} id={this.props.id} onClick={this.props.handleClick} style={this.props.style} color={this.props.color}>
        {this.props.label}
      </Button>
    );
  }
}
