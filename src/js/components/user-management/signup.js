import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import Cookies from 'universal-cookie';

import { setSnackbar } from '../../actions/appActions';
import { createOrganizationTrial } from '../../actions/organizationActions';
import { loginUser } from '../../actions/userActions';

import Loader from '../common/loader';
import UserDataEntry from './signup-steps/userdata-entry';
import OrgDataEntry from './signup-steps/orgdata-entry';

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
    this.setState({
      loading: true
    });
    const signup = {
      email: this.state.email,
      password: this.state.password,
      organization: formData.name,
      plan: 'enterprise',
      tos: formData.tos,
      marketing: formData.marketing,
      'g-recaptcha-response': recaptcha || 'empty'
    };
    return this.props
      .createOrganizationTrial(signup)
      .catch(err => {
        if (err.error.status >= 400 && err.error.status < 500) {
          this.setState({ step: 1 });
          this.props.setSnackbar(err.error.response.body.error, 5000, '');
        }
      })
      .then(res => {
        if (typeof res !== 'undefined') {
          setTimeout(() => {
            let credentials = this.state.oauthProvider
              ? {
                  email: this.state.email,
                  login: {
                    [this.state.oauthProvider]: this.state.oauthId
                  }
                }
              : {
                  email: this.state.email,
                  password: this.state.password
                };
            this.props.loginUser(credentials);
            this.setState({ loading: false });
          }, 3000);
        }
      })
      .finally(() => setTimeout(() => this.setState({ loading: false }), 3200));
  }

  componentDidUpdate() {
    if (this.props.currentUserId) {
      this.props.setSnackbar('');
      this.setState({ redirectToReferrer: true });
    }
  }

  render() {
    const self = this;
    const { step, loading, redirectToReferrer } = this.state;
    const { recaptchaSiteKey } = this.props;
    let from = { pathname: '/' };
    if (location && location.state && location.state.from.pathname !== '/ui/') {
      from = location.state.from;
    }
    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }
    return (
      <div className="full-screen">
        <div id="signup-box">
          {loading ? (
            <Loader show={true} style={{ display: 'flex' }} />
          ) : (
            <>
              {step == 1 && <UserDataEntry setSnackbar={setSnackbar} onSubmit={formdata => self._handleStep1(formdata)} />}
              {step == 2 && <OrgDataEntry setSnackbar={setSnackbar} onSubmit={formdata => self._handleSignup(formdata)} recaptchaSiteKey={recaptchaSiteKey} />}
              <div className="flexbox margin-top" style={{ color: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center' }}>
                Already have an account?{' '}
                <Link style={{ marginLeft: '4px' }} to="/login">
                  Log in
                </Link>
              </div>
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
