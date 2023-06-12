// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';

import { makeStyles } from 'tss-react/mui';

import Cookies from 'universal-cookie';

import LoginLogo from '../../../assets/img/loginlogo.svg';
import { setSnackbar } from '../../actions/appActions';
import { createOrganizationTrial } from '../../actions/organizationActions';
import { stringToBoolean } from '../../helpers';
import Loader from '../common/loader';
import OrgDataEntry from './signup-steps/orgdata-entry';
import UserDataEntry from './signup-steps/userdata-entry';

const cookies = new Cookies();
const useStyles = makeStyles()(theme => ({
  background: {
    width: '100%',
    marginTop: -(50 + 45),
    height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    '&#signup-box': {
      maxWidth: 'initial'
    }
  },
  locationSelect: { minWidth: 150 },
  locationIcon: { marginLeft: theme.spacing(1.5), transform: 'scale(0.75)' },
  fullHeight: { height: '100%' },
  userData: {
    display: 'grid',
    gridTemplateColumns: 'min-content',
    justifyContent: 'center',
    alignContent: 'center',
    '&.right': {
      background: theme.palette.grey[400],
      rowGap: 20,
      gridTemplateRows: 'min-content min-content min-content'
    }
  },
  orgData: { maxWidth: 400 },
  logo: { marginLeft: '5vw', marginTop: 45, maxHeight: 50 }
}));

export const Signup = () => {
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
  const dispatch = useDispatch();
  const currentUserId = useSelector(state => state.users.currentUserId);
  const recaptchaSiteKey = useSelector(state => state.app.recaptchaSiteKey);

  const dispatchedSetSnackbar = message => dispatch(setSnackbar(message));

  useEffect(() => {
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
      dispatchedSetSnackbar('');
      setRedirectOnLogin(true);
    }
  }, [currentUserId]);

  const handleStep1 = formData => {
    setEmail(formData.email);
    setPassword(formData.password_new);
    setEmailVerified(true);
    setStep(2);
  };

  const handleSignup = (formData, recaptcha, location, captchaTimestamp) => {
    setLoading(true);
    const actualEmail = formData.email != null ? formData.email : email;
    const credentials = oauthProvider ? { email: actualEmail, login: { [oauthProvider]: oauthId } } : { email: actualEmail, password };
    const signup = {
      ...credentials,
      emailVerified: emailVerified,
      organization: formData.name,
      plan: 'enterprise',
      tos: formData.tos,
      location,
      marketing: formData.marketing == 'true',
      'g-recaptcha-response': recaptcha || 'empty',
      ts: captchaTimestamp,
      campaign
    };
    return dispatch(createOrganizationTrial(signup)).catch(() => {
      setStep(1);
      setOrganization(formData.name);
      setTos(formData.tos);
      setMarketing(formData.marketing);
      setLoading(false);
    });
  };

  if (redirectOnLogin) {
    return <Navigate to="/" replace />;
  }
  const { classes } = useStyles();

  const steps = {
    1: (
      <UserDataEntry classes={classes} setSnackbar={dispatchedSetSnackbar} data={{ email, password, password_confirmation: password }} onSubmit={handleStep1} />
    ),
    2: (
      <OrgDataEntry
        classes={classes}
        setSnackbar={dispatchedSetSnackbar}
        data={{ name: organization, email, emailVerified, tos, marketing }}
        onSubmit={handleSignup}
        recaptchaSiteKey={recaptchaSiteKey}
      />
    )
  };
  return (
    <>
      <LoginLogo className={classes.logo} />
      <div className={`content ${classes.background}`} id="signup-box">
        {loading ? <Loader show={true} style={{ marginTop: '40vh' }} /> : steps[step]}
      </div>
    </>
  );
};

export default Signup;
