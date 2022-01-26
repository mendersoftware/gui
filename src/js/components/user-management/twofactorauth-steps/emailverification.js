import React, { useEffect, useState } from 'react';

import { Button } from '@mui/material';

import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import Loader from '../../common/loader';

export const EmailVerification = ({ activationCode, verifyEmailComplete, verifyEmailStart }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVerifying(Boolean(activationCode));
  }, [activationCode]);

  const startVerification = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsVerifying(true);
      setIsLoading(false);
    }, 3000);
    verifyEmailStart().catch(() => setIsVerifying(false));
  };

  const completeVerification = formData => {
    verifyEmailComplete(formData.emailVerification);
  };

  return (
    <div className="margin-top">
      Please verify your email address first, to enable Two Factor Authentication.
      <br />
      Once you click the button below we will send you an email with a confirmation link in it and a confirmation field will appear below. Click on the link to
      complete the verification. If the link does not work, you can also enter the confirmation code from the link in a confirmation field that will appear
      below once you clicked the button.
      {!isVerifying ? (
        <div className="flexbox center-aligned">
          <Button variant="contained" disabled={isLoading} color="primary" onClick={startVerification} style={{ marginTop: 20, marginRight: 30 }}>
            Verify your email address
          </Button>
          <Loader show={isLoading} />
        </div>
      ) : (
        <Form showButtons={isVerifying} buttonColor="primary" onSubmit={completeVerification} submitLabel="Verify" submitButtonId="confirm-button">
          <TextInput hint="Verification code" label="Verification code" id="emailVerification" required={true} value={activationCode} />
        </Form>
      )}
    </div>
  );
};

export default EmailVerification;
