import React from 'react';
import PasswordField from 'material-ui-password-field';
import zxcvbn from 'zxcvbn';
import copy from 'copy-to-clipboard';
import generator from 'generate-password';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import CheckIcon from '@material-ui/icons/CheckCircle';

export default class PasswordInput extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this._getState();
  }

  componentWillMount() {
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
      value: '',
      errorText: null,
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
    var className = this.props.required ? `${this.props.className} required` : this.props.className;

    var feedback = this.state.feedback.map((message, index) => {
      return <p key={index}>{message}</p>;
    });

    return (
      <div id={`${this.props.id}-holder`} className={className}>
        <div style={{ position: 'relative' }}>
          <FormControl>
            <InputLabel htmlFor={this.props.id}>{this.props.label}</InputLabel>
            <PasswordField
              id={this.props.id}
              name={this.props.id}
              defaultValue={this.props.defaultValue}
              value={this.state.value}
              onChange={e => this.setValue(e)}
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              style={{ width: 400 }}
              errorText={this.state.errorText}
              required={this.props.required}
              onKeyPress={this.props.handleKeyPress}
              disabled={this.props.disabled}
              visible={this.state.visible}
            />
          </FormControl>
          {this.props.create ? (
            <div>
              <Button className="pass-buttons" color="primary" onClick={() => this.generatePass()}>
                Generate
              </Button>
              {this.props.edit ? <Button onClick={() => this.clearPass()}>Cancel</Button> : null}
            </div>
          ) : null}
        </div>
        {this.state.copied ? <span className="green fadeIn margin-bottom-small">Copied to clipboard</span> : null}

        {this.props.create ? (
          <div>
            <div className="help-text" id="pass-strength">
              Strength: <meter max={4} min={0} value={this.state.score} high={3.9} optimum={4} low={2.5} />
              {this.state.score > 3 ? <CheckIcon className="fadeIn" style={{ color: '#009E73', height: '18px' }} /> : null}
            </div>
            <div>{feedback}</div>
          </div>
        ) : null}
      </div>
    );
  }
}
