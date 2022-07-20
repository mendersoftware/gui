import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import headerLogo from '../../../assets/img/headerlogo.png';
import { passwordResetStart } from '../../actions/userActions';
import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';

export const Password = ({ passwordResetStart }) => {
  const [confirm, setConfirm] = useState(false);

  const _handleSubmit = formData => {
    if (!formData.hasOwnProperty('email')) {
      return;
    }
    passwordResetStart(formData.email).then(() => setConfirm(true));
  };

  return (
    <div className="flexbox column" id="login-box">
      <img src={headerLogo} alt="mender-logo" id="signupLogo" />
      <h1 className="align-center">Reset your password</h1>
      {confirm ? (
        <p className="margin-bottom align-center">
          Thanks - we&#39;re sending you an email now!
          <br />
          If there is a Mender account with that address, you&#39;ll receive an email with a link and instructions to reset your password.
        </p>
      ) : (
        <>
          <p className="margin-bottom align-center">
            If you&#39;ve forgotten your password, you can request to reset it.
            <br />
            Enter the email address you use to sign in to Mender, and we&#39;ll send you a reset link.
          </p>
          <Form showButtons={true} buttonColor="primary" onSubmit={_handleSubmit} submitLabel="Send the password reset link" submitButtonId="password_button">
            <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
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

const actionCreators = { passwordResetStart };

export default connect(null, actionCreators)(Password);
