import React from 'react';
import copy from 'copy-to-clipboard';
import generator from 'generate-password';

import { Button, FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel } from '@material-ui/core';
import { CheckCircle as CheckIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@material-ui/icons';

import { colors } from '../../../themes/Mender';

export default class PasswordInput extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this._getState();
  }

  componentDidMount() {
    this.props.attachToForm(this); // Attaching the component to the form
  }
  componentWillUnmount() {
    this.props.detachFromForm(this); // Detaching if unmounting
  }
  componentDidUpdate(prevProps) {
    if (prevProps.className !== this.props.className) {
      // resets state when "cancel" pressed
      this.setState(this._getState());
    }
  }
  _getState() {
    return {
      value: this.props.value || '',
      errortext: null,
      isValid: true,
      score: '',
      feedback: [],
      visible: false,
      copied: false
    };
  }
  setValue(event) {
    var value = event ? event.currentTarget.value : '';
    if (this.props.create) {
      import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn').then(({ default: zxcvbn }) => {
        var strength = zxcvbn(value);
        var score = strength.score;
        var feedback = strength.feedback.suggestions || [];

        this.setState({
          score: score,
          feedback: feedback,
          value: value
        });
        if (score > 3) {
          this.props.validate(this, value);
        } else {
          // if some weak pass exists, pass it to validate as "0", otherwise leave empty- if not required, blank is allowed but weak is not
          this.props.validate(this, value ? '0' : '');
        }
      });
    } else {
      this.setState({ value: value });
      this.props.validate(this, value);
    }
  }
  clearPass() {
    this.setValue();
    this.props.onClear();
    this.setState({ copied: false });
  }
  generatePass() {
    this.setState({ visible: true });
    var password = generator.generate({
      length: 16,
      numbers: true
    });
    this.setValue({ currentTarget: { value: password } });
    copy(password);
    this.setState({ copied: true });
  }
  render() {
    var { generate = true } = this.props;
    var feedback = (
      <p>
        {this.state.feedback.map((message, index) => (
          <React.Fragment key={`feedback-${index}`}>
            <span>{message}</span>
            <br />
          </React.Fragment>
        ))}
      </p>
    );

    return (
      <div id={`${this.props.id}-holder`} className={this.props.className}>
        <FormControl error={Boolean(this.state.errortext)} className={this.props.required ? 'required' : ''}>
          <InputLabel htmlFor={this.props.id}>{this.props.label}</InputLabel>
          <Input
            id={this.props.id}
            name={this.props.id}
            type={this.state.visible ? 'text' : 'password'}
            defaultValue={this.props.defaultValue}
            value={this.state.value}
            disabled={this.props.disabled}
            style={{ width: 400 }}
            required={this.props.required}
            onChange={e => this.setValue(e)}
            onKeyPress={this.props.handleKeyPress}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => this.setState({ visible: !this.state.visible })}>
                  {this.state.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            }
          />
          <FormHelperText id="component-error-text">{this.state.errortext}</FormHelperText>
        </FormControl>
        {this.state.copied ? <div className="green fadeIn margin-bottom-small">Copied to clipboard</div> : null}
        {this.props.create ? (
          <div>
            <div className="help-text" id="pass-strength">
              Strength: <meter max={4} min={0} value={this.state.score} high={3.9} optimum={4} low={2.5} />
              {this.state.score > 3 ? (
                <CheckIcon className="fadeIn" style={{ color: colors.successStyleColor, height: '18px', marginTop: '-3px', marginBottom: '-3px' }} />
              ) : null}
            </div>
            {feedback}
            {generate ? (
              <div className="pass-buttons">
                <Button color="primary" onClick={() => this.generatePass()}>
                  Generate
                </Button>
                {this.props.edit ? <Button onClick={() => this.clearPass()}>Cancel</Button> : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}
