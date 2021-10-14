import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import FormCheckbox from '../../common/forms/formcheckbox';

export const OrgDataEntry = ({ data: { name, email, tos, marketing }, onSubmit, recaptchaSiteKey = '', setSnackbar }) => {
  const [recaptcha, setRecaptcha] = useState('');

  const handleSubmit = formData => {
    if (recaptchaSiteKey !== '' && recaptcha === '') {
      return setSnackbar('Please complete the reCAPTCHA test before proceeding!', 5000, '');
    }
    return onSubmit(formData, recaptcha);
  };

  return (
    <>
      <h1>Setting up your Account</h1>
      <h2 className="margin-bottom-large">
        To finish creating your account,
        <br />
        please fill in a few details
      </h2>
      <Form showButtons={true} buttonColor="primary" onSubmit={handleSubmit} submitLabel="Complete signup" submitButtonId="login_button">
        <TextInput
          hint="Company or organization name *"
          label="Company or organization name *"
          id="name"
          required={true}
          value={name}
          validations="isLength:1"
        />
        {email != null || <TextInput hint="Email *" label="Email *" id="email" required={true} validations="isLength:1,isEmail" value={email} />}
        <FormCheckbox
          id="tos"
          label={
            <label htmlFor="tos">
              By checking this you agree to our{' '}
              <a
                href="https://northern.tech/legal/Hosted%20Mender%20Agreement%20-%2005-23-2020%20-%20Northern.tech%20AS.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of service
              </a>{' '}
              and{' '}
              <a href="https://northern.tech/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>{' '}
              *
            </label>
          }
          required={true}
          value="true"
          checked={tos === 'true'}
        />
        <FormCheckbox
          id="marketing"
          label="By checking this you agree that we can send you occasional email updates about Mender. You can unsubscribe from these emails at any time"
          value="true"
          checked={marketing === 'true'}
        />
        {recaptchaSiteKey && (
          <div className="margin-top">
            <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={setRecaptcha} />
          </div>
        )}
      </Form>
    </>
  );
};

export default OrgDataEntry;
