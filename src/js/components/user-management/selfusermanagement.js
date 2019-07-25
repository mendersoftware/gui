import React from 'react';
import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormButton from '../common/forms/formbutton';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import { preformatWithRequestID } from '../../helpers';
import { Checkbox, Collapse } from '@material-ui/core';
import Loader from '../common/loader';

export default class SelfUserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = Object.assign({ qrExpanded: false }, this._getState());
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  _getState() {
    return {
      snackbar: AppStore.getSnackbar(),
      currentUser: AppStore.getCurrentUser(),
      has2fa: AppStore.get2FARequired()
    };
  }

  _onChange() {
    const self = this;
    self.setState(self._getState(), () =>
      self.state.qrExpanded && !self.state.qrImage ? AppActions.get2FAQRCode(self.state.currentUser.email).then(qrImage => self.setState({ qrImage })) : null
    );
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

  handle2FAState(required) {
    this.setState({ qrExpanded: required });
    AppActions.saveGlobalSettings(Object.assign(AppStore.getGlobalSettings() || {}, { '2fa': required ? 'enabled' : 'disabled' }));
  }

  render() {
    const self = this;
    const { editEmail, editPass, qrExpanded, has2fa, qrImage } = self.state;
    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        <h2 style={{ marginTop: '15px' }}>My account</h2>

        <Form
          className="flexbox space-between"
          onSubmit={userdata => this._editSubmit(userdata)}
          handleCancel={() => this.handleEmail()}
          submitLabel="Save"
          showButtons={editEmail}
          buttonColor="secondary"
          submitButtonId="submit_email"
          uniqueId={this.state.emailFormId}
        >
          <TextInput
            hint="Email"
            label="Email"
            id="email"
            disabled={!editEmail}
            value={(this.state.currentUser || {}).email}
            validations="isLength:1,isEmail"
            focus={editEmail}
            InputLabelProps={{ shrink: (this.state.currentUser || {}).email }}
          />

          {!editEmail && (
            <FormButton
              className="inline-block"
              color="primary"
              id="change_email"
              label="Change email"
              style={{ margin: '30px 0 0 15px' }}
              handleClick={() => this.handleEmail()}
            />
          )}
        </Form>

        <Form
          onSubmit={userdata => this._editSubmit(userdata)}
          handleCancel={() => this.handlePass()}
          submitLabel="Save"
          submitButtonId="submit_pass"
          buttonColor="secondary"
          showButtons={editPass}
          className="margin-top flexbox space-between"
        >
          {editPass ? (
            <PasswordInput
              className="edit-pass"
              id="password"
              label="Password"
              create={editPass}
              validations="isLength:1"
              disabled={!editPass}
              onClear={() => this.handleButton()}
              edit={false}
            />
          ) : (
            <FormButton buttonHolder={true} color="primary" id="change_pass" label="Change password" handleClick={() => this.handlePass()} />
          )}
        </Form>
        {AppStore.get2FAAvailability() && (
          <div className="margin-top">
            <div className="clickable flexbox space-between" onClick={() => self.handle2FAState(!has2fa)}>
              <p className="help-content muted">Enable 2FA authentication</p>
              <Checkbox checked={has2fa} />
            </div>
            <Collapse in={qrExpanded} timeout="auto" unmountOnExit>
              {!qrImage ? <Loader show={!qrImage} /> : <img src={`data:image/png;base64,${qrImage}`} style={{ maxHeight: '20vh' }} />}
            </Collapse>
          </div>
        )}
      </div>
    );
  }
}
