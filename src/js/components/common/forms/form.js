import validator from 'validator';
import React from 'react';
import mui from 'material-ui';

var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;

var Form = React.createClass({
  componentWillMount: function () {
    this.model = {};
    this.newChildren = {};
    this.inputs = {}; // We create a map of traversed inputs
    this.registerInputs(); // We register inputs from the children
  },
  registerInputs: function() {
    this.newChildren = React.Children.map(this.props.children, function(child) {
      return React.cloneElement(child, {attachToForm:this.attachToForm, detachFromForm:this.detachFromForm, updateModel:this.updateModel})
    }.bind(this));
  
  },
  // All methods defined are bound to the component by React JS, so it is safe to use "this"
  // even though we did not bind it. We add the input component to our inputs map
  attachToForm: function (component) {
    this.inputs[component.props.id] = component;
    this.model[component.props.id] = component.state.value;
  },
  
  // We want to remove the input component from the inputs map
  detachFromForm: function (component) {
    delete this.inputs[component.props.id];
    delete this.model[component.props.id];
  },
  updateModel: function (component) {
    Object.keys(this.inputs).forEach(function (id) {
      this.model[id] = this.inputs[id].state.value;
    }.bind(this));
    this.props.onSubmit(this.model);
  },
  render: function () {

    var uploadActions = (
      <div className="float-right">
        <div key="cancelcontain" style={{marginRight:"10", display:"inline-block"}}>
          <FlatButton
            key="cancel"
            label="Cancel"
            onClick={this.props.dialogDismiss.bind(null, 'upload')} />
        </div>
        <RaisedButton
          key="submit"
          label="Save image"
          primary={true}
          onClick={this.updateModel} />
      </div>
    );
    return (
      <form>
        {this.newChildren}
        {uploadActions}
      </form>
    )
  }
});

module.exports = Form;