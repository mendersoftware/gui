import React from 'react';
var createReactClass = require('create-react-class');
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

var SelectInput = createReactClass({
  getInitialState: function () {
    return {
      value: this.props.value,
    };
  },

  componentWillMount: function () {
    this.props.attachToForm(this); // Attaching the component to the form
  },
  componentWillUnmount: function () {
    this.props.detachFromForm(this); // Detaching if unmounting
  },

  setValue: function (event, target, value) {
    this.setState({
      value: value
    });
    this.props.onChange(value);
  },

  render: function () {
    var menuItems = this.props.menuItems.map( function ( item, index) {
      return  ( <MenuItem key={index} value={item.value} primaryText={item.label} /> )
    }, this);

    return (
      <div>

        <SelectField
          id={this.props.id}
          name={this.props.id}
          defaultValue={this.props.default}
          value={this.props.value}
          hintText={this.props.hint}
          floatingLabelText={this.props.label} 
          onChange={this.setValue}
          errorStyle={{color: "rgb(171, 16, 0)"}}
          style={this.props.style} >
            {menuItems}
          </SelectField>
          { this.props.extraHint ? <p className="info" style={{width: "500px"}}>{this.props.extraHint}</p> : null }
      </div>
    )
  }
});

module.exports = SelectInput;

