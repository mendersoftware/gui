import React from 'react';

import { Button } from '@material-ui/core';
import { CheckCircle as CheckCircleIcon } from '@material-ui/icons';

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
    self.state = { validated2fa: false, validating2fa: false };
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
    self.setState({ validating2fa: true });
    formData.email = self.props.user.email;
    AppActions.loginUser(formData)
      .then(token => self.setState({ validated2fa: !!token, validating2fa: false }))
      .catch(() => {
        AppActions.setSnackbar('An error occured validating the verification code.');
        self.setState({ validating2fa: false });
      });
  }

  render() {
    const self = this;
    const { handle2FAState } = self.props;
    const { qrImage, validated2fa, validating2fa } = self.state;

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
                Type in your password and the generated code in the input field below and click Verify.
                {validated2fa ? (
                  <div className="flexbox space-between centered margin-top margin-right margin-bottom" style={{ justifyContent: 'flex-end' }}>
                    <CheckCircleIcon className="green" />
                    <h3 className="green margin-left-small" style={{ textTransform: 'uppercase' }}>
                      Verified
                    </h3>
                  </div>
                ) : (
                  <>
                    <Form
                      showButtons={!validating2fa}
                      buttonColor="primary"
                      onSubmit={formdata => self.validate2faSetup(formdata)}
                      submitLabel="Verify"
                      submitButtonId="confirm-button"
                    >
                      <PasswordInput id="password" label="Password" required={true} />
                      <TextInput hint="Verification code" label="Verification code" id="token2fa" validations="isLength:6,isNumeric" required={true} />
                    </Form>
                    {validating2fa && (
                      <div className="flexbox" style={{ alignItems: 'flex-end', justifyContent: 'flex-end', height: 'min-content' }}>
                        <Loader show={true} />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => this.updateModel()}
                          disabled={!this.state.isValid}
                          style={{ marginLeft: 30 }}
                        >
                          Verifying...
                        </Button>
                      </div>
                    )}
                  </>
                )}
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
