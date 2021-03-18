import React, { useState } from 'react';

import { Button } from '@material-ui/core';

import Form from '../../common/forms/form';
import TextInput from '../../common/forms/textinput';
import Loader from '../../common/loader';

export const EmailVerification = ({ verifyEmailComplete, verifyEmailStart }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      Once you click the button below we will send you an email with a confirmation code in it and a confirmation field will appear below. Enter the
      confirmation code in the confirmation field to complete the verification process.
      {!isVerifying ? (
        <div className="flexbox" style={{ alignItems: 'center' }}>
          <Button variant="contained" disabled={isLoading} color="primary" onClick={startVerification} style={{ marginTop: 20, marginRight: 30 }}>
            Verify your email address
          </Button>
          <Loader show={isLoading} />
        </div>
      ) : (
        <Form showButtons={isVerifying} buttonColor="primary" onSubmit={completeVerification} submitLabel="Verify" submitButtonId="confirm-button">
          <TextInput hint="Verification code" label="Verification code" id="emailVerification" required={true} />
        </Form>
      )}
    </div>
  );
};

export default EmailVerification;
