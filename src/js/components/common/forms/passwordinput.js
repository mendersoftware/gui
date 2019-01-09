import React from 'react';
import PasswordField from 'material-ui-password-field';
import CheckIcon from 'react-material-icons/icons/action/check-circle';
import zxcvbn from 'zxcvbn';
import copy from 'copy-to-clipboard';
var generator = require('generate-password');
var createReactClass = require('create-react-class');
import FlatButton from 'material-ui/FlatButton';

function getState() {
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

var PasswordInput = createReactClass({
  getInitialState: function () {
    return getState();
  },

  componentWillMount: function () {
    this.props.attachToForm(this); // Attaching the component to the form
  },
  componentWillUnmount: function () {
    this.props.detachFromForm(this); // Detaching if unmounting
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.className!==this.props.className) {
      // resets state when "cancel" pressed
      this.setState(getState());
    }
  },
  setValue: function (event) {

    var value = event ? event.currentTarget.value : "";

    if (this.props.create) {
      var strength = zxcvbn(value); 
      var score = strength.score;
      var feedback = strength.feedback.suggestions || [];

      this.setState({    
        score: score,    
        feedback: feedback,    
        value: value   
      });
      if (score>3) {
        this.props.validate(this, value); 
      } else {
        // if some weak pass exists, pass it to validate as "0", otherwise leave empty- if not required, blank is allowed but weak is not
        this.props.validate(this, value ? "0" : ""); 
      }
         
      
    } else {
      this.setState({value: value});
      this.props.validate(this, value);
    }
  },
  clearPass: function() {
    this.setValue();
    this.props.onClear();
    this.setState({copied:false});
  },
  generatePass: function() {
    this.setState({visible: true});
    var password = generator.generate({
        length: 16,
        numbers: true
    });
    this.setValue({currentTarget: {value: password}});
    copy(password);
    this.setState({copied: true});
  },
  render: function () {
    var className = this.props.required ? this.props.className + " required" : this.props.className;

    var feedback = this.state.feedback.map(function(message, index) {
      return (
        <p key={index}>{message}</p>
      )
    });

    return (
      <div id={this.props.id+"-holder"} className={className}>
        <div style={{position: "relative"}}>
          <PasswordField
            id={this.props.id}
            name={this.props.id}
            defaultValue={this.props.defaultValue}
            value={this.state.value}
            hintText={this.props.hint}
            floatingLabelText={this.props.label} 
            onChange={this.setValue}
            errorStyle={{color: "rgb(171, 16, 0)"}}
            style={{maxWidth: "100%", width: "400px"}}
            multiLine={this.props.multiLine}
            rows={this.props.rows}
            errorText={this.state.errorText}
            required={this.props.required}
            onKeyPress={this.props.handleKeyPress}
            disabled={this.props.disabled}
            visible={this.state.visible}
          />
          <div className={this.props.create ? "pass-buttons" : "hidden"}>
            <FlatButton label="Generate" primary={true} onClick={this.generatePass} style={{top:"20px !important"}} />
            {this.props.edit ? <FlatButton label="Cancel" onClick={this.clearPass} style={{top:"20px !important"}} /> : null }
          </div>
        </div>
        {this.state.copied ? <span className="green fadeIn margin-bottom-small">Copied to clipboard</span> : null }
        <div className={this.props.create ? "help-text" : "hidden"}>
          <div id="pass-strength">Strength: <meter max={4} min={0} value={this.state.score} high={3.9} optimum={4} low={2.5}></meter>
            {this.state.score>3 ? <CheckIcon className="fadeIn" style={{color:"#009E73", height:"18px"}}/> : null }
          </div>
          <div>{feedback}</div>
        </div>
      </div>
    )
  }
});

module.exports = PasswordInput;

