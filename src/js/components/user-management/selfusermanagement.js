import React from 'react';

import { Collapse, Switch, TextField } from '@material-ui/core';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import FormButton from '../common/forms/formbutton';
import EnterpriseNotification from '../common/enterpriseNotification';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import { preformatWithRequestID } from '../../helpers';

import TwoFactorAuthSetup from './twofactorauthsetup';

export default class SelfUserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = Object.assign({ qrExpanded: false }, this._getState());
    AppActions.getGlobalSettings().then(settings => {
      if ((AppStore.getIsEnterprise() || AppStore.getIsHosted()) && !settings.hasOwnProperty('2fa')) {
        AppActions.saveGlobalSettings(Object.assign(settings, { '2fa': 'disabled' }));
      }
    });
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

  handle2FAState(required) {
    this.setState({ qrExpanded: false });
    AppActions.saveGlobalSettings(Object.assign(AppStore.getGlobalSettings() || {}, { '2fa': required ? 'enabled' : 'disabled' }));
  }

  render() {
    const self = this;
    const { currentUser, editEmail, editPass, emailFormId, qrExpanded, has2fa } = self.state;
    const email = (currentUser || { email: '' }).email;
    const isEnterprise = AppStore.getIsEnterprise() || AppStore.getIsHosted();
    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        <h2 className="margin-top-small">My account</h2>

        <Form
          className="flexbox space-between"
          onSubmit={userdata => self._editSubmit(userdata)}
          handleCancel={() => self.handleEmail()}
          submitLabel="Save"
          showButtons={editEmail}
          buttonColor="secondary"
          submitButtonId="submit_email"
          uniqueId={emailFormId}
        >
          {!editEmail && currentUser.email ? (
            <>
              <TextField label="Email" InputLabelProps={{ shrink: !!email }} disabled defaultValue={email} style={{ width: '400px', maxWidth: '100%' }} />
              <FormButton
                className="inline-block"
                color="primary"
                id="change_email"
                label="Change email"
                style={{ margin: '30px 0 0 15px' }}
                handleClick={() => self.handleEmail()}
              />
            </>
          ) : (
            <TextInput
              hint="Email"
              label="Email"
              id="email"
              disabled={false}
              value={email}
              validations="isLength:1,isEmail"
              focus={true}
              InputLabelProps={{ shrink: !!email }}
            />
          )}
        </Form>

        <Form
          onSubmit={userdata => self._editSubmit(userdata)}
          handleCancel={() => self.handlePass()}
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
              onClear={() => self.handleButton()}
              edit={false}
            />
          ) : (
            <FormButton buttonHolder={true} color="primary" id="change_pass" label="Change password" handleClick={() => self.handlePass()} />
          )}
        </Form>
        {isEnterprise ? (
          <div className="margin-top">
            <div className="clickable flexbox space-between" onClick={() => self.setState({ qrExpanded: !qrExpanded })}>
              <p className="help-content">Enable Two Factor authentication</p>
              <Switch checked={has2fa || qrExpanded} />
            </div>
            <p className="info" style={{ width: '75%', margin: 0 }}>
              Two Factor Authentication adds a second layer of protection to your account by asking for an additional verification code each time you log in.
            </p>
            <Collapse in={qrExpanded} timeout="auto" unmountOnExit>
              <TwoFactorAuthSetup handle2FAState={isEnabled => self.handle2FAState(isEnabled)} show={qrExpanded} user={currentUser} />
            </Collapse>
          </div>
        ) : (
          <EnterpriseNotification
            isEnterprise={isEnterprise}
            benefit="set up Two Factor Authentication to add an additional layer of security to their account"
          />
        )}
      </div>
    );
  }
}
