import React from 'react';
import PasswordField from 'material-ui-password-field';
import zxcvbn from 'zxcvbn';

import CheckIcon from 'react-material-icons/icons/action/check-circle';

var PasswordInput = React.createClass({
  getInitialState: function () {
    return {
      value: this.props.value || '',
      errorText: null,
      isValid: true,
      feedback: []
    };
  },

  componentWillMount: function () {
    this.props.attachToForm(this); // Attaching the component to the form
  },
  componentDidMount: function() {
    //this._checkStrength("");
    this.setValue();
  },
  componentWillUnmount: function () {
    this.props.detachFromForm(this); // Detaching if unmounting
  },
  _checkStrength: function(value) {
    var strength = zxcvbn(value);
    var feedback = strength.feedback.suggestions || [];

    this.setState({
      score: strength.score,
      feedback: feedback,
    });
  },
  setValue: function (event) {
    var value = event ? event.currentTarget.value : "";

    var strength = zxcvbn(value);
    var score = strength.score;
    var feedback = strength.feedback.suggestions || [];

    this.setState({
      score: score,
      feedback: feedback,
      value: value
    });
   

    if (score>2) {
      this.props.validate(this, value);
    } else {
      // check for length - if has any value, make string type otherwise null
      value = value ? "" : null;
      this.props.validate(this, value );
    }
    
  },
  render: function () {
    var className = this.props.required ? this.props.className + " required" : this.props.className;

    var feedback = this.state.feedback.map(function(message, index) {
      return (
        <p key={index}>{message}</p>
      )
    });

    return (
      <div id={this.props.id+"-holder"}>
        <PasswordField
          id={this.props.id}
          name={this.props.id}
          defaultValue={this.props.defaultValue}
          value={this.state.value}
          hintText={this.props.hint}
          floatingLabelText={this.props.label} 
          onChange={this.setValue}
          className={className}
          errorStyle={{color: "rgb(171, 16, 0)"}}
          multiLine={this.props.multiLine}
          rows={this.props.rows}
          style={{display:"block", width:"400px", maxWidth:"100%", position:"relative", maxHeight:"84px"}}
          errorText={this.state.errorText}
          required={this.props.required}
          />
        <div className={this.props.showHelp ? "help-text" : "hidden"}>
          <div id="pass-strength">Strength: <meter max={4} min={0} value={this.state.score} high={3} low={2} optimum={4}></meter>
            {this.state.score>2 ? <CheckIcon className="fadeIn" style={{color:"#009E73", height:"18px"}}/> : null }
          </div>
          <div>{feedback}</div>
        </div>
      </div>
    )
  }
});

module.exports = PasswordInput;

