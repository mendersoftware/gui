import React from 'react';
import copy from 'copy-to-clipboard';
import generator from 'generate-password';

import { Button, FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel } from '@mui/material';
import { CheckCircle as CheckIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

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
    const self = this;
    self.setState({ visible: true });
    var password = generator.generate({
      length: 16,
      numbers: true
    });
    self.setValue({ currentTarget: { value: password } });
    copy(password);
    self.setState({ copied: true });
    setTimeout(() => self.setState({ copied: false }), 2000);
  }
  render() {
    const {
      className,
      create,
      defaultValue,
      disabled,
      edit,
      generate = true,
      handleKeyPress,
      id,
      InputLabelProps = {},
      label,
      placeholder,
      required
    } = this.props;
    const { copied, errortext, feedback, score, visible, value } = this.state;
    const feedbackMessages = (
      <p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content', columnGap: 8, alignItems: 'baseline' }}>
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
          {generate ? (
            <div className="pass-buttons">
              <Button color="primary" onClick={() => this.generatePass()}>
                Generate
              </Button>
              {edit ? <Button onClick={() => this.clearPass()}>Cancel</Button> : null}
            </div>
          ) : null}
        </div>
        {copied ? <div className="green fadeIn margin-bottom-small">Copied to clipboard</div> : null}
        {create ? (
          <div>
            <div className="help-text" id="pass-strength">
              Strength: <meter max={4} min={0} value={score} high={3.9} optimum={4} low={2.5} />
              {score > 3 ? (
                <CheckIcon className="fadeIn" style={{ color: colors.successStyleColor, height: '18px', marginTop: '-3px', marginBottom: '-3px' }} />
              ) : null}
            </div>
            {feedbackMessages}
          </div>
        ) : null}
      </div>
    );
  }
}
