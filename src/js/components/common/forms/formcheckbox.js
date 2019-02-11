import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export default class FormCheckbox extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      checked: this.props.checked,
      isValid: true
    };
  }

  componentWillMount() {
    this.props.attachToForm(this); // Attaching the component to the form
  }
  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }

  updateCheck(checked) {
    this.setState({ checked });
    this.props.validate(this, !this.state.checked);
  }
  render() {
    return (
      <FormControlLabel
        className={this.props.className}
        control={
          <Checkbox
            id={this.props.id}
            name={this.props.id}
            ref={this.props.id}
            onChange={(e, checked) => this.updateCheck(checked)}
            onClick={this.props.handleClick}
            style={this.props.style}
            checked={this.state.checked}
          />
        }
        label={this.props.label}
      />
    );
  }
}
