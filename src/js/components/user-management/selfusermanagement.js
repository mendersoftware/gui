import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Button, Switch, TextField } from '@material-ui/core';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';
import EnterpriseNotification from '../common/enterpriseNotification';

import { setSnackbar } from '../../actions/appActions';
import { editUser, saveGlobalSettings, saveUserSettings } from '../../actions/userActions';
import { getCurrentUser, getIsEnterprise, getUserSettings } from '../../selectors';
import { OAuth2Providers } from './oauth2providers';
import TwoFactorAuthSetup from './twofactorauthsetup';
import UserConstants from '../../constants/userConstants';

export const SelfUserManagement = ({ canHave2FA, currentUser, editUser, hasTracking, hasTrackingConsent, isEnterprise, saveUserSettings, setSnackbar }) => {
  const [editEmail, setEditEmail] = useState(false);
  const [editPass, setEditPass] = useState(false);
  const [emailFormId, setEmailFormId] = useState(new Date());

  const editSubmit = userData => {
    if (userData.password != userData.password_confirmation) {
      setSnackbar(`The passwords don't match`);
    } else {
      editUser(UserConstants.OWN_USER_ID, userData).then(() => {
        setEditEmail(false);
        setEditPass(false);
      });
    }
  };

  const handleEmail = () => {
    let uniqueId = emailFormId;
    if (editEmail) {
      // changing unique id will reset form values
      uniqueId = new Date();
    }
    setEditEmail(!editEmail);
    setEmailFormId(uniqueId);
  };

  const handlePass = () => setEditPass(!editPass);
  const email = currentUser.email;
  const isOAuth2 = !!currentUser.login;
  const provider = isOAuth2 ? OAuth2Providers.find(provider => !!currentUser.login[provider.id]) : null;
  return (
    <div style={{ maxWidth: 750 }} className="margin-top-small">
      <h2 className="margin-top-small">My profile</h2>
      {!editEmail && currentUser.email ? (
        <div className="flexbox space-between">
          <TextField label="Email" key={email} InputLabelProps={{ shrink: !!email }} disabled defaultValue={email} style={{ width: 400, maxWidth: '100%' }} />
          {!isOAuth2 && (
            <Button className="inline-block" color="primary" id="change_email" style={{ margin: '30px 0 0 15px' }} onClick={handleEmail}>
              Change email
            </Button>
          )}
        </div>
      ) : (
        <Form
          className="flexbox space-between"
          onSubmit={editSubmit}
          handleCancel={handleEmail}
          submitLabel="Save"
          showButtons={editEmail}
          buttonColor="secondary"
          submitButtonId="submit_email"
          uniqueId={emailFormId}
        >
          <TextInput
            disabled={false}
            focus
            hint="Email"
            id="email"
            InputLabelProps={{ shrink: !!email }}
            label="Email"
            validations="isLength:1,isEmail"
            value={email}
          />
        </Form>
      )}
      {!isOAuth2 &&
        (!editPass ? (
          <form className="flexbox space-between">
            <TextField label="Password" key="password-placeholder" disabled defaultValue="********" style={{ width: 400, maxWidth: '100%' }} type="password" />
            <Button color="primary" id="change_password" style={{ margin: '30px 0 0 15px' }} onClick={handlePass}>
              Change password
            </Button>
          </form>
        ) : (
          <>
            <h3 className="margin-top margin-bottom-none">Change password</h3>
            <Form
              onSubmit={editSubmit}
              handleCancel={handlePass}
              submitLabel="Save"
              submitButtonId="submit_pass"
              buttonColor="secondary"
              showButtons={editPass}
            >
              <PasswordInput id="current_password" label="Current password *" validations={`isLength:8,isNot:${email}`} required={true} />
              <PasswordInput className="edit-pass" id="password" label="Password *" validations={`isLength:8,isNot:${email}`} required={true} create={true} />
              <PasswordInput id="password_confirmation" label="Confirm password *" validations={`isLength:8,isNot:${email}`} required={true} />
            </Form>
          </>
        ))}
      {!isOAuth2 ? (
        canHave2FA ? (
          <TwoFactorAuthSetup />
        ) : (
          <EnterpriseNotification isEnterprise={isEnterprise} benefit="Two Factor Authentication to add an additional layer of security to accounts" />
        )
      ) : (
        <div className="flexbox margin-top">
          <div style={{ fontSize: '36px', marginRight: 10 }}>{provider.icon}</div>
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
            <Switch checked={!!hasTrackingConsent} />
          </div>
          <p className="info" style={{ width: '75%', margin: 0 }}>
            Enable usage data and errors to be sent to help us improve our service.
          </p>
        </div>
      )}
    </div>
  );
};

const actionCreators = { editUser, saveGlobalSettings, saveUserSettings, setSnackbar };

const mapStateToProps = state => {
  const { plan = 'os' } = state.organization.organization;
  const isEnterprise = getIsEnterprise(state);
  return {
    canHave2FA: isEnterprise || (state.app.features.isHosted && plan !== 'os'),
    currentUser: getCurrentUser(state),
    hasTracking: !!state.app.trackerCode,
    hasTrackingConsent: getUserSettings(state).trackingConsentGiven,
    isEnterprise
  };
};

export default connect(mapStateToProps, actionCreators)(SelfUserManagement);
