import React from 'react';

import SignupHero from '../../../../assets/img/signuphero.svg';
import { TIMEOUTS } from '../../../constants/appConstants';
import Form from '../../common/forms/form';
import PasswordInput from '../../common/forms/passwordinput';
import TextInput from '../../common/forms/textinput';
import { EntryLink, OAuthHeader } from '../login';

export const UserDataEntry = ({ classes, data = {}, setSnackbar, onSubmit }) => {
  const { email = '', password = '', password_confirmation = '' } = data;

  const handleSubmit = formData => {
    if (formData.password_new != formData.password_confirmation) {
      setSnackbar('The passwords you provided do not match, please check again.', TIMEOUTS.fiveSeconds, '');
      return;
    }
    return onSubmit(formData);
  };

  return (
    <div className="two-columns full-height">
      <div className={classes.userData}>
        <h1 className="flexbox centered">Create your account</h1>
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
        <EntryLink target="login" />
      </div>
      <div className={`${classes.userData} right`}>
        <div className="flexbox column">
          <h2>Connect up to 10 devices free for 12 months – no credit card required.</h2>
          <p>
            Mender provides a complete over-the-air update infrastructure for all device software. Whether in the field or the factory, you can remotely and
            easily manage device software without the need for manual labor.
          </p>
          <div className="svg-container margin-top">
            <SignupHero />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDataEntry;
