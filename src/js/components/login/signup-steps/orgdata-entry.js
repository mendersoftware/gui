import React, { useCallback, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { MenuItem, Select } from '@mui/material';

import { TIMEOUTS, locations } from '../../../constants/appConstants';
import Form from '../../common/forms/form';
import FormCheckbox from '../../common/forms/formcheckbox';
import TextInput from '../../common/forms/textinput';
import { EntryLink } from '../login';

export const OrgDataEntry = ({ classes, data: { name, email, emailVerified, tos, marketing }, onSubmit, recaptchaSiteKey = '', setSnackbar }) => {
  const [recaptcha, setRecaptcha] = useState('');
  const [location, setLocation] = useState(locations.us.key);
  const [captchaTimestamp, setCaptchaTimestamp] = useState(0);

  const handleSubmit = useCallback(
    formData => {
      if (recaptchaSiteKey !== '' && recaptcha === '') {
        return setSnackbar('Please complete the reCAPTCHA test before proceeding!', TIMEOUTS.fiveSeconds, '');
      }
      return onSubmit(formData, recaptcha, location, captchaTimestamp);
    },
    [captchaTimestamp, location, recaptchaSiteKey, recaptcha]
  );

  const handleLocationChange = ({ target: { value } }) => setLocation(value);

  const handleCaptchaChange = value => {
    setCaptchaTimestamp(new Date().getTime());
    setRecaptcha(value);
  };

  return (
    <div className="flexbox centered full-height">
      <div className={`flexbox column centered ${classes.orgData}`}>
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
          {!emailVerified && <TextInput hint="Email *" label="Email *" id="email" required={true} validations="isLength:1,isEmail" value={email} />}

          <div className="flexbox center-aligned margin-top slightly-smaller">
            <p className="margin-bottom-none margin-top-none muted" style={{ marginRight: 4 }}>
              Choose which instance to set up your Mender account.
            </p>
            <a href="https://docs.mender.io/general/hosted-mender-regions" target="_blank" rel="noopener noreferrer">
              Learn more
            </a>
          </div>
          <Select
            value={location}
            onChange={handleLocationChange}
            className={classes.locationSelect}
            renderValue={selected => {
              const { icon: Icon, title } = locations[selected];
              return (
                <div className="flexbox center-aligned">
                  {title} <Icon className={classes.locationIcon} />
                </div>
              );
            }}
          >
            {Object.entries(locations).map(([key, { icon: Icon, title }]) => (
              <MenuItem key={key} value={key}>
                {title} <Icon className={classes.locationIcon} />
              </MenuItem>
            ))}
          </Select>
          <FormCheckbox
            id="tos"
            label={
              <label htmlFor="tos">
                By checking this you agree to our{' '}
                <a href="https://northern.tech/legal/hosted-mender-agreement-10_10_2022-northern-tech-as.pdf" target="_blank" rel="noopener noreferrer">
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
              <ReCAPTCHA sitekey={recaptchaSiteKey} onChange={handleCaptchaChange} />
            </div>
          )}
        </Form>
        <EntryLink target="login" />
      </div>
    </div>
  );
};

export default OrgDataEntry;
