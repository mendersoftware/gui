import React from 'react';

import headerLogo from '../../../../assets/img/headerlogo.png';
import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import PasswordInput from '../../common/forms/passwordinput';
import { OAuthHeader } from '../login';

export const UserDataEntry = ({ data = {}, setSnackbar, onSubmit }) => {
  const { email = '', password = '', password_confirmation = '' } = data;

  const handleSubmit = formData => {
    if (formData.password_new != formData.password_confirmation) {
      setSnackbar('The passwords you provided do not match, please check again.', 5000, '');
      return;
    }
    return onSubmit(formData);
  };

  return (
    <>
      <img src={headerLogo} alt="mender-logo" id="signupLogo" />
      <h1>Try Mender for Free</h1>
      <h2 className="margin-bottom">
        Sign up and connect up to 10 devices
        <br />
        free for 12 months – no credit card required.
      </h2>
      <OAuthHeader type="Sign up" />
      <Form showButtons={true} buttonColor="primary" onSubmit={handleSubmit} submitLabel="Sign up" submitButtonId="login_button">
        <TextInput hint="Email *" label="Email *" id="email" required={true} validations="isLength:1,isEmail" value={email} />
        <PasswordInput
          id="password_new"
          label="Password *"
          validations={`isLength:8,isNot:${email}`}
          create={true}
          generate={false}
          required={true}
          value={password}
          className="margin-bottom-small"
        />
        <PasswordInput
          id="password_confirmation"
          label="Confirm password *"
          validations={`isLength:8,isNot:${email}`}
          required={true}
          value={password_confirmation}
        />
      </Form>
    </>
  );
};

export default UserDataEntry;
