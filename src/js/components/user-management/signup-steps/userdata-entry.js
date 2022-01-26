import React from 'react';

import { Button } from '@mui/material';

import headerLogo from '../../../../assets/img/headerlogo.png';
import { useradmApiUrl } from '../../../constants/userConstants';
import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import PasswordInput from '../../common/forms/passwordinput';
import { OAuth2Providers } from '../oauth2providers';

export class UserDataEntry extends React.Component {
  constructor(props, context) {
    super(props, context);
    const data = props.data || {};
    this.state = {
      email: data.email || '',
      password: data.password || '',
      password_confirmation: data.password_confirmation || ''
    };
  }

  handleSubmit(formData) {
    if (formData.password_new != formData.password_confirmation) {
      this.props.setSnackbar('The passwords you provided do not match, please check again.', 5000, '');
      return;
    }
    return this.props.onSubmit(formData);
  }

  render() {
    const self = this;
    const { email, password, password_confirmation } = this.state;
    return (
      <>
        <img src={headerLogo} alt="mender-logo" id="signupLogo" />
        <h1>Try Mender for Free</h1>
        <h2 className="margin-bottom">
          Sign up and connect up to 10 devices
          <br />
          free for 12 months – no credit card required.
        </h2>
        <div className="flexbox centered margin-bottom">Sign up with:</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {OAuth2Providers.map(provider => (
            <Button className="oauth-provider" variant="contained" key={provider.id} href={`${useradmApiUrl}/oauth2/${provider.id}`} startIcon={provider.icon}>
              {provider.name}
            </Button>
          ))}
        </div>
        <h4 className="dashboard-header margin-top-large" style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ padding: 15, top: -24 }}>or your email address</span>
        </h4>
        <Form showButtons={true} buttonColor="primary" onSubmit={formdata => self.handleSubmit(formdata)} submitLabel="Sign up" submitButtonId="login_button">
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
  }
}

export default UserDataEntry;
