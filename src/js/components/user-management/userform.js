import React from 'react';
var createReactClass = require('create-react-class');

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormButton from '../common/forms/formbutton';

var UserForm = createReactClass({
  componentDidUpdate: function(prevProps) {
    if (this.props.editPass !== prevProps.editPass) {
      this.forceUpdate();
    }
  },

  handleButton: function() {
    this.props.togglePass();
  },

  render: function() {
    return (
      <div>
        <Form
          dialog={true}
          onSubmit={this.props.handleSubmit}
          handleCancel={this.props.closeDialog}
          submitLabel={this.props.buttonLabel}
          submitButtonId="submit_button"
          showButtons={true}
        >
          <TextInput hint="Email" label="Email" id="email" value={(this.props.user || {}).email} validations="isLength:1,isEmail" required={!this.props.user} />

          <PasswordInput
            className={this.props.editPass ? 'edit-pass' : 'hidden'}
            id="password"
            label="Password"
            create={this.props.editPass}
            validations="isLength:1"
            disabled={!this.props.editPass}
            onClear={this.handleButton}
            edit={this.props.edit}
            required={!this.props.user}
          />

          <FormButton
            buttonHolder={this.props.edit}
            className={this.props.editPass ? 'hidden' : 'block'}
            primary={true}
            id="change"
            label="Change password"
            handleClick={this.handleButton}
          />
        </Form>
      </div>
    );
  }
});

module.exports = UserForm;
