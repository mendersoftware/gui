import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { Button } from '@mui/material';

import { setFirstLoginAfterSignup, setSnackbar } from '../../actions/appActions';
import { createOrganizationTrial } from '../../actions/organizationActions';
import { loginUser } from '../../actions/userActions';
import { noExpiryKey, TIMEOUTS } from '../../constants/appConstants';
import { useradmApiUrl } from '../../constants/userConstants';
import { stringToBoolean } from '../../helpers';
import Loader from '../common/loader';
import UserDataEntry from './signup-steps/userdata-entry';
import OrgDataEntry from './signup-steps/orgdata-entry';
import { OAuth2Providers } from './oauth2providers';
import { EntryLink } from './login';

const cookies = new Cookies();

export const Signup = ({ createOrganizationTrial, currentUserId, loginUser, setFirstLoginAfterSignup, recaptchaSiteKey, setSnackbar }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState(undefined);
  const [oauthId, setOauthId] = useState(undefined);
  const [password, setPassword] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [organization, setOrganization] = useState('');
  const [tos, setTos] = useState(false);
  const [redirectOnLogin, setRedirectOnLogin] = useState(false);
  const { campaign = '' } = useParams();

  useEffect(() => {
    window.localStorage.removeItem(noExpiryKey);
    const usedOauthProvider = cookies.get('oauth');
    if (usedOauthProvider) {
      setOauthProvider(usedOauthProvider);
      setOauthId(cookies.get('externalID'));
      setEmail(cookies.get('email'));
      setEmailVerified(stringToBoolean(cookies.get('emailVerified')));
      setStep(2);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      setSnackbar('');
      setRedirectOnLogin(true);
    }
  }, [currentUserId]);

  const handleStep1 = formData => {
    setEmail(formData.email);
    setPassword(formData.password_new);
    setEmailVerified(true);
    setStep(2);
  };

  const handleSignup = (formData, recaptcha) => {
    setLoading(true);
    const actualEmail = formData.email != null ? formData.email : email;
    const credentials = oauthProvider ? { email: actualEmail, login: { [oauthProvider]: oauthId } } : { email: actualEmail, password };
    const signup = {
      ...credentials,
      emailVerified: emailVerified,
      organization: formData.name,
      plan: 'enterprise',
      tos: formData.tos,
      marketing: formData.marketing == 'true',
      'g-recaptcha-response': recaptcha || 'empty',
      campaign
    };
    return createOrganizationTrial(signup)
      .catch(() => {
        setStep(1);
        return Promise.reject();
      })
      .then(() => {
        setFirstLoginAfterSignup(true);
        if (!oauthProvider) {
          return new Promise((resolve, reject) => {
            setTimeout(() => loginUser({ email, password }).catch(reject).then(resolve), TIMEOUTS.threeSeconds);
          });
        }
        return Promise.resolve();
      })
      .then(() => {
        setStep(3);
        setRedirectOnLogin(!oauthProvider);
      })
      .finally(() => {
        setOrganization(formData.name);
        setTos(formData.tos);
        setMarketing(formData.marketing);
        setLoading(false);
      });
  };

  if (redirectOnLogin) {
    return <Navigate to="/" replace />;
  }
  const provider = OAuth2Providers.find(item => item.id === oauthProvider) || { id: '' };
  const steps = {
    1: <UserDataEntry setSnackbar={setSnackbar} data={{ email, password, password_confirmation: password }} onSubmit={handleStep1} />,
    2: (
      <OrgDataEntry
        setSnackbar={setSnackbar}
        data={{ name: organization, email, emailVerified, tos, marketing }}
        onSubmit={handleSignup}
        recaptchaSiteKey={recaptchaSiteKey}
      />
    ),
    3: (
      <div className="align-center" style={{ minHeight: '50vh' }}>
        <h1>Sign up completed</h1>
        <h2 className="margin-bottom-large">
          Your account has been created,
          <br />
          you can now log in.
        </h2>
        <Button variant="contained" color="secondary" href={`${useradmApiUrl}/oauth2/${provider.id.toLowerCase()}`} startIcon={provider.icon}>
          {provider.name}
        </Button>
      </div>
    )
  };
  return (
    <div className="flexbox column padding-top padding-bottom" id="signup-box">
      {loading ? (
        <Loader show={true} style={{ display: 'flex' }} />
      ) : (
        <>
          {steps[step]}
          {step !== 3 && <EntryLink target="login" />}
        </>
      )}
    </div>
  );
};

const actionCreators = { createOrganizationTrial, loginUser, setFirstLoginAfterSignup, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUserId: state.users.currentUserId,
    recaptchaSiteKey: state.app.recaptchaSiteKey
  };
};

export default connect(mapStateToProps, actionCreators)(Signup);
