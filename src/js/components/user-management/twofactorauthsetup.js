import React from 'react';

import { Button } from '@material-ui/core';

import Form from '../common/forms/form';
import TextInput from '../common/forms/textinput';
import PasswordInput from '../common/forms/passwordinput';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';

import Loader from '../common/loader';

export default class TwoFactorAuthSetup extends React.Component {
  constructor(props, context) {
    super(props, context);
    const self = this;
    self.state = { validated2fa: false };
    AppActions.saveGlobalSettings(Object.assign(AppStore.getGlobalSettings() || {}, { '2fa': 'enabled' })).then(() =>
      AppActions.get2FAQRCode(props.user.email).then(qrImage => self.setState({ qrImage }))
    );
  }

  componentWillUnmount() {
    if (!this.state.validated2fa) {
      AppActions.saveGlobalSettings(Object.assign(AppStore.getGlobalSettings(), { '2fa': 'disabled' }));
    }
  }

  validate2faSetup(formData) {
    const self = this;
    formData.email = self.props.user.email;
    AppActions.loginUser(formData)
      .then(token => self.setState({ validated2fa: !!token }))
      .catch(() => AppActions.setSnackbar('An error occured validating the verification code.'));
  }

  render() {
    const self = this;
    const { handle2FAState } = self.props;
    const { qrImage, validated2fa } = self.state;

    return (
      <div className="margin-top">
        Setup:
        <div className="flexbox margin-top">
          <ol className="spaced-list margin-right-large" style={{ paddingInlineStart: 20 }}>
            <li className="margin-top-none">
              To use Two Factor Authentication, first download a third party authentication app such as{' '}
              <a href="https://authy.com/download/" target="_blank">
                Authy
              </a>{' '}
              or{' '}
              <a href="https://support.google.com/accounts/answer/1066447" target="_blank">
                Google Authenticator
              </a>
              .
            </li>
            <li>Scan the QR code on the right with the authenticator app you just downloaded on your device.</li>
            <li>
              <div>
                Type in your password and the generated code in the input field below and click confirm.
                <Form
                  showButtons={true}
                  buttonColor="primary"
                  onSubmit={formdata => self.validate2faSetup(formdata)}
                  submitLabel="Verify"
                  submitButtonId="confirm-button"
                >
                  <PasswordInput id="password" label="Password" required={true} />
                  <TextInput hint="Verification code" label="Verification code" id="token2fa" validations="isLength:6,isNumeric" required={true} />
                </Form>
              </div>
            </li>
            <li>Then each time you log in, you will be asked for a verification code which you can retrieve from the authentication app on your device.</li>
          </ol>
          {!qrImage ? <Loader show={!qrImage} /> : <img src={`data:image/png;base64,${qrImage}`} style={{ maxHeight: '20vh' }} />}
        </div>
        <div className="flexbox" style={{ justifyContent: 'flex-end' }}>
          <Button onClick={() => handle2FAState(false)} style={{ marginRight: 10 }}>
            Cancel
          </Button>
          <Button variant="contained" color="secondary" disabled={!validated2fa} onClick={() => handle2FAState(true)}>
            Save
          </Button>
        </div>
      </div>
    );
  }
}
