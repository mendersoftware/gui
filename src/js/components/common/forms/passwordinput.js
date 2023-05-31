// Copyright 2016 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';

import { CheckCircle as CheckIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { Button, FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel } from '@mui/material';

import copy from 'copy-to-clipboard';
import generator from 'generate-password';

import { TIMEOUTS } from '../../../constants/appConstants';

const PasswordGenerateButtons = ({ clearPass, edit, generatePass }) => (
  <div className="pass-buttons">
    <Button color="primary" onClick={generatePass}>
      Generate
    </Button>
    {edit ? <Button onClick={clearPass}>Cancel</Button> : null}
  </div>
);

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
    const value = event ? event.currentTarget.value : '';
    this.setState({ value });
    if (this.props.create) {
      import(/* webpackChunkName: "zxcvbn" */ 'zxcvbn').then(({ default: zxcvbn }) => {
        const strength = zxcvbn(value);
        const score = strength.score;
        const feedback = strength.feedback.suggestions || [];
        this.setState({ score, feedback });
        if (score > 3) {
          this.props.validate(this, value);
        } else {
          // if some weak pass exists, pass it to validate as "0", otherwise leave empty- if not required, blank is allowed but weak is not
          this.props.validate(this, value ? '0' : '');
        }
      });
    } else {
      this.props.validate(this, value);
    }
  }
  clearPass() {
    this.setValue();
    this.props.onClear();
    this.setState({ copied: false });
  }
  generatePass() {
    const self = this;
    const password = generator.generate({ length: 16, numbers: true });
    self.setValue({ currentTarget: { value: password } });
    copy(password);
    self.setState({ copied: true, visible: true });
    setTimeout(() => self.setState({ copied: false }), TIMEOUTS.fiveSeconds);
  }
  render() {
    const { className, create, defaultValue, disabled, edit, generate, handleKeyPress, id, InputLabelProps = {}, label, placeholder, required } = this.props;
    const { copied, errortext, feedback, score, visible, value } = this.state;
    const feedbackMessages = Boolean(errortext) && (
      <p className="help-text">
        {feedback.map((message, index) => (
          <React.Fragment key={`feedback-${index}`}>
            <span>{message}</span>
            <br />
          </React.Fragment>
        ))}
      </p>
    );

    return (
      <div id={`${id}-holder`} className={className}>
        <div className="password-wrapper">
          <FormControl error={Boolean(errortext)} className={required ? 'required' : ''}>
            <InputLabel htmlFor={id} {...InputLabelProps}>
              {label}
            </InputLabel>
            <Input
              id={id}
              name={id}
              type={visible ? 'text' : 'password'}
              defaultValue={defaultValue}
              placeholder={placeholder}
              value={value}
              disabled={disabled}
              style={{ width: 400 }}
              required={required}
              onChange={e => this.setValue(e)}
              onKeyPress={handleKeyPress}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => this.setState({ visible: !visible })} size="large">
                    {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText id="component-error-text">{errortext}</FormHelperText>
          </FormControl>
          {generate && !required && <PasswordGenerateButtons clearPass={() => this.clearPass()} edit={edit} generatePass={() => this.generatePass()} />}
        </div>
        {copied ? <div className="green fadeIn margin-bottom-small">Copied to clipboard</div> : null}
        {create ? (
          <div>
            <div className="help-text" id="pass-strength">
              Strength: <meter max={4} min={0} value={score} high={3.9} optimum={4} low={2.5} />
              {score > 3 ? <CheckIcon className="fadeIn green" style={{ height: '18px', marginTop: '-3px', marginBottom: '-3px' }} /> : null}
            </div>
            {feedbackMessages}
            {generate && required && <PasswordGenerateButtons clearPass={() => this.clearPass()} edit={edit} generatePass={() => this.generatePass()} />}
          </div>
        ) : null}
      </div>
    );
  }
}
