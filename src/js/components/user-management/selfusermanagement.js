import React from 'react';
import { connect } from 'react-redux';

import { Button, Collapse, Switch, TextField } from '@material-ui/core';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import EnterpriseNotification from '../common/enterpriseNotification';

import { setSnackbar } from '../../actions/appActions';
import { editUser, saveGlobalSettings, saveUserSettings } from '../../actions/userActions';

import { preformatWithRequestID } from '../../helpers';

import { OAuth2Providers } from './oauth2providers';
import TwoFactorAuthSetup from './twofactorauthsetup';

export class SelfUserManagement extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editEmail: false,
      editPass: false,
      emailFormId: new Date(),
      qrExpanded: false
    };
  }

  _editSubmit(userId, userData) {
    var self = this;
    return self.props
      .editUser(userId, userData)
      .then(() => {
        self.props.setSnackbar('The user has been updated.');
        self.setState({ editPass: false, editEmail: false });
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `There was an error editing the user. ${errMsg}`));
      });
  }

  handleEmail() {
    let uniqueId = this.state.emailFormId;
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
    const self = this;
    self.setState({ qrExpanded: false });
    self.props
      .saveGlobalSettings({ '2fa': required ? 'enabled' : 'disabled' })
      .then(() => (required ? self.props.setSnackbar('Two Factor authentication set up successfully.') : null));
  }

  render() {
    const self = this;
    const { editEmail, editPass, emailFormId, qrExpanded } = self.state;
    const { canHave2FA, currentUser, has2FA, hasTracking, hasTrackingConsent, isEnterprise, saveUserSettings } = self.props;
    const email = currentUser.email;
    const isOAuth2 = !!currentUser.login;
    const provider = isOAuth2 ? OAuth2Providers.find(provider => !!currentUser.login[provider.id]) : null;
    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        <h2 className="margin-top-small">My profile</h2>
        {!editEmail && currentUser.email ? (
          <div className="flexbox space-between">
            <TextField
              label="Email"
              key={email}
              InputLabelProps={{ shrink: !!email }}
              disabled
              defaultValue={email}
              style={{ width: '400px', maxWidth: '100%' }}
            />
            {!isOAuth2 && (
              <Button className="inline-block" color="primary" id="change_email" style={{ margin: '30px 0 0 15px' }} onClick={() => self.handleEmail()}>
                Change email
              </Button>
            )}
          </div>
        ) : (
          <Form
            className="flexbox space-between"
            onSubmit={userdata => self._editSubmit(currentUser.id, userdata)}
            handleCancel={() => self.handleEmail()}
            submitLabel="Save"
            showButtons={editEmail}
            buttonColor="secondary"
            submitButtonId="submit_email"
            uniqueId={emailFormId}
          >
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
          </Form>
        )}
        {!isOAuth2 &&
          (!editPass ? (
            <form className="flexbox space-between">
              <TextField
                label="Password"
                key="password-placeholder"
                disabled
                defaultValue="********"
                style={{ width: '400px', maxWidth: '100%' }}
                type="password"
              />
              <Button color="primary" id="change_password" style={{ margin: '30px 0 0 15px' }} onClick={() => self.handlePass()}>
                Change password
              </Button>
            </form>
          ) : (
            <Form
              onSubmit={userdata => self._editSubmit(currentUser.id, userdata)}
              handleCancel={() => self.handlePass()}
              submitLabel="Save"
              submitButtonId="submit_pass"
              buttonColor="secondary"
              showButtons={editPass}
              className="margin-top flexbox space-between"
            >
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
            </Form>
          ))}
        {!isOAuth2 &&
          (canHave2FA ? (
            <div className="margin-top">
              <div
                className="clickable flexbox space-between"
                onClick={() => self.setState({ qrExpanded: has2FA && !qrExpanded ? self.handle2FAState(false) : !qrExpanded })}
              >
                <p className="help-content">Enable Two Factor authentication</p>
                <Switch checked={has2FA || qrExpanded} />
              </div>
              <p className="info" style={{ width: '75%', margin: 0 }}>
                Two Factor Authentication adds a second layer of protection to your account by asking for an additional verification code each time you log in.
              </p>
              <Collapse in={qrExpanded} timeout="auto" unmountOnExit>
                <TwoFactorAuthSetup handle2FAState={isEnabled => self.handle2FAState(isEnabled)} has2FA={has2FA} show={qrExpanded} user={currentUser} />
              </Collapse>
            </div>
          ) : (
            <EnterpriseNotification
              isEnterprise={isEnterprise}
              recommendedPlan={canHave2FA ? 'professional' : null}
              benefit="set up Two Factor Authentication to add an additional layer of security to accounts"
            />
          ))}
        {isOAuth2 && (
          <div className="flexbox margin-top">
            <div style={{ fontSize: '36px', marginRight: '10px' }}>{provider.icon}</div>
            <div className="info">
              You are logging in using your <strong>{provider.name}</strong> account.
              <br />
              Please connect to {provider.name} to update your login settings.
            </div>
          </div>
        )}
        {isEnterprise && hasTracking && (
          <div className="margin-top">
            <div className="clickable flexbox space-between" onClick={() => saveUserSettings({ trackingConsentGiven: !hasTrackingConsent })}>
              <p className="help-content">Help us improve Mender</p>
              <Switch checked={!!(hasTracking && hasTrackingConsent)} />
            </div>
            <p className="info" style={{ width: '75%', margin: 0 }}>
              Enable usage data and errors to be sent to help us improve our service.
            </p>
          </div>
        )}
      </div>
    );
  }
}

const actionCreators = { editUser, saveGlobalSettings, saveUserSettings, setSnackbar };

const mapStateToProps = state => {
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    canHave2FA: state.app.features.isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    currentUser: state.users.byId[state.users.currentUser] || {},
    has2FA: state.users.globalSettings.hasOwnProperty('2fa') && state.users.globalSettings['2fa'] === 'enabled',
    hasTracking: !!state.app.trackerCode,
    hasTrackingConsent: state.users.globalSettings[state.users.currentUser]?.trackingConsentGiven,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise')
  };
};

export default connect(mapStateToProps, actionCreators)(SelfUserManagement);
