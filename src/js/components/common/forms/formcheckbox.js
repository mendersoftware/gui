import React from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

export default class FormCheckbox extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      checked: this.props.checked,
      // the following is needed for the form validation to work if the field is not required
      isValid: true, // lgtm [js/react/unused-or-undefined-state-property]
      value: this.props.checked ? this.props.value : ''
    };
  }

  componentDidMount() {
    this.props.attachToForm(this); // Attaching the component to the form
    if (this.props.value) {
      this.props.validate(this, this.props.value);
    }
    if (this.props.setControlRef) {
      this.props.setControlRef(this.input);
    }
  }

  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }

  updateCheck(checked) {
    const value = checked ? this.props.value : '';
    this.setState({ checked, value });
    this.props.validate(this, value);
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
            color="primary"
            checked={this.state.checked}
          />
        }
        label={this.props.label}
      />
    );
  }
}
