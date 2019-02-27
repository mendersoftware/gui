import React from 'react';

import FlatButton from 'material-ui/FlatButton';

export default class FormButton extends React.Component {
  render() {
    var className = this.props.buttonHolder ? `button-holder ${this.props.className}` : this.props.className;

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
    );
  }
}
