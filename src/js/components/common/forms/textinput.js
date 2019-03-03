import React from 'react';

import TextField from '@material-ui/core/TextField';

export default class TextInput extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: this.props.value,
      errorText: null,
      isValid: true
    };
  }

  componentWillMount() {
    this.props.attachToForm(this); // Attaching the component to the form
  }
  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }
  componentDidMount() {
    if (this.props.value) {
      this.props.validate(this, this.props.value);
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.focus) {
      this.refs[this.props.id].focus();
    }
    var self = this;
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value }, self.props.validate(self, self.props.value));
    }
  }
  setValue(event) {
    this.setState({
      value: event.currentTarget.value
    });
    this.props.validate(this, event.currentTarget.value);
  }
  render() {
    var className = this.props.required ? `${this.props.className} required` : this.props.className;
    return (
      <TextField
        id={this.props.id}
        name={this.props.id}
        value={this.state.value}
        placeholder={this.props.hint}
        label={this.props.label}
        onChange={e => this.setValue(e)}
        className={className}
        errorStyle={{ color: 'rgb(171, 16, 0)' }}
        style={{ width: '400px', maxWidth: '100%', marginRight: '80px' }}
        errorText={this.state.errorText}
        required={this.props.required}
        type={this.props.type}
        onKeyPress={this.props.handleKeyPress}
        disabled={this.props.disabled}
        ref={this.props.id}
      />
    );
  }
}
