import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Button, Switch, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { setSnackbar } from '../../../actions/appActions';
import { editUser, saveGlobalSettings, saveUserSettings } from '../../../actions/userActions';
import UserConstants from '../../../constants/userConstants';
import { getCurrentUser, getIsEnterprise, getUserSettings } from '../../../selectors';
import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import PasswordInput from '../../common/forms/passwordinput';
import { OAuth2Providers } from '../../login/oauth2providers';
import TwoFactorAuthSetup from './twofactorauthsetup';
import AccessTokenManagement from '../accesstokenmanagement';
import InfoText from '../../common/infotext';

const useStyles = makeStyles()(() => ({
  formField: { width: 400, maxWidth: '100%' },
  changeButton: { margin: '30px 0 0 15px' },
  infoText: { margin: 0, width: '75%' },
  oauthIcon: { fontSize: '36px', marginRight: 10 },
  widthLimit: { maxWidth: 750 }
}));

export const SelfUserManagement = ({
  canHave2FA,
  currentUser,
  editUser,
  hasTracking,
  hasTrackingConsent,
  isEnterprise,
  mode,
  saveUserSettings,
  setSnackbar
}) => {
  const [editEmail, setEditEmail] = useState(false);
  const [editPass, setEditPass] = useState(false);
  const [emailFormId, setEmailFormId] = useState(new Date());
  const { classes } = useStyles();

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

  const toggleMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    saveUserSettings({ mode: newMode });
  };

  const handlePass = () => setEditPass(!editPass);
  const email = currentUser.email;
  const isOAuth2 = !!currentUser.sso?.length;
  const provider = isOAuth2 ? OAuth2Providers.find(provider => currentUser.sso.some(({ kind }) => kind.includes(provider.id))) : null;
  return (
    <div className={`margin-top-small ${classes.widthLimit}`}>
      <h2 className="margin-top-small">My profile</h2>
      {!editEmail && currentUser.email ? (
        <div className="flexbox space-between">
          <TextField className={classes.formField} label="Email" key={email} InputLabelProps={{ shrink: !!email }} disabled defaultValue={email} />
          {!isOAuth2 && (
            <Button className={`inline-block ${classes.changeButton}`} color="primary" id="change_email" onClick={handleEmail}>
              Change email
            </Button>
          )}
        </div>
      ) : (
        <Form
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
          <PasswordInput id="current_password" label="Current password *" validations={`isLength:8,isNot:${email}`} required={true} />
        </Form>
      )}
      {!isOAuth2 &&
        (!editPass ? (
          <form className="flexbox space-between">
            <TextField className={classes.formField} label="Password" key="password-placeholder" disabled defaultValue="********" type="password" />
            <Button className={classes.changeButton} color="primary" id="change_password" onClick={handlePass}>
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
              <PasswordInput id="current_password" label="Current password *" validations={`isLength:8,isNot:${email}`} required />
              <PasswordInput className="edit-pass" id="password" label="Password *" validations={`isLength:8,isNot:${email}`} create generate required />
              <PasswordInput id="password_confirmation" label="Confirm password *" validations={`isLength:8,isNot:${email}`} required />
            </Form>
          </>
        ))}
      <div className="clickable flexbox space-between margin-top" onClick={toggleMode}>
        <p className="help-content">Enable dark theme</p>
        <Switch checked={mode === 'dark'} />
      </div>
      {!isOAuth2 ? (
        canHave2FA && <TwoFactorAuthSetup />
      ) : (
        <div className="flexbox margin-top">
          <div className={classes.oauthIcon}>{provider.icon}</div>
          <div className="info">
            You are logging in using your <strong>{provider.name}</strong> account.
            <br />
            Please connect to {provider.name} to update your login settings.
          </div>
        </div>
      )}
      {!isOAuth2 && <AccessTokenManagement />}
      {isEnterprise && hasTracking && (
        <div className="margin-top">
          <div className="clickable flexbox space-between" onClick={() => saveUserSettings({ trackingConsentGiven: !hasTrackingConsent })}>
            <p className="help-content">Help us improve Mender</p>
            <Switch checked={!!hasTrackingConsent} />
          </div>
          <InfoText className={classes.infoText}>Enable usage data and errors to be sent to help us improve our service.</InfoText>
        </div>
      )}
    </div>
  );
};

const actionCreators = { editUser, saveGlobalSettings, saveUserSettings, setSnackbar };

const mapStateToProps = state => {
  const isEnterprise = getIsEnterprise(state);
  return {
    canHave2FA: isEnterprise || state.app.features.isHosted,
    currentUser: getCurrentUser(state),
    hasTracking: !!state.app.trackerCode,
    hasTrackingConsent: getUserSettings(state).trackingConsentGiven,
    mode: getUserSettings(state).mode,
    isEnterprise
  };
};

export default connect(mapStateToProps, actionCreators)(SelfUserManagement);
