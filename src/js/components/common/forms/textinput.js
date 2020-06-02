import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

export default class TextInput extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: this.props.value || '',
      errortext: null,
      isValid: true
    };
  }

  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
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
  componentDidUpdate(prevProps) {
    if (this.props.focus) {
      this.input.focus();
    }
    var self = this;
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value }, self.props.validate(self, self.props.value));
    }
  }
  setControlRef(ref) {
    if (this.props.setControlRef) {
      this.props.setControlRef(ref);
    }
  }
  setValue(event) {
    this.setState({
      value: event.currentTarget.value
    });
    this.props.validate(this, event.currentTarget.value);
  }
  render() {
    let { className = '' } = this.props;
    className = this.props.required ? `${className} required` : className;
    return (
      <FormControl className={className} error={Boolean(this.state.errortext)}>
        <InputLabel htmlFor={this.props.id} {...this.props.InputLabelProps}>
          {this.props.label}
        </InputLabel>
        <Input
          id={this.props.id}
          name={this.props.id}
          disabled={this.props.disabled}
          inputRef={input => (this.input = input)}
          value={this.state.value}
          onKeyPress={this.props.handleKeyPress}
          onChange={e => this.setValue(e)}
          placeholder={this.props.hint}
          required={this.props.required}
          style={{ width: '400px', maxWidth: '100%' }}
          type={this.props.type}
        />
        <FormHelperText id="component-error-text">{this.state.errortext}</FormHelperText>
      </FormControl>
    );
  }
}
