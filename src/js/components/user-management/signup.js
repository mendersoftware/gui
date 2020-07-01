import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { Button } from '@material-ui/core';

import { setSnackbar } from '../../actions/appActions';
import { createOrganizationTrial } from '../../actions/organizationActions';
import { loginUser } from '../../actions/userActions';

import Loader from '../common/loader';
import UserDataEntry from './signup-steps/userdata-entry';
import OrgDataEntry from './signup-steps/orgdata-entry';
import { OAuth2Providers } from './oauth2providers';

export class Signup extends React.Component {
  constructor(props, context) {
    super(props, context);
    let state = {
      step: 1,
      email: '',
      loading: false,
      oauthProvider: undefined,
      password: '',
      recaptcha: ''
    };

    const cookies = new Cookies();
    const oauthProvider = cookies.get('oauth');
    if (oauthProvider) {
      state.oauthProvider = oauthProvider;
      state.oauthId = cookies.get('externalID');
      state.email = cookies.get('email');
      state.step = 2;
    }
    this.state = state;
  }

  _handleStep1(formData) {
    this.setState({
      email: formData.email,
      password: formData.password_new,
      step: 2
    });
  }

  _handleSignup(formData, recaptcha) {
    const self = this;
    self.setState({
      organization: formData.name,
      tos: formData.tos,
      marketing: formData.marketing,
      loading: true
    });
    const { email, password, oauthProvider, oauthId } = self.state;
    const credentials = oauthProvider ? { email, login: { [oauthProvider]: oauthId } } : { email, password };
    const signup = {
      ...credentials,
      organization: formData.name,
      plan: 'enterprise',
      tos: formData.tos,
      marketing: formData.marketing == 'true',
      'g-recaptcha-response': recaptcha || 'empty'
    };
    return self.props
      .createOrganizationTrial(signup)
      .catch(() => {
        self.setState({ step: 1 });
        return Promise.reject();
      })
      .then(() => {
        if (!oauthProvider) {
          return new Promise((resolve, reject) => {
            setTimeout(() => self.props.loginUser({ email, password }).catch(reject).then(resolve), 3000);
          });
        }
        return Promise.resolve();
      })
      .then(() => self.setState({ step: 3, redirectOnLogin: !oauthProvider }))
      .finally(() => self.setState({ loading: false }));
  }

  componentDidUpdate() {
    if (this.props.currentUserId) {
      this.props.setSnackbar('');
      this.setState({ redirectOnLogin: true });
    }
  }

  render() {
    const self = this;
    const { step, loading, oauthProvider, redirectOnLogin } = this.state;
    const { recaptchaSiteKey, setSnackbar } = this.props;
    if (redirectOnLogin) {
      return <Redirect to="/" />;
    }
    const provider = OAuth2Providers.find(item => item.id === oauthProvider);
    return (
      <div className="full-screen">
        <div id="signup-box">
          {loading ? (
            <Loader show={true} style={{ display: 'flex' }} />
          ) : (
            <>
              {step == 1 && (
                <UserDataEntry
                  setSnackbar={setSnackbar}
                  data={{ email: self.state.email, password: self.state.password, password_confirmation: self.state.password }}
                  onSubmit={formdata => self._handleStep1(formdata)}
                />
              )}
              {step == 2 && (
                <OrgDataEntry
                  setSnackbar={setSnackbar}
                  data={{ name: self.state.organization, tos: self.state.tos, marketing: self.state.marketing }}
                  onSubmit={(formdata, recaptcha) => self._handleSignup(formdata, recaptcha)}
                  recaptchaSiteKey={recaptchaSiteKey}
                />
              )}
              {step == 3 && (
                <div className="align-center" style={{ minHeight: '50vh' }}>
                  <h1>Sign up completed</h1>
                  <h2 className="margin-bottom-large">
                    Your account has been created,
                    <br />
                    you can now log in.
                  </h2>
                  <Button
                    variant="contained"
                    color="secondary"
                    href={`/api/management/v1/useradm/oauth2/${provider.id.toLowerCase()}`}
                    startIcon={provider.icon}
                  >
                    {provider.name}
                  </Button>
                </div>
              )}
              {step !== 3 && (
                <div className="flexbox margin-top" style={{ color: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center' }}>
                  Already have an account?{' '}
                  <Link style={{ marginLeft: '4px' }} to="/login">
                    Log in
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

const actionCreators = { createOrganizationTrial, loginUser, setSnackbar };

const mapStateToProps = state => {
  return {
    currentUserId: state.users.currentUserId,
    recaptchaSiteKey: state.app.recaptchaSiteKey
  };
};

export default connect(mapStateToProps, actionCreators)(Signup);
