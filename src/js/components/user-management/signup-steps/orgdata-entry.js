import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import FormCheckbox from '../../common/forms/formcheckbox';

export class OrgDataEntry extends React.Component {
  constructor(props, context) {
    super(props, context);
    const data = props.data || {};
    this.state = {
      name: data.name || '',
      tos: data.tos || '',
      marketing: data.marketing || '',
      recaptcha: ''
    };
  }

  handleSubmit(formData) {
    if (this.props.recaptchaSiteKey !== '' && this.state.recaptcha === '') {
      return this.props.setSnackbar('Please complete the reCAPTCHA test before proceeding!', 5000, '');
    }
    return this.props.onSubmit(formData, this.state.recaptcha);
  }

  render() {
    const self = this;
    const { name, tos, marketing } = self.state;
    const { recaptchaSiteKey } = self.props;
    return (
      <>
        <h1>Setting up your Account</h1>
        <h2 className="margin-bottom-large">
          To finish creating your account,
          <br />
          please fill in a few details
        </h2>
        <Form
          showButtons={true}
          buttonColor="primary"
          onSubmit={formdata => self.handleSubmit(formdata)}
          submitLabel="Complete signup"
          submitButtonId="login_button"
        >
          <TextInput
            hint="Company or organization name *"
            label="Company or organization name *"
            id="name"
            required={true}
            value={name}
            validations="isLength:1"
          />
          <FormCheckbox
            id="tos"
            label={
              <label htmlFor={tos}>
                By checking this you agree to our{' '}
                <a href="https://northern.tech/legal/Hosted%20Mender%20Agreement%20-%2005-23-2020%20-%20Northern.tech%20AS.pdf" target="_blank">
                  Terms of service
                </a>{' '}
                and{' '}
                <a href="https://northern.tech/legal/privacy-policy" target="_blank">
                  Privacy Policy
                </a>{' '}
                *
              </label>
            }
            required={true}
            value={'true'}
            checked={tos === 'true'}
          />
          <FormCheckbox
            id="marketing"
            label="By checking this you agree that we can send you occasional email updates about Mender. You can unsubscribe from these emails at any time"
            value={'true'}
            checked={marketing === 'true'}
          />
          {recaptchaSiteKey && (
            <div className="margin-top">
              <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={recaptcha => self.setState({ recaptcha })} />
            </div>
          )}
        </Form>
      </>
    );
  }
}

export default OrgDataEntry;
