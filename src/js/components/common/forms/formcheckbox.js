import React from 'react';

import Checkbox from 'material-ui/Checkbox';

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

  updateCheck() {
    this.setState({
      checked: !this.state.checked
    });
    this.props.validate(this, !this.state.checked);
  }
  render() {
    return (
      <div className={this.props.className}>
        <Checkbox
          id={this.props.id}
          name={this.props.id}
          ref={this.props.id}
          onCheck={() => this.updateCheck()}
          label={this.props.label}
          onClick={this.props.handleClick}
          style={this.props.style}
          checked={this.state.checked}
        />
      </div>
    );
  }
}
