import React from 'react';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormButton from '../common/forms/formbutton';

export default class UserForm extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.editPass !== prevProps.editPass) {
      this.forceUpdate();
    }
  }

  handleButton() {
    this.props.togglePass();
  }

  render() {
    return (
      <Form
        dialog={true}
        onSubmit={this.props.handleSubmit}
        handleCancel={this.props.closeDialog}
        submitLabel={this.props.buttonLabel}
        submitButtonId="submit_button"
        showButtons={true}
      >
        <TextInput hint="Email" label="Email" id="email" value={(this.props.user || {}).email} validations="isLength:1,isEmail" required={!this.props.user} />

        {this.props.editPass ? (
          <PasswordInput
            className="edit-pass"
            id="password"
            label="Password"
            create={this.props.editPass}
            validations="isLength:1"
            disabled={!this.props.editPass}
            onClear={() => this.handleButton()}
            edit={this.props.edit}
            required={!this.props.user}
          />
        ) : (
          <FormButton buttonHolder={this.props.edit} color="primary" id="change" label="Change password" handleClick={() => this.handleButton()} />
        )}
      </Form>
    );
  }
}
