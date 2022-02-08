import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import headerLogo from '../../../assets/img/headerlogo.png';
import { passwordResetComplete } from '../../actions/userActions';
import { setSnackbar } from '../../actions/appActions';
import Form from '../common/forms/form';
import PasswordInput from '../common/forms/passwordinput';

export const PasswordReset = ({
  passwordResetComplete,
  setSnackbar,
  match: {
    params: { secretHash }
  }
}) => {
  const [confirm, setConfirm] = useState(false);

  const _handleSubmit = formData => {
    if (!formData.hasOwnProperty('password_new')) {
      return;
    }
    if (formData.password_new != formData.password_confirmation) {
      setSnackbar('The passwords you provided do not match, please check again.', 5000, '');
      return;
    }

    passwordResetComplete(secretHash, formData.password_new).then(() => setConfirm(true));
  };

  return (
    <div className="flexbox column" id="login-box">
      <img src={headerLogo} alt="mender-logo" id="signupLogo" />
      <h1 className="align-center">Change your password</h1>
      {confirm ? (
        <p className="margin-bottom align-center">Your password has been updated.</p>
      ) : (
        <>
          <p className="margin-bottom align-center">
            You requested to change your password.
            <br />
            Enter a new, secure password of your choice below.
          </p>
          <Form
            showButtons={true}
            buttonColor="primary"
            onSubmit={formdata => _handleSubmit(formdata)}
            submitLabel="Save password"
            submitButtonId="password_button"
          >
            <PasswordInput id="password_new" label="Password *" validations="isLength:8" create={true} generate={false} required={true} />
            <PasswordInput id="password_confirmation" label="Confirm password *" validations="isLength:8" required={true} />
          </Form>
        </>
      )}
      <div className="margin-top-large muted">
        <div className="flexbox centered">
          <Link style={{ marginLeft: '4px' }} to="/login">
            Back to the login page
          </Link>
        </div>
      </div>
    </div>
  );
};

const actionCreators = { passwordResetComplete, setSnackbar };

export default connect(null, actionCreators)(PasswordReset);
