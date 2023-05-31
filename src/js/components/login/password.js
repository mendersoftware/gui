// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import LoginLogo from '../../../assets/img/loginlogo.svg';
import { passwordResetStart } from '../../actions/userActions';
import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import { LocationWarning } from './login';

export const PasswordScreenContainer = ({ children, title }) => (
  <>
    <LocationWarning />
    <div className="flexbox column content" id="login-box" style={{ marginTop: -200 }}>
      <LoginLogo alt="mender-logo" className="flexbox margin-bottom-large" style={{ maxWidth: 300, alignSelf: 'center' }} />
      <h1 className="align-center">{title}</h1>
      {children}
      <div className="margin-top-large flexbox centered">
        <Link to="/login">Back to the login page</Link>
      </div>
    </div>
  </>
);

const texts = {
  confirmation: [
    `Thanks - we're sending you an email now!`,
    `If there is a Mender account with that address, you'll receive an email with a link and instructions to reset your password.`
  ],
  request: [
    `If you've forgotten your password, you can request to reset it.`,
    `Enter the email address you use to sign in to Mender, and we'll send you a reset link.`
  ]
};

export const Password = ({ passwordResetStart }) => {
  const [confirm, setConfirm] = useState(false);

  const _handleSubmit = formData => {
    if (!formData.hasOwnProperty('email')) {
      return;
    }
    passwordResetStart(formData.email).then(() => setConfirm(true));
  };

  return (
    <PasswordScreenContainer title="Reset your password">
      {confirm ? (
        texts.confirmation.map((text, index) => (
          <p className="align-center" key={index}>
            {text}
          </p>
        ))
      ) : (
        <>
          {texts.request.map((text, index) => (
            <p className="align-center" key={index}>
              {text}
            </p>
          ))}
          <Form showButtons={true} buttonColor="primary" onSubmit={_handleSubmit} submitLabel="Send password reset link" submitButtonId="password_button">
            <TextInput hint="Your email" label="Your email" id="email" required={true} validations="isLength:1,isEmail" />
          </Form>
        </>
      )}
    </PasswordScreenContainer>
  );
};

const actionCreators = { passwordResetStart };

export default connect(null, actionCreators)(Password);
