import React from 'react';
import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormButton from '../common/forms/formbutton';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import { preformatWithRequestID } from '../../helpers';

export default class SelfUserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = this._getState();
  }
  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  _getState() {
    return {
      snackbar: AppStore.getSnackbar(),
      currentUser: AppStore.getCurrentUser()
    };
  }

  _onChange() {
    this.setState(this._getState());
  }

  componentWillUnmount() {
    AppStore.removeChangeListener(this._onChange.bind(this));
  }

  _editSubmit(userData) {
    var self = this;
    return AppActions.editUser(self.state.currentUser.id, userData)
      .then(user => {
        user = userData;
        user.id = self.state.currentUser.id;
        AppActions.setCurrentUser(user);
        AppActions.setSnackbar('The user has been updated.');
        self.setState({ editPass: false, editEmail: false });
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `There was an error editing the user. ${errMsg}`));
      });
  }

  handleEmail() {
    var uniqueId = this.state.emailFormId;
    if (this.state.editEmail) {
      uniqueId = new Date();
      // changing unique id will reset form values
    }
    this.setState({ editEmail: !this.state.editEmail, emailFormId: uniqueId });
  }

  handlePass() {
    this.setState({ editPass: !this.state.editPass });
  }

  render() {
    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        <h2 style={{ marginTop: '15px' }}>My account</h2>

        <Form
          onSubmit={userdata => this._editSubmit(userdata)}
          handleCancel={() => this.handleEmail()}
          submitLabel="Save"
          showButtons={this.state.editEmail}
          submitButtonId="submit_email"
          uniqueId={this.state.emailFormId}
        >
          <TextInput
            hint="Email"
            label="Email"
            id="email"
            disabled={!this.state.editEmail}
            value={(this.state.currentUser || {}).email}
            validations="isLength:1,isEmail"
            focus={this.state.editEmail}
          />

          <FormButton
            className={this.state.editEmail ? 'hidden' : 'inline-block'}
            color="primary"
            id="change_email"
            label="Change email"
            handleClick={() => this.handleEmail()}
          />
        </Form>

        <Form
          onSubmit={userdata => this._editSubmit(userdata)}
          handleCancel={() => this.handlePass()}
          submitLabel="Save"
          submitButtonId="submit_pass"
          showButtons={this.state.editPass}
          className="margin-top"
        >
          <PasswordInput
            className={this.state.editPass ? 'edit-pass' : 'hidden'}
            id="password"
            label="Password"
            create={this.state.editPass}
            validations="isLength:1"
            disabled={!this.state.editPass}
            onClear={() => this.handleButton()}
            edit={false}
          />

          <FormButton
            buttonHolder={true}
            className={this.state.editPass ? 'hidden' : 'block'}
            color="primary"
            id="change_pass"
            label="Change password"
            handleClick={() => this.handlePass()}
          />
        </Form>
      </div>
    );
  }
}
